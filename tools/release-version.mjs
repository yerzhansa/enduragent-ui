import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { stableVersion, assertVersionIncrease } from "./release-semver.mjs";
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
stableVersion(before.version);
const versions = await releaseVersions();
execFileSync("pnpm", ["exec", "changeset", "version"], { stdio: "inherit" });
const manifest = JSON.parse(readFileSync("package.json", "utf8"));
assertVersionIncrease(before.version, manifest.version, versions);
execFileSync("pnpm", ["install", "--lockfile-only"], { stdio: "inherit" });
