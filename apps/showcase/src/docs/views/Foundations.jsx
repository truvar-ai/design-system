"use client";
import { useState } from "react";
import { useBrand, Logo, BrandAvatar, OrbitMark, OrbitLoader, SearchField, Button } from "../../ds.js";
import * as Icon from "@truvar-ai/design-system/icons";
import { brands } from "@truvar-ai/design-system/tokens";
import { useTr, useT, useLang } from "../i18n.jsx";
import { Spec, ViewHeader } from "../ui.jsx";
import { TYPE_SAMPLES } from "../../strings.js";

const COLORS = [
  ["navy-900", "#001250", "#001250", ["Brand anchor: logo, hero fields", "لون الهوية الأساسي: الشعار والمساحات الكبيرة"]],
  ["gold-300", "#e0b96a", "#e0b96a", ["Highlight on navy and dark grounds", "لون الإبراز على الكحلي والخلفيات الداكنة"]],
  ["primary", "#001250", "#e0b96a", ["Primary buttons and selected states", "الأزرار الأساسية والحالات المحددة"]],
  ["accent", "#916625", "#e0b96a", ["Links and accent text", "الروابط ونصوص الإبراز"]],
  ["surface", "#ffffff", "#131416", ["Page background", "خلفية الصفحة"]],
  ["surface-alt", "#f7f5f0", "#1c1d20", ["Sections, panels, table headers", "الأقسام واللوحات ورؤوس الجداول"]],
  ["surface-raised", "#ffffff", "#232428", ["Menus, dialogs, drawers", "القوائم والنوافذ واللوحات الجانبية"]],
  ["ink", "#001250", "#ebe9e4", ["Text", "النصوص"]],
  ["ink-muted", "#4a5578", "#a5a39d", ["Secondary text", "النصوص الثانوية"]],
  ["border", "#d9dce6", "#2d2e32", ["Hairlines", "الخطوط الفاصلة"]],
  ["border-strong", "#6b7494", "#76777d", ["Control borders", "حدود عناصر التحكم"]],
  ["success", "#1f6f4a", "#6fd3a0", ["Success, with a word or icon", "النجاح، مع كلمة أو أيقونة"]],
  ["warning", "#9a5b00", "#f2b45a", ["Warnings, with a word or icon", "التحذيرات، مع كلمة أو أيقونة"]],
  ["danger", "#b3261e", "#ff8a80", ["Errors, with a word or icon", "الأخطاء، مع كلمة أو أيقونة"]],
];

export function Colors() {
  const tr = useTr();
  const lang = useLang();
  // Values below are Truvar's; another brand shows its own from the token build.
  const own = brands[useBrand()];
  return (
    <>
      <ViewHeader viewId="colors" intro={tr("Navy carries the brand, gold marks the moment of value. Every component reads these tokens, so light, dark and future themes come for free.", "الكحلي يحمل الهوية والذهبي يميز لحظة القيمة. كل المكونات تقرأ هذه الرموز، فتأتي الأوضاع الفاتحة والداكنة وأي أوضاع مستقبلية دون جهد إضافي.")} />
      <Spec id="color-tokens" name={tr("Colour tokens", "رموز الألوان")} primitive="tokens.css" note={tr("Swatches show the current theme. Values list light, then dark.", "العينات تعرض الوضع الحالي. القيم: الفاتح ثم الداكن.")} wide>
        <div className="swatch-grid">
          {COLORS.map(([name, light, dark, use]) => (own ? [name, own.light[name] ?? light, own.dark[name] ?? dark, use] : [name, light, dark, use])).map(([name, light, dark, use]) => (
            <div className="swatch-card" key={name}>
              <span className="swatch-chip" style={{ background: `var(--${name})` }} />
              <div className="swatch-meta">
                <code dir="ltr">{name}</code>
                <span className="tv-desc" dir="ltr">{light === dark ? light : `${light} / ${dark}`}</span>
                <span className="tv-desc">{lang === "ar" ? use[1] : use[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </Spec>
      <Spec id="spacing" name={tr("Spacing", "المسافات")} primitive="--space-*" note={tr("A 4px-based scale. Cards use space-6 inside; sections are space-16 apart.", "مقياس مبني على ٤ بكسل. البطاقات تستخدم space-6 داخليًا، والأقسام بينها space-16.")}>
        <div className="space-list">
          {[["1", 4], ["2", 8], ["3", 12], ["4", 16], ["6", 24], ["10", 40], ["16", 64]].map(([n, px]) => (
            <div className="space-row" key={n}><code dir="ltr">space-{n}</code><span className="space-bar" style={{ width: px }} /><span className="tv-desc">{px}px</span></div>
          ))}
        </div>
      </Spec>
      <Spec id="radius" name={tr("Radius and depth", "الحواف والعمق")} primitive="--radius-*, --shadow-card" note={tr("Rounded like the wordmark. Shadows only for things that float.", "حواف دائرية مثل الشعار. الظلال فقط للعناصر الطافية.")}>
        <div className="radius-row">
          {[["sm", 6], ["md", 12], ["lg", 24], ["pill", 999]].map(([n]) => (
            <div key={n} className="radius-box" style={{ borderRadius: `var(--radius-${n})` }}><code dir="ltr">radius-{n}</code></div>
          ))}
          <div className="radius-box shadowed"><code dir="ltr">shadow-card</code></div>
        </div>
      </Spec>
    </>
  );
}

export function Typography() {
  const t = useT();
  return (
    <>
      <ViewHeader viewId="typography" intro={t.typeIntro} />
      <Spec id="type-scale" name={t.scaleName} primitive="--font-display / --font-body" note={t.scaleNote} wide>
        <div className="type-head" aria-hidden="true">
          <span />
          <span lang="en" dir="ltr">Poppins · DM Sans</span>
          <span lang="ar" dir="rtl">Alexandria · IBM Plex Sans Arabic</span>
        </div>
        <div className="type-table">
          {TYPE_SAMPLES.map((s) => (
            <div className="type-row" key={s.style}>
              <span className="type-meta" dir="ltr"><code>{s.style}</code><br />{s.meta}</span>
              <span className={`ts ts-${s.style}`} lang="en" dir="ltr">{s.en}</span>
              <span className={`ts ts-${s.style}`} lang="ar" dir="rtl">{s.ar}</span>
            </div>
          ))}
        </div>
      </Spec>
      <Spec id="mixed-text" name={t.mixedName} primitive="font fallback" note={t.mixedNote}>
        <p className="ts ts-body mixed" lang="ar" dir="rtl">ربطنا Truvar بمنصتي HubSpot و Salesforce، فوفّر فريق المبيعات ١٢ ساعة أسبوعيًا ورفع معدل الإغلاق بنسبة ١٨٪.</p>
        <p className="ts ts-body mixed" lang="en" dir="ltr">We connected Truvar to HubSpot and Salesforce. The sales team saved 12 hours a week and closed 18% more deals.</p>
      </Spec>
    </>
  );
}

export function LogoView() {
  const t = useT();
  return (
    <>
      <ViewHeader viewId="logo" intro={t.logoIntro} />
      <Spec id="wordmark" name={t.wordmark} primitive="Logo" note={t.wordmarkNote}>
        <div className="logo-grid">
          <div className="logo-tile tile-theme"><Logo width={200} /><span className="caption">{t.currentTheme}</span></div>
          <div className="logo-tile tile-navy"><Logo width={200} tone="onDark" /><span className="caption on-navy">{t.onField}</span></div>
        </div>
      </Spec>
      <Spec id="monogram" name={t.monogram} primitive={'Logo variant="monogram"'} note={t.monogramNote}>
        <div className="row" style={{ gap: 24 }}>
          <Logo variant="monogram" width={64} />
          <Logo variant="monogram" width={32} />
          <BrandAvatar size={56} />
          <BrandAvatar size={32} />
        </div>
      </Spec>
    </>
  );
}

function SearchDemo() {
  const t = useT();
  const [q, setQ] = useState("");
  const [state, setState] = useState("idle");
  const [done, setDone] = useState("");
  const run = () => {
    const query = q.trim() || t.searchPh.replace(/^[^:]*:\s*/, "");
    setState("loading");
    setTimeout(() => { setDone(query); setState("done"); }, 2200);
  };
  return (
    <div className="stack">
      <div className="search-row">
        <SearchField label={t.searchLabel} placeholder={t.searchPh} value={q} onChange={setQ} onSubmit={run} />
        <Button onPress={run} isDisabled={state === "loading"}>{t.searchBtn}</Button>
      </div>
      <div className="search-out" aria-live="polite">
        {state === "loading" && <OrbitLoader label={t.searching} size={28} />}
        {state === "done" && (
          <div className="results">
            <p className="caption" style={{ marginTop: 0 }}>{t.found(done)}</p>
            <ul>{t.results.map((r) => <li key={r}><Icon.Search width={16} height={16} />{r}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}
function ChatDemo() {
  const t = useT();
  const [phase, setPhase] = useState("idle");
  const ask = () => { setPhase("thinking"); setTimeout(() => setPhase("answered"), 3200); };
  return (
    <div className="stack">
      {phase !== "idle" && (
        <div className="chat" aria-live="polite">
          <div className="bubble bubble-you"><span className="who">{t.you}</span>{t.question}</div>
          <div className="bubble-row">
            <BrandAvatar size={36} active={phase === "thinking"} activity="speaking" label={t.assistant} />
            {phase === "thinking"
              ? <OrbitLoader label={t.thinking} size={0} activity="speaking" />
              : <div className="bubble"><span className="who">{t.assistant}</span>{t.answer}</div>}
          </div>
        </div>
      )}
      <div className="row">
        <Button variant={phase === "idle" ? "primary" : "secondary"} onPress={ask} isDisabled={phase === "thinking"}>
          <Icon.Send className="tv-flip" />{phase === "idle" ? t.ask : t.again}
        </Button>
      </div>
    </div>
  );
}
export function Assistant() {
  const t = useT();
  return (
    <>
      <ViewHeader viewId="assistant" intro={t.asstIntro} />
      <Spec id="orbit" name={t.hoverName} primitive="OrbitMark, BrandAvatar" note={t.hoverNote}>
        <div className="orbit-demo">
          <figure><OrbitMark size={72} /><figcaption className="caption">{t.restLbl}</figcaption></figure>
          <figure><BrandAvatar size={88} label={t.assistant} /><figcaption className="caption">{t.hoverLbl}</figcaption></figure>
          <figure><BrandAvatar size={88} label={t.assistant} active activity="searching" /><figcaption className="caption">{t.activeLbl}</figcaption></figure>
        </div>
      </Spec>
      <Spec id="search-loading" name={t.searchName} primitive="SearchField + ProgressBar" note={t.searchNote}><SearchDemo /></Spec>
      <Spec id="talking" name={t.talkName} primitive={'BrandAvatar activity="speaking"'} note={t.talkNote}><ChatDemo /></Spec>
    </>
  );
}
