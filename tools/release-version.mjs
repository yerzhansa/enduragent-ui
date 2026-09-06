import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { nextVersion, rewriteChangelog } from "./calver.mjs";

const response = spawnSync(
  "npm",
  ["view", "@enduragent/ui", "versions", "--json", "--registry=https://registry.npmjs.org"],
  { encoding: "utf8" },
);
if (response.error) throw response.error;
let versions;
if (response.status === 0) {
  const value = JSON.parse(response.stdout);
  versions = typeof value === "string" ? [value] : value;
} else {
  const error = JSON.parse(response.stdout || "{}");
  if (error.error?.code !== "E404" || process.env.UI_BOOTSTRAP !== "1")
    throw new Error(
      "Registry lookup failed; bootstrap requires an explicit UI_BOOTSTRAP=1 and confirmed package ownership",
    );
  versions = [];
}
const version = nextVersion(process.env.RELEASE_DATE, versions);
const before = JSON.parse(readFileSync("package.json", "utf8"));
if (before.name !== "@enduragent/ui" || before.private === true)
  throw new Error("Expected public UI package");
execFileSync("pnpm", ["exec", "changeset", "version"], { stdio: "inherit" });
const manifest = JSON.parse(readFileSync("package.json", "utf8"));
if (manifest.version === before.version) throw new Error("No UI changeset was consumed");
const changelog = rewriteChangelog(readFileSync("CHANGELOG.md", "utf8"), manifest.version, version);
manifest.version = version;
writeFileSync("package.json", `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync("CHANGELOG.md", changelog);
execFileSync("pnpm", ["install", "--lockfile-only"], { stdio: "inherit" });
