import fs from "node:fs/promises";
import path from "node:path";
import { OFFICIAL_AGENTS, OFFICIAL_AGENT_MAP } from "../domain/agents.ts";
import {
  getOmoConfigJsoncPath,
  getOmoConfigPath
} from "../domain/config-paths.ts";
import type { OfficialAgentId } from "../domain/types.ts";

export interface OmoAgentEntry {
  model?: string;
  description?: string;
  [key: string]: unknown;
}

export interface OmoConfig {
  agents?: Record<string, OmoAgentEntry>;
  hooks?: {
    pre?: { enabled?: boolean };
    post?: { enabled?: boolean };
  };
  mcp?: {
    enabled?: boolean;
  };
  [key: string]: unknown;
}

export type OfficialAgentModelMap = Record<OfficialAgentId, string>;

function canonicalizeKey(rawKey: string) {
  return rawKey.trim().toLowerCase().replace(/[\s_]+/g, "-");
}

const OFFICIAL_KEY_MAP = new Map<string, OfficialAgentId>(
  OFFICIAL_AGENTS.flatMap((agent) => [
    [agent.id, agent.id],
    [canonicalizeKey(agent.label), agent.id]
  ])
);

export function normalizeOfficialAgentKey(
  rawKey: string
): OfficialAgentId | null {
  return OFFICIAL_KEY_MAP.get(canonicalizeKey(rawKey)) ?? null;
}

export function extractOfficialAgentModels(
  config: OmoConfig
): Partial<OfficialAgentModelMap> {
  const result: Partial<OfficialAgentModelMap> = {};

  for (const [rawKey, value] of Object.entries(config.agents ?? {})) {
    const officialId = normalizeOfficialAgentKey(rawKey);

    if (!officialId || typeof value?.model !== "string") {
      continue;
    }

    result[officialId] = value.model;
  }

  return result;
}

export function buildDefaultOmoConfig(
  presetModels: OfficialAgentModelMap
): Required<Pick<OmoConfig, "agents" | "hooks" | "mcp">> {
  return {
    agents: Object.fromEntries(
      OFFICIAL_AGENTS.map((agent) => [
        agent.id,
        {
          model: presetModels[agent.id],
          description: agent.description
        }
      ])
    ),
    hooks: {
      pre: { enabled: true },
      post: { enabled: true }
    },
    mcp: {
      enabled: true
    }
  };
}

export function applyPresetToOmoConfig(
  existingConfig: OmoConfig | undefined,
  presetModels: OfficialAgentModelMap
): OmoConfig {
  const baseline = buildDefaultOmoConfig(presetModels);
  const config: OmoConfig = existingConfig
    ? {
        ...existingConfig,
        agents: {
          ...(existingConfig.agents ?? {})
        }
      }
    : baseline;

  if (!config.agents) {
    config.agents = {};
  }

  for (const agent of OFFICIAL_AGENTS) {
    const existingAgent = config.agents[agent.id] ?? {};
    config.agents[agent.id] = {
      ...existingAgent,
      model: presetModels[agent.id],
      description:
        typeof existingAgent.description === "string"
          ? existingAgent.description
          : OFFICIAL_AGENT_MAP[agent.id].description
    };
  }

  config.hooks = config.hooks ?? baseline.hooks;
  config.hooks.pre = config.hooks.pre ?? baseline.hooks.pre;
  config.hooks.post = config.hooks.post ?? baseline.hooks.post;
  config.mcp = config.mcp ?? baseline.mcp;

  return config;
}

export function parseOmoConfig(content: string): OmoConfig {
  return JSON.parse(content) as OmoConfig;
}

export async function readOmoConfig() {
  const targetPath = getOmoConfigPath();

  try {
    const raw = await fs.readFile(targetPath, "utf8");
    return {
      exists: true,
      config: parseOmoConfig(raw)
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {
        exists: false,
        config: undefined
      };
    }

    if (error instanceof SyntaxError) {
      throw new Error(
        `Failed to parse ${path.basename(targetPath)}: ${error.message}`
      );
    }

    throw error;
  }
}

async function writeConfigFileAtomically(targetPath: string, content: string) {
  const tempPath = `${targetPath}.tmp`;

  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(tempPath, content, "utf8");

  try {
    await fs.rename(tempPath, targetPath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code !== "EEXIST" && code !== "EPERM") {
      await fs.rm(tempPath, { force: true });
      throw error;
    }

    await fs.rm(targetPath, { force: true });
    await fs.rename(tempPath, targetPath);
  }
}

export async function writeOmoConfig(config: OmoConfig) {
  const serializedConfig = JSON.stringify(config, null, 2);

  // Validate the serialized payload before touching the target file.
  JSON.parse(serializedConfig);

  await Promise.all([
    writeConfigFileAtomically(getOmoConfigPath(), serializedConfig),
    writeConfigFileAtomically(getOmoConfigJsoncPath(), serializedConfig)
  ]);
}
