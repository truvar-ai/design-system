// Assembles the stylesheets and token files into dist/ after tsup.
import fs from "node:fs";

const TOKENS = "../../tokens/build";
const read = (f) => fs.readFileSync(f, "utf8");
fs.mkdirSync("dist", { recursive: true });
for (const f of ["tokens.css", "tokens.json", "tokens.js"]) fs.copyFileSync(`${TOKENS}/${f}`, `dist/${f}`);
fs.writeFileSync("dist/styles.css", read(`${TOKENS}/tokens.css`) + "\n" + read("src/core/styles.css"));
for (const part of ["charts", "voice", "os"]) fs.copyFileSync(`src/${part}/styles.css`, `dist/${part}.css`);
console.log("css: styles.css, tokens.css, charts.css, voice.css, os.css");
