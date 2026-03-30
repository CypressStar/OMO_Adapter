import { useEffect, useRef, useState } from "react";
import { PresetList } from "./ui/preset-list";
import { PresetEditor } from "./ui/preset-editor";
import { StatusBar } from "./ui/status-bar";
import { getBridge } from "./ui/bridge";
import { useAppStore } from "./ui/store";

export default function App() {
  const {
    snapshot,
    selectedPresetId,
    draftPreset,
    pendingConflictAction,
    status,
    errorMessage,
    load,
    refreshSnapshot,
    refreshProviderCatalog,
    selectPreset,
    updateDraft,
    persistDraft,
    createPreset,
    duplicatePreset,
    deletePreset,
    movePreset,
    activatePreset,
    applyDraftToOmo,
    reapplyPresetToOmo,
    importFileToActivePreset
  } = useAppStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isRefreshingCatalog, setIsRefreshingCatalog] = useState(false);
  const [catalogFeedback, setCatalogFeedback] = useState<string | null>(null);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  const activePresetId = snapshot?.activePresetId ?? "";
  const isActiveDraft = Boolean(draftPreset) && draftPreset?.id === activePresetId;

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const unsubscribe = getBridge().onConfigChanged(() => {
      void refreshSnapshot();
    });

    return () => {
      unsubscribe();
    };
  }, [refreshSnapshot]);

  useEffect(() => {
    if (!settingsOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [settingsOpen]);

  useEffect(() => {
    if (!catalogFeedback) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCatalogFeedback(null);
    }, 2200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [catalogFeedback]);

  if (status === "error") {
    return (
      <main className="app-shell">
        <div className="action-rail" data-testid="action-rail">
          <div className="floating-settings">
            <button className="settings-button" type="button">
              Settings
            </button>
          </div>
        </div>
        <section className="panel panel-editor panel-full">
          <h1>OMO Adapter</h1>
          <p>{errorMessage}</p>
        </section>
        <StatusBar snapshot={snapshot} />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="action-rail" data-testid="action-rail">
        <div className="floating-settings" ref={settingsRef}>
          <button
            aria-expanded={settingsOpen}
            className="settings-button"
            onClick={() => {
              setSettingsOpen((current) => !current);
            }}
            type="button"
          >
            Settings
          </button>
          {settingsOpen ? (
            <div className="settings-popover">
              <button
                disabled={isRefreshingCatalog}
                className="ghost-button settings-action"
                onClick={async () => {
                  setIsRefreshingCatalog(true);
                  setCatalogFeedback(null);

                  try {
                    await refreshProviderCatalog();
                    setCatalogFeedback("Catalog refreshed");
                    setSettingsOpen(false);
                  } finally {
                    setIsRefreshingCatalog(false);
                  }
                }}
                type="button"
              >
                {isRefreshingCatalog ? "Refreshing..." : "Refresh Model Catalog"}
              </button>
            </div>
          ) : null}
          {catalogFeedback ? (
            <div className="settings-feedback" role="status">
              {catalogFeedback}
            </div>
          ) : null}
        </div>
      </div>
      <section className="workspace-grid">
        <PresetList
          presets={snapshot?.presets ?? []}
          activePresetId={activePresetId}
          selectedPresetId={selectedPresetId}
          onSelect={selectPreset}
          onActivate={(presetId) => {
            void activatePreset(presetId);
          }}
          onDuplicate={(presetId) => {
            void duplicatePreset(presetId);
          }}
          onDelete={(presetId) => {
            void deletePreset(presetId);
          }}
          onMove={(presetId, targetIndex) => {
            void movePreset(presetId, targetIndex);
          }}
          onCreate={() => {
            void createPreset();
          }}
        />
        <PresetEditor
          providerCatalog={
            snapshot?.providerCatalog ?? {
              providerOrder: [],
              providers: {}
            }
          }
          draftPreset={draftPreset}
          drift={snapshot?.drift ?? null}
          showDriftWarning={pendingConflictAction !== null && isActiveDraft}
          canApply={isActiveDraft}
          onChange={updateDraft}
          onSave={() => {
            void persistDraft();
          }}
          onApply={() => {
            void applyDraftToOmo();
          }}
          onReapply={() => {
            void reapplyPresetToOmo();
          }}
          onImport={() => {
            void importFileToActivePreset();
          }}
        />
      </section>
      <StatusBar snapshot={snapshot} />
    </main>
  );
}
