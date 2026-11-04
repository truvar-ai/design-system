"use client";
// Site header: logo, main links, search, language, theme. On phones the links move into a drawer.
import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ModalOverlay, Modal, Dialog, MenuItem } from "react-aria-components";
import { Logo, IconButton, Tooltip, CommandMenu, Drawer, SegmentedControl, Kbd } from "@truvar-ai/design-system";
import * as Icon from "@truvar-ai/design-system/icons";
import { useSite, useTheme } from "./Providers.jsx";
import { ButtonLink, BrandIcon } from "./ui.jsx";
import { GITHUB, localePath } from "./config.js";
import { DOCS_PAGES, docsHref } from "../docs/nav.js";

const cx = (...c) => c.filter(Boolean).join(" ");

// The same page in the other language
export function useOtherLanguage() {
  const path = usePathname() || "/";
  const { ar } = useSite();
  if (ar) return path.replace(/^\/ar(?=\/|$)/, "") || "/";
  return "/ar" + (path === "/" ? "/" : path);
}

export function useLinks() {
  const { lang, tr } = useSite();
  return [
    { href: localePath(lang, "/docs/"), label: tr("Docs", "التوثيق"), match: /\/docs\/?$|\/docs\/(installation|nextjs|theming|rtl|mobile|cursors)/ },
    { href: localePath(lang, "/docs/buttons/"), label: tr("Components", "المكونات"), match: /\/docs\/(?!installation|nextjs|theming|rtl|mobile|cursors|overview|dashboard|conversations|contacts|opportunities|schedule|team)[^/]+/ },
    { href: localePath(lang, "/docs/overview/"), label: tr("Examples", "أمثلة"), match: /\/docs\/(overview|dashboard|conversations|contacts|opportunities|schedule|team)/ },
  ];
}

export function SearchDialog({ isOpen, onOpenChange }) {
  const { lang, tr } = useSite();
  const router = useRouter();
  const i = lang === "ar" ? 1 : 0;
  const items = useMemo(() => DOCS_PAGES.flatMap((p) => [
    { id: p.id || "intro", href: docsHref(p.id), label: p.name[i], group: p.group[i] },
    ...(p.items ?? []).map(([id, en, ar]) => ({ id: `${p.id}#${id}`, href: `${docsHref(p.id)}#${id}`, label: i ? ar : en, group: p.name[i] })),
  ]), [i]);
  const label = tr("Search the docs", "ابحث في التوثيق");
  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable className="tv-overlay site-search-overlay">
      <Modal className="tv-modal site-search">
        <Dialog className="tv-focus" aria-label={label}>
          {({ close }) => (
            <CommandMenu label={label} placeholder={tr("Search components, guides and examples", "ابحث عن مكوّن أو دليل أو مثال")}
              items={items} onCancel={close} cancelLabel={tr("Cancel", "إلغاء")}
              onAction={(id) => { const it = items.find((x) => x.id === id); close(); if (it) router.push(localePath(lang, it.href)); }}
              renderEmpty={() => <div className="tv-empty-mini">{tr("No results.", "لا توجد نتائج.")}</div>}>
              {(it) => (
                <MenuItem id={it.id} textValue={it.label + " " + it.group} className="tv-item">
                  <span>{it.label}</span><span className="tv-desc site-search-group">{it.group}</span>
                </MenuItem>
              )}
            </CommandMenu>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

function ThemeButton() {
  const { tr } = useSite();
  const { setTheme } = useTheme();
  // The icon shows what you'd switch to; the page reads the current theme from the root
  const toggle = () => setTheme(document.documentElement.matches("[data-theme=dark]") ||
    (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches) ? "light" : "dark");
  const label = tr("Switch light or dark", "التبديل بين الفاتح والداكن");
  return (
    <Tooltip content={label}>
      <IconButton label={label} onPress={toggle}>
        <Icon.Moon className="site-when-light" /><Icon.Sun className="site-when-dark" />
      </IconButton>
    </Tooltip>
  );
}

export function Header({ variant = "site", onMenu, collapsed, onCollapse }) {
  const { lang, ar, tr } = useSite();
  const path = usePathname() || "/";
  const links = useLinks();
  const other = useOtherLanguage();
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const on = () => setScrolled(scrollY > 8);
    on(); addEventListener("scroll", on, { passive: true });
    const key = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch(true); } };
    addEventListener("keydown", key);
    const open = () => setSearch(true);
    addEventListener("site:search", open);
    return () => { removeEventListener("scroll", on); removeEventListener("keydown", key); removeEventListener("site:search", open); };
  }, []);
  useEffect(() => setMenu(false), [path]);

  return (
    <header className={cx("site-header", variant === "docs" && "is-docs")} data-scrolled={scrolled || undefined}>
      <a href="#content" className="site-skip">{tr("Skip to content", "انتقل إلى المحتوى")}</a>
      <div className="site-header-inner">
        {onMenu && (
          <span className="site-only-narrow">
            <IconButton label={tr("Docs menu", "قائمة التوثيق")} aria-haspopup="dialog" onPress={onMenu}><Icon.MenuIcon /></IconButton>
          </span>
        )}
        {onCollapse ? (
          <div className="site-brand">
            <NextLink href={localePath(lang, "/")} className="site-brand-link" aria-label={tr("Truvar.ai Design System, home", "نظام تصميم Truvar.ai، الرئيسية")}>
              <Logo width={104} className="site-brand-full" />
              <Logo variant="monogram" width={28} className="site-brand-mark" />
            </NextLink>
            <span className="site-brand-sep" aria-hidden="true" />
            <span className="site-collapse">
              <Tooltip content={collapsed ? tr("Expand sidebar", "توسيع الشريط الجانبي") : tr("Collapse sidebar", "طي الشريط الجانبي")}>
                <IconButton label={collapsed ? tr("Expand sidebar", "توسيع الشريط الجانبي") : tr("Collapse sidebar", "طي الشريط الجانبي")}
                  aria-controls="docs-aside" aria-expanded={!collapsed} onPress={onCollapse}>
                  {collapsed ? <Icon.PanelLeftOpen /> : <Icon.PanelLeftClose />}
                </IconButton>
              </Tooltip>
            </span>
            <span className="site-brand-name">{tr("Design System", "نظام التصميم")}</span>
          </div>
        ) : (
          <NextLink href={localePath(lang, "/")} className="site-brand" aria-label={tr("Truvar.ai Design System, home", "نظام تصميم Truvar.ai، الرئيسية")}>
            <Logo width={104} />
            <span className="site-brand-sep" aria-hidden="true" />
            <span className="site-brand-name">{tr("Design System", "نظام التصميم")}</span>
          </NextLink>
        )}
        <nav className="site-nav" aria-label={tr("Main", "الرئيسية")}>
          {links.map((l) => (
            <NextLink key={l.href} href={l.href} className="site-nav-link" aria-current={l.match.test(path) ? "page" : undefined}>{l.label}</NextLink>
          ))}
        </nav>
        <div className="site-actions">
          <button type="button" className="site-search-btn" onClick={() => setSearch(true)} aria-label={tr("Search the docs", "ابحث في التوثيق")} aria-haspopup="dialog">
            <Icon.Search />
            <span className="site-search-text">{tr("Search", "بحث")}</span>
            <Kbd className="site-search-kbd">⌘K</Kbd>
          </button>
          <span className="site-only-wide site-actions-row">
            <Tooltip content={ar ? "English" : "العربية"}>
              <a href={other} className="site-lang" hrefLang={ar ? "en" : "ar"} lang={ar ? "en" : "ar"}>
                <Icon.Globe /><span>{ar ? "English" : "العربية"}</span>
              </a>
            </Tooltip>
            <ThemeButton />
            <Tooltip content="GitHub">
              <a href={GITHUB} className="tv-icon-btn" aria-label="GitHub" target="_blank" rel="noopener noreferrer"><BrandIcon id="github" /></a>
            </Tooltip>
            {variant === "site" && <ButtonLink href={localePath(lang, "/docs/installation/")} size="sm">{tr("Get started", "ابدأ الآن")}</ButtonLink>}
          </span>
          <span className="site-only-narrow">
            {variant === "docs" ? <ThemeButton /> : <IconButton label={tr("Menu", "القائمة")} onPress={() => setMenu(true)}><Icon.More /></IconButton>}
          </span>
        </div>
      </div>
      <SearchDialog isOpen={search} onOpenChange={setSearch} />
      <Drawer isOpen={menu} onOpenChange={setMenu} side="end" width={340} title={tr("Menu", "القائمة")}>
        <div className="site-drawer">
          <nav className="site-drawer-nav" aria-label={tr("Main", "الرئيسية")}>
            <NextLink href={localePath(lang, "/")} className="site-drawer-link"><Icon.Home />{tr("Home", "الرئيسية")}</NextLink>
            {links.map((l, n) => {
              const I = [Icon.FileText, Icon.Layers, Icon.Kanban][n];
              return <NextLink key={l.href} href={l.href} className="site-drawer-link" aria-current={l.match.test(path) ? "page" : undefined}><I />{l.label}</NextLink>;
            })}
            <a href={GITHUB} className="site-drawer-link" target="_blank" rel="noopener noreferrer"><BrandIcon id="github" />GitHub</a>
          </nav>
          <div className="site-drawer-group">
            <p className="site-drawer-label" id="m-lang">{tr("Language", "اللغة")}</p>
            <div className="site-drawer-seg" role="group" aria-labelledby="m-lang">
              <a href={ar ? other : path} className="site-seg" aria-current={!ar ? "true" : undefined} lang="en">English</a>
              <a href={ar ? path : other} className="site-seg" aria-current={ar ? "true" : undefined} lang="ar">العربية</a>
            </div>
          </div>
          <div className="site-drawer-group">
            <p className="site-drawer-label" id="m-theme">{tr("Appearance", "المظهر")}</p>
            <SegmentedControl aria-labelledby="m-theme" value={theme} onChange={setTheme}
              options={[{ id: "system", label: tr("Auto", "تلقائي") }, { id: "light", label: tr("Light", "فاتح") }, { id: "dark", label: tr("Dark", "داكن") }]} />
          </div>
          <ButtonLink href={localePath(lang, "/docs/installation/")} className="site-drawer-cta">{tr("Get started", "ابدأ الآن")}</ButtonLink>
        </div>
      </Drawer>
    </header>
  );
}
