import type { DriftState } from "../integration/contracts";
import { OFFICIAL_AGENTS } from "../domain/agents";
import type { PresetRecord, ProviderCatalog } from "../domain/types";
import { resolveProviderModelRefStatus } from "../domain/provider-catalog.ts";

interface PresetEditorProps {
  providerCatalog: ProviderCatalog;
  draftPreset: PresetRecord | null;
  drift: DriftState | null;
  showDriftWarning: boolean;
  canApply: boolean;
  onChange(preset: PresetRecord): void;
  onSave(): void;
  onApply(): void;
  onReapply(): void;
  onImport(): void;
}

export function PresetEditor(props: PresetEditorProps) {
  if (!props.draftPreset) {
    return (
      <section className="panel panel-editor">
        <div className="panel-scroll">
          <h2>No preset selected</h2>
        </div>
      </section>
    );
  }

  const draftPreset = props.draftPreset;

  return (
    <section className="panel panel-editor">
      <div className="panel-scroll">
        <div className="editor-header">
          <div>
            <p className="section-label">Preset Editor</p>
            <h2 title={draftPreset.name}>{draftPreset.name}</h2>
            <p className="eyebrow editor-note">
              {props.canApply
                ? "This preset is active. Saving updates the preset record, and applying writes the edited mapping into OMO."
                : "This preset is not active. Save your edits here, then use Activate from the preset list to switch and overwrite OMO."}
            </p>
          </div>
          <div className="editor-actions">
            <button className="ghost-button" onClick={props.onSave} type="button">
              Save Preset
            </button>
            {props.canApply ? (
              <>
                <button className="ghost-button" onClick={props.onImport} type="button">
                  Import from file
                </button>
                <button className="primary-button" onClick={props.onApply} type="button">
                  Apply
                </button>
              </>
            ) : null}
          </div>
        </div>

        {props.showDriftWarning && props.drift?.status === "drifted" ? (
          <section className="drift-banner">
            <div>
              <p className="section-label">Drift Detected</p>
              <strong>Current OMO file differs from the active preset.</strong>
              <p>
                {props.drift.changedAgents.length} agent
                {props.drift.changedAgents.length === 1 ? "" : "s"} changed.
              </p>
              <p className="eyebrow drift-copy">
                Import the current OMO file into this active preset, or reapply your
                edited preset to overwrite the file.
              </p>
            </div>
            <div className="editor-actions">
              <button className="ghost-button" onClick={props.onImport} type="button">
                Import from file
              </button>
              <button className="primary-button" onClick={props.onReapply} type="button">
                Apply
              </button>
            </div>
          </section>
        ) : null}

        <div className="editor-meta">
          <label className="field">
            <span>Name</span>
            <input
              value={draftPreset.name}
              onChange={(event) =>
                props.onChange({
                  ...draftPreset,
                  name: event.target.value
                })
              }
            />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea
              rows={2}
              value={draftPreset.description}
              onChange={(event) =>
                props.onChange({
                  ...draftPreset,
                  description: event.target.value
                })
              }
            />
          </label>
        </div>

        <div className="agent-grid">
          {OFFICIAL_AGENTS.map((agent) => {
            const currentModelRef = draftPreset.agentModels[agent.id];
            const modelRefStatus = resolveProviderModelRefStatus(
              props.providerCatalog,
              currentModelRef
            );
            const providerId =
              modelRefStatus.kind === "invalid-format"
                ? "__invalid__"
                : modelRefStatus.providerId;
            const modelId =
              modelRefStatus.kind === "invalid-format"
                ? modelRefStatus.rawValue
                : modelRefStatus.modelId;
            const modelOptions =
              modelRefStatus.kind === "invalid-format"
                ? []
                : props.providerCatalog.providers[modelRefStatus.providerId]?.models ?? [];
            const providerWarning =
              modelRefStatus.kind === "unsupported-provider"
                ? `Unsupported provider: ${modelRefStatus.providerId}`
                : modelRefStatus.kind === "invalid-format"
                  ? `Unsupported model reference: ${modelRefStatus.rawValue}`
                  : null;
            const modelWarning =
              modelRefStatus.kind === "unsupported-model"
                ? `Unsupported model: ${modelRefStatus.modelId}`
                : null;

            return (
              <article className="agent-card" key={agent.id}>
                <div className="agent-copy">
                  <p className="section-label">{agent.label}</p>
                  <p>{agent.description}</p>
                </div>
                <div className="selector-row">
                  <label className="field compact-field">
                    <span>Provider</span>
                    <select
                      value={providerId}
                      onChange={(event) => {
                        const nextProviderId = event.target.value;
                        if (nextProviderId.startsWith("__")) {
                          return;
                        }
                        const nextProvider =
                          props.providerCatalog.providers[nextProviderId];
                        const nextModelId = nextProvider?.models[0] ?? "";
                        props.onChange({
                          ...draftPreset,
                          agentModels: {
                            ...draftPreset.agentModels,
                            [agent.id]: nextModelId
                              ? `${nextProviderId}/${nextModelId}`
                              : currentModelRef
                          }
                        });
                      }}
                    >
                      <option value="">Select provider</option>
                      {modelRefStatus.kind === "invalid-format" ? (
                        <option value="__invalid__">Invalid reference</option>
                      ) : null}
                      {modelRefStatus.kind === "unsupported-provider" ? (
                        <option value={modelRefStatus.providerId}>
                          {modelRefStatus.providerId} (Unavailable)
                        </option>
                      ) : null}
                      <optgroup label="Official providers">
                        {props.providerCatalog.providerOrder
                          .filter(
                            (item) =>
                              props.providerCatalog.providers[item]?.source === "official"
                          )
                          .map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="Custom providers">
                        {props.providerCatalog.providerOrder
                          .filter(
                            (item) =>
                              props.providerCatalog.providers[item]?.source === "custom"
                          )
                          .map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </label>
                  <label className="field compact-field">
                    <span>Model</span>
                    <select
                      value={modelId}
                      onChange={(event) =>
                        props.onChange({
                          ...draftPreset,
                          agentModels: {
                            ...draftPreset.agentModels,
                            [agent.id]: !providerId || providerId.startsWith("__")
                              ? currentModelRef
                              : `${providerId}/${event.target.value}`
                          }
                        })
                      }
                    >
                      {modelRefStatus.kind === "invalid-format" ? (
                        <option value={modelRefStatus.rawValue}>
                          {modelRefStatus.rawValue}
                        </option>
                      ) : null}
                      {modelRefStatus.kind === "unsupported-model" ? (
                        <option value={modelRefStatus.modelId}>
                          {modelRefStatus.modelId} (Unavailable)
                        </option>
                      ) : null}
                      {!modelOptions.length && modelRefStatus.kind === "unsupported-provider" ? (
                        <option value={modelRefStatus.modelId}>
                          {modelRefStatus.modelId}
                        </option>
                      ) : null}
                      {modelOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {providerWarning || modelWarning ? (
                  <p className="field-hint field-hint-warning">
                    {providerWarning ?? modelWarning}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
