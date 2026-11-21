// Copies the hand-written TypeScript declarations (types/) into dist/ after tsup, so every "types" path in
// package.json sits next to its JavaScript (dist/index.d.ts beside dist/index.js, and so on).
// The files inside use relative ".js" imports (./core/more.js), which TypeScript resolves to ./core/more.d.ts.
// dist/core/ is not used by tsup (its shared code goes to dist/chunk-*.js and dist/internal/), so nothing collides.
import fs from "node:fs";
import path from "node:path";

const SRC = "types";
const OUT = "dist";

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

let n = 0;
for (const file of walk(SRC)) {
  if (!file.endsWith(".d.ts")) continue;
  const target = path.join(OUT, path.relative(SRC, file));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(file, target);
  n++;
}
console.log(`types: copied ${n} declaration files into ${OUT}/`);
