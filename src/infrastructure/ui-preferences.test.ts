// @vitest-environment node

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  getUiPreferencesPath,
  readUiPreferences,
  writeUiPreferences
} from "./ui-preferences.ts";

let tempHomePath = "";

beforeEach(async () => {
  tempHomePath = path.join(
    process.cwd(),
    ".tmp-tests",
    `ui-preferences-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
  await fs.mkdir(tempHomePath, { recursive: true });
  vi.spyOn(os, "homedir").mockReturnValue(tempHomePath);
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.rm(tempHomePath, { recursive: true, force: true });
});

describe("ui-preferences", () => {
  test("defaults to simplified Chinese for zh locales when the file is missing", async () => {
    await expect(readUiPreferences("zh-CN")).resolves.toEqual({
      language: "zh-CN"
    });
  });

  test("persists the selected language", async () => {
    await writeUiPreferences({ language: "en" });

    await expect(readUiPreferences("zh-CN")).resolves.toEqual({
      language: "en"
    });
  });

  test("reports which file is invalid when the ui preference file cannot be parsed", async () => {
    const preferencesPath = getUiPreferencesPath();
    await fs.mkdir(path.dirname(preferencesPath), { recursive: true });
    await fs.writeFile(preferencesPath, "{ invalid json", "utf8");

    await expect(readUiPreferences("en")).rejects.toThrow(/omo-adapter-ui\.json/i);
  });
});
