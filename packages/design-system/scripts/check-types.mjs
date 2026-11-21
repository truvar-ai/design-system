// Guard: the TypeScript declarations must describe exactly the runtime exports of every entry point.
// For each entry it loads the built JavaScript (dist/<entry>.js), lists the declaration file's exported VALUE
// names with the TypeScript compiler API (following `export *`), and fails if the two lists differ.
// Run after a build: `pnpm --filter @truvar-ai/design-system build && pnpm --filter @truvar-ai/design-system check:types`.
import fs from "node:fs";
import path from "node:path";
import { createRequire, register } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const ENTRIES = ["index", "brand", "icons", "charts", "voice", "os", "crm", "widget", "tokens"];
const DIST = path.resolve("dist");

// Some entries import stylesheets (voice does). Node can't, so a tiny loader turns every .css import into an empty module.
register(
  "data:text/javascript," +
    encodeURIComponent(`
      export async function load(url, context, next) {
        if (url.endsWith(".css")) return { format: "module", source: "export default {};", shortCircuit: true };
        return next(url, context);
      }
    `),
  import.meta.url,
);

// Runtime export names of the entries (the page's own globals: some modules touch window/document lazily only)
async function runtimeExports(entry) {
  const file = path.join(DIST, `${entry}.js`);
  const mod = await import(pathToFileURL(file).href);
  return new Set(Object.keys(mod));
}

// Declared value export names of the entries
function declaredExports(entries) {
  const files = entries.map((e) => path.join(DIST, `${e}.d.ts`));
  for (const f of files) if (!fs.existsSync(f)) throw new Error(`missing declaration file ${path.relative(".", f)} (run the build first)`);
  const program = ts.createProgram(files, {
    noEmit: true,
    strict: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    types: [],
  });
  const checker = program.getTypeChecker();
  const out = {};
  const problems = [];
  entries.forEach((entry, i) => {
    const sf = program.getSourceFile(files[i]);
    const moduleSymbol = sf && checker.getSymbolAtLocation(sf);
    if (!moduleSymbol) {
      problems.push(`${entry}.d.ts is not a module (it has no import or export)`);
      out[entry] = new Set();
      return;
    }
    const names = new Set();
    for (const sym of checker.getExportsOfModule(moduleSymbol)) {
      let target = sym;
      if (sym.flags & ts.SymbolFlags.Alias) target = checker.getAliasedSymbol(sym);
      // Skip pure types (interfaces, type aliases); a name that is both a type and a value counts as a value.
      if (target.flags & ts.SymbolFlags.Value) names.add(sym.name);
    }
    out[entry] = names;
  });
  return { out, problems };
}

const { out: declared, problems } = declaredExports(ENTRIES);

for (const entry of ENTRIES) {
  let runtime;
  try {
    runtime = await runtimeExports(entry);
  } catch (err) {
    problems.push(`${entry}: could not load dist/${entry}.js to list its exports: ${err.message}`);
    continue;
  }
  const decl = declared[entry];
  const missing = [...runtime].filter((n) => !decl.has(n)).sort();
  const extra = [...decl].filter((n) => !runtime.has(n)).sort();
  if (missing.length) problems.push(`${entry}: exported at runtime but has no declaration: ${missing.join(", ")}`);
  if (extra.length) problems.push(`${entry}: declared but not exported at runtime: ${extra.join(", ")}`);
  console.log(`${entry}: ${runtime.size} runtime exports, ${decl.size} declared values${missing.length || extra.length ? "  MISMATCH" : ""}`);
}

if (problems.length) {
  console.error("\ncheck-types FAILED:\n  " + problems.join("\n  "));
  console.error("\nFix the declarations in packages/design-system/types/ (they are copied into dist/ by scripts/copy-types.mjs).");
  process.exit(1);
}
console.log("check-types: runtime exports and declarations match for every entry.");
process.exit(0);
