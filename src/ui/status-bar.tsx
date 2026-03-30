import type { AppSnapshot } from "../integration/contracts";
import type { UiLanguage } from "../domain/ui-preferences";
import { getLocaleForLanguage, getUiCopy } from "./i18n";

interface StatusBarProps {
  language?: UiLanguage;
  snapshot: AppSnapshot | null;
}

export function StatusBar(props: StatusBarProps) {
  const language = props.language ?? "en";
  const copy = getUiCopy(language);
  const snapshot = props.snapshot;

  if (!snapshot) {
    return <footer className="status-bar">{copy.loadingConfiguration}</footer>;
  }

  const activePreset = snapshot.presets.find(
    (preset) => preset.id === snapshot.activePresetId
  );
  const lastAppliedLabel = snapshot.lastAppliedAt
    ? new Intl.DateTimeFormat(getLocaleForLanguage(language), {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(snapshot.lastAppliedAt))
    : copy.never;
  const driftLabel = snapshot.drift.status === "drifted" ? copy.drifted : copy.synced;

  return (
    <footer className="status-bar">
      <span>
        {copy.activePreset}: <strong>{activePreset?.name ?? copy.unknown}</strong>
      </span>
      <span>
        {copy.omoFile}: <strong>{snapshot.fileState.omoExists ? copy.present : copy.willBeCreated}</strong>
      </span>
      <span>
        {copy.drift}: <strong className={snapshot.drift.status === "drifted" ? "danger" : ""}>
          {driftLabel}
        </strong>
      </span>
      <span>
        {copy.lastApplied}: <strong>{lastAppliedLabel}</strong>
      </span>
      <span>
        {copy.providersDetected}: <strong>{snapshot.providerCatalog.providerOrder.length}</strong>
      </span>
    </footer>
  );
}
