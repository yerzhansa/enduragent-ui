import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("../tools/verify-release.mjs", import.meta.url));
const commit = "a".repeat(40);
const repository = "yerzhansa/enduragent-ui";

function run(mode, change = {}) {
  const directory = mkdtempSync(join(tmpdir(), "ui-release-boundary-"));
  try {
    const manifest = { name: "@enduragent/ui", version: "0.1.0", ...change.manifest };
    writeFileSync(join(directory, "package.json"), JSON.stringify(manifest));
    mkdirSync(join(directory, "package"));
    mkdirSync(join(directory, "release"));
    writeFileSync(join(directory, "package/package.json"), JSON.stringify(manifest));
    execFileSync("tar", ["-czf", "release/enduragent-ui-0.1.0.tgz", "package/package.json"], {
      cwd: directory,
    });
    const sha512 = createHash("sha512")
      .update(readFileSync(join(directory, "release/enduragent-ui-0.1.0.tgz")))
      .digest("hex");
    writeFileSync(
      join(directory, "release/identity.json"),
      JSON.stringify({
        repository,
        commit,
        version: manifest.version,
        tag: `v${manifest.version}`,
        asset: `enduragent-ui-${manifest.version}.tgz`,
        sha512,
        ...change.identity,
      }),
    );
    const responses = {
      [`commits/${commit}/pulls`]: [
        {
          merged_at: "fixture",
          title: "Version Packages",
          base: { ref: "main" },
          merge_commit_sha: commit,
          ...change.pr,
        },
      ],
      [`actions/workflows/ci.yml/runs?head_sha=${commit}&per_page=100`]: {
        workflow_runs: [
          {
            id: 5,
            head_sha: commit,
            head_branch: "main",
            event: "push",
            conclusion: "success",
            ...change.ci,
          },
        ],
      },
      "actions/runs/9": {
        path: ".github/workflows/prepare-release.yml",
        event: "workflow_dispatch",
        head_branch: "main",
        head_sha: commit,
        conclusion: "success",
        ...change.run,
      },
    };
    const preload = join(directory, "fetch-fixture.mjs");
    writeFileSync(
      preload,
      `const responses = ${JSON.stringify(responses)}; globalThis.fetch = async (url) => { const path = String(url).replace('https://api.github.com/repos/${repository}/', ''); if (!(path in responses)) throw new Error('Unexpected API request'); return new Response(JSON.stringify(responses[path]), {status:${change.apiStatus ?? 200}}); };`,
    );
    return spawnSync(process.execPath, ["--import", preload, script, mode], {
      cwd: directory,
      encoding: "utf8",
      env: {
        PATH: process.env.PATH,
        GITHUB_REPOSITORY: repository,
        GITHUB_REF: "refs/heads/main",
        GITHUB_SHA: commit,
        GITHUB_TOKEN: "synthetic-fixture",
        PREPARE_RUN_ID: "9",
        ARTIFACT_SHA512: sha512,
        ...change.env,
      },
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("preparation accepts an approved-shape merged version snapshot with successful CI", () => {
  const result = run("prepare");
  assert.equal(result.status, 0, result.stderr);
});
test("artifact verification accepts the exact reviewed tarball and successful preparation run", () => {
  const result = run("artifact");
  assert.equal(result.status, 0, result.stderr);
});
for (const [label, change] of [
  ["wrong repository", { env: { GITHUB_REPOSITORY: "other/repository" } }],
  ["wrong branch", { env: { GITHUB_REF: "refs/heads/feature" } }],
  ["malformed commit", { env: { GITHUB_SHA: "main" } }],
  ["development placeholder", { manifest: { version: "0.0.0" } }],
  ["prerelease version", { manifest: { version: "0.1.0-beta" } }],
  [
    "build metadata",
    { identity: { version: "0.1.0+build" }, manifest: { version: "0.1.0+build" } },
  ],
  ["malformed version", { manifest: { version: "0.01.0" } }],
  ["private package", { manifest: { private: true } }],
  ["API failure", { apiStatus: 403 }],
])
  test(`both verification modes reject ${label}`, () => {
    for (const mode of ["prepare", "artifact"]) assert.notEqual(run(mode, change).status, 0);
  });
for (const [label, change] of [
  ["unmerged PR", { pr: { merged_at: null } }],
  ["another PR commit", { pr: { merge_commit_sha: "b".repeat(40) } }],
  ["failed CI", { ci: { conclusion: "failure" } }],
])
  test(`preparation rejects ${label}`, () => assert.notEqual(run("prepare", change).status, 0));
for (const [label, change] of [
  ["wrong workflow", { run: { path: ".github/workflows/ci.yml" } }],
  ["another snapshot", { run: { head_sha: "b".repeat(40) } }],
  ["failed preparation", { run: { conclusion: "failure" } }],
  ["invalid run identifier", { env: { PREPARE_RUN_ID: "../9" } }],
  ["different tarball digest", { env: { ARTIFACT_SHA512: "b".repeat(128) } }],
  ["wrong asset name", { identity: { asset: "../other.tgz" } }],
  ["wrong release tag", { identity: { tag: "v0.0.9" } }],
  ["different identity repository", { identity: { repository: "other/repository" } }],
  ["different identity commit", { identity: { commit: "b".repeat(40) } }],
])
  test(`artifact verification rejects ${label}`, () =>
    assert.notEqual(run("artifact", change).status, 0));

test("read-only artifact verification can inspect public run evidence without a local token", () => {
  const result = run("artifact", { env: { GITHUB_TOKEN: "" } });
  assert.equal(result.status, 0, result.stderr);
});

test("release verification does not depend on the preparation or publication date", () => {
  for (const mode of ["prepare", "artifact"])
    for (const date of ["1998-01-01", "1999-12-31", "not-a-date"]) {
      const result = run(mode, { env: { RELEASE_DATE: date } });
      assert.equal(result.status, 0, result.stderr);
    }
});
