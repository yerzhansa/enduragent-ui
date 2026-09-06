export function stableVersion(version) {
  if (
    typeof version !== "string" ||
    version !== version.trim() ||
    !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)
  )
    throw new Error("Expected stable SemVer X.Y.Z without prerelease or build metadata");
  const parts = version.split(".").map(Number);
  if (parts.some((part) => !Number.isSafeInteger(part)))
    throw new Error("SemVer components must be safe integers");
  return parts;
}

export function assertReleaseVersion(version) {
  stableVersion(version);
  if (version === "0.0.0")
    throw new Error("Version 0.0.0 is an unpublished development placeholder");
}

export function assertVersionIncrease(previous, version, reserved) {
  const before = stableVersion(previous);
  assertReleaseVersion(version);
  const after = stableVersion(version);
  const changed = after.findIndex((part, index) => part !== before[index]);
  if (changed === -1 || after[changed] < before[changed])
    throw new Error("Changesets version must increase beyond the current manifest");
  if (!Array.isArray(reserved) || reserved.some((entry) => typeof entry !== "string"))
    throw new Error("GitHub versions must be a string array");
  if (reserved.includes(version))
    throw new Error("Changesets version collides with a GitHub release or tag");
}
