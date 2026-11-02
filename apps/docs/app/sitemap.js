import { SITE_URL, localePath } from "../src/site/config.js";
import { DOCS_PAGES } from "../src/docs/nav.js";

export const dynamic = "force-static";
// Every page in both languages, each linked to its twin. lastModified is the build, which is when the site changed.
export default function sitemap() {
  const lastModified = new Date();
  const paths = ["/", ...DOCS_PAGES.map((p) => (p.id ? `/docs/${p.id}/` : "/docs/"))];
  return paths.flatMap((p) => ["en", "ar"].map((l) => ({
    url: SITE_URL + localePath(l, p),
    lastModified,
    changeFrequency: p === "/" ? "weekly" : "monthly",
    priority: p === "/" ? 1 : p === "/docs/" ? 0.9 : 0.7,
    alternates: { languages: { en: SITE_URL + localePath("en", p), ar: SITE_URL + localePath("ar", p), "x-default": SITE_URL + localePath("en", p) } },
  })));
}
