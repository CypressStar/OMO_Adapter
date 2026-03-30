import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import {
  resolveDefaultUiLanguage,
  type UiLanguage,
  type UiPreferences
} from "../domain/ui-preferences.ts";

const uiPreferencesSchema = z.object({
  language: z.enum(["en", "zh-CN"]).optional()
});

export function getUiPreferencesPath() {
  return path.join(os.homedir(), ".config", "opencode", "omo-adapter-ui.json");
}

function resolveFallbackPreferences(systemLocale?: string): UiPreferences {
  return {
    language: resolveDefaultUiLanguage(systemLocale)
  };
}

export async function readUiPreferences(systemLocale?: string): Promise<UiPreferences> {
  const targetPath = getUiPreferencesPath();
  const fallbackPreferences = resolveFallbackPreferences(systemLocale);

  try {
    const raw = await fs.readFile(targetPath, "utf8");
    const parsed = uiPreferencesSchema.parse(JSON.parse(raw));

    return {
      language: parsed.language ?? fallbackPreferences.language
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return fallbackPreferences;
    }

    if (error instanceof SyntaxError || error instanceof z.ZodError) {
      throw new Error(
        `Failed to parse ${path.basename(targetPath)}: ${error.message}`
      );
    }

    throw error;
  }
}

export async function writeUiPreferences(preferences: UiPreferences) {
  const targetPath = getUiPreferencesPath();

  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, JSON.stringify(preferences, null, 2), "utf8");
}
