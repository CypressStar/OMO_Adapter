export type OfficialAgentId =
  | "sisyphus"
  | "hephaestus"
  | "oracle"
  | "librarian"
  | "explore"
  | "multimodal-looker"
  | "prometheus"
  | "metis"
  | "momus"
  | "atlas"
  | "sisyphus-junior";

export type ProviderSource = "official" | "custom";

export interface OfficialAgentDefinition {
  id: OfficialAgentId;
  label: string;
  description: string;
}

export interface ProviderEntry {
  id: string;
  source: ProviderSource;
  models: string[];
}

export interface ProviderCatalog {
  providerOrder: string[];
  providers: Record<string, ProviderEntry>;
}

export type AgentModelMap = Record<OfficialAgentId, string>;

export interface PresetRecord {
  id: string;
  name: string;
  description: string;
  agentModels: AgentModelMap;
}
