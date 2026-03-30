import { useState } from "react";
import type { PresetRecord } from "../domain/types";

const MAX_PRESET_NAME_DISPLAY_LENGTH = 30;

function truncatePresetName(name: string) {
  if (name.length <= MAX_PRESET_NAME_DISPLAY_LENGTH) {
    return name;
  }

  return `${name.slice(0, MAX_PRESET_NAME_DISPLAY_LENGTH - 3)}...`;
}

interface PresetListProps {
  presets: PresetRecord[];
  activePresetId: string;
  selectedPresetId: string | null;
  onSelect(presetId: string): void;
  onActivate(presetId: string): void;
  onDuplicate(presetId: string): void;
  onDelete(presetId: string): void;
  onMove(presetId: string, targetIndex: number): void;
  onCreate(): void;
}

export function PresetList(props: PresetListProps) {
  const [draggingPresetId, setDraggingPresetId] = useState<string | null>(null);
  const [dropTargetPresetId, setDropTargetPresetId] = useState<string | null>(null);

  return (
    <aside className="panel panel-sidebar">
      <div className="panel-scroll">
        <div className="sidebar-header">
          <div>
            <p className="section-label">OMO Adapter</p>
            <h1>Agent Presets</h1>
          </div>
          <button className="ghost-button" onClick={props.onCreate} type="button">
            New
          </button>
        </div>
        <p className="eyebrow">
          Manage official OMO agent model layouts and switch what gets written to
          `oh-my-opencode.json`.
        </p>
        <div className="preset-list">
          {props.presets.map((preset, index) => {
            const isActive = preset.id === props.activePresetId;
            const isSelected = preset.id === props.selectedPresetId;
            const displayName = truncatePresetName(preset.name);

            return (
              <article
                key={preset.id}
                className={`preset-card${isActive ? " is-active" : ""}${
                  isSelected ? " is-selected" : ""
                }${draggingPresetId === preset.id ? " is-dragging" : ""}${
                  dropTargetPresetId === preset.id ? " is-drop-target" : ""
                }`}
                onClick={() => {
                  props.onSelect(preset.id);
                }}
                onDragLeave={() => {
                  if (dropTargetPresetId === preset.id) {
                    setDropTargetPresetId(null);
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (draggingPresetId && draggingPresetId !== preset.id) {
                    setDropTargetPresetId(preset.id);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const sourcePresetId = event.dataTransfer.getData("text/preset-id");
                  setDropTargetPresetId(null);
                  setDraggingPresetId(null);

                  if (!sourcePresetId || sourcePresetId === preset.id) {
                    return;
                  }

                  props.onMove(sourcePresetId, index);
                }}
              >
                <div className="preset-card-head">
                  <div className="preset-card-title">
                    <button
                      aria-label={`Move preset ${preset.name}`}
                      className="drag-handle"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/preset-id", preset.id);
                        setDraggingPresetId(preset.id);
                      }}
                      onDragEnd={() => {
                        setDraggingPresetId(null);
                        setDropTargetPresetId(null);
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                      type="button"
                    >
                      ≡
                    </button>
                    <button
                      className="preset-select-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        props.onSelect(preset.id);
                      }}
                      title={preset.name}
                      type="button"
                    >
                      <strong>{displayName}</strong>
                    </button>
                  </div>
                  {isActive ? <span className="active-chip">Active</span> : null}
                </div>
                <p>{preset.description || "No description yet."}</p>
                <div className="preset-actions">
                  {!isActive ? (
                    <button
                      aria-label={`Activate preset ${preset.name}`}
                      className="ghost-button action-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        props.onActivate(preset.id);
                      }}
                      type="button"
                    >
                      Activate
                    </button>
                  ) : null}
                  <button
                    aria-label={`Duplicate preset ${preset.name}`}
                    className="ghost-button action-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      props.onDuplicate(preset.id);
                    }}
                    type="button"
                  >
                    Duplicate
                  </button>
                  {props.presets.length > 1 ? (
                    <button
                      aria-label={`Delete preset ${preset.name}`}
                      className="ghost-button action-button danger-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        props.onDelete(preset.id);
                      }}
                      type="button"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
