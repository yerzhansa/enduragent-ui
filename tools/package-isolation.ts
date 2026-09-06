import ts from "typescript";
import { readFileSync } from "node:fs";
import { resolve, relative, isAbsolute } from "node:path";

export function verifyRuntimeGraph(root: string): readonly string[] {
  const sourceRoot = resolve(root, "src");
  const pending = [resolve(sourceRoot, "index.ts")];
  const visited = new Set<string>();
  const dependencies: unknown = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  if (
    typeof dependencies !== "object" ||
    dependencies === null ||
    !("dependencies" in dependencies) ||
    typeof dependencies.dependencies !== "object" ||
    dependencies.dependencies === null
  )
    throw Error("Package dependencies missing");
  const allowed = new Set([...Object.keys(dependencies.dependencies), "react", "react-dom"]);
  while (pending.length) {
    const next = pending.pop();
    if (next === undefined || visited.has(next)) continue;
    const file: string = next;
    const path = relative(sourceRoot, file);
    if (
      path.startsWith("..") ||
      isAbsolute(path) ||
      /(?:^|\/)(?:stories|preview|fixtures|tests)(?:\/|\.)/.test(path)
    )
      throw Error(`Preview code in runtime graph: ${path}`);
    visited.add(file);
    const source = ts.createSourceFile(
      file,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
    );
    function visit(node: ts.Node): void {
      const specifier =
        ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
          ? node.moduleSpecifier
          : ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword
            ? node.arguments[0]
            : undefined;
      if (specifier !== undefined) {
        if (!ts.isStringLiteral(specifier)) throw Error(`Nonliteral runtime import: ${path}`);
        const name = specifier.text;
        if (name.startsWith(".")) {
          const resolved = ts.resolveModuleName(
            name,
            file,
            { moduleResolution: ts.ModuleResolutionKind.NodeNext, module: ts.ModuleKind.NodeNext },
            ts.sys,
          ).resolvedModule;
          if (!resolved) throw Error(`Unresolved runtime import: ${name}`);
          pending.push(resolved.resolvedFileName);
        } else {
          const packageName = name.startsWith("@")
            ? name.split("/").slice(0, 2).join("/")
            : name.split("/")[0];
          if (!allowed.has(packageName)) throw Error(`Undeclared runtime import: ${name}`);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  return [...visited].sort();
}
