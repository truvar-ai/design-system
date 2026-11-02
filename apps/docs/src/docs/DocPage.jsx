"use client";
// One docs page: a written guide, or a showcase view with its live examples.
import NextLink from "next/link";
import * as Icon from "@truvar-ai/design-system/icons";
import { useSite } from "../site/Providers.jsx";
import { CopyButton } from "../site/ui.jsx";
import { DocsShell } from "./DocsShell.jsx";
import { GUIDES } from "./guides.jsx";
import { Island } from "./Island.jsx";
import { pageById, docsHref } from "./nav.js";
import { localePath } from "../site/config.js";

const VIEW_FILES = {
  colors: "Foundations", typography: "Foundations", logo: "Foundations", assistant: "Foundations", countries: "Countries",
  buttons: "Controls", forms: "Controls", dates: "Controls", selection: "Choices", navigation: "Choices", "crm-kit": "CrmKit",
  overlays: "Overlays", feedback: "Feedback", data: "Tables", collections: "Collections", layout: "More", color: "More",
  "drag-drop": "More", "record-panel": "More", extending: "More", widget: "WidgetPage", charts: "Charts", maps: "Maps",
  "call-review": "Voice", "call-player": "Voice", workflow: "Voice", "live-call": "Voice", developer: "Voice",
  "os-prototype": "OS", "os-system": "OS", "os-lock": "OS", "os-agent": "OS", "os-workspace": "OS", "os-home": "OS", "os-permissions": "OS",
  overview: "Overview", dashboard: "Dashboard", conversations: "Workspace", contacts: "Workspace", opportunities: "Planning", schedule: "Planning", team: "Workspace",
};

// children: the live example, chosen by the page on the server (views.server.js)
export function DocPage({ id, children }) {
  const { lang, tr } = useSite();
  const i = lang === "ar" ? 1 : 0;
  const page = pageById(id);
  const Guide = GUIDES[id];
  const sections = Guide ? Guide.sections : page.items;
  const editPath = Guide ? "apps/docs/src/docs/guides.jsx" : `apps/showcase/src/docs/views/${VIEW_FILES[id]}.jsx`;
  return (
    <DocsShell page={page} sections={sections} editPath={editPath}>
      <header className="dx-head">
        <nav aria-label={tr("Breadcrumb", "مسار التنقل")} className="dx-crumbs">
          <NextLink href={localePath(lang, docsHref(""))}>{tr("Docs", "التوثيق")}</NextLink>
          <Icon.ChevronRight className="lx-flip" aria-hidden="true" />
          <span>{page.group[i]}</span>
        </nav>
        <h1 className="dx-title">{page.name[i]}</h1>
        {page.importFrom && (
          <div className="dx-import" dir="ltr">
            <span className="dx-import-label">import</span>
            <code>{`"${page.importFrom}"`}</code>
            <CopyButton text={page.importFrom} label={tr("Copy import path", "انسخ مسار الاستيراد")} />
          </div>
        )}
      </header>
      {Guide ? <div className="dx-prose"><Guide /></div> : <Island className={page.example ? "dx-demo is-example" : "dx-demo"}>{children}</Island>}
    </DocsShell>
  );
}
