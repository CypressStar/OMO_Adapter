// @vitest-environment node

import path from "node:path";
import { describe, expect, test, vi } from "vitest";
import { startElectronProcess, terminateElectronProcess } from "./dev-launcher.ts";

describe("terminateElectronProcess", () => {
  test("ignores Windows taskkill errors when the target process is already gone", async () => {
    const child = {
      pid: 49648,
      removeAllListeners: vi.fn()
    };
    const execFile = vi.fn().mockRejectedValue(
      Object.assign(new Error('ERROR: The process "49648" not found.'), {
        stderr: 'ERROR: The process "49648" not found.'
      })
    );

    await expect(
      terminateElectronProcess(child, {
        platform: "win32",
        execFile
      })
    ).resolves.toBeUndefined();

    expect(child.removeAllListeners).toHaveBeenCalled();
    expect(execFile).toHaveBeenCalledWith("taskkill", [
      "/pid",
      "49648",
      "/T",
      "/F"
    ]);
  });

  test("restarts Electron even if the previous Windows process is already gone", async () => {
    const firstChild = {
      pid: 49648,
      removeAllListeners: vi.fn(),
      once: vi.fn()
    };
    const secondChild = {
      pid: 49649,
      removeAllListeners: vi.fn(),
      once: vi.fn()
    };
    const spawn = vi.fn()
      .mockReturnValueOnce(firstChild)
      .mockReturnValueOnce(secondChild);
    const execFile = vi.fn().mockRejectedValue(
      Object.assign(new Error('ERROR: The process "49648" not found.'), {
        stderr: 'ERROR: The process "49648" not found.'
      })
    );

    await startElectronProcess({
      platform: "win32",
      spawn,
      execFile,
      electronPath: "mock-electron"
    });
    await startElectronProcess({
      platform: "win32",
      spawn,
      execFile,
      electronPath: "mock-electron"
    });

    expect(spawn).toHaveBeenCalledTimes(2);
    expect(execFile).toHaveBeenCalledWith("taskkill", [
      "/pid",
      "49648",
      "/T",
      "/F"
    ]);
  });

  test("starts Electron with the built main entry by default", async () => {
    const child = {
      pid: 49650,
      removeAllListeners: vi.fn(),
      once: vi.fn()
    };
    const spawn = vi.fn().mockReturnValue(child);

    await startElectronProcess({
      spawn,
      electronPath: "mock-electron"
    });

    expect(spawn).toHaveBeenCalledWith(
      "mock-electron",
      [path.resolve("dist-electron/main.js"), "--no-sandbox"],
      expect.objectContaining({
        stdio: ["inherit", "inherit", "inherit", "ipc"]
      })
    );
  });
});
