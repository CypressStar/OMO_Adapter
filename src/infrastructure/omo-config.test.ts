// @vitest-environment node

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  applyPresetToOmoConfig,
  buildDefaultOmoConfig,
  extractOfficialAgentSettings,
  extractOfficialAgentModels,
  readOmoConfig,
  writeOmoConfig
} from "./omo-config.ts";

let tempHomePath = "";

beforeEach(async () => {
  tempHomePath = path.join(
    process.cwd(),
    ".tmp-tests",
    `omo-config-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
  await fs.mkdir(tempHomePath, { recursive: true });
  vi.spyOn(os, "homedir").mockReturnValue(tempHomePath);
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.rm(tempHomePath, { recursive: true, force: true });
});

describe("extractOfficialAgentModels", () => {
  test("normalizes legacy agent keys to official ids", () => {
    const models = extractOfficialAgentModels({
      agents: {
        Sisyphus: { model: "openai/gpt-5.4@opencode-high" },
        Hephaestus: { model: "openai/gpt-5.4@opencode-high" },
        "sisyphus-junior": { model: "openai/gpt-5.4@opencode-medium" },
        "Frontend UI": { model: "openai/gpt-5.4@opencode-medium" }
      }
    });

    expect(models.sisyphus).toBe("openai/gpt-5.4@opencode-high");
    expect(models.hephaestus).toBe("openai/gpt-5.4@opencode-high");
    expect(models["sisyphus-junior"]).toBe("openai/gpt-5.4@opencode-medium");
    expect(models).not.toHaveProperty("Frontend UI");
  });
});

describe("buildDefaultOmoConfig", () => {
  test("creates a baseline config when the target file does not exist", () => {
    const config = buildDefaultOmoConfig({
      sisyphus: "openai/gpt-5.4@opencode-high",
      hephaestus: "openai/gpt-5.4@opencode-high",
      oracle: "openai/gpt-5.4@opencode-xhigh",
      librarian: "openai/gpt-5.4@opencode-medium",
      explore: "openai/gpt-5.4@opencode-medium",
      "multimodal-looker": "openai/gpt-5.4@opencode-medium",
      prometheus: "openai/gpt-5.4@opencode-xhigh",
      metis: "openai/gpt-5.4@opencode-medium",
      momus: "openai/gpt-5.4@opencode-medium",
      atlas: "openai/gpt-5.4@opencode-high",
      "sisyphus-junior": "openai/gpt-5.4@opencode-medium"
    });

    expect(config.agents.sisyphus.model).toBe("openai/gpt-5.4@opencode-high");
    expect(config.hooks.pre.enabled).toBe(true);
    expect(config.mcp.enabled).toBe(true);
  });
});

describe("applyPresetToOmoConfig", () => {
  test("updates only official agents and preserves unrelated fields", () => {
    const result = applyPresetToOmoConfig(
      {
        agents: {
          sisyphus: { model: "anthropic/claude-sonnet-4-5" },
          "Frontend UI": { model: "openai/gpt-5.4@opencode-medium" }
        },
        hooks: {
          pre: { enabled: true }
        }
      },
      {
        sisyphus: "openai/gpt-5.4@opencode-high",
        hephaestus: "openai/gpt-5.4@opencode-high",
        oracle: "openai/gpt-5.4@opencode-xhigh",
        librarian: "openai/gpt-5.4@opencode-medium",
        explore: "openai/gpt-5.4@opencode-medium",
        "multimodal-looker": "openai/gpt-5.4@opencode-medium",
        prometheus: "openai/gpt-5.4@opencode-xhigh",
        metis: "openai/gpt-5.4@opencode-medium",
        momus: "openai/gpt-5.4@opencode-medium",
        atlas: "openai/gpt-5.4@opencode-high",
        "sisyphus-junior": "openai/gpt-5.4@opencode-medium"
      }
    );

    expect(result.agents.sisyphus.model).toBe("openai/gpt-5.4@opencode-high");
    expect(result.agents["Frontend UI"].model).toBe(
      "openai/gpt-5.4@opencode-medium"
    );
    expect(result.hooks.pre.enabled).toBe(true);
  });

  test("consolidates legacy official agent aliases into the canonical key", () => {
    const result = applyPresetToOmoConfig(
      {
        agents: {
          Hephaestus: {
            model: "anthropic/claude-sonnet-4-5",
            description: "深度工作者:自主目标执行、深入探索后编码"
          },
          hephaestus: {
            model: "openai/gpt-5.4@opencode-medium",
            description: "Deep execution specialist for autonomous implementation."
          }
        }
      },
      {
        sisyphus: "openai/gpt-5.4@opencode-high",
        hephaestus: "xai/grok-4-1-fast",
        oracle: "openai/gpt-5.4@opencode-xhigh",
        librarian: "openai/gpt-5.4@opencode-medium",
        explore: "openai/gpt-5.4@opencode-medium",
        "multimodal-looker": "openai/gpt-5.4@opencode-medium",
        prometheus: "openai/gpt-5.4@opencode-xhigh",
        metis: "openai/gpt-5.4@opencode-medium",
        momus: "openai/gpt-5.4@opencode-medium",
        atlas: "openai/gpt-5.4@opencode-high",
        "sisyphus-junior": "openai/gpt-5.4@opencode-medium"
      }
    );

    expect(result.agents.hephaestus.model).toBe("xai/grok-4-1-fast");
    expect(result.agents.hephaestus.description).toBe(
      "深度工作者:自主目标执行、深入探索后编码"
    );
    expect(result.agents).not.toHaveProperty("Hephaestus");
  });

  test("writes non-default reasoning effort and removes stale medium values", () => {
    const result = applyPresetToOmoConfig(
      {
        agents: {
          hephaestus: {
            model: "openai/gpt-5.4",
            reasoningEffort: "high"
          },
          oracle: {
            model: "openai/gpt-5.4",
            reasoningEffort: "medium"
          }
        }
      },
      {
        sisyphus: "openai/gpt-5.4@opencode-high",
        hephaestus: "openai/gpt-5.4",
        oracle: "openai/gpt-5.4",
        librarian: "openai/gpt-5.4@opencode-medium",
        explore: "openai/gpt-5.4@opencode-medium",
        "multimodal-looker": "openai/gpt-5.4@opencode-medium",
        prometheus: "openai/gpt-5.4@opencode-xhigh",
        metis: "openai/gpt-5.4@opencode-medium",
        momus: "openai/gpt-5.4@opencode-medium",
        atlas: "openai/gpt-5.4@opencode-high",
        "sisyphus-junior": "openai/gpt-5.4@opencode-medium"
      },
      {
        hephaestus: "low"
      }
    );

    expect(result.agents.hephaestus.reasoningEffort).toBe("low");
    expect(result.agents.oracle).not.toHaveProperty("reasoningEffort");
  });
});

describe("extractOfficialAgentSettings", () => {
  test("normalizes medium reasoning effort away and keeps non-default values", () => {
    const settings = extractOfficialAgentSettings({
      agents: {
        Hephaestus: {
          model: "openai/gpt-5.4",
          reasoningEffort: "medium"
        },
        oracle: {
          model: "openai/gpt-5.4",
          reasoningEffort: "high"
        }
      }
    });

    expect(settings.models.hephaestus).toBe("openai/gpt-5.4");
    expect(settings.reasoningEfforts.hephaestus).toBeUndefined();
    expect(settings.reasoningEfforts.oracle).toBe("high");
  });

  test("treats unsupported reasoning effort values as default medium", () => {
    const settings = extractOfficialAgentSettings({
      agents: {
        hephaestus: {
          model: "openai/gpt-5.4",
          reasoningEffort: "minimal"
        },
        oracle: {
          model: "openai/gpt-5.4",
          reasoningEffort: "none"
        }
      }
    });

    expect(settings.reasoningEfforts.hephaestus).toBeUndefined();
    expect(settings.reasoningEfforts.oracle).toBeUndefined();
  });
});

describe("writeOmoConfig", () => {
  test("writes through a temp file before replacing the target file", async () => {
    const renameSpy = vi.spyOn(fs, "rename");
    const writeFileSpy = vi.spyOn(fs, "writeFile");

    await writeOmoConfig({
      agents: {
        sisyphus: {
          model: "openai/gpt-5.4@opencode-high"
        }
      }
    });

    expect(writeFileSpy).toHaveBeenCalledWith(
      expect.stringMatching(/oh-my-opencode\.json\.tmp$/),
      expect.any(String),
      "utf8"
    );
    expect(renameSpy).toHaveBeenCalledWith(
      expect.stringMatching(/oh-my-opencode\.json\.tmp$/),
      expect.stringMatching(/oh-my-opencode\.json$/)
    );
  });

  test("writes a mirrored oh-my-opencode.jsonc file alongside oh-my-opencode.json", async () => {
    await writeOmoConfig({
      agents: {
        sisyphus: {
          model: "openai/gpt-5.4@opencode-high"
        }
      }
    });

    const jsonPath = path.join(tempHomePath, ".config", "opencode", "oh-my-opencode.json");
    const jsoncPath = path.join(
      tempHomePath,
      ".config",
      "opencode",
      "oh-my-opencode.jsonc"
    );

    await expect(fs.readFile(jsonPath, "utf8")).resolves.toBe(
      await fs.readFile(jsoncPath, "utf8")
    );
  });
});

describe("readOmoConfig", () => {
  test("reports which file is invalid when oh-my-opencode.json cannot be parsed", async () => {
    await fs.mkdir(path.join(tempHomePath, ".config", "opencode"), { recursive: true });
    await fs.writeFile(
      path.join(tempHomePath, ".config", "opencode", "oh-my-opencode.json"),
      "{ invalid json",
      "utf8"
    );

    await expect(readOmoConfig()).rejects.toThrow(/oh-my-opencode\.json/i);
  });
});
