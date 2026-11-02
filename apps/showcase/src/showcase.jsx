// Docs shell: top bar, side navigation, hash routing, command palette, toasts.
import { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider, ModalOverlay, Modal as RACModal, Dialog, MenuItem as RACMenuItem, ToggleButton as RACToggle, Focusable, Select as RACSelect, Button as RACButton, SelectValue, Popover, ListBox, ListBoxItem } from "react-aria-components";
import {
  Logo, BrandProvider, BRANDS, LanguageSelect, NotificationCenter, ToastRegion, CommandMenu, IconButton, Tooltip,
  BottomNav, BottomNavItem, SegmentedControl, UserMenu, ConfirmDialog, toast, NotificationList, NotificationDetail, Button, EmptyState, useSystemBars, PushLayout, useHideOnScroll, Avatar,
} from "./ds.js";
import * as Icon from "@truvar-ai/design-system/icons";
import { LangContext } from "./docs/i18n.jsx";
import { NAV, VIEWS, TOKEN_TO_VIEW } from "./docs/nav.js";
import { useNotifications, Feedback } from "./docs/views/Feedback.jsx";
import Overview from "./docs/views/Overview.jsx";
import { Dashboard } from "./docs/views/Dashboard.jsx";
import { ConversationsPage, ContactsPage, ContactDetailPage, TeamPage } from "./docs/views/Workspace.jsx";
import { CrmKit } from "./docs/views/CrmKit.jsx";
import { OpportunitiesPage, CalendarPage } from "./docs/views/Planning.jsx";
import { WidgetPage } from "./docs/views/WidgetPage.jsx";
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
  overview: Overview, dashboard: Dashboard, contacts: ContactsPage, opportunities: OpportunitiesPage, schedule: CalendarPage, team: TeamPage, widget: WidgetPage, "crm-kit": CrmKit, colors: Colors, typography: Typography, logo: LogoView, countries: Countries, assistant: Assistant,
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
  // settings and inbox (#inbox, #inbox/<id>) are app pages outside the docs nav
  const head = token.split("/")[0];
  const view = token === "settings" ? "settings" : ["inbox", "contact", "conversations"].includes(head) ? head : TOKEN_TO_VIEW[token] ?? "overview";
  useEffect(() => {
    // On desktop the content panel scrolls on its own (the frame stays put); on phones the page scrolls
    if (token === view || ["inbox", "contact", "conversations"].includes(view)) { window.scrollTo(0, 0); document.getElementById("main")?.scrollTo(0, 0); return; }
    const id = setTimeout(() => document.getElementById(token)?.scrollIntoView({ block: "start" }), 60);
    return () => clearTimeout(id);
  }, [token, view]);
  return { token, view };
}
const inboxId = () => readToken().split("/")[1] ?? null;
const routeId = inboxId;

// collapsed: icons only; each page name stays in the link for screen readers and shows as a tooltip on hover or focus
function NavList({ lang, view, onNavigate, collapsed = false, groups = NAV }) {
  const i = lang === "ar" ? 1 : 0;
  return (
    <nav className="side-nav" aria-label={lang === "ar" ? "أقسام المكتبة" : "Library sections"}>
      {groups.map((g) => (
        <div className="nav-group" key={g.group[0]}>
          <p className="nav-group-title">{g.group[i]}</p>
          <ul>
            {g.views.map((v) => {
              const I = Icon[v.icon] ?? Icon.Layers;
              return (
                <li key={v.id}>
                  <Tooltip content={v.name[i]} placement="end" isDisabled={!collapsed} delay={0}>
                    <Focusable>
                      <a href={"#" + v.id} className="nav-link" aria-current={v.id === (view === "contact" ? "contacts" : view) ? "page" : undefined} onClick={onNavigate}>
                        <I /><span className="nav-label">{v.name[i]}</span>
                      </a>
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
              items={items} onAction={(id) => { close(); location.hash = id; }} onCancel={close} cancelLabel={i ? "إلغاء" : "Cancel"}
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

// Brand theme picker. Each brand's colours come from tokens/brands/*.tokens.json via data-brand on <html>.
function BrandSelect({ value, onChange, ar }) {
  const label = ar ? "السمة" : "Theme";
  return (
    <RACSelect selectedKey={value} onSelectionChange={(k) => k && onChange(k)} aria-label={label} className="tv-langselect">
      <RACButton className="tv-langselect-btn">
        <Logo variant="monogram" brand={value} width={16} />
        <span className="tv-langselect-name">{BRANDS[value]}</span>
        <Icon.ChevronDown className="tv-cpicker-chev" />
        <SelectValue className="tv-sr" />
      </RACButton>
      <Popover className="tv-popover tv-langselect-pop" offset={6} placement="bottom end">
        <p className="tv-pop-title" id="brand-pop-title">{ar ? "السمات" : "Themes"}</p>
        <ListBox className="tv-listbox" aria-labelledby="brand-pop-title">
          {Object.entries(BRANDS).map(([id, name]) => (
            <ListBoxItem key={id} id={id} textValue={name} className="tv-item tv-lang-item">
              <Logo variant="monogram" brand={id} width={18} />
              <span className="tv-lang-text"><span className="tv-lang-native">{name}</span></span>
              <Icon.Check className="tv-check-icon" />
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </RACSelect>
  );
}

/* ---------- Phone: bottom nav and the Settings page ---------- */
// Foundations is one group; Components is everything after it (components, data, voice, OS, patterns). Home is the CRM example.
const FOUNDATIONS = NAV.filter((g) => g.group[0] === "Foundations");
const COMPONENTS = NAV.slice(NAV.findIndex((g) => g.group[0] === "Components"));
const inGroups = (groups, view) => groups.some((g) => g.views.some((v) => v.id === view));

// Each tab reopens the last page you visited in its section, the way native tab bars keep their place
function useLastVisited(view) {
  const [last, setLast] = useState({ foundations: "colors", components: "buttons" });
  useEffect(() => {
    if (inGroups(FOUNDATIONS, view)) setLast((l) => ({ ...l, foundations: view }));
    else if (inGroups(COMPONENTS, view)) setLast((l) => ({ ...l, components: view }));
  }, [view]);
  return last;
}

function PhoneNav({ ar, view, setPalette, hidden }) {
  const t = (en, a) => (ar ? a : en);
  const last = useLastVisited(view);
  return (
    <BottomNav mobileOnly isHidden={hidden} aria-label={t("Main", "الرئيسية")}>
      <BottomNavItem href="#overview" icon={<Icon.Home />} isCurrent={view === "overview"}>{t("Home", "الرئيسية")}</BottomNavItem>
      <BottomNavItem href={"#" + last.foundations} icon={<Icon.Palette />} isCurrent={inGroups(FOUNDATIONS, view)}>{t("Foundations", "الأساسيات")}</BottomNavItem>
      <BottomNavItem href={"#" + last.components} icon={<Icon.Layers />} isCurrent={inGroups(COMPONENTS, view)}>{t("Components", "المكونات")}</BottomNavItem>
      <BottomNavItem icon={<Icon.Search />} onPress={() => setPalette(true)} aria-haspopup="dialog">{t("Search", "بحث")}</BottomNavItem>
      <BottomNavItem href="#settings" icon={<Icon.User />} isCurrent={view === "settings"}>{t("Settings", "الإعدادات")}</BottomNavItem>
    </BottomNav>
  );
}

// Full-page inbox: list and reading pane side by side; on phones, the list and then the message with Back
function InboxView({ ar, notif }) {
  const t = (en, a) => (ar ? a : en);
  const [id, setId] = useState(inboxId);
  useEffect(() => {
    const on = () => setId(inboxId());
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  const open = notif.items.find((n) => n.id === id);
  const unread = notif.items.filter((n) => n.unread).length;
  return (
    <div className="inbox" data-reading={open ? "" : undefined}>
      <section className="inbox-list" aria-labelledby="inbox-title">
        <div className="inbox-head">
          <h1 className="view-title" id="inbox-title">{t("Inbox", "البريد الوارد")}</h1>
          {unread > 0 && <Button variant="ghost" size="sm" onPress={notif.markAll}>{t("Mark all as read", "تحديد الكل كمقروء")}</Button>}
        </div>
        <NotificationList items={notif.items} currentId={id} label={t("Inbox", "البريد الوارد")}
          onAction={(k) => { notif.open(k); location.hash = "inbox/" + k; }} />
      </section>
      <section className="inbox-read" aria-live="polite">
        {open ? (
          <NotificationDetail key={open.id} item={open} headingLevel={2} showFullPage={false}
            onBack={() => { location.hash = "inbox"; }} />
        ) : (
          <EmptyState icon={<Icon.Mail />} title={t("Pick a message", "اختر رسالة")}>{t("Its full text and actions open here.", "يظهر نصها الكامل وإجراءاتها هنا.")}</EmptyState>
        )}
      </section>
    </div>
  );
}

// The phone menu: who you are, every page, and the look of the app. Sits behind the app when it slides aside.
function PhoneMenu({ ar, lang, setLang, dark, setDark, view, close }) {
  const t = (en, a) => (ar ? a : en);
  return (
    <div className="pmenu">
      <div className="pmenu-head">
        <Logo width={104} />
        <IconButton label={t("Close menu", "إغلاق القائمة")} onPress={close}><Icon.X /></IconButton>
      </div>
      <a href="#settings" className="pmenu-me" onClick={close}>
        <span className="pmenu-me-photo"><Avatar name={t("Amira Hassan", "أميرة حسن")} src="https://randomuser.me/api/portraits/women/44.jpg" size={44} /></span>
        <span className="pmenu-me-text"><b>{t("Amira Hassan", "أميرة حسن")}</b><span dir="ltr">amira.hassan@truvar.ai</span></span>
        <span className="pmenu-me-role">{t("Owner", "المالك")}</span>
      </a>
      <div className="pmenu-scroll"><NavList lang={lang} view={view} onNavigate={close} /></div>
      <div className="pmenu-foot">
        <SegmentedControl aria-label={t("Appearance", "المظهر")} value={dark ? "dark" : "light"} onChange={(v) => setDark(v === "dark")}
          options={[{ id: "light", label: <><Icon.Sun />{t("Light", "فاتح")}</> }, { id: "dark", label: <><Icon.Moon />{t("Dark", "داكن")}</> }]} />
        <SegmentedControl aria-label={t("Language", "اللغة")} value={lang} onChange={setLang}
          options={[{ id: "en", label: "EN", lang: "en" }, { id: "ar", label: "ع", lang: "ar" }]} />
      </div>
    </div>
  );
}

// The signed-in person and their account actions
function AccountMenu({ ar, compact }) {
  const t = (en, a) => (ar ? a : en);
  const [confirm, setConfirm] = useState(false);
  const items = [
    { id: "profile", label: t("My profile", "ملفي الشخصي"), icon: <Icon.User /> },
    { id: "settings", label: t("Settings", "الإعدادات"), icon: <Icon.Sliders />, shortcut: "⌘ ," },
    { id: "team", label: t("Team & roles", "الفريق والأدوار"), icon: <Icon.Shield /> },
    { separator: true },
    { id: "shortcuts", label: t("Keyboard shortcuts", "اختصارات لوحة المفاتيح"), icon: <Icon.Keyboard />, shortcut: "?", desktopOnly: true },
    { id: "help", label: t("Help and support", "المساعدة والدعم"), icon: <Icon.HelpCircle /> },
    { separator: true },
    { id: "logout", label: t("Log out", "تسجيل الخروج"), icon: <Icon.LogOut />, danger: true },
  ];
  const go = (k) => {
    if (k === "profile" || k === "settings") location.hash = "settings";
    else if (k === "team") location.hash = "team";
    else if (k === "shortcuts") location.hash = "keyboard";
    else if (k === "help") toast({ title: t("Help centre opened", "تم فتح مركز المساعدة") });
    else if (k === "logout") setConfirm(true);
  };
  return (
    <>
      <UserMenu compact={compact} onAction={go} items={items}
        user={{ name: t("Amira Hassan", "أميرة حسن"), email: "amira.hassan@truvar.ai", role: t("Owner", "المالك"),
          // Sample photo (randomuser.me); falls back to initials if it can't load
          src: "https://randomuser.me/api/portraits/women/44.jpg" }} />
      <ConfirmDialog isOpen={confirm} onOpenChange={setConfirm} icon={<Icon.LogOut />} confirmLabel={t("Log out", "تسجيل الخروج")}
        title={t("Log out of Truvar?", "تسجيل الخروج من Truvar؟")}
        onConfirm={() => toast({ tone: "success", title: t("Signed out", "تم تسجيل الخروج"), description: t("This is a demo, so you're still here.", "هذا عرض تجريبي، لذا ما زلت هنا.") })}>
        {t("You'll need to sign in again to see your conversations. Replies you haven't sent are kept as drafts.", "ستحتاج إلى تسجيل الدخول مجددًا لرؤية محادثاتك. الردود غير المرسلة تُحفظ كمسودات.")}
      </ConfirmDialog>
    </>
  );
}

function SettingsView({ lang, ar, brand, setBrand, setLang, dark, setDark }) {
  const t = (en, a) => (ar ? a : en);
  return (
    <div className="settings-page">
      <h1 className="view-title">{t("Settings", "الإعدادات")}</h1>
      <div className="settings">
        <section className="settings-row">
          <h2 className="settings-label" id="set-brand">{t("Theme", "السمة")}</h2>
          <SegmentedControl aria-labelledby="set-brand" value={brand} onChange={setBrand}
            options={Object.entries(BRANDS).map(([id, label]) => ({ id, label }))} />
        </section>
        <section className="settings-row">
          <h2 className="settings-label" id="set-lang">{t("Language", "اللغة")}</h2>
          <SegmentedControl aria-labelledby="set-lang" value={lang} onChange={setLang}
            options={[{ id: "en", label: "English", lang: "en" }, { id: "ar", label: "العربية", lang: "ar" }]} />
        </section>
        <section className="settings-row">
          <h2 className="settings-label" id="set-theme">{t("Appearance", "المظهر")}</h2>
          <SegmentedControl aria-labelledby="set-theme" value={dark ? "dark" : "light"} onChange={(v) => setDark(v === "dark")}
            options={[{ id: "light", label: t("Light", "فاتح") }, { id: "dark", label: t("Dark", "داكن") }]} />
        </section>
      </div>
    </div>
  );
}

function readBrand() {
  try { const v = localStorage.getItem("truvar-brand"); if (v in BRANDS) return v; } catch {}
  return "truvar";
}

function readLang() {
  try { const v = localStorage.getItem("truvar-lang"); if (v === "ar" || v === "en") return v; } catch {}
  return (navigator.language || "en").startsWith("ar") ? "ar" : "en";
}

function App() {
  const [lang, setLangState] = useState(readLang);
  const setLang = (l) => { setLangState(l); try { localStorage.setItem("truvar-lang", l); } catch {} };
  const [brand, setBrandState] = useState(readBrand);
  const setBrand = (b) => { setBrandState(b); try { localStorage.setItem("truvar-brand", b); } catch {} };
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [navOpen, setNavOpen] = useState(false);
  const [collapsed, setCollapsedState] = useState(() => { try { return localStorage.getItem("truvar-nav-collapsed") === "1"; } catch { return false; } });
  const setCollapsed = (c) => { setCollapsedState(c); try { localStorage.setItem("truvar-nav-collapsed", c ? "1" : "0"); } catch {} };
  const [palette, setPalette] = useState(false);
  const { view } = useRoute();
  const ar = lang === "ar";

  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; }, [dark]);
  useEffect(() => {
    if (brand === "truvar") delete document.documentElement.dataset.brand;
    else document.documentElement.dataset.brand = brand;
  }, [brand]);
  // The phone's status bar and navigation bar follow the page, and dim with it when a sheet opens
  useSystemBars([brand, dark]);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = ar ? "rtl" : "ltr";
    const v = VIEWS.find((x) => x.id === view);
    const name = v ? v.name[ar ? 1 : 0] : view === "inbox" ? (ar ? "البريد الوارد" : "Inbox") : view === "contact" ? (ar ? "جهة اتصال" : "Contact") : ar ? "الإعدادات" : "Settings";
    document.title = `${name} · ${BRANDS[brand]}`;
  }, [lang, ar, view, brand]);
  // The visible height above the on-screen keyboard, so full-screen search keeps its results in view
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const set = () => document.documentElement.style.setProperty("--vvh", vv.height + "px");
    set(); vv.addEventListener("resize", set);
    return () => vv.removeEventListener("resize", set);
  }, []);
  useEffect(() => {
    const on = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(true); } };
    addEventListener("keydown", on);
    return () => removeEventListener("keydown", on);
  }, []);

  const View = VIEW_COMPONENTS[view] ?? Overview;
  return (
    <LangContext.Provider value={lang}>
      <I18nProvider locale={LOCALES[lang]}>
        <BrandProvider brand={brand}>
          <Shell key={lang} {...{ lang, setLang, brand, setBrand, dark, setDark, navOpen, setNavOpen, collapsed, setCollapsed, palette, setPalette, view, ar, View }} />
        </BrandProvider>
      </I18nProvider>
    </LangContext.Provider>
  );
}

function Shell({ lang, setLang, brand, setBrand, dark, setDark, navOpen, setNavOpen, collapsed, setCollapsed, palette, setPalette, view, ar, View }) {
  const notif = useNotifications();
  const collapseLabel = collapsed ? (ar ? "توسيع الشريط الجانبي" : "Expand sidebar") : (ar ? "طي الشريط الجانبي" : "Collapse sidebar");
  // Phones and tablets: the bars step aside while you read and come back as soon as you scroll up
  const [barsHidden, setBarsHidden] = useHideOnScroll(() => document.getElementById("main"), { media: "(max-width: 960px)", disabled: navOpen, resetKey: view + location.hash });
  useEffect(() => {
    const root = document.documentElement;
    if (barsHidden) root.dataset.bars = "hidden"; else delete root.dataset.bars;
  }, [barsHidden]);
  useEffect(() => {
    // Tabbing into a hidden bar brings it back
    const on = (e) => { if (e.target.closest?.(".topbar, .tv-bottomnav")) setBarsHidden(false); };
    document.addEventListener("focusin", on);
    return () => { document.removeEventListener("focusin", on); delete document.documentElement.dataset.bars; };
  }, [setBarsHidden]);
  return (
    <>
      <PushLayout isOpen={navOpen} onOpenChange={setNavOpen} label={ar ? "كل الصفحات" : "All pages"} width={300}
        menu={({ close }) => <PhoneMenu {...{ ar, lang, setLang, dark, setDark, view, close }} />}>
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById("main")?.focus(); }}>{ar ? "تخطَّ إلى المحتوى" : "Skip to content"}</a>
      <header className="topbar" data-collapsed={collapsed || undefined}>
        <div className="topbar-inner">
          <div className="brand">
            <span className="nav-toggle"><IconButton label={ar ? "كل الصفحات" : "All pages"} aria-haspopup="dialog" onPress={() => setNavOpen(true)}><Icon.MenuIcon /></IconButton></span>
            <a href="#overview" className="brand-link" aria-label={BRANDS[brand]}>
              <Logo width={112} className="brand-full" />
              <Logo variant="monogram" width={28} className="brand-mark" />
            </a>
            <span className="brand-sep" aria-hidden="true" />
            <span className="collapse-toggle">
              <Tooltip content={collapseLabel}>
                <IconButton label={collapseLabel} aria-controls="docs-aside" aria-expanded={!collapsed} onPress={() => setCollapsed(!collapsed)}>
                  {collapsed ? <Icon.PanelLeftOpen /> : <Icon.PanelLeftClose />}
                </IconButton>
              </Tooltip>
            </span>
            <span className="brand-title">{ar ? "مكتبة المكونات" : "Component library"}</span>
          </div>
          <div className="topbar-controls">
            <button className="search-btn desk-only" onClick={() => setPalette(true)}>
              <Icon.Search /><span className="search-btn-text">{ar ? "ابحث" : "Search"}</span><kbd className="tv-kbd" dir="ltr">⌘K</kbd>
            </button>
            <span className="desk-only"><BrandSelect value={brand} onChange={setBrand} ar={ar} /></span>
            <span className="desk-only"><LanguageSelect value={lang} onChange={setLang} /></span>
            <NotificationCenter items={notif.items} onMarkAllRead={notif.markAll} onOpenItem={notif.open}
              viewAllHref="#inbox" viewAllLabel={ar ? "عرض كل الإشعارات" : "View all notifications"} />
            <span className="desk-only"><Tooltip content={ar ? "الوضع الداكن" : "Dark theme"}>
              <RACToggle className="tv-icon-btn" aria-label={ar ? "الوضع الداكن" : "Dark theme"} isSelected={dark} onChange={setDark}>
                {dark ? <Icon.Sun /> : <Icon.Moon />}
              </RACToggle>
            </Tooltip></span>
            <span className="desk-only"><AccountMenu ar={ar} /></span>
            <span className="mob-only"><AccountMenu ar={ar} compact /></span>
          </div>
        </div>
      </header>
      <div className="docs" data-collapsed={collapsed || undefined}>
        <aside className="docs-aside" id="docs-aside">
          <NavList lang={lang} view={view} collapsed={collapsed} />
        </aside>
        <main id="main" tabIndex={-1} className="docs-main" data-scroll-root>
          {view === "settings" ? <SettingsView {...{ lang, ar, brand, setBrand, setLang, dark, setDark }} />
            : view === "inbox" ? <InboxView ar={ar} notif={notif} />
            : view === "contact" ? <ContactDetailPage key={routeId()} id={routeId()} />
            : view === "conversations" ? <ConversationsPage key={lang} id={routeId()} /> : <View key={view} />}
        </main>
      </div>
      <PhoneNav {...{ ar, view, setPalette }} hidden={barsHidden} />
      </PushLayout>
      <CommandPalette isOpen={palette} onOpenChange={setPalette} lang={lang} />
      <ToastRegion />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
