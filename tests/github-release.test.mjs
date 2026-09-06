import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const moduleUrl = new URL("../tools/github-release.mjs", import.meta.url).href;
const repository = "yerzhansa/enduragent-ui";

function run(
  responses,
  expression = "await module.releaseVersions()",
  token = "synthetic-fixture",
) {
  const directory = mkdtempSync(join(tmpdir(), "ui-release-versions-"));
  try {
    const preload = join(directory, "fetch-fixture.mjs");
    writeFileSync(
      preload,
      `
      const responses = ${JSON.stringify({ "": { body: { full_name: repository, permissions: { push: true } } }, ...responses })};
      globalThis.fetch = async (url, options) => {
        const prefix = 'https://api.github.com/repos/${repository}';
        if (!(String(url) === prefix || String(url).startsWith(prefix + '/')) || options.redirect !== 'error') throw new Error('Unsafe GitHub origin or redirects');
        const path = String(url).slice(prefix.length).replace(/^\\//, '');
        if (!(path in responses)) throw new Error('Unexpected API request: ' + path);
        if (options.headers.Authorization !== 'Bearer synthetic-fixture') throw new Error('Draft visibility requires authentication');
        const response = responses[path];
        return new Response(JSON.stringify(response.body), { status: response.status ?? 200 });
      };
    `,
    );
    return spawnSync(
      process.execPath,
      [
        "--import",
        preload,
        "--input-type=module",
        "--eval",
        `const module = await import(${JSON.stringify(moduleUrl)}); process.stdout.write(JSON.stringify(${expression}));`,
      ],
      {
        encoding: "utf8",
        env: { PATH: process.env.PATH, ...(token ? { GITHUB_TOKEN: token } : {}) },
      },
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("version lookup includes drafts, published releases and un-released tags", () => {
  const result = run({
    "releases?per_page=100&page=1": {
      body: [
        { tag_name: "v0.1.0", draft: false },
        { tag_name: "v0.1.1", draft: true },
      ],
    },
    "tags?per_page=100&page=1": {
      body: [{ name: "v0.1.0" }, { name: "v0.1.2" }, { name: "unrelated" }],
    },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), ["0.1.0", "0.1.1", "0.1.2"]);
});
test("version lookup follows numeric pagination without trusting response links", () => {
  const result = run({
    "releases?per_page=100&page=1": {
      body: Array.from({ length: 100 }, () => ({ tag_name: "v0.1.0" })),
    },
    "releases?per_page=100&page=2": { body: [{ tag_name: "v0.1.1", draft: true }] },
    "tags?per_page=100&page=1": { body: [] },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), ["0.1.0", "0.1.1"]);
});
test("an empty repository needs no package-registry bootstrap", () => {
  const result = run({
    "releases?per_page=100&page=1": { body: [] },
    "tags?per_page=100&page=1": { body: [] },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), []);
});
test("missing authentication cannot silently omit drafts", () => {
  const result = run({}, "await module.releaseVersions()", "");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required to include draft releases/);
});
for (const [label, response] of [
  ["API denial", { status: 403, body: {} }],
  ["missing repository", { status: 404, body: {} }],
  ["malformed array", { body: {} }],
  ["missing tag name", { body: [{}] }],
])
  test(`version lookup rejects ${label}`, () =>
    assert.notEqual(run({ "releases?per_page=100&page=1": response }).status, 0));
test("the API helper rejects arbitrary URLs and other repository paths", () => {
  for (const path of [
    "https://example.invalid",
    "../other/releases",
    "/repos/other/repository/releases",
    "releases?per_page=100&page=1#fragment",
  ]) {
    const result = run({}, `await module.githubApi(${JSON.stringify(path)})`);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Unsupported GitHub release endpoint/);
  }
});

test("version preparation rejects other repository or branch contexts before fetching", () => {
  const script = new URL("../tools/release-version.mjs", import.meta.url);
  for (const env of [
    { GITHUB_REPOSITORY: "other/repository", GITHUB_REF: "refs/heads/main" },
    { GITHUB_REPOSITORY: repository, GITHUB_REF: "refs/heads/feature" },
  ]) {
    const result = spawnSync(process.execPath, [fileURLToPath(script)], {
      encoding: "utf8",
      env: { PATH: process.env.PATH, ...env },
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /must run on the UI repository main branch/);
  }
});

for (const [label, body] of [
  ["read-only permission", { full_name: repository, permissions: { push: false } }],
  ["missing permission", { full_name: repository }],
  ["truthy non-boolean permission", { full_name: repository, permissions: { push: "true" } }],
  ["another repository", { full_name: "other/repository", permissions: { push: true } }],
])
  test(`version lookup rejects ${label} before listing releases`, () => {
    const result = run({ "": { body } });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Repository push access is required/);
  });

for (const manifest of [
  { name: "other-package", version: "0.1.0" },
  { name: "@enduragent/ui", version: "0.1.0", private: true },
  { name: "@enduragent/ui" },
  { name: "@enduragent/ui", version: 123 },
])
  test(`invalid manifest fails before release lookup: ${JSON.stringify(manifest)}`, () => {
    const directory = mkdtempSync(join(tmpdir(), "ui-invalid-manifest-"));
    try {
      writeFileSync(join(directory, "package.json"), JSON.stringify(manifest));
      const script = fileURLToPath(new URL("../tools/release-version.mjs", import.meta.url));
      const result = spawnSync(process.execPath, [script], {
        cwd: directory,
        encoding: "utf8",
        env: {
          PATH: process.env.PATH,
          GITHUB_REPOSITORY: repository,
          GITHUB_REF: "refs/heads/main",
        },
      });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /Expected public UI package/);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
