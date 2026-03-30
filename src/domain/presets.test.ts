import { describe, expect, test } from "vitest";
import {
  createDefaultPreset,
  fillMissingAgentModels,
  getFirstCatalogModelRef
} from "./presets";

describe("getFirstCatalogModelRef", () => {
  test("returns the first provider/model pair using provider order", () => {
    expect(
      getFirstCatalogModelRef({
        providerOrder: ["anthropic", "openai"],
        providers: {
          anthropic: {
            id: "anthropic",
            source: "official",
            models: ["claude-sonnet-4-5"]
          },
          openai: {
            id: "openai",
            source: "official",
            models: ["gpt-5.4@opencode-high"]
          }
        }
      })
    ).toBe("anthropic/claude-sonnet-4-5");
  });
});

describe("fillMissingAgentModels", () => {
  test("fills all official agents with the fallback model", () => {
    const result = fillMissingAgentModels({}, "openai/gpt-5.4@opencode-medium");

    expect(result.sisyphus).toBe("openai/gpt-5.4@opencode-medium");
    expect(result["sisyphus-junior"]).toBe("openai/gpt-5.4@opencode-medium");
  });
});

describe("createDefaultPreset", () => {
  test("uses existing file values first and fills the rest from a fallback model", () => {
    const preset = createDefaultPreset({
      currentFileModels: {
        sisyphus: "openai/gpt-5.4@opencode-high"
      },
      fallbackModelRef: "openai/gpt-5.4@opencode-medium"
    });

    expect(preset.id).toBe("default");
    expect(preset.agentModels.sisyphus).toBe("openai/gpt-5.4@opencode-high");
    expect(preset.agentModels.oracle).toBe("openai/gpt-5.4@opencode-medium");
  });
});
