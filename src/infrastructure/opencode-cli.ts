import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const ANSI_PATTERN = /\u001b\[[0-9;]*m/g;
const MODEL_REF_PATTERN = /^[a-z0-9][a-z0-9-]*\/.+$/i;

export function parseModelListOutput(stdout: string) {
  return stdout
    .replace(ANSI_PATTERN, "")
    .split(/\r?\n/)
    .map((line: string) => line.trim())
    .filter((line: string) => MODEL_REF_PATTERN.test(line));
}

export async function readCliModels() {
  let stdout: string;

  try {
    const result = await execFileAsync("opencode", ["models", "--refresh"], {
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 1024 * 1024
    });
    stdout = result.stdout;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(
        "Failed to run `opencode models --refresh`: `opencode` was not found in PATH."
      );
    }

    throw new Error(
      `Failed to load model list from \`opencode models --refresh\`: ${
        error instanceof Error ? error.message : "Unknown error."
      }`
    );
  }

  return parseModelListOutput(stdout);
}
