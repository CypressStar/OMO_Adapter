import type {
  AgentReasoningEffortMap,
  OfficialAgentId,
  ReasoningEffort,
  StoredReasoningEffort
} from "./types.ts";

export const REASONING_EFFORT_OPTIONS = [
  "low",
  "medium",
  "high",
  "xhigh"
] as const satisfies ReasoningEffort[];

export const STORED_REASONING_EFFORT_OPTIONS = [
  "low",
  "high",
  "xhigh"
] as const satisfies StoredReasoningEffort[];

export function normalizeReasoningEffort(
  rawValue: unknown
): StoredReasoningEffort | undefined {
  if (typeof rawValue !== "string") {
    return undefined;
  }

  const value = rawValue.trim().toLowerCase();

  if (!value || value === "medium") {
    return undefined;
  }

  return STORED_REASONING_EFFORT_OPTIONS.find((item) => item === value);
}

export function getEffectiveReasoningEffort(
  rawValue: unknown
): ReasoningEffort {
  return normalizeReasoningEffort(rawValue) ?? "medium";
}

export function normalizeReasoningEffortMap(
  input?: Partial<Record<OfficialAgentId, unknown>>
): AgentReasoningEffortMap {
  const result: AgentReasoningEffortMap = {};

  for (const [agentId, rawValue] of Object.entries(input ?? {})) {
    const normalizedValue = normalizeReasoningEffort(rawValue);

    if (!normalizedValue) {
      continue;
    }

    result[agentId as OfficialAgentId] = normalizedValue;
  }

  return result;
}
