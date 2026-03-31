import { OFFICIAL_AGENT_IDS } from "./agents.ts";
import { normalizeReasoningEffortMap } from "./reasoning-effort.ts";
import type {
  AgentModelMap,
  AgentReasoningEffortMap,
  PresetRecord,
  ProviderCatalog
} from "./types.ts";

export function getFirstCatalogModelRef(
  catalog: ProviderCatalog
): string | undefined {
  for (const providerId of catalog.providerOrder) {
    const provider = catalog.providers[providerId];

    if (!provider || provider.models.length === 0) {
      continue;
    }

    return `${providerId}/${provider.models[0]}`;
  }

  return undefined;
}

export function fillMissingAgentModels(
  partial: Partial<AgentModelMap>,
  fallbackModelRef: string
): AgentModelMap {
  return Object.fromEntries(
    OFFICIAL_AGENT_IDS.map((agentId) => [
      agentId,
      partial[agentId] ?? fallbackModelRef
    ])
  ) as AgentModelMap;
}

export function createDefaultPreset(input: {
  currentFileModels: Partial<AgentModelMap>;
  currentFileReasoningEfforts?: Partial<Record<keyof AgentModelMap, unknown>>;
  fallbackModelRef: string;
}): PresetRecord {
  return {
    id: "default",
    name: "Default",
    description: "Baseline preset synchronized from the current OMO setup.",
    agentModels: fillMissingAgentModels(
      input.currentFileModels,
      input.fallbackModelRef
    ),
    agentReasoningEfforts: normalizeReasoningEffortMap(
      input.currentFileReasoningEfforts as
        | Partial<Record<keyof AgentModelMap, unknown>>
        | undefined
    )
  };
}

export function normalizePresetRecord(input: PresetRecord): PresetRecord {
  return {
    ...input,
    agentReasoningEfforts: normalizeReasoningEffortMap(
      input.agentReasoningEfforts as AgentReasoningEffortMap | undefined
    )
  };
}
