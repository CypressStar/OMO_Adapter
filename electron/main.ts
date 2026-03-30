import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow, ipcMain } from "electron";
import {
  applyActivePreset,
  createPreset,
  deletePreset,
  duplicatePreset,
  movePreset,
  refreshProviderCatalog,
  importFileToActivePreset,
  loadSnapshot,
  savePreset,
  setActivePreset
} from "../src/integration/app-service.ts";
import { getOmoConfigPath } from "../src/domain/config-paths.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_CHANGED_CHANNEL = "app:config-changed";
const CONFIG_CHANGE_DEBOUNCE_MS = 150;

function emitConfigChanged() {
  for (const window of BrowserWindow.getAllWindows()) {
    if (!window.isDestroyed()) {
      window.webContents.send(CONFIG_CHANGED_CHANNEL);
    }
  }
}

function createConfigWatchers() {
  const watchedFilesByDirectory = new Map<string, Set<string>>();

  for (const configPath of [getOmoConfigPath()]) {
    const directoryPath = path.dirname(configPath);
    const fileName = path.basename(configPath);
    const fileNames = watchedFilesByDirectory.get(directoryPath) ?? new Set<string>();

    fileNames.add(fileName);
    watchedFilesByDirectory.set(directoryPath, fileNames);
  }

  const watchers: fs.FSWatcher[] = [];
  let debounceTimer: NodeJS.Timeout | undefined;

  const scheduleRefresh = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      debounceTimer = undefined;
      emitConfigChanged();
    }, CONFIG_CHANGE_DEBOUNCE_MS);
  };

  watchedFilesByDirectory.forEach((fileNames, directoryPath) => {
    if (!fs.existsSync(directoryPath)) {
      return;
    }

    const watcher = fs.watch(
      directoryPath,
      (_eventType: string, filename: string | Buffer | null) => {
        const changedFileName = filename?.toString();

        if (!changedFileName || !fileNames.has(changedFileName)) {
          return;
        }

        scheduleRefresh();
      }
    );

    watcher.on("error", () => {
      watcher.close();
    });
    watchers.push(watcher);
  });

  return () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    for (const watcher of watchers) {
      watcher.close();
    }
  };
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#e7ecf0",
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    },
    title: "OMO Adapter"
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    void window.loadURL(process.env.VITE_DEV_SERVER_URL);
    window.webContents.openDevTools({ mode: "detach" });
    return;
  }

  void window.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(() => {
  const disposeConfigWatchers = createConfigWatchers();

  ipcMain.handle("app:load-snapshot", () => loadSnapshot());
  ipcMain.handle("app:refresh-provider-catalog", () => refreshProviderCatalog());
  ipcMain.handle("app:save-preset", (_event, preset) => savePreset(preset));
  ipcMain.handle("app:create-preset", () => createPreset());
  ipcMain.handle("app:duplicate-preset", (_event, presetId: string) =>
    duplicatePreset(presetId)
  );
  ipcMain.handle("app:delete-preset", (_event, presetId: string) =>
    deletePreset(presetId)
  );
  ipcMain.handle("app:move-preset", (_event, presetId: string, targetIndex: number) =>
    movePreset(presetId, targetIndex)
  );
  ipcMain.handle("app:set-active-preset", (_event, presetId: string) =>
    setActivePreset(presetId)
  );
  ipcMain.handle("app:apply-active-preset", () => applyActivePreset());
  ipcMain.handle("app:import-file-to-active-preset", () =>
    importFileToActivePreset()
  );

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  app.on("before-quit", disposeConfigWatchers);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
