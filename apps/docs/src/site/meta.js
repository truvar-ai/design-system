// Search engines, AI answer engines and link previews: titles, descriptions, language links and structured data.
import { SITE_URL, GITHUB, NPM, COMPANY, SOCIAL, VERSION, PACKAGE, localePath } from "./config.js";
import { DOCS_PAGES } from "../docs/nav.js";

const SITE_NAME = { en: "Truvar.ai Design System", ar: "نظام تصميم Truvar.ai" };

const HOME = {
  en: { title: "Truvar.ai Design System: accessible React components in English and Arabic",
    description: "230+ accessible React components, design tokens and full right-to-left support from Truvar.ai, made to feel native on every phone. Free and open source (MIT)." },
  ar: { title: "نظام تصميم Truvar.ai: مكونات React للجميع بالعربية والإنجليزية",
    description: "أكثر من ٢٣٠ مكوّنًا بلغة React، ورموز تصميم، ودعم كامل للكتابة من اليمين لليسار من Truvar.ai، ويعمل كتطبيق أصلي على كل هاتف. مجاني ومفتوح المصدر (MIT)." },
};

// The written guides: one description each, saying what the reader will learn
const GUIDES = {
  "": {
    en: "What the Truvar.ai design system is: accessible React components on React Aria, Arabic-first with full RTL, design tokens, and every import path it ships.",
    ar: "ما هو نظام تصميم Truvar.ai: مكونات React للجميع مبنية على React Aria، العربية أولًا مع دعم كامل للاتجاه، ورموز تصميم، وكل مسارات الاستيراد.",
  },
  installation: {
    en: "Install @truvar-ai/design-system with pnpm, npm or Yarn, add the stylesheet and the four brand fonts, and render your first component.",
    ar: "ثبّت @truvar-ai/design-system باستخدام pnpm أو npm أو Yarn، وأضف ملف الأنماط والخطوط الأربعة، واعرض أول مكوّن.",
  },
  nextjs: {
    en: "Use the Truvar.ai design system in Next.js: root layout, fonts, I18nProvider and RouterProvider, Arabic pages and the Pages Router.",
    ar: "استخدم نظام تصميم Truvar.ai مع Next.js: التخطيط الجذري والخطوط و I18nProvider و RouterProvider والصفحات العربية و Pages Router.",
  },
  theming: {
    en: "Light and dark themes, the design tokens as CSS variables and JavaScript, and brand themes in the Truvar.ai design system.",
    ar: "الوضعان الفاتح والداكن، ورموز التصميم كمتغيرات CSS و JavaScript، وسمات العلامات التجارية في نظام تصميم Truvar.ai.",
  },
  rtl: {
    en: "Arabic and right-to-left layouts: setup, what mirrors automatically, Arabic fonts, and keeping phone numbers and code left to right.",
    ar: "العربية والكتابة من اليمين لليسار: الإعداد، وما ينعكس تلقائيًا، والخطوط العربية، وإبقاء الأرقام والأكواد من اليسار لليمين.",
  },
  cursors: {
    en: "Free Truvar OS mouse cursors for Windows and Linux in Truvar Blue or Gold, with an animated loading orbit, and the Truvar pointer colours on macOS.",
    ar: "مؤشرات فأرة Truvar OS مجانية لـ Windows و Linux بالأزرق أو الذهبي مع مدار تحميل متحرك، وألوان مؤشر Truvar على macOS.",
  },
  mobile: {
    en: "Native-feeling phones: viewport setup, touch feedback, finger-sized targets, bottom navigation, sheets, push menu and system bars.",
    ar: "تجربة أصلية على الهواتف: إعداد منفذ العرض، واستجابة اللمس، وأهداف بحجم الإصبع، وشريط التنقل السفلي، والأوراق، والقائمة الجانبية، وأشرطة النظام.",
  },
};

const list = (items, lang) => {
  const names = items.map(([, en, ar]) => (lang === "ar" ? ar : en));
  if (names.length <= 1) return names.join("");
  return lang === "ar" ? `${names.slice(0, -1).join("، ")} و${names.at(-1)}` : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
};

// Component pages: what's on the page, from its sections
function viewDescription(p, lang) {
  const i = lang === "ar" ? 1 : 0;
  const items = (p.items ?? []).slice(0, 6);
  if (p.example) {
    return lang === "ar"
      ? `${p.name[i]}: شاشة كاملة مبنية بنظام تصميم Truvar.ai، تعمل بالعربية والإنجليزية وبالوضعين الفاتح والداكن وعلى الهاتف.`
      : `${p.name[i]}: a complete screen built with the Truvar.ai design system, working in English and Arabic, light and dark, and on phones.`;
  }
  if (!items.length) {
    return lang === "ar"
      ? `${p.name[i]} في نظام تصميم Truvar.ai: مكونات React للجميع مع أمثلة حية بالعربية والإنجليزية.`
      : `${p.name[i]} in the Truvar.ai design system: accessible React components with live examples in English and Arabic.`;
  }
  return lang === "ar"
    ? `${p.name[i]} في نظام تصميم Truvar.ai: ${list(items, "ar")}. مكونات React للجميع مع أمثلة حية بالعربية والإنجليزية.`
    : `${p.name[i]} in the Truvar.ai design system: ${list(items, "en")}. Accessible React components with live examples in English and Arabic.`;
}

export function pageMeta(lang, path, title, description) {
  const url = SITE_URL + localePath(lang, path);
  return {
    metadataBase: new URL(SITE_URL),
    title, description,
    applicationName: SITE_NAME[lang],
    authors: [{ name: "Truvar.ai", url: COMPANY }],
    creator: "Truvar.ai", publisher: "Truvar.ai",
    keywords: ["design system", "React components", "React Aria", "Arabic", "RTL", "accessibility", "Next.js", "design tokens", "Truvar.ai"],
    // Every page may be indexed, shown with a large preview image and quoted in full by search and AI answer engines
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    alternates: { canonical: url, languages: { en: SITE_URL + localePath("en", path), ar: SITE_URL + localePath("ar", path), "x-default": SITE_URL + localePath("en", path) } },
    openGraph: { type: "website", url, title, description, siteName: SITE_NAME[lang], locale: lang === "ar" ? "ar_EG" : "en_US",
      alternateLocale: lang === "ar" ? "en_US" : "ar_EG",
      images: [{ url: "/og.png", width: 1600, height: 800, alt: lang === "ar" ? "نظام تصميم Truvar.ai" : "Truvar.ai Design System" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
    formatDetection: { telephone: false, email: false, address: false }, // sample phone numbers stay text
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/favicon-32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: light)" },
        { url: "/favicon-dark-32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: dark)" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.webmanifest",
  };
}

export const homeMeta = (lang) => pageMeta(lang, "/", HOME[lang].title, HOME[lang].description);

export function docDescription(lang, id) {
  const p = DOCS_PAGES.find((x) => x.id === id);
  return GUIDES[id]?.[lang] ?? viewDescription(p, lang);
}

export function docMeta(lang, id) {
  const p = DOCS_PAGES.find((x) => x.id === id);
  const name = p.name[lang === "ar" ? 1 : 0];
  return pageMeta(lang, id ? `/docs/${id}/` : "/docs/", `${name} · ${SITE_NAME[lang]}`, docDescription(lang, id));
}

export const guideSlugs = () => DOCS_PAGES.filter((p) => p.id && p.guide).map((p) => ({ slug: p.id }));

/* ---------- Structured data (schema.org JSON-LD) ---------- */
const ORG = {
  "@type": "Organization", "@id": `${COMPANY}/#organization`, name: "Truvar.ai", url: COMPANY,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png`, width: 512, height: 512 },
  email: "business@truvar.ai", slogan: "True Valuable Results Through AI",
  sameAs: [...SOCIAL.map((s) => s.href), "https://github.com/truvar-ai"],
};
const WEBSITE = (lang) => ({
  "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: SITE_NAME.en, alternateName: SITE_NAME.ar,
  inLanguage: ["en", "ar"], publisher: { "@id": ORG["@id"] }, description: HOME[lang].description,
});
const SOFTWARE = (lang) => ({
  "@type": "SoftwareSourceCode", "@id": `${SITE_URL}/#package`, name: PACKAGE, alternateName: SITE_NAME.en,
  description: HOME[lang].description, url: `${SITE_URL}/`, codeRepository: GITHUB, downloadUrl: NPM,
  programmingLanguage: ["JavaScript", "React", "CSS"], runtimePlatform: "React 18 and 19, Next.js, Vite, Electron",
  license: "https://opensource.org/license/mit", version: VERSION, isAccessibleForFree: true,
  author: { "@id": ORG["@id"] }, publisher: { "@id": ORG["@id"] },
});

export function homeJsonLd(lang) {
  const url = SITE_URL + localePath(lang, "/");
  return {
    "@context": "https://schema.org",
    "@graph": [ORG, WEBSITE(lang), SOFTWARE(lang),
      { "@type": "WebPage", "@id": `${url}#webpage`, url, name: HOME[lang].title, description: HOME[lang].description, inLanguage: lang,
        isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#package` }, primaryImageOfPage: `${SITE_URL}/og.png` }],
  };
}

export function docJsonLd(lang, id) {
  const p = DOCS_PAGES.find((x) => x.id === id);
  const i = lang === "ar" ? 1 : 0;
  const url = SITE_URL + localePath(lang, id ? `/docs/${id}/` : "/docs/");
  const docsUrl = SITE_URL + localePath(lang, "/docs/");
  const crumbs = [
    { name: SITE_NAME[lang], item: SITE_URL + localePath(lang, "/") },
    { name: lang === "ar" ? "التوثيق" : "Docs", item: docsUrl },
    ...(id ? [{ name: p.name[i], item: url }] : []),
  ];
  return {
    "@context": "https://schema.org",
    "@graph": [ORG, WEBSITE(lang),
      { "@type": "TechArticle", "@id": `${url}#article`, url, headline: p.name[i], description: docDescription(lang, id), inLanguage: lang,
        articleSection: p.group[i], isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#package` },
        author: { "@id": ORG["@id"] }, publisher: { "@id": ORG["@id"] }, image: `${SITE_URL}/og.png`,
        ...(p.items?.length && { hasPart: p.items.map(([sid, en, ar]) => ({ "@type": "WebPageElement", name: i ? ar : en, url: `${url}#${sid}` })) }) },
      { "@type": "BreadcrumbList", itemListElement: crumbs.map((c, n) => ({ "@type": "ListItem", position: n + 1, name: c.name, item: c.item })) }],
  };
}
