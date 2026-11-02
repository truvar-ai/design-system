// Assembles the stylesheets and token files into dist/ after tsup.
import fs from "node:fs";

const TOKENS = "../../tokens/build";
const read = (f) => fs.readFileSync(f, "utf8");
fs.mkdirSync("dist", { recursive: true });
for (const f of ["tokens.css", "tokens.json", "tokens.js"]) fs.copyFileSync(`${TOKENS}/${f}`, `dist/${f}`);
fs.writeFileSync("dist/styles.css", read(`${TOKENS}/tokens.css`) + "\n" + read("src/core/styles.css"));
for (const part of ["charts", "voice", "os", "crm", "widget"]) fs.copyFileSync(`src/${part}/styles.css`, `dist/${part}.css`);
// The brand fonts: dist/fonts.css points at dist/fonts/*.woff2
fs.mkdirSync("dist/fonts", { recursive: true });
for (const f of fs.readdirSync("src/fonts")) fs.copyFileSync(`src/fonts/${f}`, f === "fonts.css" ? "dist/fonts.css" : `dist/fonts/${f}`);
console.log("css: styles.css, tokens.css, fonts.css, charts.css, voice.css, os.css, crm.css, widget.css");
