import fs from "node:fs/promises";
import path from "node:path";
import { getOpenCodeConfigPath } from "../domain/config-paths.ts";
import { z } from "zod";

const providerConfigSchema = z
  .object({
    npm: z.string().optional()
  })
  .passthrough();

const openCodeConfigSchema = z
  .object({
    provider: z.record(z.string(), providerConfigSchema).optional()
  })
  .passthrough();

export function parseOpenCodeConfig(content: string) {
  const parsed = openCodeConfigSchema.parse(JSON.parse(content));
  const providerEntries = Object.entries(parsed.provider ?? {});

  return {
    configuredProviderIds: providerEntries
      .map(([providerId]) => providerId)
      .sort((left, right) => left.localeCompare(right)),
    customProviderIds: providerEntries
      .filter(([, value]) => typeof value.npm === "string" && value.npm.length > 0)
      .map(([providerId]) => providerId)
      .sort((left, right) => left.localeCompare(right))
  };
}

export async function readOpenCodeConfig() {
  const targetPath = getOpenCodeConfigPath();

  try {
    const raw = await fs.readFile(targetPath, "utf8");
    return parseOpenCodeConfig(raw);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {
        configuredProviderIds: [],
        customProviderIds: []
      };
    }

    if (error instanceof SyntaxError || error instanceof z.ZodError) {
      throw new Error(
        `Failed to parse ${path.basename(targetPath)}: ${error.message}`
      );
    }

    throw error;
  }
}
