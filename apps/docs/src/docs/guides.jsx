"use client";
// The written guides. Each one lists its sections (for "On this page") and its body, in English and Arabic.
import { useEffect, useState } from "react";
import NextLink from "next/link";
import { SegmentedControl, Badge } from "@truvar-ai/design-system";
import * as Icon from "@truvar-ai/design-system/icons";
import { siApple, siLinux } from "simple-icons";
import CURSORS from "./cursors.json";
import { useSite } from "../site/Providers.jsx";
import { Code, Command } from "../site/ui.jsx";
import { PACKAGE, localePath } from "../site/config.js";
import { docsHref } from "./nav.js";

const P = PACKAGE;

// `code` inside a sentence stays left to right
const rich = (s) => s.split("`").map((p, i) => (i % 2 ? <code key={i} dir="ltr">{p}</code> : p));

function H2({ id, children }) { return <h2 id={id} className="dx-h2">{children}</h2>; }
function Note({ tone = "info", children }) {
  const I = tone === "warn" ? Icon.AlertTriangle : Icon.Info;
  return <div className="dx-note" data-tone={tone}><I />{children}</div>;
}
function Table({ head, rows }) {
  return (
    <div className="dx-table-wrap">
      <table className="dx-table">
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{typeof c === "string" ? rich(c) : c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
function DocLink({ id, children }) {
  const { lang } = useSite();
  return <NextLink href={localePath(lang, docsHref(id))}>{children}</NextLink>;
}

/* ---------- Introduction ---------- */
function Introduction() {
  const { lang, tr } = useSite();
  const cards = [
    { id: "installation", icon: <Icon.Download />, title: tr("Install", "التثبيت"), body: tr("Add the package and its styles.", "أضف الحزمة وأنماطها.") },
    { id: "nextjs", icon: <Icon.Rocket />, title: "Next.js", body: tr("Fonts, layout, links and Arabic in the App Router.", "الخطوط والتخطيط والروابط والعربية في App Router.") },
    { id: "buttons", icon: <Icon.Layers />, title: tr("Components", "المكونات"), body: tr("Every component with live examples.", "كل المكونات مع أمثلة حية.") },
    { id: "overview", icon: <Icon.Kanban />, title: tr("Examples", "أمثلة"), body: tr("Whole screens built with the system.", "شاشات كاملة مبنية بالنظام.") },
  ];
  return (
    <>
      <p className="dx-lead">{tr(
        "The Truvar.ai design system is one set of design tokens and the React components built on them. It's Arabic-first with full right-to-left support, accessible by default on React Aria, and made to feel native on phones.",
        "نظام تصميم Truvar.ai هو مجموعة واحدة من رموز التصميم ومكونات React المبنية عليها. العربية فيه أولًا مع دعم كامل للكتابة من اليمين لليسار، وهو سهل الاستخدام للجميع بفضل React Aria، ومصمم ليبدو كتطبيق أصلي على الهواتف.")}</p>
      <div className="dx-cards">
        {cards.map((c) => (
          <NextLink key={c.id} href={localePath(lang, docsHref(c.id))} className="dx-card">
            <span className="dx-card-icon">{c.icon}</span><b>{c.title}</b><span>{c.body}</span>
          </NextLink>
        ))}
      </div>
      <H2 id="principles">{tr("Principles", "المبادئ")}</H2>
      <ul className="dx-list">
        <li><b>{tr("Accessible first.", "للجميع أولًا.")}</b> {tr("Keyboard, focus and screen reader support come from React Aria, so every component works for everyone.", "دعم لوحة المفاتيح والتركيز وقارئات الشاشة يأتي من React Aria، فيعمل كل مكوّن للجميع.")}</li>
        <li><b>{tr("Two languages, one layout.", "لغتان وتخطيط واحد.")}</b> {tr("Components use logical CSS properties, so Arabic mirrors without a separate stylesheet.", "المكونات تستخدم خصائص CSS منطقية، فتنعكس العربية بدون ملف أنماط منفصل.")}</li>
        <li><b>{tr("Tokens are the source of truth.", "الرموز هي المرجع.")}</b> {tr("Colour, type, spacing and radius come from design tokens, never hard-coded values.", "الألوان والخطوط والمسافات والحواف تأتي من رموز التصميم، وليس من قيم ثابتة.")}</li>
        <li><b>{tr("Native on every screen.", "أصلي على كل شاشة.")}</b> {tr("The same components work with a mouse, a keyboard and a finger.", "المكونات نفسها تعمل بالفأرة ولوحة المفاتيح والإصبع.")}</li>
      </ul>
      <H2 id="whats-included">{tr("What's included", "ما الذي يتضمنه")}</H2>
      <Table head={[tr("Import", "الاستيراد"), tr("What", "المحتوى")]} rows={[
        [`${P}`, tr("Core components: buttons, fields, selects, dates, dialogs, sheets, menus, tables, toasts, cards, bottom nav, phone and country inputs, logo and brand marks", "المكونات الأساسية: الأزرار والحقول والقوائم والتواريخ والنوافذ والأوراق والجداول والإشعارات والبطاقات وشريط التنقل وحقول الهاتف والدولة والشعار")],
        [`${P}/icons`, tr("UI icons and stateful system icons", "أيقونات الواجهة وأيقونات النظام")],
        [`${P}/charts`, tr("Charts, sparklines, gauges, heatmaps, funnels and a world map", "رسوم بيانية ومؤشرات وخرائط حرارية وقمع وخريطة العالم")],
        [`${P}/voice`, tr("Call player, transcript, call logs, live call and workflow builder", "مشغل المكالمات والنص وسجل المكالمات والمكالمة المباشرة ومنشئ سير العمل")],
        [`${P}/os`, tr("Truvar OS kit: system bar, voice dock, agent task and approval cards", "مكونات Truvar OS: شريط النظام وشريط الصوت وبطاقات المهام والموافقات")],
        [`${P}/crm`, tr("Conversations across every channel, AI handoff, contacts, roles and permissions", "المحادثات عبر كل القنوات والتسليم للذكاء الاصطناعي وجهات الاتصال والأدوار والصلاحيات")],
        [`${P}/widget`, tr("Website assistant: chat, voice notes and live calls", "مساعد المواقع: محادثة ورسائل صوتية ومكالمات مباشرة")],
        [`${P}/tokens`, tr("Design tokens as JS, CSS variables and JSON", "رموز التصميم بصيغة JS ومتغيرات CSS و JSON")],
      ]} />
    </>
  );
}
Introduction.sections = [["principles", "Principles", "المبادئ"], ["whats-included", "What's included", "ما الذي يتضمنه"]];

/* ---------- Installation ---------- */
function Installation() {
  const { tr } = useSite();
  return (
    <>
      <p className="dx-lead">{tr("Add the package, load its styles and fonts, and you're ready to use any component.", "أضف الحزمة وحمّل أنماطها وخطوطها، وستكون جاهزًا لاستخدام أي مكوّن.")}</p>
      <H2 id="requirements">{tr("Requirements", "المتطلبات")}</H2>
      <ul className="dx-list">
        <li>{rich(tr("React 18 or 19, with `react-dom` and `react-is` at the same version.", "React 18 أو 19، مع `react-dom` و `react-is` بنفس الإصدار."))}</li>
        <li>{tr("Any bundler: Next.js, Vite, Electron, Remix or webpack.", "أي أداة تجميع: Next.js أو Vite أو Electron أو Remix أو webpack.")}</li>
      </ul>
      <H2 id="install">{tr("Install", "التثبيت")}</H2>
      <Command>{`pnpm add ${P}`}</Command>
      <p>{rich(tr("With npm: `npm install " + P + "`. With Yarn: `yarn add " + P + "`.", "باستخدام npm: `npm install " + P + "`. وباستخدام Yarn: `yarn add " + P + "`."))}</p>
      <H2 id="styles">{tr("Add the styles", "أضف الأنماط")}</H2>
      <p>{tr("Import the stylesheet once, at the root of your app. It includes the design tokens.", "استورد ملف الأنماط مرة واحدة في جذر التطبيق. وهو يتضمن رموز التصميم.")}</p>
      <Code lang="jsx" title="main.jsx">{`import "${P}/styles.css";`}</Code>
      <p>{tr("Parts with their own look have their own stylesheet. Import only the ones you use:", "الأجزاء التي لها شكل خاص لها ملف أنماط خاص. استورد فقط ما تستخدمه:")}</p>
      <Code lang="jsx">{`import "${P}/charts/styles.css";
import "${P}/voice/styles.css";
import "${P}/os/styles.css";
import "${P}/crm/styles.css";
import "${P}/widget/styles.css";`}</Code>
      <H2 id="fonts">{tr("Load the fonts", "حمّل الخطوط")}</H2>
      <p>{tr("The four brand fonts come with the package: Poppins and DM Sans for English, Alexandria and IBM Plex Sans Arabic for Arabic. Import them once, before the styles. Your app serves them itself, with no request to Google.", "الخطوط الأربعة تأتي مع الحزمة: ‏Poppins و DM Sans للإنجليزية، و Alexandria و IBM Plex Sans Arabic للعربية. استوردها مرة واحدة قبل الأنماط، وسيقدّمها تطبيقك بنفسه دون أي طلب إلى Google.")}</p>
      <Code lang="jsx" title="main.jsx">{`import "${P}/fonts.css";
import "${P}/styles.css";`}</Code>
      <Note>{tr("A page downloads only the files its text needs: the English faces for English text, the Arabic faces when Arabic appears. All four are under the SIL Open Font License, included in the package.", "تحمّل الصفحة فقط الملفات التي يحتاجها نصها: الخطوط الإنجليزية للنص الإنجليزي، والعربية عند ظهور نص عربي. والأربعة برخصة SIL Open Font المرفقة مع الحزمة.")}</Note>
      <H2 id="first-component">{tr("Your first component", "أول مكوّن")}</H2>
      <Code lang="jsx" title="SignUp.jsx">{`import { Button, TextField, PhoneField } from "${P}";

export function SignUp() {
  return (
    <form>
      <TextField label="Name" />
      <PhoneField label="Mobile" defaultCountry="EG" />
      <Button type="submit">Create account</Button>
    </form>
  );
}`}</Code>
      <Note>{tr("Heavy parts (charts, maps, the waveform player) live behind their own import path, and unused components are removed by your bundler. An app that only uses Button doesn't ship charts.", "الأجزاء الثقيلة (الرسوم البيانية والخرائط ومشغل الصوت) لها مسار استيراد خاص، وتحذف أداة التجميع المكونات غير المستخدمة. فالتطبيق الذي يستخدم الزر فقط لا يحمّل الرسوم البيانية.")}</Note>
    </>
  );
}
Installation.sections = [["requirements", "Requirements", "المتطلبات"], ["install", "Install", "التثبيت"], ["styles", "Add the styles", "أضف الأنماط"], ["fonts", "Load the fonts", "حمّل الخطوط"], ["first-component", "Your first component", "أول مكوّن"]];

/* ---------- Next.js ---------- */
function NextGuide() {
  const { tr } = useSite();
  return (
    <>
      <p className="dx-lead">{tr("Every component is a client component (\"use client\" is built in), so you can use them directly in Server Component pages.", "كل مكوّن هو مكوّن عميل (\"use client\" مدمج)، لذا يمكنك استخدامه مباشرة داخل صفحات Server Components.")}</p>
      <H2 id="layout">{tr("Root layout", "التخطيط الجذري")}</H2>
      <p>{tr("Load the fonts and styles once in the root layout. Both come with the package.", "حمّل الخطوط والأنماط مرة واحدة في التخطيط الجذري، وكلاهما يأتي مع الحزمة.")}</p>
      <Code lang="jsx" title="app/layout.jsx">{`import "${P}/fonts.css";
import "${P}/styles.css";
import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <Providers locale="en-US">{children}</Providers>
      </body>
    </html>
  );
}`}</Code>
      <H2 id="providers">{tr("Providers", "المزوّدات")}</H2>
      <p>{rich(tr("One small client component sets the language for every component and makes links (`href`) navigate with the Next.js router.", "مكوّن عميل صغير يحدد اللغة لكل المكونات ويجعل الروابط (`href`) تنتقل عبر موجّه Next.js."))}</p>
      <Code lang="jsx" title="app/providers.jsx">{`"use client";
import { useRouter } from "next/navigation";
import { I18nProvider } from "react-aria-components";
import { RouterProvider, ToastRegion } from "${P}";

export function Providers({ locale, children }) {
  const router = useRouter();
  return (
    <I18nProvider locale={locale}>
      <RouterProvider navigate={router.push}>
        {children}
        <ToastRegion />
      </RouterProvider>
    </I18nProvider>
  );
}`}</Code>
      <H2 id="arabic">{tr("Arabic pages", "الصفحات العربية")}</H2>
      <p>{rich(tr("For Arabic, render `<html lang=\"ar\" dir=\"rtl\">` and pass `locale=\"ar-EG\"` (or your country, like `ar-SA`). A common setup is one root layout per language, for example `app/(en)/layout.jsx` and `app/(ar)/layout.jsx`.", "للعربية، اكتب `<html lang=\"ar\" dir=\"rtl\">` ومرّر `locale=\"ar-EG\"` (أو دولتك مثل `ar-SA`). من الشائع استخدام تخطيط جذري لكل لغة، مثل `app/(en)/layout.jsx` و `app/(ar)/layout.jsx`."))}</p>
      <H2 id="pages-router">{tr("Pages Router", "Pages Router")}</H2>
      <p>{rich(tr("Import the styles in `pages/_app.jsx` and wrap the page in the same providers, using `useRouter` from `next/router`.", "استورد الأنماط في `pages/_app.jsx` وغلّف الصفحة بنفس المزوّدات، مع `useRouter` من `next/router`."))}</p>
    </>
  );
}
NextGuide.sections = [["layout", "Root layout", "التخطيط الجذري"], ["providers", "Providers", "المزوّدات"], ["arabic", "Arabic pages", "الصفحات العربية"], ["pages-router", "Pages Router", "Pages Router"]];

/* ---------- Themes and tokens ---------- */
function Theming() {
  const { tr } = useSite();
  return (
    <>
      <p className="dx-lead">{tr("Light and dark are built in. Every colour, font, space and radius is a design token you can read in CSS or JavaScript.", "الوضعان الفاتح والداكن مدمجان. وكل لون وخط ومسافة وحافة هو رمز تصميم يمكنك قراءته في CSS أو JavaScript.")}</p>
      <H2 id="dark-mode">{tr("Light and dark", "الفاتح والداكن")}</H2>
      <p>{rich(tr("Dark follows the device setting. To choose a theme yourself, set `data-theme` on the root element.", "الوضع الداكن يتبع إعداد الجهاز. ولاختيار وضع بنفسك، اضبط `data-theme` على العنصر الجذري."))}</p>
      <Code lang="html">{`<html data-theme="dark">   <!-- or "light"; leave it out to follow the device -->`}</Code>
      <H2 id="tokens">{tr("Using tokens", "استخدام الرموز")}</H2>
      <p>{tr("Use the CSS variables in your own styles, so your screens change with the theme:", "استخدم متغيرات CSS في أنماطك، لتتغير شاشاتك مع الوضع:")}</p>
      <Code lang="css">{`.panel {
  background: var(--surface);
  color: var(--ink);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  font-family: var(--font-body);
}`}</Code>
      <Table head={[tr("Token", "الرمز"), tr("Use it for", "يُستخدم في")]} rows={[
        ["`--surface`, `--surface-alt`, `--surface-raised`", tr("Page, panels and raised cards", "الصفحة واللوحات والبطاقات المرتفعة")],
        ["`--ink`, `--ink-muted`", tr("Text and secondary text", "النص والنص الثانوي")],
        ["`--primary`, `--on-primary`", tr("Main actions and the text on them", "الإجراءات الرئيسية والنص فوقها")],
        ["`--accent`", tr("Links, highlights and the current page", "الروابط والتمييز والصفحة الحالية")],
        ["`--border`, `--border-strong`, `--focus-ring`", tr("Lines, field borders and focus", "الخطوط وحدود الحقول والتركيز")],
        ["`--success`, `--danger`", tr("Status", "الحالة")],
        ["`--space-*`, `--radius-*`, `--shadow-card`", tr("Spacing, corners and depth", "المسافات والحواف والعمق")],
        ["`--font-display`, `--font-body`", tr("Headings and body text", "العناوين والنص")],
      ]} />
      <p>{tr("The same values are available in JavaScript, for charts or native code:", "القيم نفسها متاحة في JavaScript، للرسوم البيانية أو التطبيقات الأصلية:")}</p>
      <Code lang="js">{`import { light, dark } from "${P}/tokens";

light.primary; // "#001250"`}</Code>
      <H2 id="fonts">{tr("Fonts", "الخطوط")}</H2>
      <p>{rich(tr("By default, headings use Poppins and body text uses DM Sans, with Alexandria and IBM Plex Sans Arabic for Arabic. They come with the package in `fonts.css`. To use your own fonts, load them the way you like, leave out `fonts.css`, and set the two font tokens after `styles.css`:", "افتراضيًا، العناوين بخط Poppins والنص بخط DM Sans، ومعهما Alexandria و IBM Plex Sans Arabic للعربية، وكلها تأتي مع الحزمة في `fonts.css`. لاستخدام خطوطك، حمّلها بالطريقة التي تفضلها، ولا تستورد `fonts.css`، ثم اضبط رمزي الخطوط بعد `styles.css`:"))}</p>
      <Code lang="css" title="app.css">{`:root {
  --font-display: "Inter", "Noto Kufi Arabic", "Helvetica Neue", Arial, sans-serif;
  --font-body: "Inter", "Noto Sans Arabic", "Helvetica Neue", Arial, sans-serif;
}`}</Code>
      <Note>{tr("Keep an Arabic font second in each list. The browser uses the first font that has each letter, so English and Arabic text each get the right one.", "اترك خطًا عربيًا في المرتبة الثانية في كل قائمة. يستخدم المتصفح أول خط يحتوي على الحرف، فيحصل كل من النص الإنجليزي والعربي على خطه المناسب.")}</Note>
      <p>{rich(tr("To change fonts for one brand only, put the same lines under `:root[data-brand=\"<name>\"]`.", "لتغيير الخطوط لعلامة تجارية واحدة فقط، ضع الأسطر نفسها تحت `:root[data-brand=\"<name>\"]`."))}</p>
      <H2 id="brands">{tr("Brands", "العلامات التجارية")}</H2>
      <p>{rich(tr("Truvar is the default brand. Another brand is a small file of token overrides: set `data-brand=\"<name>\"` on the root element for its colours in both themes, and wrap the app in `BrandProvider` so `Logo` draws its mark.", "Truvar هي العلامة الافتراضية. وأي علامة أخرى هي ملف صغير يغيّر بعض الرموز: اضبط `data-brand=\"<name>\"` على العنصر الجذري لتحصل على ألوانها في الوضعين، وغلّف التطبيق بـ `BrandProvider` ليرسم `Logo` شعارها."))}</p>
    </>
  );
}
Theming.sections = [["dark-mode", "Light and dark", "الفاتح والداكن"], ["tokens", "Using tokens", "استخدام الرموز"], ["fonts", "Fonts", "الخطوط"], ["brands", "Brands", "العلامات التجارية"]];

/* ---------- Arabic and RTL ---------- */
function Rtl() {
  const { tr } = useSite();
  return (
    <>
      <p className="dx-lead">{tr("Arabic isn't a translation layer on top. Every component is designed and tested in both directions.", "العربية ليست طبقة ترجمة إضافية. كل مكوّن مصمم ومختبر في الاتجاهين.")}</p>
      <H2 id="setup">{tr("Setup", "الإعداد")}</H2>
      <ol className="dx-list">
        <li>{rich(tr("Set `<html lang=\"ar\" dir=\"rtl\">`.", "اضبط `<html lang=\"ar\" dir=\"rtl\">`."))}</li>
        <li>{rich(tr("Wrap the app in React Aria's `<I18nProvider locale=\"ar-EG\">`.", "غلّف التطبيق بـ `<I18nProvider locale=\"ar-EG\">` من React Aria."))}</li>
      </ol>
      <Code lang="jsx">{`import { I18nProvider } from "react-aria-components";

<I18nProvider locale="ar-EG">
  <App />
</I18nProvider>`}</Code>
      <H2 id="what-mirrors">{tr("What changes", "ما الذي يتغير")}</H2>
      <ul className="dx-list">
        <li>{tr("Layout: components use logical CSS properties (start and end, not left and right), so there's no separate RTL stylesheet.", "التخطيط: المكونات تستخدم خصائص CSS منطقية (البداية والنهاية بدل اليسار واليمين)، فلا حاجة لملف أنماط منفصل.")}</li>
        <li>{tr("Keyboard: arrow keys follow reading direction in menus, tabs, sliders and calendars.", "لوحة المفاتيح: الأسهم تتبع اتجاه القراءة في القوائم والتبويبات وأشرطة التمرير والتقويم.")}</li>
        <li>{tr("Dates and numbers: calendars, the first day of the week, weekends, date order and digits follow the locale.", "التواريخ والأرقام: التقويم وأول أيام الأسبوع والعطلات وترتيب التاريخ والأرقام تتبع اللغة.")}</li>
        <li>{tr("Built-in text: labels like Cancel, Close and Search come in both languages.", "النصوص المدمجة: مثل إلغاء وإغلاق وبحث تأتي باللغتين.")}</li>
      </ul>
      <H2 id="fonts-ar">{tr("Fonts", "الخطوط")}</H2>
      <p>{tr("The font tokens list the English face first and the Arabic face second, so mixed text picks the right font for each letter automatically. Arabic headings are slightly smaller and body text slightly larger, because Arabic letters read smaller at the same size.", "رموز الخطوط تضع الخط الإنجليزي أولًا ثم العربي، فيختار النص المختلط الخط المناسب لكل حرف تلقائيًا. العناوين العربية أصغر قليلًا والنص أكبر قليلًا، لأن الحروف العربية تبدو أصغر بنفس المقاس.")}</p>
      <H2 id="ltr-islands">{tr("Left-to-right islands", "أجزاء من اليسار لليمين")}</H2>
      <p>{rich(tr("Phone numbers, code, email addresses and IDs stay left to right inside Arabic text. The phone and code components handle this for you; for your own content, add `dir=\"ltr\"`.", "أرقام الهواتف والأكواد والبريد الإلكتروني والمعرّفات تبقى من اليسار لليمين داخل النص العربي. مكونات الهاتف والكود تتعامل مع ذلك تلقائيًا، ولمحتواك أضف `dir=\"ltr\"`."))}</p>
    </>
  );
}
Rtl.sections = [["setup", "Setup", "الإعداد"], ["what-mirrors", "What changes", "ما الذي يتغير"], ["fonts-ar", "Fonts", "الخطوط"], ["ltr-islands", "Left-to-right islands", "أجزاء من اليسار لليمين"]];

/* ---------- Phones and touch ---------- */
function Mobile() {
  const { tr } = useSite();
  return (
    <>
      <p className="dx-lead">{tr("The stylesheet makes every component feel native on phones and correct with a mouse.", "ملف الأنماط يجعل كل مكوّن يبدو أصليًا على الهاتف وصحيحًا مع الفأرة.")}</p>
      <H2 id="viewport">{tr("Viewport", "منفذ العرض")}</H2>
      <p>{tr("Let the page reach behind the notch and the home indicator; components keep their content clear of them.", "اسمح للصفحة بالوصول خلف النتوء ومؤشر الشاشة الرئيسية، والمكونات تُبقي محتواها بعيدًا عنهما.")}</p>
      <Code lang="html">{`<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />`}</Code>
      <H2 id="built-in">{tr("Built in", "مدمج")}</H2>
      <ul className="dx-list">
        <li><b>{tr("No tap flash.", "بدون وميض عند اللمس.")}</b> {tr("No grey box when you tap, and no stuck hover after a tap.", "لا مربع رمادي عند اللمس، ولا تأثير تمرير عالق بعده.")}</li>
        <li><b>{tr("Pressed feedback.", "استجابة عند الضغط.")}</b> {tr("Buttons, tabs and list items dim or shrink slightly while pressed.", "الأزرار والتبويبات وعناصر القوائم تخفت أو تصغر قليلًا أثناء الضغط.")}</li>
        <li><b>{tr("Finger-sized targets.", "أهداف بحجم الإصبع.")}</b> {tr("Small buttons get a 44px touch area without changing the layout.", "الأزرار الصغيرة تحصل على مساحة لمس ٤٤ بكسل دون تغيير التخطيط.")}</li>
        <li><b>{tr("No zoom on focus.", "بدون تكبير عند الكتابة.")}</b> {tr("Fields use 16px text, so iPhone doesn't zoom in.", "الحقول تستخدم نصًا بمقاس ١٦ بكسل، فلا يكبّر iPhone الصفحة.")}</li>
      </ul>
      <H2 id="patterns">{tr("Phone patterns", "أنماط الهاتف")}</H2>
      <Table head={[tr("Component", "المكوّن"), tr("What it does", "ما يفعله")]} rows={[
        ["`BottomNav`", tr("The tab bar: 3 to 5 tabs above the home indicator.", "شريط التبويب: من ٣ إلى ٥ تبويبات فوق مؤشر الشاشة الرئيسية.")],
        ["`Sheet`", tr("Bottom sheets with swipe to close and snap points.", "أوراق سفلية تُغلق بالسحب ولها نقاط توقف.")],
        ["`PushLayout`", tr("A side menu that slides the whole app aside.", "قائمة جانبية تزيح التطبيق كله جانبًا.")],
        ["`useHideOnScroll`", tr("Hides bars while scrolling down and brings them back on scroll up.", "يخفي الأشرطة أثناء التمرير لأسفل ويعيدها عند التمرير لأعلى.")],
        ["`useSystemBars`", tr("The phone's status bar follows the page and dims with open sheets.", "شريط حالة الهاتف يتبع الصفحة ويخفت مع الأوراق المفتوحة.")],
      ]} />
      <p><DocLink id="navigation">{tr("See bottom navigation and sheets in action", "شاهد شريط التنقل والأوراق السفلية")}</DocLink></p>
    </>
  );
}
Mobile.sections = [["viewport", "Viewport", "منفذ العرض"], ["built-in", "Built in", "مدمج"], ["patterns", "Phone patterns", "أنماط الهاتف"]];

/* ---------- Cursors ----------
   The files come from packages/cursors (`pnpm cursors:build`), which also writes cursors.json. */
// "1.3 MB" stays on one line and left to right inside Arabic text
const MB = (bytes) => `\u2066${(bytes / 1048576).toFixed(1)}\u00a0MB\u2069`;
const OS_ICON = {
  windows: "M3 3h8.5v8.5H3zM12.5 3H21v8.5h-8.5zM3 12.5h8.5V21H3zM12.5 12.5H21V21h-8.5z",
  linux: siLinux.path,
  macos: siApple.path,
};
const OsIcon = ({ os }) => <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor"><path d={OS_ICON[os]} /></svg>;

// The visitor's computer, once the page runs in the browser. Phones and tablets have no pointer to change.
function useDesktopOS() {
  const [os, setOs] = useState(null);
  useEffect(() => {
    const ua = `${navigator.userAgentData?.platform ?? ""} ${navigator.userAgent}`.toLowerCase();
    if (/android|iphone|ipad/.test(ua)) return;
    setOs(/win/.test(ua) ? "windows" : /mac/.test(ua) ? "macos" : /linux|x11|cros/.test(ua) ? "linux" : null);
  }, []);
  return os;
}

// Every cursor in the chosen colour. Pointing at a tile turns the page's pointer into that cursor.
function CursorPreview() {
  const { tr, lang } = useSite();
  const [palette, setPalette] = useState("blue");
  const name = (c) => c.label[lang === "ar" ? 1 : 0];
  return (
    <div className="dx-cursors">
      <div className="dx-cursors-bar">
        <span className="dx-cursors-hint">{tr("Point at a cursor to try it.", "مرّر الفأرة على أي مؤشر لتجربته.")}</span>
        <SegmentedControl aria-label={tr("Colour", "اللون")} value={palette} onChange={setPalette}
          options={[{ id: "blue", label: tr("Blue", "الأزرق") }, { id: "gold", label: tr("Gold", "الذهبي") }, { id: "duo", label: tr("Duo", "ثنائي") }]} />
      </div>
      <ul className="dx-cursors-grid">
        {CURSORS.cursors.map((c) => {
          const base = `/cursors/${palette}/${c.id}`;
          return (
            <li key={c.id} className="dx-cursor" style={{ cursor: `url(${base}-32.png) ${Math.round(c.hotspot[0])} ${Math.round(c.hotspot[1])}, auto` }}>
              {c.frames > 1
                ? <span className="dx-cursor-anim" role="img" aria-label={name(c)} style={{ backgroundImage: `url(${base}-strip.png)`, "--frames": c.frames }} />
                : <img src={`${base}.png`} width="64" height="64" alt="" />}
              <span className="dx-cursor-name">{name(c)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DownloadCard({ os, title, detail, recommended, children }) {
  const { tr } = useSite();
  return (
    <div className="dx-download" data-recommended={recommended || undefined}>
      <span className="dx-download-icon"><OsIcon os={os} /></span>
      <div className="dx-download-text">
        <div className="dx-download-head">
          <b>{title}</b>
          {recommended && <Badge tone="success">{tr("Your computer", "جهازك")}</Badge>}
        </div>
        <p>{detail}</p>
      </div>
      {children}
    </div>
  );
}

function Cursors() {
  const { tr } = useSite();
  const os = useDesktopOS();
  // Duo shows both colours: the fill and its gold band
  const swatch = (k) => <span className="dx-swatch" style={{ background: CURSORS.palettes[k].fill, ...(k === "duo" && { boxShadow: `0 0 0 2px ${CURSORS.palettes[k].accent}, 0 0 0 3px var(--border)` }) }} aria-hidden="true" />;
  const n = CURSORS.cursors.length;
  return (
    <>
      <p className="dx-lead">{tr("The Truvar OS mouse cursors for your own computer, free: Truvar Blue, Truvar Gold, or Truvar Duo with both colours, in solid shapes with the orbit as the loading animation.", "مؤشرات فأرة Truvar OS لجهازك مجانًا: بالأزرق أو الذهبي أو الثنائي باللونين معًا، بأشكال مصمتة والمدار كحركة التحميل.")}</p>
      <H2 id="preview">{tr("Preview", "معاينة")}</H2>
      <CursorPreview />
      <p>{tr(`${n} cursors in each of the three colours, sharp at every size from 24 to 256 pixels. Busy and Working in background turn like the OrbitLoader.`, `${n} مؤشرًا بكل لون من الألوان الثلاثة، واضحة بكل المقاسات من ٢٤ إلى ٢٥٦ بكسل. ومؤشرا مشغول ويعمل في الخلفية يدوران مثل OrbitLoader.`)}</p>

      <H2 id="download">{tr("Download", "التنزيل")}</H2>
      <div className="dx-downloads">
        <DownloadCard os="windows" title="Windows" recommended={os === "windows"}
          detail={tr(`Windows 10 and 11 · all three colours · ${MB(CURSORS.downloads.windows)}`, `Windows 10 و 11 · الألوان الثلاثة · ${MB(CURSORS.downloads.windows)}`)}>
          <a className="tv-btn tv-btn--primary site-btnlink" href="/downloads/truvar-cursors-windows.zip" download><Icon.Download />{tr("Download for Windows", "تنزيل لـ Windows")}</a>
        </DownloadCard>
        <DownloadCard os="linux" title="Linux" recommended={os === "linux"}
          detail={tr(`GNOME, KDE Plasma and other desktops · all three colours · ${MB(CURSORS.downloads.linux)}`, `GNOME و KDE Plasma وغيرها · الألوان الثلاثة · ${MB(CURSORS.downloads.linux)}`)}>
          <a className="tv-btn tv-btn--primary site-btnlink" href="/downloads/truvar-cursors-linux.zip" download><Icon.Download />{tr("Download for Linux", "تنزيل لـ Linux")}</a>
        </DownloadCard>
        <DownloadCard os="macos" title="macOS" recommended={os === "macos"}
          detail={tr("Nothing to download: give the pointer the Truvar colours in System Settings.", "لا يوجد ما تنزّله: لوّن المؤشر بألوان Truvar من إعدادات النظام.")}>
          <a className="tv-btn tv-btn--secondary site-btnlink" href="#macos">{tr("Set up on a Mac", "الإعداد على Mac")}</a>
        </DownloadCard>
      </div>

      <H2 id="windows">{tr("Install on Windows", "التثبيت على Windows")}</H2>
      <ol className="dx-list">
        <li>{tr("Unzip the download and open the folder of the colour you want: Truvar Blue, Truvar Gold or Truvar Duo.", "فك ضغط الملف وافتح مجلد اللون الذي تريده: Truvar Blue أو Truvar Gold أو Truvar Duo.")}</li>
        <li>{rich(tr("Right-click `install.inf` and choose Install. On Windows 11, choose Show more options first. Windows asks for permission, because the files go into the Windows folder.", "انقر بالزر الأيمن على `install.inf` واختر Install. في Windows 11 اختر Show more options أولًا. سيطلب Windows الإذن، لأن الملفات تُنسخ إلى مجلد Windows."))}</li>
        <li>{rich(tr("Open Settings › Bluetooth & devices › Mouse › Additional mouse settings, then the Pointers tab. Or press Windows + R, type `main.cpl ,,1` and press Enter.", "افتح الإعدادات › Bluetooth والأجهزة › الماوس › إعدادات الماوس الإضافية، ثم تبويب المؤشرات. أو اضغط Windows + R واكتب `main.cpl ,,1` ثم Enter."))}</li>
        <li>{tr("Under Scheme, choose Truvar Blue, Truvar Gold or Truvar Duo, and press OK.", "من قائمة النظام (Scheme) اختر Truvar Blue أو Truvar Gold أو Truvar Duo، ثم اضغط موافق.")}</li>
      </ol>
      <Note>{tr("For bigger cursors: Settings › Accessibility › Mouse pointer and touch › Size. To go back, choose Windows Default in the same Pointers tab.", "لمؤشرات أكبر: الإعدادات › تسهيل الاستخدام › مؤشر الماوس واللمس › الحجم. وللرجوع اختر Windows Default من تبويب المؤشرات نفسه.")}</Note>

      <H2 id="linux">{tr("Install on Linux", "التثبيت على Linux")}</H2>
      <p>{tr("In the folder you downloaded to, run:", "في المجلد الذي نزّلت فيه الملف، شغّل:")}</p>
      <Command>unzip truvar-cursors-linux.zip -d truvar-cursors && sh truvar-cursors/install.sh</Command>
      <p>{rich(tr("It installs all three colours for your user and turns on Truvar Blue in GNOME and KDE Plasma. Add `gold` or `duo` at the end for Truvar Gold or Truvar Duo. It doesn't need administrator rights.", "يثبّت الألوان الثلاثة لحسابك ويفعّل Truvar Blue في GNOME و KDE Plasma. أضف `gold` أو `duo` في النهاية للذهبي أو الثنائي. ولا يحتاج صلاحيات المسؤول."))}</p>
      <Table head={[tr("Desktop", "سطح المكتب"), tr("Where to choose the cursor", "مكان اختيار المؤشر")]} rows={[
        ["GNOME", tr("Settings › Appearance, or GNOME Tweaks › Appearance › Cursor", "الإعدادات › المظهر، أو GNOME Tweaks › Appearance › Cursor")],
        ["KDE Plasma", tr("System Settings › Colors & Themes › Cursors", "إعدادات النظام › الألوان والسمات › المؤشرات")],
        [tr("Others", "غيرها"), tr("Your desktop's appearance settings", "إعدادات المظهر في سطح المكتب")],
      ]} />
      <Note>{tr("If an app still shows the old cursor, log out and back in.", "إذا بقي تطبيق يعرض المؤشر القديم، سجّل الخروج ثم الدخول مرة أخرى.")}</Note>

      <H2 id="macos">macOS</H2>
      <p>{tr("macOS doesn't allow other cursor shapes, so on a Mac you use Apple's own setting to give the pointer the Truvar colours: a fill and an outline from the table below. It works on macOS 12 Monterey and later.", "لا يسمح macOS بتغيير شكل المؤشرات، لذلك على Mac تستخدم إعداد Apple نفسه لتلوين المؤشر بألوان Truvar: تعبئة وإطار من الجدول التالي. ويعمل على macOS 12 Monterey وما بعده.")}</p>
      <ol className="dx-list">
        <li>{tr("Open System Settings › Accessibility › Display, and scroll to Pointer.", "افتح إعدادات النظام › تسهيلات الاستخدام › شاشة العرض، ثم انزل إلى المؤشر.")}</li>
        <li>{tr("Click Pointer outline colour and set the outline from the table. For Blue and Gold it's the same as the fill, so the pointer is one solid colour.", "اضغط لون إطار المؤشر واضبط الإطار من الجدول. في الأزرق والذهبي هو نفس لون التعبئة، فيصبح المؤشر بلون واحد مصمت.")}</li>
        <li>{tr("Click Pointer fill colour and set the fill from the table.", "اضغط لون تعبئة المؤشر واضبط التعبئة من الجدول.")}</li>
        <li>{tr("To type a colour: in the colour window, open the sliders tab, choose RGB Sliders, and type it into Hex Colour.", "لكتابة اللون: في نافذة الألوان افتح تبويب أشرطة التمرير، واختر RGB Sliders، واكتبه في خانة Hex Colour.")}</li>
        <li>{tr("Optional: make it bigger with Pointer size.", "اختياري: كبّره من حجم المؤشر.")}</li>
      </ol>
      <Table head={[tr("Colour", "اللون"), tr("Fill", "التعبئة"), tr("Outline", "الإطار")]} rows={[
        [<span className="dx-swatch-row" key="b">{swatch("blue")}Truvar Blue</span>, "`001250`", "`001250`"],
        [<span className="dx-swatch-row" key="g">{swatch("gold")}Truvar Gold</span>, "`E0B96A`", "`E0B96A`"],
        [<span className="dx-swatch-row" key="d">{swatch("duo")}Truvar Duo</span>, "`001250`", "`E0B96A`"],
      ]} />
      <Note>{tr("On a Mac the shapes and the spinning loading indicator stay Apple's; only their colours change. Reset puts the default colours back.", "على Mac تبقى الأشكال ومؤشر التحميل الدوار كما صممتها Apple، ويتغير لونها فقط. وزر إعادة التعيين يعيد الألوان الأصلية.")}</Note>
    </>
  );
}
Cursors.sections = [["preview", "Preview", "معاينة"], ["download", "Download", "التنزيل"], ["windows", "Windows", "Windows"], ["linux", "Linux", "Linux"], ["macos", "macOS", "macOS"]];

export const GUIDES = { "": Introduction, installation: Installation, nextjs: NextGuide, theming: Theming, rtl: Rtl, mobile: Mobile, cursors: Cursors };
