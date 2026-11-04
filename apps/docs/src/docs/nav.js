// The docs' table of contents. Guides are written here in apps/docs; every other page is a showcase view,
// so its title, sections and live examples come from apps/showcase and never drift apart.
import { NAV as SHOWCASE } from "showcase/src/docs/nav.js";

const GUIDES = {
  group: ["Get started", "البداية"],
  views: [
    { id: "", name: ["Introduction", "مقدمة"], icon: "Home", guide: true },
    { id: "installation", name: ["Installation", "التثبيت"], icon: "Download", guide: true },
    { id: "nextjs", name: ["Next.js", "Next.js"], icon: "Rocket", guide: true },
    { id: "theming", name: ["Themes and tokens", "السمات والرموز"], icon: "Palette", guide: true },
    { id: "rtl", name: ["Arabic and RTL", "العربية والاتجاه"], icon: "Globe", guide: true },
    { id: "mobile", name: ["Phones and touch", "الهواتف واللمس"], icon: "PhoneDeviceIcon", guide: true },
    { id: "cursors", name: ["Cursors for your computer", "مؤشرات لجهازك"], icon: "Cursor", guide: true },
  ],
};

// Where each page's components are imported from
const IMPORTS = {
  Foundations: "@truvar-ai/design-system",
  Components: "@truvar-ai/design-system",
  "Data visualisation": "@truvar-ai/design-system/charts",
  "Voice AI": "@truvar-ai/design-system/voice",
  "Truvar OS": "@truvar-ai/design-system/os",
  Channels: "@truvar-ai/design-system/widget",
  Patterns: "@truvar-ai/design-system",
};
const IMPORT_OVERRIDES = { "crm-kit": "@truvar-ai/design-system/crm", colors: "@truvar-ai/design-system/tokens" };

// The showcase's full app screens become the Examples group; Contacts' record page needs a route, so it stays in the playground
const EXAMPLES = ["overview", "dashboard", "conversations", "contacts", "opportunities", "schedule", "team"];
const byId = Object.fromEntries(SHOWCASE.flatMap((g) => g.views.map((v) => [v.id, v])));

const ORDER = ["Foundations", "Components", "Channels", "Data visualisation", "Voice AI", "Truvar OS", "Patterns"];
const fromShowcase = ORDER.map((name) => {
  const g = SHOWCASE.find((x) => x.group[0] === name);
  return { group: g.group, views: g.views.map((v) => ({ ...v, importFrom: IMPORT_OVERRIDES[v.id] ?? IMPORTS[name] })) };
});

export const DOCS_NAV = [
  GUIDES,
  ...fromShowcase,
  { group: ["Examples", "أمثلة"], views: EXAMPLES.map((id) => ({ ...byId[id], example: true })) },
];
export const DOCS_PAGES = DOCS_NAV.flatMap((g) => g.views.map((v) => ({ ...v, group: g.group })));
export const pageById = (id) => DOCS_PAGES.find((p) => p.id === id);
export const docsHref = (id) => (id ? `/docs/${id}/` : "/docs/");
