// Downloads the four brand fonts from Google Fonts into src/fonts/ and writes src/fonts/fonts.css.
// Run it only to update the fonts (`pnpm --filter @truvar-ai/design-system fetch:fonts`); the files are committed,
// and build-css.mjs copies them into dist/. All four are under the SIL Open Font License (src/fonts/OFL.txt).
// Each font keeps its unicode-range per subset, so a page downloads only the files its text needs.
import fs from "node:fs";

const OUT = "src/fonts";
// A browser user agent, so Google returns WOFF2 with one file per subset
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const FAMILIES = [
  // [query, file prefix]. DM Sans and Alexandria are variable: one file per subset covers every weight.
  ["Poppins:wght@400;500;600;700", "poppins"],
  ["DM+Sans:wght@100..1000", "dm-sans"],
  ["Alexandria:wght@100..900", "alexandria"],
  ["IBM+Plex+Sans+Arabic:wght@400;500;600;700", "ibm-plex-sans-arabic"],
];
const SUBSETS = ["latin", "latin-ext", "arabic"];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
let css = `/* Truvar.ai brand fonts, served with the package. Import once, before styles.css:
   import "@truvar-ai/design-system/fonts.css";
   Poppins, DM Sans, Alexandria and IBM Plex Sans Arabic: SIL Open Font License 1.1 (OFL.txt). */
`;
let files = 0;
for (const [query, prefix] of FAMILIES) {
  const res = await fetch(`https://fonts.googleapis.com/css2?family=${query}&display=swap`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${query}: ${res.status}`);
  const src = await res.text();
  // Google writes each @font-face after a /* subset */ comment
  for (const [, subset, body] of src.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g)) {
    if (!SUBSETS.includes(subset)) continue;
    const prop = (name) => body.match(new RegExp(`${name}:\\s*([^;]+);`))[1].trim();
    const weight = prop("font-weight");
    const name = `${prefix}-${subset}-${weight.replace(" ", "-")}.woff2`;
    const url = prop("src").match(/url\(([^)]+)\)/)[1];
    fs.writeFileSync(`${OUT}/${name}`, Buffer.from(await (await fetch(url)).arrayBuffer()));
    files++;
    css += `
/* ${subset} */
@font-face {
  font-family: ${prop("font-family")};
  font-style: ${prop("font-style")};
  font-weight: ${weight};
  font-display: swap;
  src: url("./fonts/${name}") format("woff2");
  unicode-range: ${prop("unicode-range")};
}
`;
  }
}
fs.writeFileSync(`${OUT}/fonts.css`, css);

// The licence travels with the files: each family's OFL.txt from the Google Fonts repository
let ofl = "";
for (const dir of ["poppins", "dmsans", "alexandria", "ibmplexsansarabic"]) {
  const res = await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${dir}/OFL.txt`);
  if (!res.ok) throw new Error(`${dir} OFL: ${res.status}`);
  ofl += (ofl ? "\n\n" + "=".repeat(72) + "\n\n" : "") + (await res.text()).trim() + "\n";
}
fs.writeFileSync(`${OUT}/OFL.txt`, ofl);
console.log(`fonts: ${files} files`);
