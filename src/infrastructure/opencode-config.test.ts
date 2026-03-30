// @vitest-environment node

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { parseOpenCodeConfig, readOpenCodeConfig } from "./opencode-config.ts";

let tempHomePath = "";

beforeEach(async () => {
  tempHomePath = path.join(
    process.cwd(),
    ".tmp-tests",
    `opencode-config-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
  await fs.mkdir(path.join(tempHomePath, ".config", "opencode"), { recursive: true });
  vi.spyOn(os, "homedir").mockReturnValue(tempHomePath);
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.rm(tempHomePath, { recursive: true, force: true });
});

describe("parseOpenCodeConfig", () => {
  test("treats provider entries with npm packages as custom providers", () => {
    const result = parseOpenCodeConfig(`{
      "provider": {
        "bosson": {
          "npm": "@ai-sdk/openai-compatible",
          "models": {
            "claude-opus-4-6": {}
          }
        },
        "openai": {
          "options": {
            "apiKey": "sk-123"
          }
        }
      }
    }`);

    expect(result.customProviderIds).toEqual(["bosson"]);
    expect(result.configuredProviderIds).toEqual(["bosson", "openai"]);
  });

  test("reports which file is invalid when opencode.json cannot be parsed", async () => {
    await fs.writeFile(
      path.join(tempHomePath, ".config", "opencode", "opencode.json"),
      "{ invalid json",
      "utf8"
    );

    await expect(readOpenCodeConfig()).rejects.toThrow(/opencode\.json/i);
  });
});
