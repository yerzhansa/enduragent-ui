import { test } from "node:test";
import assert from "node:assert/strict";
import {
  stableVersion,
  assertReleaseVersion,
  assertVersionIncrease,
} from "../tools/release-semver.mjs";

for (const version of ["0.0.1", "0.1.0", "1.0.0", "12.34.56"])
  test(`stable release version accepts ${version}`, () =>
    assert.doesNotThrow(() => assertReleaseVersion(version)));

for (const version of [
  "",
  "1",
  "1.2",
  "v1.2.3",
  "01.2.3",
  "1.02.3",
  "1.2.03",
  "1.2.3-beta",
  "1.2.3+build",
  "1.2.3\n",
  "0.1.0\n",
  "1.2.3 ",
  "-1.2.3",
  123,
  null,
])
  test(`stable version rejects ${JSON.stringify(version)}`, () =>
    assert.throws(() => stableVersion(version)));

test("0.0.0 is valid only as a development starting version", () => {
  assert.deepEqual(stableVersion("0.0.0"), [0, 0, 0]);
  assert.throws(() => assertReleaseVersion("0.0.0"));
  assert.doesNotThrow(() => assertVersionIncrease("0.0.0", "0.1.0", []));
});

test("numeric version order permits patch, minor and major increases", () => {
  for (const [previous, next] of [
    ["0.1.0", "0.1.1"],
    ["0.9.9", "0.10.0"],
    ["0.9.9", "1.0.0"],
    ["1.99.99", "2.0.0"],
  ])
    assert.doesNotThrow(() => assertVersionIncrease(previous, next, []));
});

test("unchanged and decreasing versions are rejected", () => {
  for (const [previous, next] of [
    ["0.1.0", "0.1.0"],
    ["0.10.0", "0.9.0"],
    ["1.0.0", "0.99.99"],
  ])
    assert.throws(() => assertVersionIncrease(previous, next, []), /must increase/);
});

test("reserved versions fail without selecting an unrelated larger bump", () => {
  assert.throws(() => assertVersionIncrease("0.1.0", "0.1.1", ["0.1.1", "0.2.0"]), /collides/);
  assert.doesNotThrow(() => assertVersionIncrease("0.1.0", "0.1.1", ["0.2.0"]));
});

test("malformed reservation data fails closed", () => {
  for (const reservations of [null, {}, [123]])
    assert.throws(() => assertVersionIncrease("0.1.0", "0.1.1", reservations));
});

test("SemVer components respect package-manager safe-integer limits", () => {
  assert.doesNotThrow(() => assertReleaseVersion("9007199254740991.0.0"));
  for (const version of ["9007199254740992.0.0", "0.9007199254740992.0", "0.0.9007199254740992"])
    assert.throws(() => assertReleaseVersion(version), /safe integers/);
});
