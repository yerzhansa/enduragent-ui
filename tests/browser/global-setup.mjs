import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, isAbsolute } from "node:path";
import { release } from "node:os";

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
export default async function globalSetup() {
  if (process.platform !== "darwin" || process.arch !== "arm64" || !release().startsWith("25."))
    throw Error("UI reference requires Darwin 25 arm64");
  const identity = JSON.parse(await readFile("dist-storybook/preview-source.json", "utf8"));
  const { digest, ...sealed } = identity;
  if (hash(JSON.stringify(sealed)) !== digest) throw Error("Changed UI source identity");
  if (
    identity.mode !== "build" ||
    identity.graphCoverage !== "complete-build" ||
    !identity.fileSources?.length ||
    !identity.outputs?.length
  )
    throw Error("Incomplete UI build identity");
  for (const source of identity.fileSources) {
    const path = isAbsolute(source.path) ? source.path : resolve(source.path);
    if (hash(await readFile(path)) !== source.sha256) throw Error(`Stale UI build: ${source.path}`);
  }
  for (const output of identity.outputs)
    if (hash(await readFile(resolve("dist-storybook", output.path))) !== output.sha256)
      throw Error(`Changed UI build output: ${output.path}`);
  const root = "tests/browser/baselines/extracted";
  const reference = JSON.parse(await readFile(`${root}/reference.json`, "utf8"));
  if (reference.images?.length !== 28 || !/^[a-f0-9]{64}$/.test(reference.referenceManifestSha256))
    throw Error("Incomplete transferred image reference");
  const expected = reference.images.map((image) => image.path).sort();
  const found = (await readdir(root, { recursive: true }))
    .filter((path) => path.endsWith(".png"))
    .sort();
  if (JSON.stringify(found) !== JSON.stringify(expected))
    throw Error("Missing or unexpected UI reference images");
  for (const image of reference.images)
    if (hash(await readFile(resolve(root, image.path))) !== image.sha256)
      throw Error(`Changed sealed UI reference: ${image.path}`);
}
