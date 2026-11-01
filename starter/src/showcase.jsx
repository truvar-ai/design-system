// Docs shell: top bar, side navigation, hash routing, command palette, toasts.
import React, { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider, ModalOverlay, Modal as RACModal, Dialog, MenuItem as RACMenuItem, ToggleButton as RACToggle } from "react-aria-components";
import {
  Logo, Switch, LanguageSelect, NotificationCenter, ToastRegion, CommandMenu, Drawer, IconButton, Tooltip,
} from "./components/index.jsx";
import * as Icon from "./components/icons.jsx";
import { LangContext } from "./docs/i18n.jsx";
import { NAV, VIEWS, TOKEN_TO_VIEW } from "./docs/nav.js";
import { useNotifications, Feedback } from "./docs/views/Feedback.jsx";
import Overview from "./docs/views/Overview.jsx";
import { Colors, Typography, LogoView, Assistant } from "./docs/views/Foundations.jsx";
import { Buttons, Forms, Dates } from "./docs/views/Controls.jsx";
import { Selection, Navigation } from "./docs/views/Choices.jsx";
import { Overlays } from "./docs/views/Overlays.jsx";
import { Tables } from "./docs/views/Tables.jsx";
import { Layout, ColorView, DragDrop, RecordPanelView, Extending } from "./docs/views/More.jsx";
import { Countries } from "./docs/views/Countries.jsx";
import { LargeCollections } from "./docs/views/Collections.jsx";
import { Charts } from "./docs/views/Charts.jsx";
import { Maps } from "./docs/views/Maps.jsx";
import { CallReview, PlayerView, WorkflowView, LiveCallView, DeveloperView } from "./docs/views/Voice.jsx";
import { OSPrototype, OSSystem, OSLock, OSAgent, OSWorkspace, OSHome, OSPermissions } from "./docs/views/OS.jsx";

const LOCALES = { en: "en-US", ar: "ar-EG" };
const VIEW_COMPONENTS = {
  overview: Overview, colors: Colors, typography: Typography, logo: LogoView, countries: Countries, assistant: Assistant,
  buttons: Buttons, forms: Forms, dates: Dates, selection: Selection, navigation: Navigation, overlays: Overlays,
  feedback: Feedback, data: Tables, collections: LargeCollections, layout: Layout, color: ColorView, "drag-drop": DragDrop, charts: Charts, maps: Maps, "call-review": CallReview, "call-player": PlayerView, workflow: WorkflowView, "live-call": LiveCallView, developer: DeveloperView, "os-prototype": OSPrototype, "os-system": OSSystem, "os-lock": OSLock, "os-agent": OSAgent, "os-workspace": OSWorkspace, "os-home": OSHome, "os-permissions": OSPermissions,
  "record-panel": RecordPanelView, extending: Extending,
};

function readToken() { return decodeURIComponent((location.hash || "").slice(1)) || "overview"; }
function useRoute() {
  const [token, setToken] = useState(readToken);
  useEffect(() => {
    const on = () => setToken(readToken());
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  const view = TOKEN_TO_VIEW[token] ?? "overview";
  useEffect(() => {
    if (token === view) { window.scrollTo(0, 0); return; }
    const id = setTimeout(() => document.getElementById(token)?.scrollIntoView({ block: "start" }), 60);
    return () => clearTimeout(id);
  }, [token, view]);
  return { token, view };
}

function NavList({ lang, view, onNavigate }) {
  const i = lang === "ar" ? 1 : 0;
  return (
    <nav className="side-nav" aria-label={lang === "ar" ? "أقسام المكتبة" : "Library sections"}>
      {NAV.map((g) => (
        <div className="nav-group" key={g.group[0]}>
          <p className="nav-group-title">{g.group[i]}</p>
          <ul>
            {g.views.map((v) => {
              const I = Icon[v.icon] ?? Icon.Layers;
              return (
                <li key={v.id}>
                  <a href={"#" + v.id} className="nav-link" aria-current={v.id === view ? "page" : undefined} onClick={onNavigate}>
                    <I />{v.name[i]}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function CommandPalette({ isOpen, onOpenChange, lang }) {
  const i = lang === "ar" ? 1 : 0;
  const items = useMemo(() => VIEWS.flatMap((v) => [
    { id: v.id, label: v.name[i], group: "" },
    ...v.items.map(([id, en, ar]) => ({ id, label: i ? ar : en, group: v.name[i] })),
  ]), [i]);
  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable className="tv-overlay tv-overlay--palette">
      <RACModal className="tv-modal tv-palette">
        <Dialog className="tv-focus" aria-label={i ? "ابحث في المكونات" : "Search components"}>
          {({ close }) => (
            <CommandMenu label={i ? "ابحث في المكونات" : "Search components"} placeholder={i ? "ابحث عن مكوّن أو صفحة" : "Search components and pages"}
              items={items} onAction={(id) => { close(); location.hash = id; }}
              renderEmpty={() => <div className="tv-empty-mini">{i ? "لا توجد نتائج." : "No results."}</div>}>
              {(it) => (
                <RACMenuItem id={it.id} textValue={it.label + " " + it.group} className="tv-item">
                  <span>{it.label}</span>{it.group && <span className="tv-desc palette-group">{it.group}</span>}
                </RACMenuItem>
              )}
            </CommandMenu>
          )}
        </Dialog>
      </RACModal>
    </ModalOverlay>
  );
}

function readLang() {
  try { const v = localStorage.getItem("truvar-lang"); if (v === "ar" || v === "en") return v; } catch {}
  return (navigator.language || "en").startsWith("ar") ? "ar" : "en";
}

function App() {
  const [lang, setLangState] = useState(readLang);
  const setLang = (l) => { setLangState(l); try { localStorage.setItem("truvar-lang", l); } catch {} };
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [navOpen, setNavOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const { view } = useRoute();
  const ar = lang === "ar";

  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; }, [dark]);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = ar ? "rtl" : "ltr";
    const v = VIEWS.find((x) => x.id === view);
    document.title = `${v.name[ar ? 1 : 0]} · Truvar.ai`;
  }, [lang, view]);
  useEffect(() => {
    const on = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(true); } };
    addEventListener("keydown", on);
    return () => removeEventListener("keydown", on);
  }, []);

  const View = VIEW_COMPONENTS[view] ?? Overview;
  return (
    <LangContext.Provider value={lang}>
      <I18nProvider locale={LOCALES[lang]}>
        <Shell key={lang} {...{ lang, setLang, dark, setDark, navOpen, setNavOpen, palette, setPalette, view, ar, View }} />
      </I18nProvider>
    </LangContext.Provider>
  );
}

function Shell({ lang, setLang, dark, setDark, navOpen, setNavOpen, palette, setPalette, view, ar, View }) {
  const notif = useNotifications();
  return (
    <>
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById("main")?.focus(); }}>{ar ? "تخطَّ إلى المحتوى" : "Skip to content"}</a>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="nav-toggle"><IconButton label={ar ? "فتح القائمة" : "Open menu"} onPress={() => setNavOpen(true)}><Icon.MenuIcon /></IconButton></span>
            <a href="#overview" className="brand-link" aria-label="Truvar.ai"><Logo width={112} /></a>
            <span className="brand-sep" aria-hidden="true" />
            <span className="brand-title">{ar ? "مكتبة المكونات" : "Component library"}</span>
          </div>
          <div className="topbar-controls">
            <button className="search-btn" onClick={() => setPalette(true)}>
              <Icon.Search /><span className="search-btn-text">{ar ? "ابحث" : "Search"}</span><kbd className="tv-kbd" dir="ltr">⌘K</kbd>
            </button>
            <LanguageSelect value={lang} onChange={setLang} />
            <NotificationCenter items={notif.items} onMarkAllRead={notif.markAll} onOpenItem={notif.open} />
            <Tooltip content={ar ? "الوضع الداكن" : "Dark theme"}>
              <RACToggle className="tv-icon-btn" aria-label={ar ? "الوضع الداكن" : "Dark theme"} isSelected={dark} onChange={setDark}>
                {dark ? <Icon.Sun /> : <Icon.Moon />}
              </RACToggle>
            </Tooltip>
          </div>
        </div>
      </header>
      <div className="docs">
        <aside className="docs-aside"><NavList lang={lang} view={view} /></aside>
        <main id="main" tabIndex={-1} className="docs-main">
          <View key={view} />
          <footer className="foot">
            <div className="foot-row"><Logo width={96} /><p className="caption" style={{ margin: 0 }}><bdi dir="ltr">@truvar/ui 0.7</bdi>{ar ? "، مبنية على React Aria Components 1.22 (رخصة Apache 2.0)." : ", built on React Aria Components 1.22 (Apache 2.0)."}</p></div>
          </footer>
        </main>
      </div>
      <Drawer isOpen={navOpen} onOpenChange={setNavOpen} side="start" width={300} title={ar ? "الأقسام" : "Sections"}>
        <NavList lang={lang} view={view} onNavigate={() => setNavOpen(false)} />
      </Drawer>
      <CommandPalette isOpen={palette} onOpenChange={setPalette} lang={lang} />
      <ToastRegion />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
