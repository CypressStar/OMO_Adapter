import { OFFICIAL_AGENT_IDS } from "./agents.ts";
import type { AgentModelMap, PresetRecord, ProviderCatalog } from "./types.ts";

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
  fallbackModelRef: string;
}): PresetRecord {
  return {
    id: "default",
    name: "Default",
    description: "Baseline preset synchronized from the current OMO setup.",
    agentModels: fillMissingAgentModels(
      input.currentFileModels,
      input.fallbackModelRef
    )
  };
}
