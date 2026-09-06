import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { expect, it } from "vitest";

it("records browser evidence in a clean checkout without an artifacts directory", () => {
  const root = mkdtempSync(resolve(tmpdir(), "ui-browser-record-"));
  try {
    for (const directory of ["dist-storybook", "tests/browser/baselines/extracted", "test-results"])
      mkdirSync(resolve(root, directory), { recursive: true });
    writeFileSync(resolve(root, "dist-storybook/preview-source.json"), JSON.stringify({ digest: "source" }));
    writeFileSync(resolve(root, "tests/browser/baselines/extracted/reference.json"), JSON.stringify({ images: [] }));
    writeFileSync(resolve(root, "package.json"), JSON.stringify({ version: "0.0.0" }));
    execFileSync(process.execPath, [resolve(import.meta.dirname, "../tools/record-browser.mjs")], { cwd: root });
    const result = JSON.parse(readFileSync(resolve(root, "artifacts/browser-manifest.json"), "utf8"));
    expect(result.source).toEqual({ digest: "source" });
    expect(result.packageVersion).toBe("0.0.0");
    expect(result.representativeScreenshots).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
