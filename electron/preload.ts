import { contextBridge, ipcRenderer } from "electron";

const CONFIG_CHANGED_CHANNEL = "app:config-changed";

contextBridge.exposeInMainWorld("omoAdapter", {
  loadSnapshot: () => ipcRenderer.invoke("app:load-snapshot"),
  refreshProviderCatalog: () => ipcRenderer.invoke("app:refresh-provider-catalog"),
  savePreset: (preset: unknown) => ipcRenderer.invoke("app:save-preset", preset),
  createPreset: () => ipcRenderer.invoke("app:create-preset"),
  duplicatePreset: (presetId: string) =>
    ipcRenderer.invoke("app:duplicate-preset", presetId),
  deletePreset: (presetId: string) => ipcRenderer.invoke("app:delete-preset", presetId),
  movePreset: (presetId: string, targetIndex: number) =>
    ipcRenderer.invoke("app:move-preset", presetId, targetIndex),
  setActivePreset: (presetId: string) =>
    ipcRenderer.invoke("app:set-active-preset", presetId),
  applyActivePreset: () => ipcRenderer.invoke("app:apply-active-preset"),
  importFileToActivePreset: () => ipcRenderer.invoke("app:import-file-to-active-preset"),
  onConfigChanged: (listener: () => void) => {
    const wrappedListener = () => {
      listener();
    };

    ipcRenderer.on(CONFIG_CHANGED_CHANNEL, wrappedListener);

    return () => {
      ipcRenderer.off(CONFIG_CHANGED_CHANNEL, wrappedListener);
    };
  }
});
