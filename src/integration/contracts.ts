import type { ProviderCatalog, PresetRecord } from "../domain/types";

export interface DriftState {
  status: "synced" | "drifted";
  changedAgents: string[];
}

export interface FileState {
  omoExists: boolean;
}

export interface AppSnapshot {
  providerCatalog: ProviderCatalog;
  configuredProviderIds: string[];
  presets: PresetRecord[];
  activePresetId: string;
  lastAppliedAt?: string;
  drift: DriftState;
  fileModels: Record<string, string>;
  fileState: FileState;
}
