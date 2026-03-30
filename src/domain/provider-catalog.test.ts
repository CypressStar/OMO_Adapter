import { describe, expect, test } from "vitest";
import {
  buildProviderCatalog,
  parseProviderModelRef,
  resolveProviderModelRefStatus
} from "./provider-catalog.ts";

describe("parseProviderModelRef", () => {
  test("splits provider/model values", () => {
    expect(parseProviderModelRef("openai/gpt-5.4@opencode-high")).toEqual({
      providerId: "openai",
      modelId: "gpt-5.4@opencode-high"
    });
  });
});

describe("buildProviderCatalog", () => {
  test("classifies CLI models as official or custom using opencode.json provider keys", () => {
    const catalog = buildProviderCatalog({
      cliModels: [
        "anthropic/claude-sonnet-4-5",
        "openai/gpt-5.4@opencode-high",
        "bosson/claude-opus-4-6",
        "bosson/claude-sonnet-4-5-20250929"
      ],
      customProviderIds: ["bosson"]
    });

    expect(catalog.providers.anthropic.source).toBe("official");
    expect(catalog.providers.openai.source).toBe("official");
    expect(catalog.providers.bosson.source).toBe("custom");
    expect(catalog.providers.bosson.models).toEqual([
      "claude-opus-4-6",
      "claude-sonnet-4-5-20250929"
    ]);
  });

  test("keeps providers sorted and model lists unique", () => {
    const catalog = buildProviderCatalog({
      cliModels: [
        "openai/gpt-5.4@opencode-medium",
        "openai/gpt-5.4@opencode-medium",
        "anthropic/claude-opus-4-6"
      ],
      customProviderIds: []
    });

    expect(catalog.providerOrder).toEqual(["anthropic", "openai"]);
    expect(catalog.providers.openai.models).toEqual([
      "gpt-5.4@opencode-medium"
    ]);
  });
});

describe("resolveProviderModelRefStatus", () => {
  test("flags unsupported providers and unsupported models without dropping the raw value", () => {
    const catalog = buildProviderCatalog({
      cliModels: ["openai/gpt-5.4@opencode-high"],
      customProviderIds: []
    });

    expect(
      resolveProviderModelRefStatus(catalog, "custom-provider/custom-model")
    ).toEqual({
      kind: "unsupported-provider",
      rawValue: "custom-provider/custom-model",
      providerId: "custom-provider",
      modelId: "custom-model"
    });

    expect(
      resolveProviderModelRefStatus(catalog, "openai/gpt-legacy")
    ).toEqual({
      kind: "unsupported-model",
      rawValue: "openai/gpt-legacy",
      providerId: "openai",
      modelId: "gpt-legacy"
    });
  });
});
