// After `next build`: writes the files AI assistants and answer engines read (https://llmstxt.org).
//   /llms.txt            an index of every page with its description
//   /llms-full.txt       the whole English documentation in one Markdown file, with the package README
//   /ar/llms-full.txt    the same in Arabic
//   /…/index.md          a Markdown copy next to every docs page's index.html
// Everything is read from the built pages, so these files always match the site.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node-html-parser";
import { DOCS_NAV } from "../src/docs/nav.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "../out");
const SITE = "https://design-system.truvar.ai";
const README = path.join(HERE, "../../../packages/design-system/README.md");
const local = (lang, p) => (lang === "ar" ? "/ar" + p : p);
const docPath = (id) => (id ? `/docs/${id}/` : "/docs/");

/* ---------- HTML to Markdown ---------- */
const clean = (s) => s.replace(/\s+/g, " ").trim();
const abs = (href) => (href?.startsWith("/") ? SITE + href : href);

function inline(node) {
  if (node.nodeType === 3) return node.rawText.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/\s+/g, " ");
  if (node.nodeType !== 1) return "";
  const tag = node.rawTagName?.toLowerCase();
  if (["svg", "script", "style", "button", "img"].includes(tag) || node.getAttribute("aria-hidden") === "true") return "";
  const inner = node.childNodes.map(inline).join("");
  if (tag === "code") return "`" + clean(inner) + "`";
  if (tag === "b" || tag === "strong") return `**${clean(inner)}**`;
  if (tag === "a" && node.getAttribute("href")) return `[${clean(inner)}](${abs(node.getAttribute("href"))})`;
  return inner;
}

function codeBlock(pre, lang = "") {
  const text = pre.text.replace(/\n$/, "");
  return "```" + lang + "\n" + text + "\n```";
}

// Block-level walk. skipDemos leaves out the live examples' UI and keeps their titles, notes and code.
function blocks(node, out = []) {
  for (const el of node.childNodes) {
    if (el.nodeType !== 1) continue;
    const tag = el.rawTagName?.toLowerCase();
    const cls = el.classList?.value ?? [];
    if (cls.includes("spec-stage")) {
      el.querySelectorAll("pre").forEach((p) => out.push(codeBlock(p, "jsx")));
      continue;
    }
    if (cls.includes("site-code")) {
      const lang = clean(el.querySelector(".site-code-title")?.text ?? "");
      const pre = el.querySelector("pre");
      // The title is a language (css) or a file name (app.css): either way the language is the last part
      const ext = lang.split(".").pop();
      if (pre) out.push(codeBlock(pre, /^(sh|jsx?|css|html|json)$/.test(ext) ? ext : ""));
      continue;
    }
    if (cls.includes("site-command")) { out.push("```sh\n" + clean(el.querySelector("code")?.text ?? "") + "\n```"); continue; }
    if (cls.includes("dx-note")) { out.push("> " + clean(inline(el))); continue; }
    if (cls.includes("dx-cards")) { el.querySelectorAll("a").forEach((a) => out.push(`- [${clean(a.querySelector("b")?.text ?? a.text)}](${abs(a.getAttribute("href"))}): ${clean(a.querySelector("span:last-child")?.text ?? "")}`)); continue; }
    if (cls.includes("on-page") || ["svg", "script", "style", "nav", "button", "img"].includes(tag)) continue;
    if (/^h[1-6]$/.test(tag)) { out.push("#".repeat(Math.min(+tag[1], 6)) + " " + clean(inline(el))); continue; }
    if (tag === "p") { const t = clean(inline(el)); if (t) out.push(t); continue; }
    if (tag === "ul" || tag === "ol") { el.querySelectorAll(":scope > li").forEach((li, n) => out.push((tag === "ol" ? `${n + 1}. ` : "- ") + clean(inline(li)))); continue; }
    if (tag === "pre") { out.push(codeBlock(el)); continue; }
    if (tag === "table") {
      const rows = el.querySelectorAll("tr").map((tr) => tr.querySelectorAll("th,td").map((c) => clean(inline(c)).replace(/\|/g, "\\|")));
      if (rows.length) out.push([`| ${rows[0].join(" | ")} |`, `| ${rows[0].map(() => "---").join(" | ")} |`, ...rows.slice(1).map((r) => `| ${r.join(" | ")} |`)].join("\n"));
      continue;
    }
    blocks(el, out);
  }
  return out;
}

/* ---------- Pages ---------- */
const PAGES = DOCS_NAV.flatMap((g) => g.views.map((v) => ({ ...v, group: g.group })));

function readPage(lang, id) {
  const file = path.join(OUT, local(lang, docPath(id)), "index.html");
  // <pre> is parsed as HTML (by default the parser keeps it as raw text, <code> tags and all)
  const root = parse(fs.readFileSync(file, "utf8"), { blockTextElements: { script: true, style: true } });
  const title = clean(root.querySelector(".dx-title")?.text ?? "");
  const description = root.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
  const importFrom = clean(root.querySelector(".dx-import code")?.text ?? "").replace(/"/g, "");
  const article = root.querySelector(".dx-article");
  // The view's own heading is replaced by the docs title above
  article.querySelectorAll(".view-title").forEach((h) => h.remove());
  const body = blocks(article.querySelector(".dx-prose, .dx-demo") ?? article);
  const url = SITE + local(lang, docPath(id));
  const md = [`# ${title}`, `> ${description}`, `Page: ${url}`, ...(importFrom ? ["Import from `" + importFrom + "`"] : []), ...body].join("\n\n");
  return { title, description, url, md, mdPath: local(lang, docPath(id)) + "index.md" };
}

const pages = { en: [], ar: [] };
for (const lang of ["en", "ar"]) {
  for (const p of PAGES) {
    const page = { ...readPage(lang, p.id), group: p.group[lang === "ar" ? 1 : 0] };
    fs.writeFileSync(path.join(OUT, page.mdPath), page.md + "\n");
    pages[lang].push(page);
  }
}

/* ---------- llms.txt ---------- */
const home = parse(fs.readFileSync(path.join(OUT, "index.html"), "utf8"));
const homeDescription = home.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
const pkg = JSON.parse(fs.readFileSync(path.join(HERE, "../../../packages/design-system/package.json"), "utf8"));

const groups = [];
for (const p of pages.en) { let g = groups.find((x) => x.name === p.group); if (!g) groups.push((g = { name: p.group, items: [] })); g.items.push(p); }

const llms = [
  "# Truvar.ai Design System",
  `> ${homeDescription}`,
  [
    `The design system behind every Truvar.ai product: the npm package \`${pkg.name}\` (version ${pkg.version}, MIT license), built on React Aria for React 18 and 19.`,
    "It works with Next.js (App Router and Pages), Vite and Electron. Every component supports English and Arabic with full right-to-left layout, light and dark themes, and phones.",
    `Install with \`pnpm add ${pkg.name}\`, then import \`${pkg.name}/styles.css\` once.`,
  ].join(" "),
  [
    `- Full documentation in one file: ${SITE}/llms-full.txt`,
    `- Arabic documentation in one file: ${SITE}/ar/llms-full.txt`,
    `- Source code: ${pkg.repository?.url?.replace(/^git\+/, "").replace(/\.git$/, "") ?? "https://github.com/truvar-ai/design-system"}`,
    `- npm: https://www.npmjs.com/package/${pkg.name}`,
    "- Company: https://truvar.ai",
  ].join("\n"),
  ...groups.map((g) => [`## ${g.name}`, ...g.items.map((p) => `- [${p.title}](${SITE}${p.mdPath}): ${p.description}`)].join("\n")),
  ["## Optional", `- [Arabic docs](${SITE}/ar/docs/): every page above in Arabic, with Markdown copies at the same addresses under /ar/`, `- [Sitemap](${SITE}/sitemap.xml)`].join("\n"),
].join("\n\n") + "\n";
fs.writeFileSync(path.join(OUT, "llms.txt"), llms);

/* ---------- llms-full.txt ---------- */
const readme = fs.readFileSync(README, "utf8").replace(/^# .*\n/, "");
const full = (lang) => [
  lang === "ar" ? "# نظام تصميم Truvar.ai: التوثيق الكامل" : "# Truvar.ai Design System: full documentation",
  `> ${lang === "ar" ? parse(fs.readFileSync(path.join(OUT, "ar/index.html"), "utf8")).querySelector('meta[name="description"]')?.getAttribute("content") : homeDescription}`,
  `Package: \`${pkg.name}\` ${pkg.version} · License: MIT · Site: ${SITE}${lang === "ar" ? "/ar/" : "/"}`,
  ...(lang === "en" ? ["## Package README", readme.replace(/^(#+) /gm, "$1## ")] : []),
  ...pages[lang].map((p) => p.md.replace(/^(#+) /gm, "$1# ")),
].join("\n\n---\n\n") + "\n";
fs.writeFileSync(path.join(OUT, "llms-full.txt"), full("en"));
fs.writeFileSync(path.join(OUT, "ar/llms-full.txt"), full("ar"));

const kb = (f) => Math.round(fs.statSync(path.join(OUT, f)).size / 1024);
console.log(`llms: ${pages.en.length} pages × 2 languages · llms.txt ${kb("llms.txt")} KB · llms-full.txt ${kb("llms-full.txt")} KB · ar/llms-full.txt ${kb("ar/llms-full.txt")} KB`);
