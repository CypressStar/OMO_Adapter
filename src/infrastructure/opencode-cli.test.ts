// @vitest-environment node

import { describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  execFile: vi.fn()
}));

vi.mock("node:child_process", () => ({
  execFile: mocks.execFile
}));

import { parseModelListOutput, readCliModels } from "./opencode-cli.ts";

describe("parseModelListOutput", () => {
  test("extracts provider/model refs and ignores refresh banners", () => {
    const result = parseModelListOutput(`
openai/gpt-5.4@opencode-high
anthropic/claude-sonnet-4-5
\u001b[92m\u001b[1mModels cache refreshed\u001b[0m
`);

    expect(result).toEqual([
      "openai/gpt-5.4@opencode-high",
      "anthropic/claude-sonnet-4-5"
    ]);
  });

  test("reports a clear error when the opencode CLI is not available", async () => {
    mocks.execFile.mockImplementation(
      (
        _file: string,
        _args: string[],
        _options: object,
        callback: (error: NodeJS.ErrnoException | null) => void
      ) => {
        const error = new Error("spawn opencode ENOENT") as NodeJS.ErrnoException;
        error.code = "ENOENT";
        callback(error);
      }
    );

    await expect(readCliModels()).rejects.toThrow(/opencode/i);
    await expect(readCliModels()).rejects.toThrow(/path/i);
  });
});
