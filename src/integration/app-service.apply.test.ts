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

import { applyActivePreset, resetProviderCatalogCache } from "./app-service.ts";

function createPreset(id: string): PresetRecord {
  return {
    id,
    name: "Default",
    description: "desc",
    agentModels: {
      sisyphus: "openai/gpt-5.4@opencode-high",
      hephaestus: "openai/gpt-5.4@opencode-high",
      oracle: "openai/gpt-5.4@opencode-high",
      librarian: "openai/gpt-5.4@opencode-high",
      explore: "openai/gpt-5.4@opencode-high",
      "multimodal-looker": "openai/gpt-5.4@opencode-high",
      prometheus: "openai/gpt-5.4@opencode-high",
      metis: "openai/gpt-5.4@opencode-high",
      momus: "openai/gpt-5.4@opencode-high",
      atlas: "openai/gpt-5.4@opencode-high",
      "sisyphus-junior": "openai/gpt-5.4@opencode-high"
    }
  };
}

describe("applyActivePreset", () => {
  beforeEach(() => {
    let presetStoreState = {
      presets: [createPreset("default")],
      activePresetId: "default" as const,
      lastAppliedAt: undefined as string | undefined
    };

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-28T12:34:56.000Z"));
    resetProviderCatalogCache();

    mocks.readCliModels.mockResolvedValue(["openai/gpt-5.4@opencode-high"]);
    mocks.readOpenCodeConfig.mockResolvedValue({
      configuredProviderIds: ["openai"],
      customProviderIds: [],
      providerNamesByConfigId: {}
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
      ...presetStoreState
    }));
    mocks.writePresetStore.mockImplementation(async (nextStore) => {
      presetStoreState = {
        ...nextStore
      };
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test("stores the last applied timestamp when the active preset is written", async () => {
    const snapshot = await applyActivePreset();

    expect(mocks.writePresetStore).toHaveBeenCalledWith(
      expect.objectContaining({
        activePresetId: "default",
        lastAppliedAt: "2026-03-28T12:34:56.000Z"
      })
    );
    expect(snapshot.lastAppliedAt).toBe("2026-03-28T12:34:56.000Z");
  });
});
