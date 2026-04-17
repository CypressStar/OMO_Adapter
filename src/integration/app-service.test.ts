import { describe, expect, test } from "vitest";
import { createAppSnapshot } from "./app-service.ts";

describe("createAppSnapshot", () => {
  test("returns providers, presets, active preset, and drift state", async () => {
    const snapshot = await createAppSnapshot({
      cliModels: [
        "openai/gpt-5.4@opencode-high",
        "anthropic/claude-sonnet-4-5"
      ],
      configuredProviderIds: ["openai", "bosson"],
      customProviderIds: ["bosson"],
      providerNamesByConfigId: {},
      currentOmoConfig: {
        agents: {
          sisyphus: { model: "openai/gpt-5.4@opencode-high" }
        }
      },
      storedPresets: [],
      storedActivePresetId: undefined
    });

    expect(snapshot.activePresetId).toBe("default");
    expect(snapshot.providerCatalog.providerOrder).toEqual([
      "anthropic",
      "openai"
    ]);
    expect(snapshot.drift.status).toBe("synced");
    expect(snapshot.presets).toHaveLength(1);
    expect(snapshot.lastAppliedAt).toBeUndefined();
  });

  test("keeps the stored last applied timestamp in the app snapshot", async () => {
    const snapshot = await createAppSnapshot({
      cliModels: ["openai/gpt-5.4@opencode-high"],
      configuredProviderIds: ["openai"],
      customProviderIds: [],
      providerNamesByConfigId: {},
      currentOmoConfig: {
        agents: {
          sisyphus: { model: "openai/gpt-5.4@opencode-high" }
        }
      },
      storedPresets: [],
      storedActivePresetId: undefined,
      storedLastAppliedAt: "2026-03-28T12:34:56.000Z"
    });

    expect(snapshot.lastAppliedAt).toBe("2026-03-28T12:34:56.000Z");
  });
});
