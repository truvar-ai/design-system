"use client";
// Docs layout, the same app frame as the showcase. On laptops the header and the page list sit on the frame colour and
// the page is a raised panel with a rounded corner; only the panel scrolls, so the frame never moves.
// On phones the page is a rounded card between the top bar and the tab bar, the bars step aside while you read,
// and the menu slides the whole screen aside (to the right in English, to the left in Arabic).
import { useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Focusable } from "react-aria-components";
import { Badge, Logo, IconButton, Tooltip, SegmentedControl, PushLayout, BottomNav, BottomNavItem, useHideOnScroll } from "@truvar-ai/design-system";
import * as Icon from "@truvar-ai/design-system/icons";
import { useSite, useTheme } from "../site/Providers.jsx";
import { Header, useOtherLanguage } from "../site/Header.jsx";
import { Footer } from "../site/Footer.jsx";
import { DOCS_NAV, DOCS_PAGES, docsHref } from "./nav.js";
import { GITHUB, localePath } from "../site/config.js";

// collapsed: icons only; each page name stays in the link for screen readers and shows as a tooltip
function SideNav({ current, onNavigate, collapsed = false }) {
  const { lang, tr } = useSite();
  const i = lang === "ar" ? 1 : 0;
  return (
    <nav className="dx-nav" aria-label={tr("Docs pages", "صفحات التوثيق")}>
      {DOCS_NAV.map((g) => (
        <div key={g.group[0]} className="dx-nav-group">
          <p className="dx-nav-title">{g.group[i]}</p>
          <ul>
            {g.views.map((v) => {
              const I = Icon[v.icon] ?? Icon.Layers;
              return (
                <li key={v.id || "intro"}>
                  <Tooltip content={v.name[i]} placement="end" isDisabled={!collapsed} delay={0}>
                    <Focusable>
                      <NextLink href={localePath(lang, docsHref(v.id))} className="dx-nav-link" aria-current={v.id === current ? "page" : undefined} onClick={onNavigate}>
                        <I /><span className="dx-nav-label">{v.name[i]}</span>
                        {v.id === "widget" && <Badge tone="accent">{tr("New", "جديد")}</Badge>}
                      </NextLink>
                    </Focusable>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

// "On this page": follows the section in view
function Toc({ sections }) {
  const { lang, tr } = useSite();
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (!sections?.length) return;
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
      const first = sections.find(([id]) => seen.get(id));
      if (first) setActive(first[0]);
    }, { rootMargin: "-80px 0px -60% 0px" });
    // The live examples arrive after the page, so look for the sections a little later too
    const watch = () => sections.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    watch(); const t = setTimeout(watch, 900);
    return () => { io.disconnect(); clearTimeout(t); };
  }, [sections]);
  if (!sections?.length) return null;
  return (
    <nav className="dx-toc" aria-label={tr("On this page", "في هذه الصفحة")}>
      <p className="dx-toc-title">{tr("On this page", "في هذه الصفحة")}</p>
      <ul>
        {sections.map(([id, en, ar]) => (
          <li key={id}><a href={"#" + id} aria-current={active === id ? "location" : undefined}>{lang === "ar" ? ar : en}</a></li>
        ))}
      </ul>
    </nav>
  );
}

function Pager({ id }) {
  const { lang, tr } = useSite();
  const i = lang === "ar" ? 1 : 0;
  const n = DOCS_PAGES.findIndex((p) => p.id === id);
  const prev = DOCS_PAGES[n - 1], next = DOCS_PAGES[n + 1];
  return (
    <nav className="dx-pager" aria-label={tr("Previous and next page", "الصفحة السابقة والتالية")}>
      {prev ? (
        <NextLink href={localePath(lang, docsHref(prev.id))} className="dx-pager-link" rel="prev">
          <span>{tr("Previous", "السابق")}</span><b><Icon.ChevronLeft className="lx-flip" />{prev.name[i]}</b>
        </NextLink>
      ) : <span />}
      {next && (
        <NextLink href={localePath(lang, docsHref(next.id))} className="dx-pager-link is-next" rel="next">
          <span>{tr("Next", "التالي")}</span><b>{next.name[i]}<Icon.ChevronRight className="lx-flip" /></b>
        </NextLink>
      )}
    </nav>
  );
}

// The menu behind the screen on phones: the page list, then theme and language
function PhoneMenu({ current, close }) {
  const { ar, tr } = useSite();
  const router = useRouter();
  const other = useOtherLanguage();
  const { setTheme } = useTheme();
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    setDark(root.dataset.theme === "dark" || (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches));
  }, []);
  return (
    <div className="dx-pmenu">
      <div className="dx-pmenu-head">
        <Logo width={104} />
        <IconButton label={tr("Close menu", "إغلاق القائمة")} onPress={close}><Icon.X /></IconButton>
      </div>
      <div className="dx-pmenu-scroll"><SideNav current={current} onNavigate={close} /></div>
      <div className="dx-pmenu-foot">
        <SegmentedControl aria-label={tr("Appearance", "المظهر")} value={dark ? "dark" : "light"}
          onChange={(v) => { setDark(v === "dark"); setTheme(v); }}
          options={[{ id: "light", label: <><Icon.Sun />{tr("Light", "فاتح")}</> }, { id: "dark", label: <><Icon.Moon />{tr("Dark", "داكن")}</> }]} />
        <SegmentedControl aria-label={tr("Language", "اللغة")} value={ar ? "ar" : "en"}
          onChange={(v) => { if ((v === "ar") !== ar) { close(); router.push(other); } }}
          options={[{ id: "en", label: "EN", lang: "en" }, { id: "ar", label: "ع", lang: "ar" }]} />
      </div>
    </div>
  );
}

const isGuide = (id) => DOCS_NAV[0].views.some((v) => v.id === id);
const isExample = (id) => DOCS_NAV.at(-1).views.some((v) => v.id === id);

function PhoneNav({ current, hidden }) {
  const { lang, tr } = useSite();
  const L = (p) => localePath(lang, p);
  return (
    <BottomNav mobileOnly isHidden={hidden} aria-label={tr("Docs", "التوثيق")}>
      <BottomNavItem href={L("/")} icon={<Icon.Home />}>{tr("Home", "الرئيسية")}</BottomNavItem>
      <BottomNavItem href={L("/docs/")} icon={<Icon.FileText />} isCurrent={isGuide(current)}>{tr("Guides", "الأدلة")}</BottomNavItem>
      <BottomNavItem href={L("/docs/buttons/")} icon={<Icon.Layers />} isCurrent={!isGuide(current) && !isExample(current)}>{tr("Components", "المكونات")}</BottomNavItem>
      <BottomNavItem href={L("/docs/overview/")} icon={<Icon.Kanban />} isCurrent={isExample(current)}>{tr("Examples", "أمثلة")}</BottomNavItem>
      <BottomNavItem icon={<Icon.Search />} aria-haspopup="dialog" onPress={() => dispatchEvent(new Event("site:search"))}>{tr("Search", "بحث")}</BottomNavItem>
    </BottomNav>
  );
}

export function DocsShell({ page, sections, editPath, children }) {
  const { tr } = useSite();
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [path]);
  // Laptops: the sidebar can shrink to icons. The choice is saved; the root script restores it before the first paint.
  const [collapsed, setCollapsedState] = useState(false);
  useEffect(() => setCollapsedState("navCollapsed" in document.documentElement.dataset), []);
  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsedState(next);
    if (next) document.documentElement.dataset.navCollapsed = ""; else delete document.documentElement.dataset.navCollapsed;
    try { localStorage.setItem("truvar-docs-collapsed", next ? "1" : "0"); } catch {}
  };

  // Only the panel scrolls, so each new page starts at its top (or at the section in the link)
  useEffect(() => {
    const main = document.getElementById("content");
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) { main?.scrollTo({ top: 0 }); return; }
    // Live examples arrive just after the page; wait for the section before scrolling to it
    let tries = 0;
    const find = () => { const el = document.getElementById(id); if (el) el.scrollIntoView({ block: "start" }); else if (tries++ < 20) t = setTimeout(find, 100); };
    let t = setTimeout(find, 0);
    return () => clearTimeout(t);
  }, [path]);

  // Phones and tablets: the bars step aside while you read and come back as soon as you scroll up
  const [barsHidden, setBarsHidden] = useHideOnScroll(() => document.getElementById("content"), { media: "(max-width: 960px)", disabled: menu, resetKey: path });
  useEffect(() => {
    const root = document.documentElement;
    if (barsHidden) root.dataset.bars = "hidden"; else delete root.dataset.bars;
  }, [barsHidden]);
  useEffect(() => {
    // Tabbing into a hidden bar brings it back
    const on = (e) => { if (e.target.closest?.(".site-header, .tv-bottomnav")) setBarsHidden(false); };
    document.addEventListener("focusin", on);
    return () => { document.removeEventListener("focusin", on); delete document.documentElement.dataset.bars; };
  }, [setBarsHidden]);

  return (
    <PushLayout isOpen={menu} onOpenChange={setMenu} label={tr("Docs pages", "صفحات التوثيق")} width={300}
      menu={({ close }) => <PhoneMenu current={page.id} close={close} />}>
      <div className="dx-app">
        <Header variant="docs" onMenu={() => setMenu(true)} collapsed={collapsed} onCollapse={toggleCollapsed} />
        <div className="dx">
          <aside className="dx-aside" id="docs-aside"><SideNav current={page.id} collapsed={collapsed} /></aside>
          <main id="content" className="dx-main" tabIndex={-1} data-scroll-root>
            <div className="dx-page">
              <div className="dx-body">
                <article className="dx-article">{children}</article>
                <footer className="dx-article-foot">
                  {editPath && (
                    <a href={`${GITHUB}/blob/main/${editPath}`} target="_blank" rel="noopener noreferrer" className="dx-edit">
                      <Icon.Pencil />{tr("Edit this page on GitHub", "عدّل هذه الصفحة على GitHub")}
                    </a>
                  )}
                  <Pager id={page.id} />
                </footer>
              </div>
              <aside className="dx-side"><Toc sections={sections} /></aside>
            </div>
            <Footer />
          </main>
        </div>
        <PhoneNav current={page.id} hidden={barsHidden} />
      </div>
    </PushLayout>
  );
}
