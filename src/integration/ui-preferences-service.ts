import {
  readUiPreferences,
  writeUiPreferences
} from "../infrastructure/ui-preferences.ts";
import type { UiLanguage } from "../domain/ui-preferences.ts";

export async function loadUiPreferences() {
  return readUiPreferences(Intl.DateTimeFormat().resolvedOptions().locale);
}

export async function setUiLanguage(language: UiLanguage) {
  const nextPreferences = { language } as const;

  await writeUiPreferences(nextPreferences);

  return nextPreferences;
}
