import { describe, expect, test } from "vitest";
import { OFFICIAL_AGENT_IDS, OFFICIAL_AGENTS } from "./agents";

describe("official agents", () => {
  test("contains exactly 11 official omo agents in stable order", () => {
    expect(OFFICIAL_AGENT_IDS).toHaveLength(11);
    expect(OFFICIAL_AGENT_IDS).toEqual([
      "sisyphus",
      "hephaestus",
      "oracle",
      "librarian",
      "explore",
      "multimodal-looker",
      "prometheus",
      "metis",
      "momus",
      "atlas",
      "sisyphus-junior"
    ]);
    expect(OFFICIAL_AGENTS[0].label).toBe("Sisyphus");
    expect(OFFICIAL_AGENTS[5].label).toBe("Multimodal-Looker");
  });
});
