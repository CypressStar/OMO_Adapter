// @vitest-environment node

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import {
  getPresetStorePath,
  normalizePresetStore,
  readPresetStore
} from "./preset-store.ts";

describe("normalizePresetStore", () => {
  test("returns an empty preset store when the file is missing", () => {
    expect(normalizePresetStore(undefined)).toEqual({
      presets: [],
      activePresetId: undefined,
      lastAppliedAt: undefined
    });
  });

  test("keeps stored presets, active preset id, and last applied time", () => {
    const result = normalizePresetStore({
      presets: [
        {
          id: "default",
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
        }
      ],
      activePresetId: "default",
      lastAppliedAt: "2026-03-28T12:34:56.000Z"
    });

    expect(result.presets).toHaveLength(1);
    expect(result.activePresetId).toBe("default");
    expect(result.lastAppliedAt).toBe("2026-03-28T12:34:56.000Z");
  });

  test("reports which file is invalid when the preset store cannot be parsed", async () => {
    const tempHomePath = await fs.mkdtemp(path.join(os.tmpdir(), "omo-adapter-presets-"));
    const originalHome = process.env.HOME;
    const originalUserProfile = process.env.USERPROFILE;

    process.env.HOME = tempHomePath;
    process.env.USERPROFILE = tempHomePath;

    try {
      const presetStorePath = getPresetStorePath();
      await fs.mkdir(path.dirname(presetStorePath), { recursive: true });
      await fs.writeFile(presetStorePath, '{ "presets": [\n', "utf8");

      await expect(readPresetStore()).rejects.toThrow(/omo-adapter-presets\.json/i);
    } finally {
      process.env.HOME = originalHome;
      process.env.USERPROFILE = originalUserProfile;
      await fs.rm(tempHomePath, { recursive: true, force: true });
    }
  });
});
