import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { nextVersion, rewriteChangelog } from "./calver.mjs";
import { releaseVersions } from "./github-release.mjs";

if (
  process.env.GITHUB_REPOSITORY !== "yerzhansa/enduragent-ui" ||
  process.env.GITHUB_REF !== "refs/heads/main"
)
  throw new Error("Version preparation must run on the UI repository main branch");
const before = JSON.parse(readFileSync("package.json", "utf8"));
if (
  before.name !== "@enduragent/ui" ||
  before.private === true ||
  typeof before.version !== "string" ||
  before.version.length === 0
)
  throw new Error("Expected public UI package");
const versions = await releaseVersions();
const version = nextVersion(process.env.RELEASE_DATE, [...versions, before.version]);
execFileSync("pnpm", ["exec", "changeset", "version"], { stdio: "inherit" });
const manifest = JSON.parse(readFileSync("package.json", "utf8"));
if (manifest.version === before.version) throw new Error("No UI changeset was consumed");
const changelog = rewriteChangelog(readFileSync("CHANGELOG.md", "utf8"), manifest.version, version);
manifest.version = version;
writeFileSync("package.json", `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync("CHANGELOG.md", changelog);
execFileSync("pnpm", ["install", "--lockfile-only"], { stdio: "inherit" });
