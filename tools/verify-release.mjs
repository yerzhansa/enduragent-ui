import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { assertReleaseDate } from "./calver.mjs";
import { githubApi } from "./github-release.mjs";
import { resolve } from "node:path";

const repository = "yerzhansa/enduragent-ui";
const commit = process.env.GITHUB_SHA;
if (
  process.env.GITHUB_REPOSITORY !== repository ||
  process.env.GITHUB_REF !== "refs/heads/main" ||
  !/^[a-f0-9]{40}$/.test(commit ?? "")
)
  throw new Error("Release must run on the UI repository main branch");
const mode = process.argv[2];
if (mode === "prepare") {
  const prs = await githubApi(`commits/${commit}/pulls`);
  if (
    !Array.isArray(prs) ||
    !prs.some(
      (pr) =>
        pr.merged_at &&
        pr.title === "Version Packages" &&
        pr.base?.ref === "main" &&
        pr.merge_commit_sha === commit,
    )
  )
    throw new Error("Snapshot must be the merged Version Packages PR");
  const runs = await githubApi(`actions/workflows/ci.yml/runs?head_sha=${commit}&per_page=100`);
  const candidates = runs.workflow_runs
    ?.filter((run) => run.head_sha === commit && run.head_branch === "main" && run.event === "push")
    .sort((a, b) => b.id - a.id);
  if (!candidates?.length || candidates[0].conclusion !== "success")
    throw new Error("Latest CI run for the release snapshot must pass");
  const manifest = JSON.parse(readFileSync("package.json", "utf8"));
  if (manifest.name !== "@enduragent/ui" || manifest.private === true)
    throw new Error("Expected public UI package");
  assertReleaseDate(manifest.version, process.env.RELEASE_DATE);
} else if (mode === "artifact") {
  if (
    !/^[1-9]\d*$/.test(process.env.PREPARE_RUN_ID ?? "") ||
    !/^[a-f0-9]{128}$/.test(process.env.ARTIFACT_SHA512 ?? "")
  )
    throw new Error("Invalid reviewed run or SHA-512 input");
  const run = await githubApi(`actions/runs/${process.env.PREPARE_RUN_ID}`);
  if (
    run.path !== ".github/workflows/prepare-release.yml" ||
    run.event !== "workflow_dispatch" ||
    run.head_branch !== "main" ||
    run.head_sha !== commit ||
    run.conclusion !== "success"
  )
    throw new Error("Artifact run must be successful preparation of this exact main snapshot");
  const directory = resolve(process.argv[3] ?? "release");
  const identity = JSON.parse(readFileSync(resolve(directory, "identity.json"), "utf8"));
  assertReleaseDate(identity.version, process.env.RELEASE_DATE);
  const asset = `enduragent-ui-${identity.version}.tgz`;
  if (
    identity.repository !== repository ||
    identity.asset !== asset ||
    identity.tag !== `v${identity.version}`
  )
    throw new Error("Invalid release asset identity");
  const tarball = resolve(directory, asset);
  const bytes = readFileSync(tarball);
  if (createHash("sha512").update(bytes).digest("hex") !== process.env.ARTIFACT_SHA512)
    throw new Error("Tarball differs from reviewed SHA-512");
  const manifest = JSON.parse(
    execFileSync("tar", ["-xOf", tarball, "package/package.json"], { encoding: "utf8" }),
  );
  if (
    identity.commit !== commit ||
    identity.sha512 !== process.env.ARTIFACT_SHA512 ||
    identity.version !== manifest.version ||
    manifest.name !== "@enduragent/ui" ||
    manifest.private === true
  )
    throw new Error("Artifact identity mismatch");
  assertReleaseDate(manifest.version, process.env.RELEASE_DATE);
} else throw new Error("Expected prepare or artifact mode");
