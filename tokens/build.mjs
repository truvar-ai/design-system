// Builds every token output from the DTCG files in this folder.
// Light values live in $value; dark values in $extensions["ai.truvar.modes"].dark.
import fs from "node:fs";
import StyleDictionary from "style-dictionary";

const MODE = "ai.truvar.modes";
const OUT = "build";

/* ---------- value transforms (DTCG 2025.10 objects → CSS) ---------- */
const num = (n) => String(+n.toFixed(3)).replace(/^0\./, ".");
const color = (c) => {
  if (typeof c === "string") return c;
  const a = c.alpha ?? 1;
  if (a === 1 && c.hex) return c.hex;
  const [r, g, b] = c.components.map((v) => Math.round(v * 255));
  return `rgba(${r},${g},${b},${num(a)})`;
};
const dim = (d) => (typeof d === "object" ? (d.value === 0 ? "0" : `${d.value}${d.unit}`) : String(d));
const shadow = (s) => [].concat(s).map((l) =>
  [l.inset && "inset", dim(l.offsetX), dim(l.offsetY), dim(l.blur), dim(l.spread) !== "0" && dim(l.spread), color(l.color)]
    .filter(Boolean).join(" ")).join(",");
const GENERIC = new Set(["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "ui-sans-serif", "ui-serif"]);
const fontFamily = (f) => [].concat(f).map((n) => (GENERIC.has(n) ? n : `"${n}"`)).join(",");
const toCss = (type, v) =>
  ({ color, dimension: dim, shadow, fontFamily }[type] ?? String)(v);

StyleDictionary.registerTransform({
  name: "truvar/name", type: "name",
  // color.semantic.surface → surface, space.4 → space-4, font.display → font-display
  transform: (t) => (t.path[0] === "color" ? t.path.slice(2) : t.path).join("-"),
});
StyleDictionary.registerTransform({
  name: "truvar/css", type: "value", transitive: true,
  transform: (t) => toCss(t.$type ?? t.type, t.$value ?? t.value),
});
// Swaps each token's value for its dark value, so the same pipeline builds the dark theme
StyleDictionary.registerPreprocessor({
  name: "truvar/dark",
  preprocessor: (dict) => {
    const walk = (node) => {
      if (node && typeof node === "object") {
        if ("$value" in node) {
          const d = node.$extensions?.[MODE]?.dark;
          if (d === undefined) node.$extensions = { ...node.$extensions, "ai.truvar.light-only": true };
          else node.$value = d;
          return;
        }
        for (const k of Object.keys(node)) if (!k.startsWith("$")) walk(node[k]);
      }
    };
    walk(dict);
    return dict;
  },
});

async function tokensFor(mode) {
  const sd = new StyleDictionary({
    source: ["*.tokens.json"],
    preprocessors: mode === "dark" ? ["truvar/dark"] : [],
    platforms: { css: { transforms: ["truvar/name", "truvar/css"] } },
    log: { verbosity: "silent" },
  });
  const { allTokens } = await sd.getPlatformTokens("css");
  return allTokens
    .filter((t) => mode === "light" || !t.$extensions?.["ai.truvar.light-only"])
    .map((t) => ({ name: t.name, value: t.$value, type: t.$type, description: t.$description }));
}

const light = await tokensFor("light");
const dark = await tokensFor("dark");
const decls = (list, indent) => list.map((t) => `${indent}--${t.name}: ${t.value};`).join("\n");
const HEADER = "/* Truvar design tokens. Generated from tokens/*.tokens.json — do not edit. */";

const css = `${HEADER}
:root {
${decls(light, "  ")}
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${decls(dark, "    ")}
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
${decls(dark, "  ")}
  color-scheme: dark;
}
`;
const map = (list) => Object.fromEntries(list.map((t) => [t.name, t.value]));
const json = { light: map(light), dark: { ...map(light), ...map(dark) } };

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(`${OUT}/tokens.css`, css);
fs.writeFileSync(`${OUT}/tokens.json`, JSON.stringify(json, null, 2) + "\n");
fs.writeFileSync(`${OUT}/tokens.js`,
  `// Generated from tokens/*.tokens.json — do not edit.\nexport const light = ${JSON.stringify(json.light, null, 2)};\nexport const dark = ${JSON.stringify(json.dark, null, 2)};\nexport default { light, dark };\n`);
console.log(`tokens: ${light.length} light, ${dark.length} dark overrides → ${OUT}/`);
