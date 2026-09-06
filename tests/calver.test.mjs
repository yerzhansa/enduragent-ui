import { test } from "node:test";
import assert from "node:assert/strict";
import { releaseBase, nextVersion, assertReleaseDate, rewriteChangelog } from "../tools/calver.mjs";

test("calendar normalization preserves the day rather than treating it as a patch", () => {
  assert.equal(releaseBase("1998-08-08"), "1998.8.8");
  assert.equal(nextVersion("1998-08-08", ["1998.8.7", "1998.8.7-3"]), "1998.8.8");
});
test("same-day repeats advance the largest published suffix", () => {
  assert.equal(nextVersion("1998-08-08", ["1998.8.8"]), "1998.8.8-1");
  assert.equal(nextVersion("1998-08-08", ["1998.8.8-2", "1998.8.8", "1998.8.8-1"]), "1998.8.8-3");
});
test("leap days follow Gregorian century rules", () => {
  assert.equal(releaseBase("2000-02-29"), "2000.2.29");
  for (const value of [
    "1900-02-29",
    "1998-02-29",
    "1998-04-31",
    "1998-00-01",
    "1998-13-01",
    "1998-01-00",
    "98-01-01",
    "1998-1-1",
    undefined,
  ])
    assert.throws(() => releaseBase(value));
});
test("unknown GitHub response and ambiguous same-day prereleases fail closed", () => {
  for (const versions of [
    null,
    "1998.8.8",
    [7],
    ["1998.8.8-beta"],
    ["1998.8.8-0"],
    ["1998.8.8-01"],
  ])
    assert.throws(() => nextVersion("1998-08-08", versions));
});
test("artifact verification requires the actual release date and valid suffix", () => {
  assertReleaseDate("1998.8.8", "1998-08-08");
  assertReleaseDate("1998.8.8-2", "1998-08-08");
  for (const version of ["1998.8.7", "1998.8.9", "1998.08.08", "1998.8.8-0", "1998.8.8-beta"])
    assert.throws(() => assertReleaseDate(version, "1998-08-08"));
});
test("only the first Changesets heading is relabeled", () => {
  const original = "# @enduragent/ui\n\n## 1.0.1\n\nFix\n\n## 1.0.0\nOld\n";
  assert.equal(
    rewriteChangelog(original, "1.0.1", "1998.8.8"),
    original.replace("## 1.0.1", "## 1998.8.8"),
  );
  assert.throws(() => rewriteChangelog(original, "1.0.2", "1998.8.8"));
});
