import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import type { PresetRecord } from "../domain/types.ts";

const presetRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  agentModels: z.record(z.string(), z.string())
});

const presetStoreSchema = z.object({
  presets: z.array(presetRecordSchema).default([]),
  activePresetId: z.string().optional(),
  lastAppliedAt: z.string().datetime().optional()
});

export interface PresetStoreData {
  presets: PresetRecord[];
  activePresetId?: string;
  lastAppliedAt?: string;
}

export function getPresetStorePath() {
  return path.join(os.homedir(), ".config", "opencode", "omo-adapter-presets.json");
}

export function normalizePresetStore(input: unknown): PresetStoreData {
  if (!input) {
    return {
      presets: [],
      activePresetId: undefined,
      lastAppliedAt: undefined
    };
  }

  const parsed = presetStoreSchema.parse(input);
  return {
    presets: parsed.presets as PresetRecord[],
    activePresetId: parsed.activePresetId,
    lastAppliedAt: parsed.lastAppliedAt
  };
}

export async function readPresetStore() {
  const targetPath = getPresetStorePath();

  try {
    const raw = await fs.readFile(targetPath, "utf8");
    return normalizePresetStore(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return normalizePresetStore(undefined);
    }

    if (error instanceof SyntaxError || error instanceof z.ZodError) {
      throw new Error(
        `Failed to parse ${path.basename(targetPath)}: ${error.message}`
      );
    }

    throw error;
  }
}

export async function writePresetStore(store: PresetStoreData) {
  const targetPath = getPresetStorePath();
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, JSON.stringify(store, null, 2), "utf8");
}
