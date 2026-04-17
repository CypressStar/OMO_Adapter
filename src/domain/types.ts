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

export type ReasoningEffort =
  | "low"
  | "medium"
  | "high"
  | "xhigh";

export type StoredReasoningEffort = Exclude<ReasoningEffort, "medium">;

export interface OfficialAgentDefinition {
  id: OfficialAgentId;
  label: string;
  description: string;
}

export interface ProviderEntry {
  id: string;
  label?: string;
  source: ProviderSource;
  models: string[];
}

export interface ProviderCatalog {
  providerOrder: string[];
  providers: Record<string, ProviderEntry>;
}

export type AgentModelMap = Record<OfficialAgentId, string>;

export type AgentReasoningEffortMap = Partial<
  Record<OfficialAgentId, StoredReasoningEffort>
>;

export interface PresetRecord {
  id: string;
  name: string;
  description: string;
  agentModels: AgentModelMap;
  agentReasoningEfforts?: AgentReasoningEffortMap;
}
