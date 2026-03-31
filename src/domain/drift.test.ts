import { describe, expect, test } from "vitest";
import { detectDrift } from "./drift.ts";

describe("detectDrift", () => {
  test("flags drift when any official agent model differs from the active preset", () => {
    const result = detectDrift({
      presetModels: {
        sisyphus: "openai/gpt-5.4@opencode-high",
        atlas: "openai/gpt-5.4@opencode-medium"
      },
      fileModels: {
        sisyphus: "anthropic/claude-sonnet-4-5",
        atlas: "openai/gpt-5.4@opencode-medium"
      },
      presetReasoningEfforts: {},
      fileReasoningEfforts: {}
    });

    expect(result.status).toBe("drifted");
    expect(result.changedAgents).toEqual(["sisyphus"]);
  });

  test("returns synced when all official agent models match", () => {
    const result = detectDrift({
      presetModels: {
        sisyphus: "openai/gpt-5.4@opencode-high"
      },
      fileModels: {
        sisyphus: "openai/gpt-5.4@opencode-high"
      },
      presetReasoningEfforts: {},
      fileReasoningEfforts: {}
    });

    expect(result.status).toBe("synced");
    expect(result.changedAgents).toEqual([]);
  });

  test("treats omitted reasoning effort and medium as equivalent", () => {
    const result = detectDrift({
      presetModels: {
        hephaestus: "openai/gpt-5.4"
      },
      fileModels: {
        hephaestus: "openai/gpt-5.4"
      },
      presetReasoningEfforts: {},
      fileReasoningEfforts: {
        hephaestus: "medium"
      }
    });

    expect(result.status).toBe("synced");
    expect(result.changedAgents).toEqual([]);
  });

  test("flags drift when effective reasoning effort differs", () => {
    const result = detectDrift({
      presetModels: {
        hephaestus: "openai/gpt-5.4"
      },
      fileModels: {
        hephaestus: "openai/gpt-5.4"
      },
      presetReasoningEfforts: {
        hephaestus: "xhigh"
      },
      fileReasoningEfforts: {}
    });

    expect(result.status).toBe("drifted");
    expect(result.changedAgents).toEqual(["hephaestus"]);
  });
});
