// Everything about the site that isn't page content: addresses, links, version.
import pkg from "@truvar-ai/design-system/package.json";

export const SITE_URL = "https://design-system.truvar.ai";
export const VERSION = pkg.version;
export const PACKAGE = pkg.name;
export const GITHUB = "https://github.com/truvar-ai/design-system";
export const NPM = "https://www.npmjs.com/package/@truvar-ai/design-system";
export const COMPANY = "https://truvar.ai";
export const CONTACT = "mailto:business@truvar.ai";
// Google Tag Manager container: loaded on every page, tags are managed at tagmanager.google.com
export const GTM_ID = "GTM-WHX73987";

// Social profiles shown in the footer. Each: { id, label, href } where id is one of
// linkedin, x, youtube, facebook, instagram, tiktok, npm. Empty entries are left out.
export const SOCIAL = [
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/truvar-ai" },
  { id: "youtube", label: "YouTube", href: "https://www.youtube.com/@Truvar-d8b" },
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/truvar.ai/" },
  { id: "facebook", label: "Facebook", href: "https://www.facebook.com/truvar.ai.global" },
  { id: "npm", label: "npm", href: "https://www.npmjs.com/org/truvar-ai" },
];

// "/docs/button" in English is "/ar/docs/button" in Arabic
export const localePath = (lang, path = "/") => (lang === "ar" ? "/ar" + path : path);
export const LOCALES = { en: "en-US", ar: "ar-EG" };
