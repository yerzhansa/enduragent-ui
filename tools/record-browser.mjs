import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { release } from "node:os";
import { resolve } from "node:path";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const source = JSON.parse(await readFile("dist-storybook/preview-source.json", "utf8"));
const reference = JSON.parse(
  await readFile("tests/browser/baselines/extracted/reference.json", "utf8"),
);
const screenshots = [];
for (const path of (await readdir("test-results", { recursive: true }))
  .filter((path) => path.endsWith(".png"))
  .sort())
  screenshots.push({ path, sha256: hash(await readFile(resolve("test-results", path))) });
const manifest = {
  schemaVersion: 1,
  kind: "verified-extraction",
  environment: {
    platform: process.platform,
    arch: process.arch,
    release: release(),
    browser: "151.0.7922.34",
    locale: "en-US",
    timezone: "UTC",
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  },
  source,
  reference,
  representativeScreenshots: screenshots,
  packageVersion: JSON.parse(await readFile("package.json", "utf8")).version,
};
await mkdir("artifacts", { recursive: true });
await writeFile("artifacts/browser-manifest.json", JSON.stringify(manifest, null, 2));
