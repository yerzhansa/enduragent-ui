import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { assertReleaseDate } from "./calver.mjs";

const repository = "yerzhansa/enduragent-ui";
const commit = process.env.GITHUB_SHA;
if (
  process.env.GITHUB_REPOSITORY !== repository ||
  process.env.GITHUB_REF !== "refs/heads/main" ||
  !/^[a-f0-9]{40}$/.test(commit ?? "")
)
  throw new Error("Release must run on the UI repository main branch");
async function api(path) {
  const response = await fetch(`https://api.github.com/repos/${repository}/${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!response.ok) throw new Error(`GitHub release verification failed: ${response.status}`);
  return response.json();
}
const mode = process.argv[2];
if (mode === "prepare") {
  const prs = await api(`commits/${commit}/pulls`);
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
  const runs = await api(`actions/workflows/ci.yml/runs?head_sha=${commit}&per_page=100`);
  const candidates = runs.workflow_runs
    ?.filter((run) => run.head_sha === commit && run.head_branch === "main" && run.event === "push")
    .sort((a, b) => b.id - a.id);
  if (!candidates?.length || candidates[0].conclusion !== "success")
    throw new Error("Latest CI run for the release snapshot must pass");
  const manifest = JSON.parse(readFileSync("package.json", "utf8"));
  if (manifest.name !== "@enduragent/ui" || manifest.private === true)
    throw new Error("Expected public UI package");
  assertReleaseDate(manifest.version, process.env.RELEASE_DATE);
} else if (mode === "stage") {
  if (
    !/^[1-9]\d*$/.test(process.env.PREPARE_RUN_ID ?? "") ||
    !/^[a-f0-9]{128}$/.test(process.env.ARTIFACT_SHA512 ?? "")
  )
    throw new Error("Invalid reviewed run or SHA-512 input");
  const run = await api(`actions/runs/${process.env.PREPARE_RUN_ID}`);
  if (
    run.path !== ".github/workflows/prepare-release.yml" ||
    run.event !== "workflow_dispatch" ||
    run.head_branch !== "main" ||
    run.head_sha !== commit ||
    run.conclusion !== "success"
  )
    throw new Error("Artifact run must be successful preparation of this exact main snapshot");
  const bytes = readFileSync("release/ui.tgz");
  if (createHash("sha512").update(bytes).digest("hex") !== process.env.ARTIFACT_SHA512)
    throw new Error("Tarball differs from reviewed SHA-512");
  const identity = JSON.parse(readFileSync("release/identity.json", "utf8"));
  const manifest = JSON.parse(
    execFileSync("tar", ["-xOf", "release/ui.tgz", "package/package.json"], { encoding: "utf8" }),
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
} else throw new Error("Expected prepare or stage mode");
