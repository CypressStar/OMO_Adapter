import { useEffect, useRef, useState } from "react";
import { PresetList } from "./ui/preset-list";
import { PresetEditor } from "./ui/preset-editor";
import { StatusBar } from "./ui/status-bar";
import { getBridge } from "./ui/bridge";
import { useAppStore } from "./ui/store";
import { getUiCopy } from "./ui/i18n";

export default function App() {
  const {
    snapshot,
    selectedPresetId,
    draftPreset,
    language,
    pendingConflictAction,
    status,
    errorMessage,
    load,
    refreshSnapshot,
    refreshProviderCatalog,
    setLanguage,
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
  const copy = getUiCopy(language);

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
              {copy.settings}
            </button>
          </div>
        </div>
        <section className="panel panel-editor panel-full">
          <h1>{copy.appTitle}</h1>
          <p>{errorMessage}</p>
        </section>
        <StatusBar language={language} snapshot={snapshot} />
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
            {copy.settings}
          </button>
          {settingsOpen ? (
            <div className="settings-popover">
              <div className="settings-section">
                <p className="settings-section-label">{copy.language}</p>
                <div className="settings-language-row">
                  <button
                    aria-pressed={language === "en"}
                    className="ghost-button settings-chip"
                    onClick={async () => {
                      await setLanguage("en");
                    }}
                    type="button"
                  >
                    {copy.english}
                  </button>
                  <button
                    aria-pressed={language === "zh-CN"}
                    className="ghost-button settings-chip"
                    onClick={async () => {
                      await setLanguage("zh-CN");
                    }}
                    type="button"
                  >
                    {copy.simplifiedChinese}
                  </button>
                </div>
              </div>
              <button
                disabled={isRefreshingCatalog}
                className="ghost-button settings-action"
                onClick={async () => {
                  setIsRefreshingCatalog(true);
                  setCatalogFeedback(null);

                  try {
                    await refreshProviderCatalog();
                    setCatalogFeedback(copy.catalogRefreshed);
                    setSettingsOpen(false);
                  } finally {
                    setIsRefreshingCatalog(false);
                  }
                }}
                type="button"
              >
                {isRefreshingCatalog ? copy.refreshing : copy.refreshModelCatalog}
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
          copy={copy}
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
          copy={copy}
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
      <StatusBar language={language} snapshot={snapshot} />
    </main>
  );
}
