import { detectDrift } from "../domain/drift.ts";
import { createDefaultPreset, getFirstCatalogModelRef } from "../domain/presets.ts";
import { buildProviderCatalog } from "../domain/provider-catalog.ts";
import type { PresetRecord } from "../domain/types.ts";
import { readCliModels } from "../infrastructure/opencode-cli.ts";
import { readOpenCodeConfig } from "../infrastructure/opencode-config.ts";
import {
  applyPresetToOmoConfig,
  extractOfficialAgentModels,
  readOmoConfig,
  writeOmoConfig,
  type OmoConfig
} from "../infrastructure/omo-config.ts";
import { readPresetStore, writePresetStore } from "../infrastructure/preset-store.ts";
import type { AppSnapshot } from "./contracts.ts";

interface CachedCatalogState {
  cliModels: string[];
  configuredProviderIds: string[];
  customProviderIds: string[];
}

let cachedCatalogState: CachedCatalogState | null = null;

export async function createAppSnapshot(input: {
  cliModels: string[];
  configuredProviderIds: string[];
  customProviderIds: string[];
  currentOmoConfig?: OmoConfig;
  storedPresets: PresetRecord[];
  storedActivePresetId?: string;
  storedLastAppliedAt?: string;
}): Promise<AppSnapshot> {
  const generatedDefaultPreset = input.storedPresets.length === 0;
  const providerCatalog = buildProviderCatalog({
    cliModels: input.cliModels,
    customProviderIds: input.customProviderIds
  });

  const fallbackModelRef =
    getFirstCatalogModelRef(providerCatalog) ?? "openai/gpt-5.4@opencode-medium";
  const currentFileModels = extractOfficialAgentModels(input.currentOmoConfig ?? {});
  const presets =
    input.storedPresets.length > 0
      ? input.storedPresets
      : [
          createDefaultPreset({
            currentFileModels,
            fallbackModelRef
          })
        ];
  const activePreset =
    presets.find((preset) => preset.id === input.storedActivePresetId) ?? presets[0];
  const drift = generatedDefaultPreset
    ? {
        status: "synced" as const,
        changedAgents: []
      }
    : detectDrift({
        presetModels: activePreset.agentModels,
        fileModels: currentFileModels
      });

  return {
    providerCatalog,
    configuredProviderIds: input.configuredProviderIds,
    presets,
    activePresetId: activePreset.id,
    lastAppliedAt: input.storedLastAppliedAt,
    drift,
    fileModels: currentFileModels,
    fileState: {
      omoExists: Boolean(input.currentOmoConfig)
    }
  };
}

async function loadCatalogState(forceRefresh = false) {
  if (!cachedCatalogState || forceRefresh) {
    const [cliModels, openCodeConfig] = await Promise.all([
      readCliModels(),
      readOpenCodeConfig()
    ]);

    cachedCatalogState = {
      cliModels,
      configuredProviderIds: openCodeConfig.configuredProviderIds,
      customProviderIds: openCodeConfig.customProviderIds
    };
  }

  return cachedCatalogState;
}

async function loadFastRuntime() {
  const [omoState, presetStore] = await Promise.all([
    readOmoConfig(),
    readPresetStore()
  ]);

  return {
    omoState,
    presetStore
  };
}

async function buildSnapshotFromRuntime(options?: { forceCatalogRefresh?: boolean }) {
  const [catalogState, runtime] = await Promise.all([
    loadCatalogState(options?.forceCatalogRefresh),
    loadFastRuntime()
  ]);

  return createAppSnapshot({
    cliModels: catalogState.cliModels,
    configuredProviderIds: catalogState.configuredProviderIds,
    customProviderIds: catalogState.customProviderIds,
    currentOmoConfig: runtime.omoState.config,
    storedPresets: runtime.presetStore.presets,
    storedActivePresetId: runtime.presetStore.activePresetId,
    storedLastAppliedAt: runtime.presetStore.lastAppliedAt
  });
}

function clonePreset(preset: PresetRecord, overrides: Partial<PresetRecord>): PresetRecord {
  return {
    ...preset,
    ...overrides,
    agentModels: {
      ...preset.agentModels,
      ...overrides.agentModels
    }
  };
}

function uniquePresetId() {
  return `preset-${Date.now()}`;
}

function createUntitledPresetName(timestamp: Date) {
  return `untitled-${timestamp.toISOString().slice(0, 10).replace(/-/g, "")}`;
}

export async function loadSnapshot() {
  return buildSnapshotFromRuntime();
}

export async function refreshProviderCatalog() {
  return buildSnapshotFromRuntime({ forceCatalogRefresh: true });
}

export function resetProviderCatalogCache() {
  cachedCatalogState = null;
}

export async function savePreset(input: PresetRecord) {
  const runtime = await loadFastRuntime();
  const nextPresets = [...runtime.presetStore.presets];
  const existingIndex = nextPresets.findIndex((preset) => preset.id === input.id);

  if (existingIndex === -1) {
    nextPresets.push(input);
  } else {
    nextPresets[existingIndex] = input;
  }

  await writePresetStore({
    presets: nextPresets,
    activePresetId: runtime.presetStore.activePresetId ?? input.id,
      lastAppliedAt: runtime.presetStore.lastAppliedAt
  });

  return loadSnapshot();
}

export async function createPreset() {
  const [runtime, catalogState] = await Promise.all([
    loadFastRuntime(),
    loadCatalogState()
  ]);
  const snapshot = await createAppSnapshot({
    cliModels: catalogState.cliModels,
    configuredProviderIds: catalogState.configuredProviderIds,
    customProviderIds: catalogState.customProviderIds,
    currentOmoConfig: runtime.omoState.config,
    storedPresets: runtime.presetStore.presets,
    storedActivePresetId: runtime.presetStore.activePresetId,
    storedLastAppliedAt: runtime.presetStore.lastAppliedAt
  });
  const activePreset =
    snapshot.presets.find((preset) => preset.id === snapshot.activePresetId) ??
    snapshot.presets[0];
  const newPreset = clonePreset(activePreset, {
    id: uniquePresetId(),
    name: createUntitledPresetName(new Date()),
    description: activePreset.description
  });

  await writePresetStore({
    presets: [...snapshot.presets, newPreset],
    activePresetId: snapshot.activePresetId,
    lastAppliedAt: runtime.presetStore.lastAppliedAt
  });

  return loadSnapshot();
}

export async function duplicatePreset(presetId: string) {
  const [runtime, catalogState] = await Promise.all([
    loadFastRuntime(),
    loadCatalogState()
  ]);
  const snapshot = await createAppSnapshot({
    cliModels: catalogState.cliModels,
    configuredProviderIds: catalogState.configuredProviderIds,
    customProviderIds: catalogState.customProviderIds,
    currentOmoConfig: runtime.omoState.config,
    storedPresets: runtime.presetStore.presets,
    storedActivePresetId: runtime.presetStore.activePresetId,
    storedLastAppliedAt: runtime.presetStore.lastAppliedAt
  });
  const target = snapshot.presets.find((preset) => preset.id === presetId);

  if (!target) {
    throw new Error(`Preset not found: ${presetId}`);
  }

  const duplicatedPreset = clonePreset(target, {
    id: uniquePresetId(),
    name: `${target.name} Copy`
  });

  await writePresetStore({
    presets: [...snapshot.presets, duplicatedPreset],
    activePresetId: snapshot.activePresetId,
    lastAppliedAt: runtime.presetStore.lastAppliedAt
  });

  return loadSnapshot();
}

export async function deletePreset(presetId: string) {
  const runtime = await loadFastRuntime();
  const nextPresets = runtime.presetStore.presets.filter(
    (preset: PresetRecord) => preset.id !== presetId
  );

  if (nextPresets.length === 0) {
    throw new Error("Cannot delete the last preset.");
  }

  const nextActivePresetId =
    runtime.presetStore.activePresetId === presetId
      ? nextPresets[0].id
      : runtime.presetStore.activePresetId;

  await writePresetStore({
    presets: nextPresets,
    activePresetId: nextActivePresetId,
    lastAppliedAt: runtime.presetStore.lastAppliedAt
  });

  return loadSnapshot();
}

export async function setActivePreset(presetId: string) {
  const runtime = await loadFastRuntime();
  const preset = runtime.presetStore.presets.find((item) => item.id === presetId);

  if (!preset) {
    throw new Error(`Preset not found: ${presetId}`);
  }

  await writeOmoConfig(
    applyPresetToOmoConfig(runtime.omoState.config, preset.agentModels)
  );
  const lastAppliedAt = new Date().toISOString();

  await writePresetStore({
    presets: runtime.presetStore.presets,
    activePresetId: presetId,
    lastAppliedAt
  });

  return loadSnapshot();
}

export async function applyActivePreset() {
  const [runtime, catalogState] = await Promise.all([
    loadFastRuntime(),
    loadCatalogState()
  ]);
  const snapshot = await createAppSnapshot({
    cliModels: catalogState.cliModels,
    configuredProviderIds: catalogState.configuredProviderIds,
    customProviderIds: catalogState.customProviderIds,
    currentOmoConfig: runtime.omoState.config,
    storedPresets: runtime.presetStore.presets,
    storedActivePresetId: runtime.presetStore.activePresetId,
    storedLastAppliedAt: runtime.presetStore.lastAppliedAt
  });
  const activePreset =
    snapshot.presets.find((preset) => preset.id === snapshot.activePresetId) ??
    snapshot.presets[0];

  await writeOmoConfig(
    applyPresetToOmoConfig(runtime.omoState.config, activePreset.agentModels)
  );

  const lastAppliedAt = new Date().toISOString();

  await writePresetStore({
    presets: snapshot.presets,
    activePresetId: snapshot.activePresetId,
    lastAppliedAt
  });

  return loadSnapshot();
}

export async function importFileToActivePreset() {
  const [runtime, catalogState] = await Promise.all([
    loadFastRuntime(),
    loadCatalogState()
  ]);
  const snapshot = await createAppSnapshot({
    cliModels: catalogState.cliModels,
    configuredProviderIds: catalogState.configuredProviderIds,
    customProviderIds: catalogState.customProviderIds,
    currentOmoConfig: runtime.omoState.config,
    storedPresets: runtime.presetStore.presets,
    storedActivePresetId: runtime.presetStore.activePresetId,
    storedLastAppliedAt: runtime.presetStore.lastAppliedAt
  });
  const activePreset =
    snapshot.presets.find((preset) => preset.id === snapshot.activePresetId) ??
    snapshot.presets[0];
  const fallbackModelRef =
    getFirstCatalogModelRef(snapshot.providerCatalog) ??
    "openai/gpt-5.4@opencode-medium";
  const importedModels = createDefaultPreset({
    currentFileModels: extractOfficialAgentModels(runtime.omoState.config ?? {}),
    fallbackModelRef
  }).agentModels;

  await writePresetStore({
    presets: snapshot.presets.map((preset: PresetRecord) =>
      preset.id === activePreset.id
        ? {
            ...preset,
            agentModels: importedModels
          }
        : preset
    ),
    activePresetId: snapshot.activePresetId,
    lastAppliedAt: runtime.presetStore.lastAppliedAt
  });

  return loadSnapshot();
}

export async function movePreset(presetId: string, targetIndex: number) {
  const runtime = await loadFastRuntime();
  const currentIndex = runtime.presetStore.presets.findIndex(
    (preset) => preset.id === presetId
  );

  if (currentIndex === -1) {
    throw new Error(`Preset not found: ${presetId}`);
  }

  const boundedTargetIndex = Math.max(
    0,
    Math.min(targetIndex, runtime.presetStore.presets.length - 1)
  );

  if (currentIndex === boundedTargetIndex) {
    return loadSnapshot();
  }

  const nextPresets = [...runtime.presetStore.presets];
  const [movedPreset] = nextPresets.splice(currentIndex, 1);

  nextPresets.splice(boundedTargetIndex, 0, movedPreset);

  await writePresetStore({
    presets: nextPresets,
    activePresetId: runtime.presetStore.activePresetId,
    lastAppliedAt: runtime.presetStore.lastAppliedAt
  });

  return loadSnapshot();
}
