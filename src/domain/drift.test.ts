import { describe, expect, test } from "vitest";
import { detectDrift } from "./drift";

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
      }
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
      }
    });

    expect(result.status).toBe("synced");
    expect(result.changedAgents).toEqual([]);
  });
});
