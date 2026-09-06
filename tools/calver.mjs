export function releaseBase(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date ?? "");
  if (!match) throw new Error("Release date must be YYYY-MM-DD");
  const [year, month, day] = match.slice(1).map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const lengths = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > lengths[month - 1])
    throw new Error("Invalid release calendar date");
  return `${year}.${month}.${day}`;
}

export function nextVersion(date, versions) {
  if (!Array.isArray(versions) || versions.some((version) => typeof version !== "string"))
    throw new Error("Registry versions must be a string array");
  const base = releaseBase(date);
  const sameDay = versions.filter((version) => version === base || version.startsWith(`${base}-`));
  if (sameDay.length === 0) return base;
  const suffixes = sameDay.map((version) => {
    if (version === base) return 0;
    const suffix = version.slice(base.length + 1);
    if (!/^[1-9]\d*$/.test(suffix) || !Number.isSafeInteger(Number(suffix)))
      throw new Error("Unsupported same-day registry version");
    return Number(suffix);
  });
  const sequence = Math.max(...suffixes) + 1;
  if (!Number.isSafeInteger(sequence)) throw new Error("Release sequence exhausted");
  return `${base}-${sequence}`;
}

export function assertReleaseDate(version, date) {
  const base = releaseBase(date);
  if (version !== base && !new RegExp(`^${base.replaceAll(".", "\\.")}-[1-9]\\d*$`).test(version))
    throw new Error("Package version differs from release date");
}

export function rewriteChangelog(changelog, previousVersion, version) {
  const heading = /^## ([^\r\n]+)$/m.exec(changelog);
  if (!heading || heading[1] !== previousVersion)
    throw new Error("Changesets changelog has an unexpected first version");
  return (
    changelog.slice(0, heading.index) +
    heading[0].replace(previousVersion, version) +
    changelog.slice(heading.index + heading[0].length)
  );
}
