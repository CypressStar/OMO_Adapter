import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import { normalizePresetRecord } from "../domain/presets.ts";
import type { PresetRecord } from "../domain/types.ts";

const presetRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  agentModels: z.record(z.string(), z.string()),
  agentReasoningEfforts: z.record(z.string(), z.string()).optional()
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
    presets: (parsed.presets as PresetRecord[]).map((preset) =>
      normalizePresetRecord(preset)
    ),
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
  const serializedStore = {
    ...store,
    presets: store.presets.map((preset) => {
      const normalizedPreset = normalizePresetRecord(preset);

      if (
        normalizedPreset.agentReasoningEfforts &&
        Object.keys(normalizedPreset.agentReasoningEfforts).length === 0
      ) {
        const { agentReasoningEfforts: _ignored, ...rest } = normalizedPreset;

        return rest;
      }

      return normalizedPreset;
    })
  };
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, JSON.stringify(serializedStore, null, 2), "utf8");
}
