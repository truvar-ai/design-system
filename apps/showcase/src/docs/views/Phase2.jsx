"use client";
// Demos for the phase 2 components. Each export is a <Spec> placed on the matching docs page.
import { useState } from "react";
import { today, getLocalTimeZone } from "@internationalized/date";
import * as RAC from "react-aria-components";
import {
  Sheet, PromptEditor, TokenFieldValue, SwitchRow, CheckboxRow, RadioRow, CalendarWithPickers, MultiSelect, MultiComboBox,
  LoadMoreIndicator, NavTree, Kbd, PreviewCard, Virtualizer, ListLayout, GridLayout, WaterfallLayout, TableLayout,
  Collection, RouterProvider, ListBoxLoadMoreItem, TableLoadMoreItem, GridListSection, GridListHeader, TableFooter,
  Button, Badge, Avatar, Link, Table, TableHeader, Column, TableBody, Row, Cell, GridListItem, TextField, Select, Item,
  toast, useFormat, Checkbox,
} from "../../ds.js";
import * as Icon from "@truvar-ai/design-system/icons";
import { useTr, useLang } from "../i18n.jsx";
import { Spec } from "../ui.jsx";
import { CONTACTS, OWNERS, STAGES, stageOf, ownerOf } from "../data.js";

const useL = () => { const lang = useLang(); return (o) => (lang === "ar" ? o.ar : o.en); };

/* ---------------- Forms ---------------- */
export function SettingRowsSpec() {
  const tr = useTr();
  return (
    <Spec id="setting-rows" name={tr("Setting rows", "صفوف الإعدادات")} primitive="SwitchField, CheckboxField, RadioField"
      note={tr("A label plus a description, with the whole row clickable. The description is announced with the control.", "عنوان ووصف، والصف كله قابل للضغط. يُقرأ الوصف مع عنصر التحكم.")}>
      <div className="stack">
        <div className="tv-settings">
          <SwitchRow icon={<Icon.Bell />} defaultSelected label={tr("Call summaries", "ملخصات المكالمات")} description={tr("Email a summary to the deal owner after every call.", "إرسال ملخص إلى مسؤول الصفقة بعد كل مكالمة.")} />
          <SwitchRow icon={<Icon.Phone />} label={tr("Record calls", "تسجيل المكالمات")} description={tr("Callers hear a short notice before recording starts.", "يسمع المتصل تنبيهًا قصيرًا قبل بدء التسجيل.")} />
          <SwitchRow icon={<Icon.Globe />} isDisabled label={tr("Data outside Egypt", "البيانات خارج مصر")} description={tr("Locked by your workspace admin.", "مقفل من مسؤول مساحة العمل.")} />
        </div>
        <div className="tv-settings">
          <CheckboxRow defaultSelected label={tr("Mask card numbers in transcripts", "إخفاء أرقام البطاقات في النصوص")} description={tr("Digits are replaced before anything is stored.", "تُستبدل الأرقام قبل حفظ أي شيء.")} />
          <CheckboxRow isRequired label={tr("I confirm callers are told about recording", "أؤكد إبلاغ المتصلين بالتسجيل")} description={tr("Required in many countries.", "مطلوب في كثير من الدول.")} />
        </div>
        <RAC.RadioGroup defaultValue="balanced" aria-label={tr("Voice speed", "سرعة الصوت")} className="tv-settings">
          <RadioRow value="calm" label={tr("Calm", "هادئ")} description={tr("Slower speech for older callers.", "كلام أبطأ لكبار السن.")} />
          <RadioRow value="balanced" label={tr("Balanced", "متوازن")} description={tr("Recommended for most calls.", "مُوصى به لمعظم المكالمات.")} />
          <RadioRow value="brisk" label={tr("Brisk", "سريع")} description={tr("Quicker answers for busy teams.", "إجابات أسرع للفرق المشغولة.")} />
        </RAC.RadioGroup>
      </div>
    </Spec>
  );
}

const VARS = [
  { id: "first_name", label: { en: "First name", ar: "الاسم الأول" }, example: { en: "Nadia", ar: "نادية" } },
  { id: "company", label: { en: "Company", ar: "الشركة" }, example: { en: "Nile Foods", ar: "Nile Foods" } },
  { id: "agent", label: { en: "Agent name", ar: "اسم الوكيل" }, example: { en: "Taysir", ar: "تيسير" } },
  { id: "amount", label: { en: "Amount due", ar: "المبلغ المستحق" }, example: { en: "EGP 12,400", ar: "١٢٬٤٠٠ ج.م." } },
];
export function PromptEditorSpec() {
  const tr = useTr(); const lang = useLang();
  const L = useL();
  const initial = () => new TokenFieldValue(lang === "ar" ? [
    { type: "text", text: "مرحبًا " }, { type: "token", text: "الاسم الأول", value: "first_name" },
    { type: "text", text: "، معك " }, { type: "token", text: "اسم الوكيل", value: "agent" },
    { type: "text", text: " من " }, { type: "token", text: "الشركة", value: "company" },
    { type: "text", text: ". أتصل بخصوص فاتورتك المستحقة." },
  ] : [
    { type: "text", text: "Hi " }, { type: "token", text: "First name", value: "first_name" },
    { type: "text", text: ", this is " }, { type: "token", text: "Agent name", value: "agent" },
    { type: "text", text: " from " }, { type: "token", text: "Company", value: "company" },
    { type: "text", text: ". I'm calling about your open invoice." },
  ]);
  const [value, setValue] = useState(initial);
  const preview = value.segments.map((s) => s.type === "token" ? (L(VARS.find((v) => v.id === s.value)?.example ?? { en: s.text, ar: s.text })) : s.text).join("");
  return (
    <Spec id="prompt-editor" name={tr("Prompt editor", "محرر الأوامر")} primitive="TokenField + TokenInput + Token" wide
      note={tr("Text with inline variables, for agent greetings and prompts. Variables are single tokens: Backspace removes one whole, arrow keys step over it, copy and paste keep it.", "نص بمتغيرات داخلية لتحيات الوكيل وأوامره. كل متغير وحدة واحدة: مفتاح الحذف يزيله كاملًا، والأسهم تتخطاه، والنسخ واللصق يحافظان عليه.")}>
      <div className="stack">
        <PromptEditor label={tr("First message", "الرسالة الأولى")} variables={VARS} value={value} onChange={setValue}
          description={tr("Click where you want a variable, then use Insert variable.", "اضغط حيث تريد المتغير، ثم اختر «إدراج متغير».")} />
        <div className="prompt-preview">
          <span className="tv-desc">{tr("Preview with sample data", "معاينة ببيانات تجريبية")}</span>
          <p className="body" dir="auto" style={{ margin: 0 }}>{preview}</p>
        </div>
      </div>
    </Spec>
  );
}

/* ---------------- Dates ---------------- */
export function CalendarPickersSpec() {
  const tr = useTr();
  return (
    <Spec id="calendar-pickers" name={tr("Month and year pickers", "منتقي الشهر والسنة")} primitive="CalendarMonthPicker + CalendarYearPicker"
      note={tr("Jump straight to a month or year instead of clicking the arrows, useful for birth dates and contract history.", "انتقل مباشرة إلى شهر أو سنة بدلًا من الضغط على الأسهم، مفيد لتواريخ الميلاد وسجل العقود.")}>
      <CalendarWithPickers aria-label={tr("Contract signed", "تاريخ توقيع العقد")} defaultValue={today(getLocalTimeZone()).subtract({ years: 2 })} />
    </Spec>
  );
}

/* ---------------- Selection ---------------- */
const LANGS = [
  { id: "ar-eg", name: { en: "Egyptian Arabic", ar: "العربية المصرية" } }, { id: "ar-sa", name: { en: "Gulf Arabic", ar: "العربية الخليجية" } },
  { id: "ar-msa", name: { en: "Modern Standard Arabic", ar: "العربية الفصحى" } }, { id: "en", name: { en: "English", ar: "الإنجليزية" } },
  { id: "fr", name: { en: "French", ar: "الفرنسية" } }, { id: "de", name: { en: "German", ar: "الألمانية" } },
];
const TEAMS = [
  { id: "sales", name: { en: "Sales", ar: "المبيعات" } }, { id: "support", name: { en: "Support", ar: "الدعم" } },
  { id: "billing", name: { en: "Billing", ar: "الفوترة" } }, { id: "onboarding", name: { en: "Onboarding", ar: "التهيئة" } },
  { id: "retention", name: { en: "Retention", ar: "الاحتفاظ بالعملاء" } },
];
export function MultiSelectSpec() {
  const tr = useTr();
  return (
    <Spec id="multi-select" name={tr("Multi-select", "اختيار متعدد")} primitive={'Select / ComboBox selectionMode="multiple"'}
      note={tr("The list stays open while you pick. Chips show what's chosen; extra choices collapse into a count.", "تبقى القائمة مفتوحة أثناء الاختيار، وتعرض الشارات ما اخترته، وتُجمع الاختيارات الزائدة في عدد.")}>
      <div className="grid2">
        <MultiSelect label={tr("Languages the agent speaks", "اللغات التي يتحدثها الوكيل")} items={LANGS} defaultValue={["ar-eg", "en", "fr"]} placeholder={tr("Choose languages", "اختر اللغات")} />
        <MultiComboBox label={tr("Route calls to", "تحويل المكالمات إلى")} items={TEAMS} defaultValue={["sales"]} placeholder={tr("Search teams", "ابحث في الفرق")} />
      </div>
    </Spec>
  );
}

const ALL_LEADS = Array.from({ length: 120 }, (_, i) => {
  const c = CONTACTS[i % CONTACTS.length];
  return { id: i + 1, c, n: i + 1 };
});
export function InfiniteListSpec() {
  const tr = useTr(); const L = useL(); const f = useFormat();
  const [count, setCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const items = ALL_LEADS.slice(0, count);
  const more = () => {
    if (loading || count >= ALL_LEADS.length) return;
    setLoading(true);
    setTimeout(() => { setCount((c) => Math.min(c + 20, ALL_LEADS.length)); setLoading(false); }, 700);
  };
  return (
    <Spec id="infinite-list" name={tr("Infinite list", "قائمة لا نهائية")} primitive="ListBox + ListBoxLoadMoreItem"
      note={tr("The next page loads as you near the bottom. The loading row is announced, and the count updates.", "تُحمّل الصفحة التالية عند الاقتراب من الأسفل، ويُعلن صف التحميل ويتحدّث العدد.")}>
      <div className="stack">
        <span className="tv-desc" aria-live="polite">{tr(`${items.length} of ${ALL_LEADS.length} leads loaded`, `تم تحميل ${f.number(items.length)} من ${f.number(ALL_LEADS.length)} عميل`)}</span>
        <RAC.ListBox aria-label={tr("Leads", "العملاء المحتملون")} className="tv-listbox tv-listbox--card tv-scroll-list" selectionMode="single">
          <Collection items={items}>
            {(it) => (
              <RAC.ListBoxItem id={it.id} textValue={L(it.c)} className="tv-item">
                <Avatar name={L(it.c)} size={28} />
                <span className="gl-text"><b>{L(it.c)}</b><span className="tv-desc">{it.c.company}, {tr("lead", "عميل")} #{f.number(it.n)}</span></span>
              </RAC.ListBoxItem>
            )}
          </Collection>
          {count < ALL_LEADS.length && (
            <ListBoxLoadMoreItem onLoadMore={more} isLoading={loading} className="tv-loadmore-row">
              <LoadMoreIndicator label={tr("Loading more leads", "جارٍ تحميل المزيد")} />
            </ListBoxLoadMoreItem>
          )}
        </RAC.ListBox>
      </div>
    </Spec>
  );
}

export function GridSectionsSpec() {
  const tr = useTr(); const L = useL();
  const groups = STAGES.filter((s) => ["negotiation", "proposal", "qualified"].includes(s.id)).map((s) => ({ s, items: CONTACTS.filter((c) => c.stage === s.id) }));
  return (
    <Spec id="grid-sections" name={tr("Grouped list", "قائمة مجمعة")} primitive="GridList + GridListSection + GridListHeader"
      note={tr("Headers stay with their group and are announced, so people know which group a row belongs to.", "تبقى العناوين مع مجموعاتها وتُعلن، فيعرف الناس إلى أي مجموعة ينتمي كل صف.")}>
      <RAC.GridList aria-label={tr("Deals by stage", "الصفقات حسب المرحلة")} className="tv-gridlist" selectionMode="multiple">
        {groups.map(({ s, items }) => (
          <GridListSection key={s.id} id={s.id}>
            <GridListHeader className="tv-gl-head"><Badge tone={s.tone} dot>{L(s)}</Badge></GridListHeader>
            {items.map((c) => (
              <GridListItem key={c.id} id={`${s.id}-${c.id}`} textValue={L(c)}>
                <Avatar name={L(c)} size={28} />
                <span className="gl-text"><b>{L(c)}</b><span className="tv-desc">{c.company}</span></span>
              </GridListItem>
            ))}
          </GridListSection>
        ))}
      </RAC.GridList>
    </Spec>
  );
}

/* ---------------- Navigation ---------------- */
export function NavTreeSpec() {
  const tr = useTr();
  const [route, setRoute] = useState("/calls/today");
  const sections = [
    { id: "work", label: { en: "Workspace", ar: "مساحة العمل" }, items: [
      { id: "home", href: "/home", label: { en: "Home", ar: "الرئيسية" }, icon: <Icon.Home /> },
      { id: "calls", href: "/calls", label: { en: "Calls", ar: "المكالمات" }, icon: <Icon.Phone />, children: [
        { id: "calls-today", href: "/calls/today", label: { en: "Today", ar: "اليوم" }, badge: 14 },
        { id: "calls-missed", href: "/calls/missed", label: { en: "Missed", ar: "الفائتة" }, badge: 3 },
        { id: "calls-archive", href: "/calls/archive", label: { en: "Archive", ar: "الأرشيف" } },
      ] },
      { id: "agents", href: "/agents", label: { en: "Agents", ar: "الوكلاء" }, icon: <Icon.Users />, children: [
        { id: "agents-live", href: "/agents/live", label: { en: "Live", ar: "النشطة" } },
        { id: "agents-drafts", href: "/agents/drafts", label: { en: "Drafts", ar: "المسودات" } },
      ] },
    ] },
    { id: "insights", label: { en: "Insights", ar: "التحليلات" }, items: [
      { id: "reports", href: "/reports", label: { en: "Reports", ar: "التقارير" }, icon: <Icon.FileText /> },
      { id: "billing", href: "/billing", label: { en: "Billing", ar: "الفوترة" }, icon: <Icon.Kanban /> },
    ] },
  ];
  return (
    <Spec id="navigation-tree" name={tr("Navigation tree", "شجرة التنقل")} primitive="NavigationTree + RouterProvider"
      note={tr("App navigation with sections and nesting. The current page is marked, and its parent stays highlighted when collapsed. Links go through your router.", "تنقل للتطبيق بأقسام ومستويات. تُميَّز الصفحة الحالية، ويبقى القسم الأب مميزًا عند طيّه. الروابط تمر عبر موجّه التطبيق.")}>
      <div className="navtree-demo">
        <div className="navtree-frame">
          <RouterProvider navigate={setRoute}>
            <NavTree ariaLabel={tr("App navigation", "تنقل التطبيق")} selectedRoute={route} sections={sections} defaultExpandedKeys={["calls"]} />
          </RouterProvider>
        </div>
        <div className="navtree-route"><span className="tv-desc">{tr("Current route", "المسار الحالي")}</span><code dir="ltr">{route}</code></div>
      </div>
    </Spec>
  );
}

export function KeyboardSpec() {
  const tr = useTr();
  const rows = [
    [["⌘", "K"], tr("Search everything", "البحث في كل شيء")],
    [["G", "C"], tr("Go to calls", "الانتقال إلى المكالمات")],
    [["/"], tr("Ask the assistant", "اسأل المساعد")],
    [["⇧", "⌘", "E"], tr("Export the current view", "تصدير العرض الحالي")],
    [["Esc"], tr("Close a dialog or menu", "إغلاق نافذة أو قائمة")],
  ];
  return (
    <Spec id="keyboard" name={tr("Keyboard shortcuts", "اختصارات لوحة المفاتيح")} primitive="Keyboard (kbd)"
      note={tr("Shortcut labels for menus and help screens. Keys always read left to right, even in Arabic.", "تسميات الاختصارات للقوائم وشاشات المساعدة. المفاتيح تُقرأ دائمًا من اليسار لليمين حتى في العربية.")}>
      <div className="stack">
        <dl className="kbd-list">
          {rows.map(([keys, label], i) => (
            <div key={i} className="kbd-row"><dt>{label}</dt><dd dir="ltr">{keys.map((k, j) => <Kbd key={j}>{k}</Kbd>)}</dd></div>
          ))}
        </dl>
        <div><RAC.MenuTrigger>
          <Button variant="secondary">{tr("Menu with shortcuts", "قائمة بالاختصارات")}<Icon.ChevronDown /></Button>
          <RAC.Popover className="tv-popover" offset={6}>
            <RAC.Menu className="tv-listbox" onAction={(k) => toast({ tone: "info", title: String(k) })}>
              <RAC.MenuItem id="new" textValue="new" className="tv-item"><Icon.Plus />{tr("New agent", "وكيل جديد")}<Kbd>N</Kbd></RAC.MenuItem>
              <RAC.MenuItem id="dup" textValue="dup" className="tv-item"><Icon.Copy />{tr("Duplicate", "تكرار")}<Kbd>⌘D</Kbd></RAC.MenuItem>
              <RAC.MenuItem id="exp" textValue="exp" className="tv-item"><Icon.Download />{tr("Export", "تصدير")}<Kbd>⇧⌘E</Kbd></RAC.MenuItem>
            </RAC.Menu>
          </RAC.Popover>
        </RAC.MenuTrigger></div>
      </div>
    </Spec>
  );
}

export function PreviewSpec() {
  const tr = useTr(); const L = useL(); const f = useFormat();
  const c = CONTACTS[1]; const s = stageOf(c.stage);
  return (
    <Spec id="preview" name={tr("Hover preview", "معاينة عند المرور")} primitive="PreviewTrigger + Popover"
      note={tr("Hover or focus a link to see a summary without leaving the page. It opens after a short pause so it doesn't flash.", "مرّر المؤشر على رابط أو ركّز عليه لترى ملخصًا دون مغادرة الصفحة. يظهر بعد لحظة قصيرة كي لا يومض.")}>
      <p className="body" style={{ margin: 0 }}>
        {tr("Follow up with ", "تابع مع ")}
        <PreviewCard trigger={<Link href="#record-panel">{L(c)}</Link>}>
          <div className="stack" style={{ gap: 10 }}>
            <div className="tv-cell-person"><Avatar name={L(c)} size={40} /><span><b>{L(c)}</b><span className="tv-desc">{L({ en: c.titleEn, ar: c.titleAr })}, {c.company}</span></span></div>
            <div className="row" style={{ gap: 6 }}><Badge tone={s.tone} dot>{L(s)}</Badge><Badge tone="neutral">{f.money(c.value)}</Badge></div>
            <span className="tv-desc">{tr("Owner", "المسؤول")}: {L(ownerOf(c.owner))}, {tr("last activity", "آخر نشاط")} {f.relative(c.days)}</span>
          </div>
        </PreviewCard>
        {tr(" before Thursday.", " قبل الخميس.")}
      </p>
    </Spec>
  );
}

/* ---------------- Overlays ---------------- */
export function SheetSpec() {
  const tr = useTr(); const lang = useLang();
  const startLabel = lang === "ar" ? "ورقة من اليمين" : "Sheet from the left";
  return (
    <Spec id="sheet" name={tr("Sheet", "ورقة منزلقة")} primitive="SheetTrigger + SheetOverlay + Sheet"
      note={tr("Slides in from any edge and can be swiped away on touch screens. Snap points let a bottom sheet rest half open.", "تنزلق من أي حافة ويمكن سحبها للإغلاق على الشاشات اللمسية. نقاط التثبيت تسمح للورقة السفلية بالتوقف في منتصف الطريق.")}>
      <div className="row">
        <Sheet position="bottom" snapPoints={["50%", "100%"]} title={tr("Call options", "خيارات المكالمة")}
          trigger={<Button>{tr("Bottom sheet", "ورقة سفلية")}</Button>}
          footer={({ close }) => <><Button variant="ghost" onPress={close}>{tr("Cancel", "إلغاء")}</Button><Button onPress={() => { close(); toast({ tone: "success", title: tr("Call scheduled", "تمت جدولة المكالمة") }); }}>{tr("Schedule call", "جدولة المكالمة")}</Button></>}>
          <p className="tv-desc" style={{ margin: 0 }}>{tr("Drag the handle up to see everything, or down to close.", "اسحب المقبض لأعلى لرؤية كل شيء، أو لأسفل للإغلاق.")}</p>
          <Select label={tr("Agent", "الوكيل")} defaultSelectedKey="taysir" items={[{ id: "taysir", n: tr("Taysir (Egyptian Arabic)", "تيسير (عربي مصري)") }, { id: "nour", n: tr("Nour (English)", "نور (إنجليزي)") }]}>{(o) => <Item id={o.id}>{o.n}</Item>}</Select>
          <TextField label={tr("Reason for calling", "سبب الاتصال")} multiline defaultValue={tr("Confirm delivery date for the November order.", "تأكيد موعد التسليم لطلب نوفمبر.")} />
          <Checkbox defaultSelected>{tr("Send a text if they don't answer", "أرسل رسالة إذا لم يرد")}</Checkbox>
        </Sheet>
        <Sheet position="start" title={tr("Filters", "عوامل التصفية")} trigger={<Button variant="secondary">{startLabel}</Button>}>
          <Select label={tr("Stage", "المرحلة")} items={STAGES}>{(s) => <Item id={s.id}>{lang === "ar" ? s.ar : s.en}</Item>}</Select>
          <Checkbox>{tr("Only my contacts", "جهات اتصالي فقط")}</Checkbox>
        </Sheet>
        <Sheet position="center" title={tr("Quick note", "ملاحظة سريعة")} trigger={<Button variant="secondary">{tr("Centered", "في المنتصف")}</Button>}>
          <TextField label={tr("Note", "الملاحظة")} multiline autoFocus />
        </Sheet>
      </div>
    </Spec>
  );
}

/* ---------------- Tables ---------------- */
export function TableFooterSpec() {
  const tr = useTr(); const L = useL(); const f = useFormat();
  const rows = OWNERS.map((o) => {
    const mine = CONTACTS.filter((c) => c.owner === o.id);
    return { o, deals: mine.length, value: mine.reduce((a, c) => a + c.value, 0), won: mine.filter((c) => c.stage === "won").length };
  });
  const tot = rows.reduce((a, r) => ({ deals: a.deals + r.deals, value: a.value + r.value, won: a.won + r.won }), { deals: 0, value: 0, won: 0 });
  return (
    <Spec id="table-footer" name={tr("Totals row", "صف الإجماليات")} primitive="Table + TableFooter" wide
      note={tr("Totals sit in a real table footer, so screen readers announce them as a summary rather than another row of data.", "الإجماليات في تذييل جدول حقيقي، فتعلنها قارئات الشاشة كملخص وليس كصف بيانات آخر.")}>
      <div className="tv-table-scroll">
        <Table aria-label={tr("Pipeline by owner", "الصفقات حسب المسؤول")}>
          <TableHeader>
            <Column isRowHeader>{tr("Owner", "المسؤول")}</Column>
            <Column align="end">{tr("Deals", "الصفقات")}</Column>
            <Column align="end">{tr("Won", "الناجحة")}</Column>
            <Column align="end">{tr("Pipeline", "قيمة الصفقات")}</Column>
          </TableHeader>
          <TableBody items={rows}>
            {(r) => <Row id={r.o.id}><Cell><div className="tv-cell-person"><Avatar name={L(r.o)} size={28} /><b>{L(r.o)}</b></div></Cell><Cell align="end">{f.number(r.deals)}</Cell><Cell align="end">{f.number(r.won)}</Cell><Cell align="end">{f.money(r.value)}</Cell></Row>}
          </TableBody>
          <TableFooter className="tv-tfoot">
            <Row id="total"><Cell><b>{tr("Total", "الإجمالي")}</b></Cell><Cell align="end"><b>{f.number(tot.deals)}</b></Cell><Cell align="end"><b>{f.number(tot.won)}</b></Cell><Cell align="end"><b>{f.money(tot.value)}</b></Cell></Row>
          </TableFooter>
        </Table>
      </div>
    </Spec>
  );
}

const CALLS = Array.from({ length: 200 }, (_, i) => {
  const c = CONTACTS[(i * 7) % CONTACTS.length];
  const mins = 1 + ((i * 37) % 14), secs = (i * 13) % 60;
  return { id: i + 1, c, dur: `${mins}:${String(secs).padStart(2, "0")}`, outcome: ["booked", "callback", "voicemail", "no-answer"][i % 4], ago: Math.floor(i / 6) };
});
const OUTCOME = { booked: ["Meeting booked", "تم حجز اجتماع", "success"], callback: ["Call back", "معاودة الاتصال", "accent"], voicemail: ["Voicemail", "بريد صوتي", "neutral"], "no-answer": ["No answer", "لم يرد", "warning"] };
export function InfiniteTableSpec() {
  const tr = useTr(); const L = useL(); const f = useFormat();
  const [count, setCount] = useState(15);
  const [loading, setLoading] = useState(false);
  const more = () => { if (loading || count >= CALLS.length) return; setLoading(true); setTimeout(() => { setCount((c) => Math.min(c + 15, CALLS.length)); setLoading(false); }, 700); };
  return (
    <Spec id="infinite-table" name={tr("Infinite scroll", "تمرير لا نهائي")} primitive="Table + TableLoadMoreItem" wide
      note={tr("Rows load as you scroll, with a loading row at the bottom. Good for call logs that grow all day.", "تُحمّل الصفوف أثناء التمرير مع صف تحميل في الأسفل. مناسب لسجلات المكالمات التي تكبر طوال اليوم.")}>
      <div className="stack">
        <span className="tv-desc" aria-live="polite">{tr(`${Math.min(count, CALLS.length)} of ${CALLS.length} calls`, `${f.number(Math.min(count, CALLS.length))} من ${f.number(CALLS.length)} مكالمة`)}</span>
        <div className="tv-table-scroll tv-table-tall" style={{ maxHeight: 360 }}>
          <Table aria-label={tr("Call log", "سجل المكالمات")}>
            <TableHeader>
              <Column isRowHeader>{tr("Caller", "المتصل")}</Column>
              <Column>{tr("Outcome", "النتيجة")}</Column>
              <Column align="end">{tr("Duration", "المدة")}</Column>
              <Column>{tr("When", "الوقت")}</Column>
            </TableHeader>
            <TableBody>
              <Collection items={CALLS.slice(0, count)}>
                {(r) => { const o = OUTCOME[r.outcome]; return (
                  <Row id={r.id}><Cell><b>{L(r.c)}</b></Cell><Cell><Badge tone={o[2]} dot>{tr(o[0], o[1])}</Badge></Cell><Cell align="end"><span dir="ltr" className="mono-num">{r.dur}</span></Cell><Cell><span className="tv-desc">{f.relative(r.ago)}</span></Cell></Row>
                ); }}
              </Collection>
              {count < CALLS.length && (
                <TableLoadMoreItem onLoadMore={more} isLoading={loading} className="tv-loadmore-tr">
                  <LoadMoreIndicator label={tr("Loading more calls", "جارٍ تحميل المزيد")} />
                </TableLoadMoreItem>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Spec>
  );
}

const BIG = Array.from({ length: 10000 }, (_, i) => {
  const c = CONTACTS[i % CONTACTS.length];
  return { id: i + 1, c, score: (i * 7919) % 100 };
});
export function VirtualTableSpec() {
  const tr = useTr(); const L = useL(); const f = useFormat();
  return (
    <Spec id="virtual-table" name={tr("10,000 rows", "١٠٬٠٠٠ صف")} primitive="Virtualizer + TableLayout" wide
      note={tr("Only the rows on screen exist in the page, so scrolling stays smooth at any size. Keyboard navigation and screen readers still know the full count.", "الصفوف الظاهرة فقط موجودة في الصفحة، فيبقى التمرير سلسًا مهما كان الحجم. ومع ذلك يعرف التنقل بلوحة المفاتيح وقارئات الشاشة العدد الكامل.")}>
      <Virtualizer layout={TableLayout} layoutOptions={{ rowHeight: 44, headingHeight: 40 }}>
        <Table aria-label={tr("All contacts", "كل جهات الاتصال")} className="tv-virtual tv-virtual-table">
          <TableHeader>
            <Column isRowHeader width="2fr">{tr("Name", "الاسم")}</Column>
            <Column width="2fr">{tr("Company", "الشركة")}</Column>
            <Column width="1fr" align="end">{tr("Lead score", "تقييم العميل")}</Column>
            <Column width="1fr" align="end">#</Column>
          </TableHeader>
          <TableBody items={BIG}>
            {(r) => <Row id={r.id}><Cell>{L(r.c)}</Cell><Cell>{r.c.company}</Cell><Cell align="end">{f.number(r.score)}</Cell><Cell align="end"><span className="tv-desc">{f.number(r.id)}</span></Cell></Row>}
          </TableBody>
        </Table>
      </Virtualizer>
    </Spec>
  );
}

/* ---------------- Large collections page ---------------- */
const SWATCH = ["#001250", "#916625", "#e0b96a", "#4a5578", "#1f6f4a", "#c39a4c", "#6b7494", "#b3261e"];
const GALLERY = Array.from({ length: 2000 }, (_, i) => ({ id: i + 1, color: SWATCH[i % SWATCH.length], h: 90 + ((i * 53) % 120) }));
export function VirtualListSpec() {
  const tr = useTr(); const L = useL(); const f = useFormat();
  return (
    <Spec id="virtual-list" name={tr("Virtualized list", "قائمة افتراضية")} primitive="Virtualizer + ListLayout + ListBox"
      note={tr("10,000 contacts. Type a letter to jump; Shift-click selects a range.", "١٠٬٠٠٠ جهة اتصال. اكتب حرفًا للانتقال، والضغط مع Shift يحدد نطاقًا.")}>
      <Virtualizer layout={ListLayout} layoutOptions={{ rowHeight: 52 }}>
        <RAC.ListBox aria-label={tr("Contacts", "جهات الاتصال")} items={BIG} selectionMode="multiple" className="tv-virtual">
          {(r) => (
            <RAC.ListBoxItem id={r.id} textValue={L(r.c)} className="tv-virtual-row">
              <Avatar name={L(r.c)} size={28} />
              <span className="gl-text"><b>{L(r.c)}</b><span className="tv-desc">{r.c.company}</span></span>
              <span className="tv-desc" style={{ marginInlineStart: "auto" }}>#{f.number(r.id)}</span>
            </RAC.ListBoxItem>
          )}
        </RAC.ListBox>
      </Virtualizer>
    </Spec>
  );
}
export function VirtualGridSpec() {
  const tr = useTr(); const f = useFormat();
  return (
    <Spec id="virtual-grid" name={tr("Grid layout", "تخطيط شبكي")} primitive="Virtualizer + GridLayout + ListBox"
      note={tr("2,000 cards in responsive columns. Arrow keys move in two dimensions.", "٢٬٠٠٠ بطاقة في أعمدة متجاوبة. مفاتيح الأسهم تتحرك في اتجاهين.")}>
      <Virtualizer layout={GridLayout} layoutOptions={{ minItemSize: new RAC.Size(140, 120), minSpace: new RAC.Size(12, 12) }}>
        <RAC.ListBox aria-label={tr("Voice samples", "عينات الأصوات")} items={GALLERY} layout="grid" selectionMode="multiple" className="tv-virtual">
          {(g) => (
            <RAC.ListBoxItem id={g.id} textValue={`${g.id}`} className="tv-gallery-card">
              <span className="tv-gallery-swatch" style={{ background: g.color }} />
              <span className="tv-desc">{tr("Sample", "عينة")} {f.number(g.id)}</span>
            </RAC.ListBoxItem>
          )}
        </RAC.ListBox>
      </Virtualizer>
    </Spec>
  );
}
export function MasonrySpec() {
  const tr = useTr(); const f = useFormat();
  return (
    <Spec id="masonry" name={tr("Masonry layout", "تخطيط متدرج")} primitive="Virtualizer + WaterfallLayout + ListBox"
      note={tr("Cards of different heights packed into columns, like a board of call notes.", "بطاقات بارتفاعات مختلفة مرتبة في أعمدة، مثل لوحة ملاحظات المكالمات.")}>
      <Virtualizer layout={WaterfallLayout} layoutOptions={{ minItemSize: new RAC.Size(160, 80), minSpace: new RAC.Size(12, 12) }}>
        <RAC.ListBox aria-label={tr("Call notes", "ملاحظات المكالمات")} items={GALLERY} layout="grid" className="tv-virtual">
          {(g) => (
            <RAC.ListBoxItem id={g.id} textValue={`${g.id}`} className="tv-gallery-card" style={{ height: g.h }}>
              <span className="tv-gallery-swatch" style={{ background: g.color, flex: "none", height: g.h - 56 }} />
              <span className="tv-desc">{tr("Note", "ملاحظة")} {f.number(g.id)}</span>
            </RAC.ListBoxItem>
          )}
        </RAC.ListBox>
      </Virtualizer>
    </Spec>
  );
}
