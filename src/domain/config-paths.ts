import os from "node:os";
import path from "node:path";

function resolveHomePath(...segments: string[]) {
  return path.join(os.homedir(), ...segments);
}

export function getOpenCodeConfigPath() {
  return resolveHomePath(".config", "opencode", "opencode.json");
}

export function getOmoConfigPath() {
  return resolveHomePath(".config", "opencode", "oh-my-openagent.json");
}
