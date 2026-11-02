// After `next build`: Next.js (static export) writes the data it prefetches for each link in nested folders,
// out/<page>/__next.<group>/<segments>/__PAGE__.txt, but the browser asks for one flat name,
// out/<page>/__next.<group>.<segments>.__PAGE__.txt. Without a copy under that name every prefetch is a 404:
// console errors, and links that can't open instantly. This writes the flat copies.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../out");
let n = 0;

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (!e.isDirectory()) continue;
    if (e.name.startsWith("__next.")) flatten(dir, full, e.name);
    else walk(full);
  }
}
// Every file under <dir>/__next.<group>/… becomes <dir>/__next.<group>.<a>.<b>.<file>
function flatten(dir, root, prefix) {
  const visit = (d, parts) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) visit(full, [...parts, e.name]);
      else { fs.copyFileSync(full, path.join(dir, [prefix, ...parts, e.name].join("."))); n++; }
    }
  };
  visit(root, []);
}

walk(OUT);
console.log(`prefetch: ${n} files`);
