/// <reference types="vite/client" />

import type { OmoAdapterBridge } from "./ui/bridge";

declare global {
  interface Window {
    omoAdapter?: OmoAdapterBridge;
  }
}

export {};
