import type { OfficialAgentDefinition, OfficialAgentId } from "./types.ts";

export const OFFICIAL_AGENTS: OfficialAgentDefinition[] = [
  {
    id: "sisyphus",
    label: "Sisyphus",
    description: "Primary coordinator for task orchestration and delegation."
  },
  {
    id: "hephaestus",
    label: "Hephaestus",
    description: "Deep execution specialist for autonomous implementation."
  },
  {
    id: "oracle",
    label: "Oracle",
    description: "Strategic advisor for architecture and debugging decisions."
  },
  {
    id: "librarian",
    label: "Librarian",
    description: "Research specialist for docs, repositories, and references."
  },
  {
    id: "explore",
    label: "Explore",
    description: "Fast codebase exploration and pattern lookup agent."
  },
  {
    id: "multimodal-looker",
    label: "Multimodal-Looker",
    description: "Media analysis specialist for PDFs, images, and charts."
  },
  {
    id: "prometheus",
    label: "Prometheus",
    description: "Planning and requirement analysis specialist."
  },
  {
    id: "metis",
    label: "Metis",
    description: "Pre-planning analyst for hidden risks and requirements."
  },
  {
    id: "momus",
    label: "Momus",
    description: "Plan reviewer focused on clarity and completeness."
  },
  {
    id: "atlas",
    label: "Atlas",
    description: "Secondary coordinator for larger or alternate workflows."
  },
  {
    id: "sisyphus-junior",
    label: "Sisyphus-Junior",
    description: "Lightweight executor for smaller delegated tasks."
  }
];

export const OFFICIAL_AGENT_IDS = OFFICIAL_AGENTS.map(
  (agent) => agent.id
) satisfies OfficialAgentId[];

export const OFFICIAL_AGENT_MAP = Object.fromEntries(
  OFFICIAL_AGENTS.map((agent) => [agent.id, agent])
) as Record<OfficialAgentId, OfficialAgentDefinition>;
