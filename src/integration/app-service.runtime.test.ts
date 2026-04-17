import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { PresetRecord } from "../domain/types";

const mocks = vi.hoisted(() => ({
  readCliModels: vi.fn(),
  readOpenCodeConfig: vi.fn(),
  readOmoConfig: vi.fn(),
  writeOmoConfig: vi.fn(),
  readPresetStore: vi.fn(),
  writePresetStore: vi.fn()
}));

vi.mock("../infrastructure/opencode-cli.ts", () => ({
  readCliModels: mocks.readCliModels
}));

vi.mock("../infrastructure/opencode-config.ts", () => ({
  readOpenCodeConfig: mocks.readOpenCodeConfig
}));

vi.mock("../infrastructure/omo-config.ts", async () => {
  const actual = await vi.importActual<typeof import("../infrastructure/omo-config.ts")>(
    "../infrastructure/omo-config.ts"
  );

  return {
    ...actual,
    readOmoConfig: mocks.readOmoConfig,
    writeOmoConfig: mocks.writeOmoConfig
  };
});

vi.mock("../infrastructure/preset-store.ts", () => ({
  readPresetStore: mocks.readPresetStore,
  writePresetStore: mocks.writePresetStore
}));

import {
  duplicatePreset,
  createPreset,
  loadSnapshot,
  refreshProviderCatalog,
  resetProviderCatalogCache,
  setActivePreset
} from "./app-service.ts";

function createPresetRecord(id: string, modelRef = "openai/gpt-5.4@opencode-high"): PresetRecord {
  return {
    id,
    name: id,
    description: "desc",
    agentModels: {
      sisyphus: modelRef,
      hephaestus: modelRef,
      oracle: modelRef,
      librarian: modelRef,
      explore: modelRef,
      "multimodal-looker": modelRef,
      prometheus: modelRef,
      metis: modelRef,
      momus: modelRef,
      atlas: modelRef,
      "sisyphus-junior": modelRef
    }
  };
}

describe("app-service runtime behavior", () => {
  beforeEach(() => {
    let presetStoreState = {
      presets: [createPresetRecord("default"), createPresetRecord("alt")],
      activePresetId: "default",
      lastAppliedAt: undefined as string | undefined
    };

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-29T01:30:00.000Z"));
    resetProviderCatalogCache();

    mocks.readCliModels.mockResolvedValue(["openai/gpt-5.4@opencode-high"]);
    mocks.readOpenCodeConfig.mockResolvedValue({
      configuredProviderIds: ["openai"],
      customProviderIds: [],
      providerDisplayNamesById: {}
    });
    mocks.readOmoConfig.mockResolvedValue({
      exists: true,
      config: {
        agents: {
          sisyphus: {
            model: "openai/gpt-5.4@opencode-high"
          }
        }
      }
    });
    mocks.writeOmoConfig.mockResolvedValue(undefined);
    mocks.readPresetStore.mockImplementation(async () => ({
      ...presetStoreState,
      presets: [...presetStoreState.presets]
    }));
    mocks.writePresetStore.mockImplementation(async (nextStore) => {
      presetStoreState = {
        ...nextStore,
        presets: [...nextStore.presets]
      };
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test("reuses the cached provider catalog for preset creation", async () => {
    await loadSnapshot();
    await createPreset();

    expect(mocks.readCliModels).toHaveBeenCalledTimes(1);
    expect(mocks.readOpenCodeConfig).toHaveBeenCalledTimes(1);
  });

  test("creating a preset uses the untitled date naming rule", async () => {
    const snapshot = await createPreset();
    const createdPreset = snapshot.presets.find((preset) => preset.id !== "default" && preset.id !== "alt");

    expect(createdPreset?.name).toBe("untitled-20260329");
    expect(snapshot.activePresetId).toBe("default");
  });

  test("imports non-default reasoning effort into the generated default preset", async () => {
    mocks.readPresetStore.mockResolvedValueOnce({
      presets: [],
      activePresetId: undefined,
      lastAppliedAt: undefined
    });
    mocks.readOmoConfig.mockResolvedValueOnce({
      exists: true,
      config: {
        agents: {
          hephaestus: {
            model: "openai/gpt-5.4",
            reasoningEffort: "high"
          }
        }
      }
    });

    const snapshot = await loadSnapshot();

    expect(snapshot.presets[0].agentReasoningEfforts).toEqual({
      hephaestus: "high"
    });
  });

  test("refreshProviderCatalog forces a fresh CLI reload", async () => {
    mocks.readCliModels
      .mockResolvedValueOnce(["openai/gpt-5.4@opencode-high"])
      .mockResolvedValueOnce([
        "openai/gpt-5.4@opencode-high",
        "anthropic/claude-sonnet-4-5"
      ]);
    mocks.readOpenCodeConfig
      .mockResolvedValueOnce({
        configuredProviderIds: ["openai"],
        customProviderIds: [],
        providerDisplayNamesById: {}
      })
      .mockResolvedValueOnce({
        configuredProviderIds: ["openai", "anthropic"],
        customProviderIds: [],
        providerDisplayNamesById: {}
      });

    const firstSnapshot = await loadSnapshot();
    const refreshedSnapshot = await refreshProviderCatalog();

    expect(firstSnapshot.providerCatalog.providerOrder).toEqual(["openai"]);
    expect(refreshedSnapshot.providerCatalog.providerOrder).toEqual([
      "anthropic",
      "openai"
    ]);
    expect(mocks.readCliModels).toHaveBeenCalledTimes(2);
  });

  test("activating a preset writes it to the OMO config immediately", async () => {
    const snapshot = await setActivePreset("alt");

    expect(mocks.writeOmoConfig).toHaveBeenCalledTimes(1);
    expect(mocks.writePresetStore).toHaveBeenCalledWith(
      expect.objectContaining({
        activePresetId: "alt",
        lastAppliedAt: "2026-03-29T01:30:00.000Z"
      })
    );
    expect(snapshot.activePresetId).toBe("alt");
    expect(snapshot.lastAppliedAt).toBe("2026-03-29T01:30:00.000Z");
  });

  test("duplicating a preset keeps the current active preset unchanged", async () => {
    const snapshot = await duplicatePreset("alt");

    expect(mocks.writePresetStore).toHaveBeenCalledWith(
      expect.objectContaining({
        activePresetId: "default"
      })
    );
    expect(snapshot.activePresetId).toBe("default");
  });
});
