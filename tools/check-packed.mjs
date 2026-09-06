import { execFileSync } from "node:child_process";
import { mkdtemp, cp, readFile, writeFile, readdir, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { preview } from "vite";
import { provePackedBrowser } from "./prove-packed-browser.mjs";

const temporary = await mkdtemp(resolve(tmpdir(), "enduragent-ui-packed-"));
const consumer = resolve(temporary, "consumer");
let server;
try {
  await mkdir("artifacts", { recursive: true });
  execFileSync("pnpm", ["pack", "--pack-destination", temporary], { stdio: "inherit" });
  const archives = (await readdir(temporary)).filter((name) => name.endsWith(".tgz"));
  if (archives.length !== 1) throw Error("Expected exactly one packed artifact");
  const tarball = resolve(temporary, archives[0]);
  const files = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" }).trim().split("\n");
  const allowed =
    /^package\/(?:dist\/(?:[\w/-]+\.(?:js|d\.ts|css)|fonts\/[\w-]+\.woff2)|package\.json|README\.md|NOTICE\.md|LICENSE)$/;
  for (const file of files) if (!allowed.test(file)) throw Error(`Unexpected packed file: ${file}`);
  const manifest = JSON.parse(
    execFileSync("tar", ["-xOzf", tarball, "package/package.json"], { encoding: "utf8" }),
  );
  if (
    JSON.stringify(Object.keys(manifest.exports).sort()) !== JSON.stringify([".", "./tailwind.css"])
  )
    throw Error("Unexpected public exports");
  if (manifest.dependencies.react || manifest.dependencies["react-dom"])
    throw Error("React must remain a peer");
  if (!manifest.peerDependencies.react || !manifest.peerDependencies["react-dom"])
    throw Error("Missing React peers");
  if (files.filter((name) => name.endsWith(".woff2")).length !== 13)
    throw Error("Expected all 13 bundled font files");
  await cp("tests/consumer", consumer, { recursive: true });
  const packageFile = resolve(consumer, "package.json");
  await writeFile(
    packageFile,
    (await readFile(packageFile, "utf8")).replace("PACKED_PACKAGE", tarball),
  );
  await writeFile(
    resolve(consumer, "pnpm-workspace.yaml"),
    "packages:\n  - .\nallowBuilds:\n  esbuild: true\n",
  );
  execFileSync("pnpm", ["install"], {
    cwd: consumer,
    stdio: "inherit",
    env: { ...process.env, CI: "true" },
  });
  execFileSync("pnpm", ["build"], { cwd: consumer, stdio: "inherit" });
  const assets = await readdir(resolve(consumer, "dist/assets"));
  const css = await Promise.all(
    assets
      .filter((name) => name.endsWith(".css"))
      .map((name) => readFile(resolve(consumer, "dist/assets", name), "utf8")),
  );
  if (css.join("").split("@layer utilities{").length !== 2)
    throw Error("Expected one Tailwind utility layer");
  if ((css.join("").match(/::file-selector-button\{box-sizing:border-box;/g) ?? []).length !== 1)
    throw Error("Expected exactly one preflight reset");
  const reactIdentity = JSON.parse(
    await readFile(resolve(consumer, "dist/react-identity.json"), "utf8"),
  );
  if (reactIdentity.roots.length !== 1) throw Error("Expected one actual React runtime");
  server = await preview({
    root: consumer,
    configFile: false,
    preview: { host: "127.0.0.1", port: 0, strictPort: true },
  });
  const address = server.httpServer.address();
  if (address === null || typeof address === "string") throw Error("Missing proof server address");
  await provePackedBrowser({ consumer, url: `http://127.0.0.1:${address.port}`, tarball });
  const sha512 = createHash("sha512")
    .update(await readFile(tarball))
    .digest("hex");
  const retained = resolve(
    "artifacts",
    `enduragent-ui-${manifest.version}-${sha512.slice(0, 16)}.tgz`,
  );
  await cp(tarball, retained);
  await writeFile(
    "artifacts/packed-artifact.json",
    JSON.stringify(
      {
        version: manifest.version,
        sha512,
        tarball: retained,
        files,
        reactIdentity,
        cssSha256: createHash("sha256").update(css.join("")).digest("hex"),
      },
      null,
      2,
    ),
  );
} finally {
  if (server) await new Promise((resolve) => server.httpServer.close(resolve));
  await rm(temporary, { recursive: true, force: true });
}
