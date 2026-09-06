import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test, expect } from "vitest";
import { verifyRuntimeGraph } from "../tools/package-isolation";

test("release graph includes actual public runtime source", () => {
  expect(verifyRuntimeGraph(resolve(import.meta.dirname, "..")).length).toBeGreaterThan(8);
});
for (const throughHelper of [false, true])
  test(`rejects ${throughHelper ? "transitive" : "direct"} preview imports before tree shaking`, () => {
    const root = mkdtempSync(join(tmpdir(), "ui-graph-"));
    try {
      mkdirSync(join(root, "src"));
      mkdirSync(join(root, "stories"));
      writeFileSync(join(root, "package.json"), JSON.stringify({ dependencies: {} }));
      writeFileSync(join(root, "stories/fixture.ts"), 'export const fixture = "fictional";');
      writeFileSync(
        join(root, "src/index.ts"),
        throughHelper
          ? 'export { value } from "./helper.js";'
          : 'import {fixture} from "../stories/fixture.js"; export const value = 1;',
      );
      if (throughHelper)
        writeFileSync(
          join(root, "src/helper.ts"),
          'import {fixture} from "../stories/fixture.js"; export const value = 1;',
        );
      expect(() => verifyRuntimeGraph(root)).toThrow("Preview code in runtime graph");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
