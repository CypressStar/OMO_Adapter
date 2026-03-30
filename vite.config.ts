import { createRequire } from "node:module";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron/simple";
import { startElectronProcess } from "./electron/dev-launcher";

const require = createRequire(import.meta.url);
const electronPath = require("electron");

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: "electron/main.ts",
        onstart: () => {
          void startElectronProcess({
            electronPath
          });
        }
      },
      preload: {
        input: {
          preload: "electron/preload.ts"
        }
      },
      renderer: {}
    })
  ],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts"
  }
});
