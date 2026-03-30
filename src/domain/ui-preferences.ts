export type UiLanguage = "en" | "zh-CN";

export interface UiPreferences {
  language: UiLanguage;
}

export function resolveDefaultUiLanguage(locale?: string): UiLanguage {
  return locale?.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}
