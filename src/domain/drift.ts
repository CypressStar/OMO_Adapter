import { getEffectiveReasoningEffort } from "./reasoning-effort.ts";

export function detectDrift(input: {
  presetModels: Record<string, string>;
  fileModels: Record<string, string>;
  presetReasoningEfforts?: Record<string, string | undefined>;
  fileReasoningEfforts?: Record<string, string | undefined>;
}) {
  const changedAgents = Object.keys(input.presetModels).filter((agentId) => {
    return (
      input.presetModels[agentId] !== input.fileModels[agentId] ||
      getEffectiveReasoningEffort(input.presetReasoningEfforts?.[agentId]) !==
        getEffectiveReasoningEffort(input.fileReasoningEfforts?.[agentId])
    );
  });

  return {
    status: changedAgents.length > 0 ? "drifted" : "synced",
    changedAgents
  } as const;
}
