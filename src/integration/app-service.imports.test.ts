// @vitest-environment node

import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("app-service source imports", () => {
  test("uses explicit .ts extensions for runtime internal imports", async () => {
    const sourcePath = path.join(process.cwd(), "src", "integration", "app-service.ts");
    const source = await fs.readFile(sourcePath, "utf8");

    expect(source).toContain('from "../domain/drift.ts"');
    expect(source).toContain('from "../domain/presets.ts"');
    expect(source).toContain('from "../domain/provider-catalog.ts"');
    expect(source).toContain('from "../infrastructure/opencode-cli.ts"');
    expect(source).toContain('from "../infrastructure/opencode-config.ts"');
    expect(source).toContain('from "../infrastructure/omo-config.ts"');
    expect(source).toContain('from "../infrastructure/preset-store.ts"');
  });
});
