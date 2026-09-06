import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const { verifyRuntimeGraph } = await import("./package-isolation.ts");
verifyRuntimeGraph(process.cwd());
await rm("dist", { recursive: true, force: true });
execFileSync("pnpm", ["exec", "tsc"], { stdio: "inherit" });
await mkdir("dist/fonts", { recursive: true });
for (const file of ["tokens.css", "tailwind.css"]) await cp(`src/styles/${file}`, `dist/${file}`);
let fonts = "";
let notices = "";
for (const [name, entry] of [
  ["inter", "opsz.css"],
  ["geist-mono", "index.css"],
]) {
  const cssPath = fileURLToPath(import.meta.resolve(`@fontsource-variable/${name}/${entry}`));
  let css = await readFile(cssPath, "utf8");
  for (const match of css.matchAll(/url\(\.\/files\/([^)]*)\)/g)) {
    await cp(resolve(dirname(cssPath), "files", match[1]), `dist/fonts/${match[1]}`);
  }
  css = css.replaceAll("./files/", "./fonts/").replace(/\/\*[\s\S]*?\*\//g, "");
  fonts += css;
  notices += `\n## ${name}\n\n${await readFile(resolve(dirname(cssPath), "LICENSE"), "utf8")}\n`;
}
await writeFile("dist/fonts.css", fonts);
await cp("node_modules/tw-animate-css/dist/tw-animate.css", "dist/animations.css");
notices += `\n## tw-animate-css\n\n${await readFile("node_modules/tw-animate-css/LICENSE", "utf8")}\n`;
await writeFile("NOTICE.md", `# Font licenses\n${notices}`);
