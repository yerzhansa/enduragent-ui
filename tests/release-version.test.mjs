import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  symlinkSync,
  existsSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repository = "yerzhansa/enduragent-ui";
const script = fileURLToPath(new URL("../tools/release-version.mjs", import.meta.url));
const cli = fileURLToPath(new URL("../node_modules/@changesets/cli/bin.js", import.meta.url));
const dependencies = fileURLToPath(new URL("../node_modules", import.meta.url));

function run({ current = "0.0.0", bump = "minor", releases = [], tags = [] } = {}) {
  const directory = mkdtempSync(join(tmpdir(), "ui-changesets-semver-"));
  try {
    writeFileSync(
      join(directory, "package.json"),
      JSON.stringify({ name: "@enduragent/ui", version: current }),
    );
    writeFileSync(
      join(directory, "CHANGELOG.md"),
      `# @enduragent/ui\n\n## ${current}\n\nPrevious changes\n`,
    );
    mkdirSync(join(directory, ".changeset"));
    writeFileSync(
      join(directory, ".changeset/config.json"),
      readFileSync(new URL("../.changeset/config.json", import.meta.url)),
    );
    if (bump)
      writeFileSync(
        join(directory, ".changeset/new-change.md"),
        `---\n"@enduragent/ui": ${bump}\n---\n\nNew changes\n`,
      );
    symlinkSync(dependencies, join(directory, "node_modules"), "dir");
    const preload = join(directory, "fixture.mjs");
    writeFileSync(
      preload,
      `
      import childProcess from 'node:child_process';
      import { syncBuiltinESMExports } from 'node:module';
      import { writeFileSync } from 'node:fs';
      const execute = childProcess.execFileSync;
      globalThis.fetch = async (url, options) => {
        if (options.redirect !== 'error' || options.headers.Authorization !== 'Bearer synthetic-fixture') throw new Error('Invalid API options');
        const responses = {
          'https://api.github.com/repos/${repository}': { full_name: '${repository}', permissions: { push: true } },
          'https://api.github.com/repos/${repository}/releases?per_page=100&page=1': ${JSON.stringify(releases)},
          'https://api.github.com/repos/${repository}/tags?per_page=100&page=1': ${JSON.stringify(tags)},
        };
        if (!(url in responses)) throw new Error('Unexpected API request');
        return new Response(JSON.stringify(responses[url]));
      };
      childProcess.execFileSync = (command, args, options) => {
        if (command !== 'pnpm') throw new Error('Unexpected command');
        if (args.join(' ') === 'exec changeset version') return execute(process.execPath, [${JSON.stringify(cli)}, 'version'], options);
        if (args.join(' ') !== 'install --lockfile-only') throw new Error('Unexpected command arguments');
        writeFileSync('lockfile-requested', 'true');
      };
      syncBuiltinESMExports();
    `,
    );
    const result = spawnSync(process.execPath, ["--import", preload, script], {
      cwd: directory,
      encoding: "utf8",
      env: {
        PATH: process.env.PATH,
        GITHUB_REPOSITORY: repository,
        GITHUB_REF: "refs/heads/main",
        GITHUB_TOKEN: "synthetic-fixture",
      },
    });
    return {
      ...result,
      version: JSON.parse(readFileSync(join(directory, "package.json"), "utf8")).version,
      changelog: readFileSync(join(directory, "CHANGELOG.md"), "utf8"),
      consumed: !existsSync(join(directory, ".changeset/new-change.md")),
      lockfileRequested: existsSync(join(directory, "lockfile-requested")),
    };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

for (const [current, bump, expected] of [
  ["0.0.0", "minor", "0.1.0"],
  ["0.1.0", "patch", "0.1.1"],
  ["0.1.0", "minor", "0.2.0"],
  ["0.9.0", "major", "1.0.0"],
])
  test(`actual Changesets ${bump} bump preserves ${current} -> ${expected}`, () => {
    const result = run({ current, bump });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.version, expected);
    assert.equal(result.consumed, true);
    assert.equal(result.lockfileRequested, true);
    assert.ok(result.changelog.includes(`## ${expected}\n`));
    assert.ok(result.changelog.includes(`## ${current}\n\nPrevious changes`));
  });

for (const [label, reservation] of [
  ["draft", { releases: [{ tag_name: "v0.1.0", draft: true }] }],
  ["published release", { releases: [{ tag_name: "v0.1.0", draft: false }] }],
  ["tag", { tags: [{ name: "v0.1.0" }] }],
])
  test(`version preparation rejects collision with ${label} without inventing another version`, () => {
    const result = run(reservation);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /collides/);
    assert.equal(result.version, "0.1.0");
    assert.equal(result.lockfileRequested, false);
  });

test("missing changesets cannot reuse the manifest version", () => {
  const result = run({ current: "0.1.0", bump: null });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must increase/);
  assert.equal(result.lockfileRequested, false);
});
