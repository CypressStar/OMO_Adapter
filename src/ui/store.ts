import { create } from "zustand";
import { startTransition } from "react";
import type { PresetRecord } from "../domain/types";
import type { AppSnapshot } from "../integration/contracts";
import { getBridge } from "./bridge";

interface AppStoreState {
  snapshot: AppSnapshot | null;
  selectedPresetId: string | null;
  draftPreset: PresetRecord | null;
  pendingConflictAction: "save" | "apply" | null;
  status: "idle" | "loading" | "ready" | "error";
  errorMessage: string | null;
  load(): Promise<void>;
  refreshSnapshot(): Promise<void>;
  refreshProviderCatalog(): Promise<void>;
  selectPreset(presetId: string): void;
  updateDraft(preset: PresetRecord): void;
  persistDraft(): Promise<void>;
  createPreset(): Promise<void>;
  duplicatePreset(presetId: string): Promise<void>;
  deletePreset(presetId: string): Promise<void>;
  movePreset(presetId: string, targetIndex: number): Promise<void>;
  activatePreset(presetId: string): Promise<void>;
  applyDraftToOmo(): Promise<void>;
  reapplyPresetToOmo(): Promise<void>;
  importFileToActivePreset(): Promise<void>;
}

function resolveSelectedPreset(snapshot: AppSnapshot) {
  return (
    snapshot.presets.find((preset) => preset.id === snapshot.activePresetId) ??
    snapshot.presets[0]
  );
}

function clonePreset(preset: PresetRecord) {
  return structuredClone(preset);
}

function findInsertedPreset(previous: AppSnapshot | null, next: AppSnapshot) {
  const previousIds = new Set(previous?.presets.map((preset) => preset.id) ?? []);

  return next.presets.find((preset) => !previousIds.has(preset.id)) ?? null;
}

function presetsEqual(left: PresetRecord | null, right: PresetRecord | null) {
  if (!left || !right) {
    return false;
  }

  return JSON.stringify(left) === JSON.stringify(right);
}

function mergeSnapshotIntoState(
  snapshot: AppSnapshot,
  currentState: Pick<AppStoreState, "selectedPresetId" | "draftPreset">
) {
  const fallbackPreset = resolveSelectedPreset(snapshot);
  const selectedPreset =
    snapshot.presets.find((preset) => preset.id === currentState.selectedPresetId) ??
    fallbackPreset;
  const shouldPreserveDraft =
    currentState.draftPreset?.id === selectedPreset.id;

  return {
    snapshot,
    selectedPresetId: selectedPreset.id,
    draftPreset: shouldPreserveDraft
      ? currentState.draftPreset
      : clonePreset(selectedPreset)
  };
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  snapshot: null,
  selectedPresetId: null,
  draftPreset: null,
  pendingConflictAction: null,
  status: "idle",
  errorMessage: null,
  async load() {
    set({ status: "loading", errorMessage: null });

    try {
      const snapshot = await getBridge().loadSnapshot();

      startTransition(() => {
        set({
          ...mergeSnapshotIntoState(snapshot, get()),
          pendingConflictAction: null,
          status: "ready"
        });
      });
    } catch (error) {
      set({
        status: "error",
        errorMessage:
          error instanceof Error ? error.message : "Failed to load snapshot."
      });
    }
  },
  async refreshSnapshot() {
    try {
      const snapshot = await getBridge().loadSnapshot();
      set({
        ...mergeSnapshotIntoState(snapshot, get())
      });
    } catch (error) {
      set({
        status: "error",
        errorMessage:
          error instanceof Error ? error.message : "Failed to refresh snapshot."
      });
    }
  },
  async refreshProviderCatalog() {
    try {
      const snapshot = await getBridge().refreshProviderCatalog();
      set({
        ...mergeSnapshotIntoState(snapshot, get()),
        pendingConflictAction: null
      });
    } catch (error) {
      set({
        status: "error",
        errorMessage:
          error instanceof Error
            ? error.message
            : "Failed to refresh provider catalog."
      });
    }
  },
  selectPreset(presetId) {
    const snapshot = get().snapshot;

    if (!snapshot) {
      return;
    }

    const preset = snapshot.presets.find((item) => item.id === presetId);

    if (!preset) {
      return;
    }

    set({
      selectedPresetId: presetId,
      draftPreset: clonePreset(preset),
      pendingConflictAction: null
    });
  },
  updateDraft(preset) {
    set({ draftPreset: clonePreset(preset) });
  },
  async persistDraft() {
    const { draftPreset, snapshot } = get();

    if (!draftPreset || !snapshot) {
      return;
    }

    const storedPreset =
      snapshot.presets.find((preset) => preset.id === draftPreset.id) ?? null;
    const isActivePreset = snapshot.activePresetId === draftPreset.id;
    const hasUnsavedChanges = !presetsEqual(draftPreset, storedPreset);

    if (isActivePreset && hasUnsavedChanges && snapshot.drift.status === "drifted") {
      set({ pendingConflictAction: "save" });
      return;
    }

    const nextSnapshot = await getBridge().savePreset(draftPreset);
    set({
      ...mergeSnapshotIntoState(nextSnapshot, {
        selectedPresetId: draftPreset.id,
        draftPreset
      }),
      selectedPresetId: draftPreset.id,
      draftPreset: clonePreset(
        nextSnapshot.presets.find((preset) => preset.id === draftPreset.id) ??
          draftPreset
      ),
      pendingConflictAction: null
    });
  },
  async createPreset() {
    const previousSnapshot = get().snapshot;
    const snapshot = await getBridge().createPreset();
    const selectedPreset = findInsertedPreset(previousSnapshot, snapshot)
      ?? resolveSelectedPreset(snapshot);
    set({
      snapshot,
      selectedPresetId: selectedPreset.id,
      draftPreset: clonePreset(selectedPreset),
      pendingConflictAction: null
    });
  },
  async duplicatePreset(presetId) {
    const previousSnapshot = get().snapshot;
    const snapshot = await getBridge().duplicatePreset(presetId);
    const selectedPreset = findInsertedPreset(previousSnapshot, snapshot)
      ?? resolveSelectedPreset(snapshot);
    set({
      snapshot,
      selectedPresetId: selectedPreset.id,
      draftPreset: clonePreset(selectedPreset),
      pendingConflictAction: null
    });
  },
  async deletePreset(presetId) {
    const snapshot = await getBridge().deletePreset(presetId);
    const selectedPreset = resolveSelectedPreset(snapshot);
    set({
      snapshot,
      selectedPresetId: selectedPreset.id,
      draftPreset: clonePreset(selectedPreset),
      pendingConflictAction: null
    });
  },
  async movePreset(presetId, targetIndex) {
    const snapshot = await getBridge().movePreset(presetId, targetIndex);
    set({
      ...mergeSnapshotIntoState(snapshot, get()),
      pendingConflictAction: null
    });
  },
  async activatePreset(presetId) {
    const snapshot = await getBridge().setActivePreset(presetId);
    const selectedPreset = snapshot.presets.find((preset) => preset.id === presetId);

    set({
      snapshot,
      selectedPresetId: presetId,
      draftPreset: clonePreset(selectedPreset ?? resolveSelectedPreset(snapshot)),
      pendingConflictAction: null
    });
  },
  async applyDraftToOmo() {
    const { draftPreset, snapshot } = get();

    if (!draftPreset || !snapshot || snapshot.activePresetId !== draftPreset.id) {
      return;
    }

    const storedPreset =
      snapshot.presets.find((preset) => preset.id === draftPreset.id) ?? null;
    const hasUnsavedChanges = !presetsEqual(draftPreset, storedPreset);

    if (hasUnsavedChanges && snapshot.drift.status === "drifted") {
      set({ pendingConflictAction: "apply" });
      return;
    }

    if (hasUnsavedChanges) {
      await getBridge().savePreset(draftPreset);
    }

    const nextSnapshot = await getBridge().applyActivePreset();
    const selectedPreset = resolveSelectedPreset(nextSnapshot);
    set({
      snapshot: nextSnapshot,
      selectedPresetId: selectedPreset.id,
      draftPreset: clonePreset(selectedPreset),
      pendingConflictAction: null
    });
  },
  async reapplyPresetToOmo() {
    const { draftPreset, snapshot } = get();

    if (!draftPreset || !snapshot || snapshot.activePresetId !== draftPreset.id) {
      return;
    }

    const storedPreset =
      snapshot.presets.find((preset) => preset.id === draftPreset.id) ?? null;
    const hasUnsavedChanges = !presetsEqual(draftPreset, storedPreset);

    if (hasUnsavedChanges) {
      await getBridge().savePreset(draftPreset);
    }

    const nextSnapshot = await getBridge().applyActivePreset();
    const selectedPreset = resolveSelectedPreset(nextSnapshot);
    set({
      snapshot: nextSnapshot,
      selectedPresetId: selectedPreset.id,
      draftPreset: clonePreset(selectedPreset),
      pendingConflictAction: null
    });
  },
  async importFileToActivePreset() {
    const snapshot = await getBridge().importFileToActivePreset();
    const selectedPreset = resolveSelectedPreset(snapshot);
    set({
      snapshot,
      selectedPresetId: selectedPreset.id,
      draftPreset: clonePreset(selectedPreset),
      pendingConflictAction: null
    });
  }
}));
