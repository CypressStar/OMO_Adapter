import type { AppSnapshot } from "../integration/contracts";
import type { PresetRecord } from "../domain/types";
import type {
  UiLanguage,
  UiPreferences
} from "../domain/ui-preferences";

export interface OmoAdapterBridge {
  loadSnapshot(): Promise<AppSnapshot>;
  loadUiPreferences(): Promise<UiPreferences>;
  setLanguage(language: UiLanguage): Promise<UiPreferences>;
  refreshProviderCatalog(): Promise<AppSnapshot>;
  savePreset(preset: PresetRecord): Promise<AppSnapshot>;
  createPreset(): Promise<AppSnapshot>;
  duplicatePreset(presetId: string): Promise<AppSnapshot>;
  deletePreset(presetId: string): Promise<AppSnapshot>;
  movePreset(presetId: string, targetIndex: number): Promise<AppSnapshot>;
  setActivePreset(presetId: string): Promise<AppSnapshot>;
  applyActivePreset(): Promise<AppSnapshot>;
  importFileToActivePreset(): Promise<AppSnapshot>;
  onConfigChanged(listener: () => void): () => void;
}

const demoSnapshot: AppSnapshot = {
  providerCatalog: {
    providerOrder: ["anthropic", "openai", "bosson"],
    providers: {
      anthropic: {
        id: "anthropic",
        source: "official",
        models: ["claude-sonnet-4-5", "claude-opus-4-6"]
      },
      openai: {
        id: "openai",
        source: "official",
        models: ["gpt-5.4@opencode-medium", "gpt-5.4@opencode-high"]
      },
      bosson: {
        id: "bosson",
        source: "custom",
        models: ["claude-opus-4-6"]
      }
    }
  },
  configuredProviderIds: ["openai", "bosson"],
  presets: [
    {
      id: "default",
      name: "Default",
      description: "Baseline preset synchronized from the current OMO setup.",
      agentModels: {
        sisyphus: "openai/gpt-5.4@opencode-high",
        hephaestus: "openai/gpt-5.4@opencode-high",
        oracle: "openai/gpt-5.4@opencode-high",
        librarian: "anthropic/claude-sonnet-4-5",
        explore: "anthropic/claude-sonnet-4-5",
        "multimodal-looker": "anthropic/claude-sonnet-4-5",
        prometheus: "openai/gpt-5.4@opencode-high",
        metis: "openai/gpt-5.4@opencode-medium",
        momus: "openai/gpt-5.4@opencode-medium",
        atlas: "openai/gpt-5.4@opencode-high",
        "sisyphus-junior": "bosson/claude-opus-4-6"
      }
    }
  ],
  activePresetId: "default",
  lastAppliedAt: "2026-03-28T12:34:56.000Z",
  drift: {
    status: "synced",
    changedAgents: []
  },
  fileModels: {
    sisyphus: "openai/gpt-5.4@opencode-high"
  },
  fileState: {
    omoExists: true
  }
};

function createDemoBridge(): OmoAdapterBridge {
  let currentSnapshot = structuredClone(demoSnapshot);

  return {
    async loadSnapshot() {
      return structuredClone(currentSnapshot);
    },
    async loadUiPreferences() {
      return { language: "en" };
    },
    async setLanguage(language) {
      return { language };
    },
    async refreshProviderCatalog() {
      return structuredClone(currentSnapshot);
    },
    async savePreset(preset) {
      currentSnapshot.presets = currentSnapshot.presets.map((item) =>
        item.id === preset.id ? preset : item
      );
      return structuredClone(currentSnapshot);
    },
    async createPreset() {
      return structuredClone(currentSnapshot);
    },
    async duplicatePreset() {
      return structuredClone(currentSnapshot);
    },
    async deletePreset() {
      return structuredClone(currentSnapshot);
    },
    async movePreset() {
      return structuredClone(currentSnapshot);
    },
    async setActivePreset(presetId) {
      currentSnapshot.activePresetId = presetId;
      return structuredClone(currentSnapshot);
    },
    async applyActivePreset() {
      return structuredClone(currentSnapshot);
    },
    async importFileToActivePreset() {
      return structuredClone(currentSnapshot);
    },
    onConfigChanged() {
      return () => {};
    }
  };
}

export function getBridge(): OmoAdapterBridge {
  if (typeof window !== "undefined" && window.omoAdapter) {
    return window.omoAdapter;
  }

  return createDemoBridge();
}
