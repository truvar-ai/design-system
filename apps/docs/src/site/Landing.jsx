"use client";
// design-system.truvar.ai: what the design system is, shown with its own live components.
import { useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { I18nProvider } from "react-aria-components";
import {
  Button, PhoneField, SegmentedControl, Switch, BrandAvatar, OrbitMark, Badge, Avatar, TextField, Select, Item, Slider,
  Tabs, TabList, Tab, TabPanel, Checkbox, toast, BottomNav, BottomNavItem, DatePicker, numberFormat,
} from "@truvar-ai/design-system";
import * as Icon from "@truvar-ai/design-system/icons";
import { useSite } from "./Providers.jsx";
import { Header } from "./Header.jsx";
import { Footer } from "./Footer.jsx";
import { ButtonLink, Command, Code, Reveal } from "./ui.jsx";
import { PACKAGE, VERSION, localePath } from "./config.js";

const cx = (...c) => c.filter(Boolean).join(" ");

/* ---------- Hero ---------- */
// A live product preview: real components in a window, on a grid (nothing overlaps). The window has its own
// language switch, so one tap shows the same screen in Arabic: direction, digits and fonts included.
function HeroPreview() {
  const { lang: siteLang, tr } = useSite();
  const [lang, setLang] = useState(siteLang);
  const [booked, setBooked] = useState(false);
  const ar = lang === "ar";
  const t = (en, a) => (ar ? a : en);
  const locale = ar ? "ar-EG" : "en-US";
  const num = (v) => numberFormat(locale).format(v);
  const pct = (v) => numberFormat(locale, { style: "percent", signDisplay: "always" }).format(v);
  return (
    <figure className="lx-preview" aria-label={tr("Live preview of the components", "معاينة حية للمكونات")}>
      <div className="lx-preview-bar">
        <span className="lx-preview-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="lx-preview-title">{tr("Live preview", "معاينة حية")}</span>
        <SegmentedControl aria-label={tr("Preview language", "لغة المعاينة")} value={lang} onChange={setLang}
          options={[{ id: "en", label: "EN", lang: "en" }, { id: "ar", label: "ع", lang: "ar" }]} />
      </div>
      <I18nProvider locale={locale}>
        <div className="lx-preview-body" dir={ar ? "rtl" : "ltr"} lang={lang}>
          <section className="lx-pcard lx-pcard--form" aria-label={t("Sign up", "التسجيل")}>
            <div className="lx-pcard-head">
              <span className="lx-pcard-title">{t("Create your account", "أنشئ حسابك")}</span>
              <Badge tone="success" dot>{t("Live", "مباشر")}</Badge>
            </div>
            <TextField label={t("Full name", "الاسم الكامل")} defaultValue={t("Amira Hassan", "أميرة حسن")} key={"n" + lang} />
            <PhoneField label={t("Mobile", "الجوال")} defaultCountry="EG" />
            <Switch defaultSelected>{t("Product updates", "تحديثات المنتج")}</Switch>
            <Checkbox defaultSelected>{t("I agree to the terms and privacy policy", "أوافق على الشروط وسياسة الخصوصية")}</Checkbox>
            <Button onPress={() => toast({ tone: "success", title: t("Account created", "تم إنشاء الحساب"), description: t("This is a live demo, nothing was sent.", "هذا عرض حي، لم يُرسل شيء.") })}>
              {t("Create account", "إنشاء الحساب")}
            </Button>
          </section>

          <section className="lx-pcard lx-pcard--agent" aria-label={t("AI agent", "الوكيل الذكي")}>
            <div className="lx-agent-head">
              <BrandAvatar size={36} active={!booked} activity="speaking" label={t("Layla, AI agent", "ليلى، الوكيل الذكي")} />
              <span className="lx-agent-who"><b>{t("Layla", "ليلى")}</b><span>{t("AI agent", "وكيل ذكي")}</span></span>
              <Badge tone={booked ? "success" : "accent"}>{booked ? t("Done", "تم") : t("Working", "يعمل")}</Badge>
            </div>
            <p className="lx-bubble">{booked
              ? t("Booked for Tuesday at 10:30. I sent the confirmation on WhatsApp.", "تم الحجز يوم الثلاثاء الساعة ١٠:٣٠، وأرسلت التأكيد على واتساب.")
              : t("I found 3 free times on Tuesday. Shall I book 10:30?", "وجدت ٣ مواعيد متاحة يوم الثلاثاء. أحجز الساعة ١٠:٣٠؟")}</p>
            <ul className="lx-agent-steps">
              <li className="is-done"><Icon.Check />{t("Checked the calendar", "راجعت التقويم")}</li>
              <li className="is-done"><Icon.Check />{t("Found 3 free times", "وجدت ٣ مواعيد متاحة")}</li>
              <li className={booked ? "is-done" : "is-now"}>{booked ? <Icon.Check /> : <OrbitMark size={14} active />}{booked ? t("Booked and confirmed", "تم الحجز والتأكيد") : t("Waiting for your OK", "بانتظار موافقتك")}</li>
            </ul>
            <div className="lx-agent-actions">
              {booked
                ? <Button size="sm" variant="secondary" onPress={() => setBooked(false)}>{t("Start again", "ابدأ من جديد")}</Button>
                : <><Button size="sm" onPress={() => setBooked(true)}>{t("Approve", "موافقة")}</Button><Button size="sm" variant="ghost">{t("Other time", "موعد آخر")}</Button></>}
            </div>
          </section>

          <section className="lx-pcard lx-pcard--stat" aria-label={t("This week", "هذا الأسبوع")}>
            <span className="lx-stat-label">{t("Conversations this week", "المحادثات هذا الأسبوع")}</span>
            <span className="lx-stat-row">
              <span className="lx-stat-value">{num(2481)}</span>
              <Badge tone="success">{pct(0.12)}</Badge>
            </span>
            <span className="lx-bars" aria-hidden="true">
              {[38, 62, 48, 80, 56, 100, 70].map((h, i) => <i key={i} style={{ height: h + "%" }} className={i === 5 ? "is-gold" : undefined} />)}
            </span>
          </section>
        </div>
      </I18nProvider>
    </figure>
  );
}

function Hero() {
  const { lang, tr } = useSite();
  return (
    <section className="lx-hero" aria-labelledby="hero-title">
      <div className="lx-hero-bg" aria-hidden="true" />
      <div className="lx-wrap lx-hero-grid">
        <div className="lx-hero-text">
          <NextLink href={localePath(lang, "/docs/widget/")} className="lx-announce">
            <span className="lx-announce-mark" aria-hidden="true"><OrbitMark size={18} active activity="searching" /></span>
            <span className="lx-announce-tag">{tr("New", "جديد")}</span>
            <span className="lx-announce-text">
              <span className="lx-announce-long">{tr("Website assistant: chat, voice notes and live calls", "مساعد المواقع: محادثة ورسائل صوتية ومكالمات مباشرة")}</span>
              <span className="lx-announce-short">{tr("Meet the website assistant", "تعرّف على مساعد المواقع")}</span>
            </span>
            <Icon.ChevronRight className="lx-flip lx-announce-go" />
          </NextLink>
          <h1 id="hero-title" className="lx-h1">
            {tr(<>Build products people trust, <em>in English and Arabic.</em></>, <>ابنِ منتجات يثق بها الناس، <em>بالعربية والإنجليزية.</em></>)}
          </h1>
          <p className="lx-lead">
            {tr("The Truvar.ai design system: 230+ accessible React components, design tokens and full right-to-left support, made to feel native on every phone.",
              "نظام تصميم Truvar.ai: أكثر من ٢٣٠ مكوّنًا بلغة React سهلة الاستخدام للجميع، ورموز تصميم، ودعم كامل للكتابة من اليمين لليسار، ويعمل كتطبيق أصلي على كل هاتف.")}
          </p>
          <div className="lx-cta">
            <ButtonLink href={localePath(lang, "/docs/installation/")} className="lx-btn-lg">{tr("Get started", "ابدأ الآن")}<Icon.ChevronRight className="lx-flip" /></ButtonLink>
            <ButtonLink href={localePath(lang, "/docs/buttons/")} variant="secondary" className="lx-btn-lg">{tr("Browse components", "تصفح المكونات")}</ButtonLink>
          </div>
          <Command>{`pnpm add ${PACKAGE}`}</Command>
        </div>
        <HeroPreview />
      </div>
    </section>
  );
}

/* ---------- Built on ---------- */
function Strip() {
  const { tr } = useSite();
  const items = [
    { icon: <Icon.Shield />, label: tr("Built on React Aria", "مبني على React Aria") },
    { icon: <Icon.Zap />, label: tr("Next.js, Vite and Electron", "Next.js و Vite و Electron") },
    { icon: <Icon.Braces />, label: tr("Design tokens (DTCG)", "رموز تصميم (DTCG)") },
    { icon: <Icon.Globe />, label: tr("English and Arabic", "العربية والإنجليزية") },
    { icon: <Icon.FileText />, label: tr("Open source, MIT", "مفتوح المصدر، MIT") },
  ];
  return (
    <div className="lx-strip">
      <ul className="lx-wrap lx-strip-list">
        {items.map((it) => <li key={it.label}>{it.icon}<span>{it.label}</span></li>)}
      </ul>
    </div>
  );
}

/* ---------- Numbers ---------- */
function CountUp({ to, format }) {
  const ref = useRef(null);
  const [n, setN] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t) => { const p = Math.min(1, (t - t0) / 1100); setN(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(step); };
      setN(0); raf = requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref}>{format(n)}</span>;
}

function Numbers() {
  const { lang, tr } = useSite();
  const f = (n) => new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US").format(n);
  const stats = [
    { n: 230, plus: true, label: tr("components", "مكوّن") },
    { n: 130, plus: true, label: tr("icons", "أيقونة") },
    { n: 245, label: tr("countries and flags", "دولة وعلم") },
    { n: 19, label: tr("messaging channels", "قناة تواصل") },
  ];
  return (
    <section className="lx-section lx-numbers-sec" aria-label={tr("In numbers", "بالأرقام")}>
      <Reveal className="lx-wrap lx-numbers">
        {stats.map((s) => (
          <div key={s.label} className="lx-number">
            <span className="lx-number-value"><CountUp to={s.n} format={f} />{s.plus && "+"}</span>
            <span className="lx-number-label">{s.label}</span>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

/* ---------- Features ---------- */
function SectionHead({ eyebrow, title, lead, id }) {
  return (
    <Reveal className="lx-head">
      <p className="lx-eyebrow">{eyebrow}</p>
      <h2 className="lx-h2" id={id}>{title}</h2>
      {lead && <p className="lx-sub">{lead}</p>}
    </Reveal>
  );
}

// The same card in both directions: flip it and everything mirrors, from layout to dates and digits
function RtlDemo() {
  const { tr } = useSite();
  const [l, setL] = useState("ar");
  const t = (en, ar) => (l === "ar" ? ar : en);
  return (
    <div className="lx-rtl">
      <SegmentedControl aria-label={tr("Direction", "الاتجاه")} value={l} onChange={setL}
        options={[{ id: "en", label: "English", lang: "en" }, { id: "ar", label: "العربية", lang: "ar" }]} />
      <I18nProvider locale={l === "ar" ? "ar-EG" : "en-US"}>
        <div className="lx-rtl-card" dir={l === "ar" ? "rtl" : "ltr"} lang={l}>
          <div className="lx-rtl-row">
            <Avatar name={t("Omar Khaled", "عمر خالد")} size={36} />
            <div className="lx-rtl-who"><b>{t("Omar Khaled", "عمر خالد")}</b><span>{t("Replied 2 min ago", "رد منذ دقيقتين")}</span></div>
            <Badge tone="info">{t("WhatsApp", "واتساب")}</Badge>
          </div>
          <p className="lx-rtl-msg">{t("Can I move my appointment to Thursday at 4 pm?", "ممكن أنقل موعدي ليوم الخميس الساعة ٤ العصر؟")}</p>
          <div className="lx-rtl-actions">
            <Button size="sm">{t("Reschedule", "تغيير الموعد")}</Button>
            <Button size="sm" variant="ghost">{t("Reply", "رد")}</Button>
          </div>
        </div>
      </I18nProvider>
    </div>
  );
}

function ThemeDemo() {
  const { tr } = useSite();
  return (
    <div className="lx-themes" aria-hidden="true">
      {["light", "dark"].map((t) => (
        <div key={t} className={cx("lx-theme", `is-${t}`)}>
          <span className="lx-theme-chip">{t === "light" ? tr("Light", "فاتح") : tr("Dark", "داكن")}</span>
          <span className="lx-theme-line" /><span className="lx-theme-line is-short" />
          <span className="lx-theme-btn">{tr("Continue", "متابعة")}</span>
        </div>
      ))}
    </div>
  );
}

function PhoneDemo() {
  const { tr } = useSite();
  return (
    <div className="lx-phone">
      <div className="lx-phone-screen">
        <p className="lx-phone-title">{tr("Inbox", "الوارد")}</p>
        {[0, 1, 2].map((i) => <div key={i} className="lx-phone-row"><span /><span /></div>)}
        <BottomNav inline aria-label={tr("Demo tabs", "تبويبات العرض")}>
          <BottomNavItem icon={<Icon.Home />} isCurrent>{tr("Home", "الرئيسية")}</BottomNavItem>
          <BottomNavItem icon={<Icon.MessageCircle />} badge={3}>{tr("Chats", "المحادثات")}</BottomNavItem>
          <BottomNavItem icon={<Icon.User />}>{tr("Profile", "حسابي")}</BottomNavItem>
        </BottomNav>
      </div>
    </div>
  );
}

function KeyboardDemo() {
  return (
    <div className="lx-keys" aria-hidden="true">
      <span className="lx-key is-wide">Tab</span><span className="lx-key">←</span><span className="lx-key">→</span><span className="lx-key">Esc</span>
      <span className="lx-focus-demo">Aa</span>
    </div>
  );
}

function AiDemo() {
  const { tr } = useSite();
  return (
    <div className="lx-ai" aria-hidden="true">
      <BrandAvatar size={52} active activity="speaking" label="" />
      <span className="lx-wave">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ "--i": i }} />)}</span>
      <span className="lx-ai-steps">
        <span className="is-done"><Icon.Check />{tr("Checked the calendar", "راجع التقويم")}</span>
        <span className="is-done"><Icon.Check />{tr("Found 3 free slots", "وجد ٣ مواعيد متاحة")}</span>
        <span className="is-now"><OrbitMark size={14} active />{tr("Waiting for your OK", "بانتظار موافقتك")}</span>
      </span>
    </div>
  );
}

function TokensDemo() {
  const sw = [["--primary", "var(--primary)"], ["--accent", "var(--accent)"], ["--surface-alt", "var(--surface-alt)"], ["--success", "var(--success)"]];
  return (
    <div className="lx-tokens" dir="ltr" aria-hidden="true">
      {sw.map(([n, v]) => <span key={n} className="lx-token"><i style={{ background: v }} /><code>{n}</code></span>)}
    </div>
  );
}

function Features() {
  const { tr } = useSite();
  const cards = [
    { cls: "is-wide", icon: <Icon.Globe />, title: tr("Arabic-first, not an afterthought", "العربية أولًا، وليست إضافة"),
      body: tr("Layouts mirror with logical CSS. Dates, numbers, calendars and keyboard arrows follow the language, and each Arabic font is paired with its English partner.",
        "التخطيط ينعكس تلقائيًا، والتواريخ والأرقام والتقويم وأسهم لوحة المفاتيح تتبع اللغة، وكل خط عربي مختار ليتناسب مع نظيره الإنجليزي."), demo: <RtlDemo /> },
    { icon: <Icon.Shield />, title: tr("Accessible by default", "سهل الاستخدام للجميع"),
      body: tr("Keyboard, focus and screen reader behaviour come from React Aria, so every component works for everyone.", "التنقل بلوحة المفاتيح والتركيز وقارئات الشاشة مبنية على React Aria، فيعمل كل مكوّن للجميع."), demo: <KeyboardDemo /> },
    { icon: <Icon.Moon />, title: tr("Light and dark", "فاتح وداكن"),
      body: tr("Both themes are built in and follow the device, or set one yourself.", "الوضعان مدمجان ويتبعان إعداد الجهاز، أو اختر أحدهما بنفسك."), demo: <ThemeDemo /> },
    { icon: <Icon.PhoneDeviceIcon />, title: tr("Native on phones", "كتطبيق أصلي على الهاتف"),
      body: tr("Bottom sheets, a tab bar, finger-sized targets and no zoom on focus. It feels like an app, not a web page.", "أوراق سفلية وشريط تبويب وأهداف بحجم الإصبع وبدون تكبير عند الكتابة. يبدو كتطبيق، لا كصفحة ويب."), demo: <PhoneDemo /> },
    { icon: <Icon.Sparkles />, title: tr("Made for AI products", "مصمم لمنتجات الذكاء الاصطناعي"),
      body: tr("Agent steps, approvals, voice calls, transcripts and an assistant mark that shows when AI is working.", "خطوات الوكيل والموافقات والمكالمات الصوتية والنصوص، وعلامة توضح متى يعمل الذكاء الاصطناعي."), demo: <AiDemo /> },
    { cls: "is-wide is-full", icon: <Icon.Palette />, title: tr("One set of tokens", "مجموعة واحدة من الرموز"),
      body: tr("Colour, type, spacing and radius live in design tokens, so a change lands everywhere at once.", "الألوان والخطوط والمسافات والحواف في رموز تصميم، فيصل أي تغيير إلى كل مكان مرة واحدة."), demo: <TokensDemo /> },
  ];
  return (
    <section className="lx-section" aria-labelledby="features-title">
      <div className="lx-wrap">
        <SectionHead id="features-title" eyebrow={tr("Why Truvar", "لماذا Truvar")}
          title={tr("Everything a serious product needs, from day one", "كل ما يحتاجه منتج جاد، من اليوم الأول")}
          lead={tr("Stop rebuilding the basics. Start from components that are already accessible, bilingual and tested on phones.", "توقف عن إعادة بناء الأساسيات. ابدأ بمكونات جاهزة للجميع وبلغتين ومختبرة على الهواتف.")} />
        <div className="lx-bento">
          {cards.map((c, i) => (
            <Reveal key={c.title} className={cx("lx-feature", c.cls)} delay={(i % 3) * 80}>
              <div className="lx-feature-demo">{c.demo}</div>
              <div className="lx-feature-text">
                <span className="lx-feature-icon">{c.icon}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Components gallery ---------- */
function Gallery() {
  const { lang, tr } = useSite();
  const L = (p) => localePath(lang, p);
  const tiles = [
    { href: L("/docs/buttons/"), name: tr("Buttons", "الأزرار"), demo: <div className="lx-tile-row"><Button size="sm">{tr("Save", "حفظ")}</Button><Button size="sm" variant="secondary">{tr("Cancel", "إلغاء")}</Button></div> },
    { href: L("/docs/forms/"), name: tr("Form fields", "حقول النماذج"), demo: <TextField aria-label={tr("Email", "البريد")} placeholder="name@company.com" /> },
    { href: L("/docs/countries/"), name: tr("Phone and country", "الهاتف والدولة"), demo: <PhoneField aria-label={tr("Mobile", "الجوال")} defaultCountry="SA" /> },
    { href: L("/docs/dates/"), name: tr("Dates", "التواريخ"), demo: <DatePicker aria-label={tr("Date", "التاريخ")} /> },
    { href: L("/docs/selection/"), name: tr("Selection", "الاختيار"), demo: (
      <Select aria-label={tr("Plan", "الباقة")} defaultSelectedKey="pro">
        <Item id="starter">{tr("Starter", "البداية")}</Item><Item id="pro">{tr("Pro", "الاحترافية")}</Item><Item id="team">{tr("Team", "الفرق")}</Item>
      </Select>) },
    { href: L("/docs/forms/#slider"), name: tr("Slider", "شريط التمرير"), demo: <Slider aria-label={tr("Volume", "الصوت")} defaultValue={64} /> },
    { href: L("/docs/navigation/"), name: tr("Tabs", "التبويبات"), demo: (
      <Tabs>
        <TabList aria-label={tr("Sections", "الأقسام")}><Tab id="a">{tr("Overview", "نظرة")}</Tab><Tab id="b">{tr("Activity", "النشاط")}</Tab></TabList>
        <TabPanel id="a">{tr("3 open deals", "٣ صفقات مفتوحة")}</TabPanel>
        <TabPanel id="b">{tr("2 calls today", "مكالمتان اليوم")}</TabPanel>
      </Tabs>) },
    { href: L("/docs/feedback/"), name: tr("Badges and status", "الشارات والحالة"), demo: <div className="lx-tile-row"><Badge tone="success" dot>{tr("Paid", "مدفوع")}</Badge><Badge tone="warning">{tr("Pending", "معلّق")}</Badge><Badge tone="danger">{tr("Overdue", "متأخر")}</Badge></div> },
    { href: L("/docs/forms/#checkbox"), name: tr("Checkbox and switch", "الاختيار والمفتاح"), demo: <div className="lx-tile-col"><Checkbox defaultSelected>{tr("Email me", "راسلني")}</Checkbox><Switch defaultSelected>{tr("Alerts", "التنبيهات")}</Switch></div> },
  ];
  return (
    <section className="lx-section lx-gallery-sec" aria-labelledby="gallery-title">
      <div className="lx-wrap">
        <SectionHead id="gallery-title" eyebrow={tr("Components", "المكونات")}
          title={tr("Try them right here", "جرّبها هنا مباشرة")}
          lead={tr("These are the real components, not pictures. Click, type and tab through them.", "هذه هي المكونات الحقيقية، وليست صورًا. اضغط واكتب وتنقل بينها.")} />
        <div className="lx-gallery">
          {tiles.map((t, i) => (
            <Reveal key={t.name} className="lx-tile" delay={(i % 3) * 70}>
              <div className="lx-tile-stage">{t.demo}</div>
              <NextLink href={t.href} className="lx-tile-link">{t.name}<Icon.ChevronRight className="lx-flip" /></NextLink>
            </Reveal>
          ))}
        </div>
        <Reveal className="lx-center">
          <ButtonLink href={L("/docs/buttons/")} variant="secondary">{tr("See all components", "كل المكونات")}<Icon.ChevronRight className="lx-flip" /></ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Examples ---------- */
function Examples() {
  const { lang, tr } = useSite();
  const L = (p) => localePath(lang, p);
  const items = [
    { href: L("/docs/overview/"), img: "crm", title: tr("CRM", "إدارة العملاء"), body: tr("Contacts, deals and a full record page.", "جهات الاتصال والصفقات وصفحة ملف كاملة.") },
    { href: L("/docs/conversations/"), img: "inbox", title: tr("Unified inbox", "صندوق وارد موحّد"), body: tr("Every channel in one place, with AI handoff.", "كل القنوات في مكان واحد، مع التسليم للذكاء الاصطناعي.") },
    { href: L("/docs/dashboard/"), img: "dashboard", title: tr("Dashboard", "لوحة المؤشرات"), body: tr("Charts, maps and live numbers.", "رسوم بيانية وخرائط وأرقام مباشرة.") },
    { href: L("/docs/widget/"), img: "widget", title: tr("Website assistant", "مساعد المواقع"), body: tr("An agent your visitors can chat or talk to.", "وكيل يتحدث إليه زوار موقعك أو يراسلونه.") },
  ];
  return (
    <section className="lx-section" aria-labelledby="examples-title">
      <div className="lx-wrap">
        <SectionHead id="examples-title" eyebrow={tr("Examples", "أمثلة")}
          title={tr("Whole screens, ready to start from", "شاشات كاملة، جاهزة لتبدأ منها")}
          lead={tr("See the components working together in real product screens, in both languages and both themes.", "شاهد المكونات تعمل معًا في شاشات منتجات حقيقية، باللغتين وبالوضعين.")} />
        <div className="lx-examples">
          {items.map((it, i) => (
            <Reveal key={it.img} delay={(i % 2) * 90} className="lx-example-wrap">
              <NextLink href={it.href} className="lx-example">
                <span className="lx-example-shot">
                  <img src={`/shots/${it.img}-${lang}-light.webp`} alt={tr(`${it.title} screen built with the Truvar.ai design system`, `شاشة ${it.title} مبنية بنظام تصميم Truvar.ai`)}
                    width="1440" height="900" loading="lazy" decoding="async" className="site-when-light" />
                  <img src={`/shots/${it.img}-${lang}-dark.webp`} alt={tr(`${it.title} screen built with the Truvar.ai design system, dark theme`, `شاشة ${it.title} مبنية بنظام تصميم Truvar.ai، الوضع الداكن`)}
                    width="1440" height="900" loading="lazy" decoding="async" className="site-when-dark" />
                </span>
                <span className="lx-example-text">
                  <b>{it.title}</b><span>{it.body}</span>
                </span>
                <Icon.ChevronRight className="lx-example-go lx-flip" />
              </NextLink>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Developers ---------- */
function Developers() {
  const { lang, tr } = useSite();
  const [fw, setFw] = useState("next");
  const steps = [
    { title: tr("Install the package", "ثبّت الحزمة"), code: `pnpm add ${PACKAGE}`, lang: "sh" },
    { title: tr("Add the styles once", "أضف الأنماط مرة واحدة"), lang: "jsx", title2: fw === "next" ? "app/layout.jsx" : "src/main.jsx",
      code: fw === "next"
        ? `import "${PACKAGE}/styles.css";\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang="ar" dir="rtl">\n      <body>{children}</body>\n    </html>\n  );\n}`
        : `import "${PACKAGE}/styles.css";\nimport { createRoot } from "react-dom/client";\nimport App from "./App.jsx";\n\ncreateRoot(document.getElementById("root")).render(<App />);` },
    { title: tr("Use any component", "استخدم أي مكوّن"), lang: "jsx", title2: "SignUp.jsx",
      code: `import { Button, TextField, PhoneField } from "${PACKAGE}";\n\nexport function SignUp() {\n  return (\n    <form>\n      <TextField label="Name" />\n      <PhoneField label="Mobile" defaultCountry="EG" />\n      <Button type="submit">Create account</Button>\n    </form>\n  );\n}` },
  ];
  return (
    <section className="lx-section lx-dev-sec" aria-labelledby="dev-title">
      <div className="lx-wrap lx-dev">
        <div className="lx-dev-text">
          <SectionHead id="dev-title" eyebrow={tr("For developers", "للمطورين")}
            title={tr("From install to first screen in minutes", "من التثبيت إلى أول شاشة في دقائق")}
            lead={tr("Works with Next.js (App Router and Pages), Vite, Electron and any React 18 or 19 app. Every component is a client component, ready for Server Component pages.",
              "يعمل مع Next.js (App Router و Pages) و Vite و Electron وأي تطبيق React 18 أو 19. كل مكوّن جاهز للاستخدام داخل صفحات Server Components.")} />
          <Reveal className="lx-dev-links">
            <ButtonLink href={localePath(lang, "/docs/installation/")}>{tr("Read the guide", "اقرأ الدليل")}</ButtonLink>
            <ButtonLink href={localePath(lang, "/docs/nextjs/")} variant="ghost">{tr("Next.js setup", "الإعداد مع Next.js")}</ButtonLink>
          </Reveal>
        </div>
        <Reveal className="lx-steps">
          <SegmentedControl aria-label={tr("Framework", "إطار العمل")} value={fw} onChange={setFw}
            options={[{ id: "next", label: "Next.js" }, { id: "vite", label: "Vite" }]} />
          <ol>
            {steps.map((s, i) => (
              <li key={i} className="lx-step">
                <span className="lx-step-n" aria-hidden="true">{new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US").format(i + 1)}</span>
                <div className="lx-step-body">
                  <h3>{s.title}</h3>
                  {i === 0 ? <Command>{s.code}</Command> : <Code lang={s.lang} title={s.title2}>{s.code}</Code>}
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Closing call to action ---------- */
function Closing() {
  const { lang, tr } = useSite();
  return (
    <section className="lx-section lx-closing-sec" aria-labelledby="closing-title">
      <Reveal className="lx-wrap">
        <div className="lx-closing">
          <div className="lx-closing-orbit" aria-hidden="true"><OrbitMark size={220} active activity="searching" /></div>
          <div className="lx-closing-text">
            <h2 id="closing-title" className="lx-h2">{tr("Start building with Truvar", "ابدأ البناء مع Truvar")}</h2>
            <p>{tr(`Free and open source. Version ${VERSION}, in English and Arabic.`, `مجاني ومفتوح المصدر. الإصدار ${VERSION}، بالعربية والإنجليزية.`)}</p>
            <div className="lx-cta">
              <ButtonLink href={localePath(lang, "/docs/installation/")} className="lx-btn-lg lx-btn-gold">{tr("Get started", "ابدأ الآن")}<Icon.ChevronRight className="lx-flip" /></ButtonLink>
              <ButtonLink href={localePath(lang, "/docs/")} variant="secondary" className="lx-btn-lg lx-btn-onnavy">{tr("Read the docs", "اقرأ التوثيق")}</ButtonLink>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Landing() {
  return (
    <>
      <Header />
      <main id="content" className="lx">
        <Hero />
        <Strip />
        <Numbers />
        <Features />
        <Gallery />
        <Examples />
        <Developers />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
