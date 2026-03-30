export function detectDrift(input: {
  presetModels: Record<string, string>;
  fileModels: Record<string, string>;
}) {
  const changedAgents = Object.keys(input.presetModels).filter((agentId) => {
    return input.presetModels[agentId] !== input.fileModels[agentId];
  });

  return {
    status: changedAgents.length > 0 ? "drifted" : "synced",
    changedAgents
  } as const;
}
