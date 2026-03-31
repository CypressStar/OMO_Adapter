import type { UiLanguage } from "../domain/ui-preferences.ts";

export interface UiCopy {
  appTitle: string;
  settings: string;
  refreshModelCatalog: string;
  refreshing: string;
  catalogRefreshed: string;
  language: string;
  english: string;
  simplifiedChinese: string;
  agentPresets: string;
  sidebarNote: string;
  newPreset: string;
  active: string;
  noDescriptionYet: string;
  movePreset(name: string): string;
  activatePreset(name: string): string;
  duplicatePreset(name: string): string;
  deletePreset(name: string): string;
  activate: string;
  duplicate: string;
  delete: string;
  presetEditor: string;
  noPresetSelected: string;
  activePresetNote: string;
  inactivePresetNote: string;
  savePreset: string;
  importFromFile: string;
  apply: string;
  driftDetected: string;
  currentOmoDiffers: string;
  changedAgents(count: number): string;
  driftCopy: string;
  name: string;
  description: string;
  provider: string;
  model: string;
  reasoning: string;
  reasoningDefault: string;
  selectProvider: string;
  invalidReference: string;
  officialProviders: string;
  customProviders: string;
  unsupportedProvider(providerId: string): string;
  unsupportedModelReference(rawValue: string): string;
  unsupportedModel(modelId: string): string;
  unavailableLabel(value: string): string;
  loadingConfiguration: string;
  activePreset: string;
  unknown: string;
  omoFile: string;
  present: string;
  willBeCreated: string;
  drift: string;
  synced: string;
  drifted: string;
  lastApplied: string;
  never: string;
  providersDetected: string;
}

const uiCopy: Record<UiLanguage, UiCopy> = {
  en: {
    appTitle: "OMO Adapter",
    settings: "Settings",
    refreshModelCatalog: "Refresh Model Catalog",
    refreshing: "Refreshing...",
    catalogRefreshed: "Catalog refreshed",
    language: "Language",
    english: "English",
    simplifiedChinese: "简体中文",
    agentPresets: "Agent Presets",
    sidebarNote:
      "Manage official OMO agent model layouts and switch what gets written to `oh-my-opencode.json`.",
    newPreset: "New",
    active: "Active",
    noDescriptionYet: "No description yet.",
    movePreset: (name) => `Move preset ${name}`,
    activatePreset: (name) => `Activate preset ${name}`,
    duplicatePreset: (name) => `Duplicate preset ${name}`,
    deletePreset: (name) => `Delete preset ${name}`,
    activate: "Activate",
    duplicate: "Duplicate",
    delete: "Delete",
    presetEditor: "Preset Editor",
    noPresetSelected: "No preset selected",
    activePresetNote:
      "This preset is active. Saving updates the preset record, and applying writes the edited mapping into OMO.",
    inactivePresetNote:
      "This preset is not active. Save your edits here, then use Activate from the preset list to switch and overwrite OMO.",
    savePreset: "Save Preset",
    importFromFile: "Import from file",
    apply: "Apply",
    driftDetected: "Drift Detected",
    currentOmoDiffers: "Current OMO file differs from the active preset.",
    changedAgents: (count) => `${count} agent${count === 1 ? "" : "s"} changed.`,
    driftCopy:
      "Import the current OMO file into this active preset, or reapply your edited preset to overwrite the file.",
    name: "Name",
    description: "Description",
    provider: "Provider",
    model: "Model",
    reasoning: "Reasoning",
    reasoningDefault: "medium (default)",
    selectProvider: "Select provider",
    invalidReference: "Invalid reference",
    officialProviders: "Official providers",
    customProviders: "Custom providers",
    unsupportedProvider: (providerId) => `Unsupported provider: ${providerId}`,
    unsupportedModelReference: (rawValue) =>
      `Unsupported model reference: ${rawValue}`,
    unsupportedModel: (modelId) => `Unsupported model: ${modelId}`,
    unavailableLabel: (value) => `${value} (Unavailable)`,
    loadingConfiguration: "Loading configuration...",
    activePreset: "Active preset",
    unknown: "Unknown",
    omoFile: "OMO file",
    present: "Present",
    willBeCreated: "Will be created",
    drift: "Drift",
    synced: "synced",
    drifted: "drifted",
    lastApplied: "Last applied",
    never: "Never",
    providersDetected: "Providers detected"
  },
  "zh-CN": {
    appTitle: "OMO Adapter",
    settings: "设置",
    refreshModelCatalog: "刷新模型目录",
    refreshing: "刷新中...",
    catalogRefreshed: "模型目录已刷新",
    language: "语言",
    english: "English",
    simplifiedChinese: "简体中文",
    agentPresets: "Agent 预设",
    sidebarNote:
      "管理官方 OMO Agent 的模型预设，并切换写入 `oh-my-opencode.json` 的配置映射。",
    newPreset: "新建",
    active: "已启用",
    noDescriptionYet: "暂无描述。",
    movePreset: (name) => `移动预设 ${name}`,
    activatePreset: (name) => `启用预设 ${name}`,
    duplicatePreset: (name) => `复制预设 ${name}`,
    deletePreset: (name) => `删除预设 ${name}`,
    activate: "启用",
    duplicate: "复制",
    delete: "删除",
    presetEditor: "预设编辑器",
    noPresetSelected: "未选择预设",
    activePresetNote:
      "当前预设已启用。保存会更新预设记录，应用会把编辑后的映射写入 OMO。",
    inactivePresetNote:
      "当前预设未启用。先保存编辑，再在预设列表中点击启用以切换并覆盖 OMO 配置。",
    savePreset: "保存预设",
    importFromFile: "从文件导入",
    apply: "应用",
    driftDetected: "检测到漂移",
    currentOmoDiffers: "当前 OMO 文件与启用中的预设不一致。",
    changedAgents: (count) => `${count} 个 Agent 已变化。`,
    driftCopy:
      "可将当前 OMO 文件导入此启用中的预设，或重新应用已编辑的预设以覆盖文件。",
    name: "名称",
    description: "描述",
    provider: "Provider",
    model: "Model",
    reasoning: "推理强度",
    reasoningDefault: "medium（默认）",
    selectProvider: "选择 Provider",
    invalidReference: "无效引用",
    officialProviders: "官方 Providers",
    customProviders: "自定义 Providers",
    unsupportedProvider: (providerId) => `不支持的 Provider: ${providerId}`,
    unsupportedModelReference: (rawValue) => `不支持的模型引用: ${rawValue}`,
    unsupportedModel: (modelId) => `不支持的模型: ${modelId}`,
    unavailableLabel: (value) => `${value}（不可用）`,
    loadingConfiguration: "正在加载配置...",
    activePreset: "当前预设",
    unknown: "未知",
    omoFile: "OMO 文件",
    present: "已存在",
    willBeCreated: "将创建",
    drift: "漂移",
    synced: "已同步",
    drifted: "已漂移",
    lastApplied: "最近应用",
    never: "从未",
    providersDetected: "已检测 Provider 数"
  }
};

export function getUiCopy(language: UiLanguage): UiCopy {
  return uiCopy[language];
}

export function getLocaleForLanguage(language: UiLanguage) {
  return language === "zh-CN" ? "zh-CN" : "en-US";
}
