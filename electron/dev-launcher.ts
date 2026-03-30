import {
  spawn as nodeSpawn,
  execFile as nodeExecFile,
  type ChildProcess,
  type SpawnOptions
} from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(nodeExecFile);
let cleanupHookInstalled = false;
const processWithElectron = process as NodeJS.Process & {
  electronApp?: ChildProcess;
};
let activeElectronProcess:
  | Pick<ChildProcess, "pid" | "removeAllListeners" | "once">
  | undefined;

function isMissingWindowsProcessError(error: unknown) {
  const message =
    error instanceof Error
      ? `${error.message} ${"stderr" in error ? String(error.stderr ?? "") : ""}`
      : String(error);

  return /process .* not found/i.test(message);
}

export async function terminateElectronProcess(
  child: { pid?: number; removeAllListeners(): void } | undefined,
  dependencies: {
    platform?: NodeJS.Platform;
    execFile?: (
      file: string,
      args: string[]
    ) => Promise<unknown>;
  } = {}
) {
  if (!child?.pid) {
    return;
  }

  child.removeAllListeners();

  const platform = dependencies.platform ?? process.platform;
  const execFile = dependencies.execFile ?? execFileAsync;

  if (platform === "win32") {
    try {
      await execFile("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
    } catch (error) {
      if (isMissingWindowsProcessError(error)) {
        return;
      }

      throw error;
    }

    return;
  }

  try {
    process.kill(child.pid);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ESRCH") {
      throw error;
    }
  }
}

export async function startElectronProcess(
  dependencies: {
    platform?: NodeJS.Platform;
    execFile?: (
      file: string,
      args: string[]
    ) => Promise<unknown>;
    spawn?: typeof nodeSpawn;
    electronPath: string;
    argv?: string[];
    appEntryPath?: string;
    options?: SpawnOptions;
  }
) {
  await terminateElectronProcess(activeElectronProcess, dependencies);

  const platform = dependencies.platform ?? process.platform;
  const spawn = dependencies.spawn ?? nodeSpawn;
  const appEntryPath =
    dependencies.appEntryPath ?? path.resolve("dist-electron/main.js");
  const argv = dependencies.argv ?? [appEntryPath, "--no-sandbox"];
  const stdio: SpawnOptions["stdio"] =
    platform === "linux"
      ? ["inherit", "inherit", "inherit", "ignore", "ipc"]
      : ["inherit", "inherit", "inherit", "ipc"];

  activeElectronProcess = spawn(dependencies.electronPath, argv, {
    stdio,
    ...dependencies.options
  });
  processWithElectron.electronApp = activeElectronProcess as ChildProcess;

  if (!cleanupHookInstalled) {
    cleanupHookInstalled = true;
    process.once("exit", () => {
      void terminateElectronProcess(activeElectronProcess, dependencies);
    });
  }

  return activeElectronProcess;
}
