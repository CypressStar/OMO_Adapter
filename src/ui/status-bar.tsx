import type { AppSnapshot } from "../integration/contracts";

interface StatusBarProps {
  snapshot: AppSnapshot | null;
}

export function StatusBar(props: StatusBarProps) {
  const snapshot = props.snapshot;

  if (!snapshot) {
    return <footer className="status-bar">Loading configuration...</footer>;
  }

  const activePreset = snapshot.presets.find(
    (preset) => preset.id === snapshot.activePresetId
  );
  const lastAppliedLabel = snapshot.lastAppliedAt
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(snapshot.lastAppliedAt))
    : "Never";

  return (
    <footer className="status-bar">
      <span>
        Active preset: <strong>{activePreset?.name ?? "Unknown"}</strong>
      </span>
      <span>
        OMO file: <strong>{snapshot.fileState.omoExists ? "Present" : "Will be created"}</strong>
      </span>
      <span>
        Drift: <strong className={snapshot.drift.status === "drifted" ? "danger" : ""}>
          {snapshot.drift.status}
        </strong>
      </span>
      <span>
        Last applied: <strong>{lastAppliedLabel}</strong>
      </span>
      <span>
        Providers detected: <strong>{snapshot.providerCatalog.providerOrder.length}</strong>
      </span>
    </footer>
  );
}
