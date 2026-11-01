import React, { useState } from "react";
import { parseColor } from "react-aria-components";
import {
  StatTile, Card, Avatar, BrandAvatar, Badge, Button, Meter, Link, ColorPickerPanel, ColorWheel, ColorSwatch, DropZone, FileTrigger,
  GridList, GridListItem, ConfirmButton, Rating, useListData, useDragAndDrop, isFileDropItem, toast, useFormat, Tooltip, IconButton,
} from "../../ds.js";
import * as Icon from "@truvar-ai/design-system/icons";
import { useTr, useT, useLang } from "../i18n.jsx";
import { Spec, ViewHeader } from "../ui.jsx";
import { CONTACTS, STAGES } from "../data.js";
import { RecordPanel } from "../RecordPanel.jsx";

export function Layout() {
  const tr = useTr(); const f = useFormat(); const lang = useLang();
  const names = CONTACTS.slice(0, 5).map((c) => (lang === "ar" ? c.ar : c.en));
  return (
    <>
      <ViewHeader viewId="layout" intro={tr("Brand components React Aria leaves to each design system. Plain elements, styled only with tokens.", "مكونات الهوية التي تتركها React Aria لكل نظام تصميم: عناصر بسيطة منسقة بالرموز فقط.")} />
      <Spec id="stat" name={tr("Stat tiles", "مربعات الإحصاءات")} primitive="div" note={tr("Lead with the result. Change is shown with an arrow, a colour and words.", "ابدأ بالنتيجة، ويُعرض التغير بسهم ولون وكلمات.")} wide>
        <div className="stat-grid">
          <StatTile label={tr("Revenue influenced", "الإيرادات المتأثرة")} value={f.money(4820000)} delta={f.number(0.18, { style: "percent" })} deltaLabel={tr("vs last quarter", "عن الربع الماضي")} />
          <StatTile label={tr("Hours saved", "الساعات الموفرة")} value={f.number(312)} delta={f.number(46)} deltaLabel={tr("this month", "هذا الشهر")} />
          <StatTile label={tr("Churn", "فقدان العملاء")} value={f.number(0.031, { style: "percent", maximumFractionDigits: 1 })} trend="down" good delta={f.number(0.006, { style: "percent", maximumFractionDigits: 1 })} deltaLabel={tr("lower", "أقل")} />
          <StatTile label={tr("Open tickets", "التذاكر المفتوحة")} value={f.number(27)} trend="up" good={false} delta={f.number(9)} deltaLabel={tr("more than usual", "أكثر من المعتاد")} />
        </div>
      </Spec>
      <Spec id="card" name={tr("Cards", "البطاقات")} primitive="div" wide>
        <div className="card-grid">
          <Card>
            <div className="card-top"><Badge tone="warning" dot>{tr("Negotiation", "تفاوض")}</Badge><Tooltip content={tr("More", "المزيد")}><IconButton label={tr("More", "المزيد")}><Icon.More /></IconButton></Tooltip></div>
            <h3 className="card-title">Nile Foods {tr("annual plan", "الخطة السنوية")}</h3>
            <p className="card-value">{f.money(840000)}</p>
            <div className="card-foot"><Avatar name={names[0]} size={24} /><span className="tv-desc">{names[0]}, {tr("closes in 34 days", "تُغلق خلال ٣٤ يومًا")}</span></div>
          </Card>
          <Card>
            <h3 className="card-title">{tr("AI credits", "رصيد الذكاء الاصطناعي")}</h3>
            <p className="tv-desc">{tr("Resets on 1 November", "يُعاد التعيين في ١ نوفمبر")}</p>
            <Meter label={tr("Used", "المستخدم")} value={64} />
            <Link standalone href="#feedback">{tr("Manage credits", "إدارة الرصيد")}</Link>
          </Card>
          <Card className="card-brand">
            <BrandAvatar size={44} />
            <h3 className="card-title">{tr("Ask about your pipeline", "اسأل عن صفقاتك")}</h3>
            <p className="card-text">{tr("“Which deals are at risk this month?”", "«ما الصفقات المعرضة للخطر هذا الشهر؟»")}</p>
            <Button>{tr("Ask the assistant", "اسأل المساعد")}</Button>
          </Card>
        </div>
      </Spec>
      <Spec id="avatar" name={tr("Avatars", "الصور الرمزية")} primitive="span">
        <div className="stack">
          <div className="row">{[24, 32, 40, 56].map((s) => <Avatar key={s} name={names[0]} size={s} />)}<BrandAvatar size={40} /></div>
          <div className="avatar-group" aria-label={tr("5 people", "٥ أشخاص")}>{names.map((n) => <Avatar key={n} name={n} size={32} />)}<span className="avatar-more">+{f.number(8)}</span></div>
        </div>
      </Spec>
    </>
  );
}

const lum = (c) => { const r = c.toFormat("rgb"); return (0.299 * r.getChannelValue("red") + 0.587 * r.getChannelValue("green") + 0.114 * r.getChannelValue("blue")) / 255; };
export function ColorView() {
  const tr = useTr();
  const [label, setLabel] = useState(parseColor("#916625"));
  return (
    <>
      <ViewHeader viewId="color" intro={tr("For labels, charts and custom tags. Brand colours are offered first as swatches.", "للتسميات والرسوم البيانية والوسوم المخصصة، وتظهر ألوان الهوية أولًا كعينات.")} />
      <Spec id="color-picker" name={tr("Colour picker", "منتقي الألوان")} primitive="ColorPicker + ColorArea + ColorSlider + ColorField">
        <div className="row" style={{ alignItems: "flex-start", gap: 32 }}>
          <ColorPickerPanel value={label} onChange={setLabel} label={tr("Label colour", "لون التسمية")} swatches={["#001250", "#916625", "#e0b96a", "#1f6f4a", "#b3261e", "#4a5578"]} />
          <div className="stack">
            <span className="tv-label">{tr("Preview", "معاينة")}</span>
            <span className="label-preview" style={{ background: label.toString("hex"), color: lum(label) > 0.55 ? "#001250" : "#fff" }}>{tr("Key account", "حساب رئيسي")}</span>
          </div>
        </div>
      </Spec>
      <Spec id="color-wheel" name={tr("Colour wheel", "عجلة الألوان")} primitive="ColorWheel">
        <ColorWheel defaultValue="hsl(40, 65%, 65%)" />
      </Spec>
      <Spec id="swatches" name={tr("Swatches", "عينات الألوان")} primitive="ColorSwatch">
        <div className="row">{["#001250", "#e0b96a", "#c39a4c", "#916625", "#f7f5f0", "#131416"].map((c) => <span key={c} className="swatch-labelled"><ColorSwatch color={c} /><code dir="ltr">{c}</code></span>)}</div>
      </Spec>
    </>
  );
}

export function DragDrop() {
  const tr = useTr(); const lang = useLang(); const f = useFormat();
  const [files, setFiles] = useState([]);
  const add = (names) => { setFiles((x) => [...x, ...names]); toast({ tone: "success", title: tr(`${names.length} file(s) added`, `تمت إضافة ${f.number(names.length)} ملف`) }); };
  const list = useListData({ initialItems: STAGES.slice(0, 5).map((s) => ({ ...s })) });
  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => [...keys].map((k) => ({ "text/plain": list.getItem(k).en })),
    onReorder(e) { e.target.dropPosition === "before" ? list.moveBefore(e.target.key, e.keys) : list.moveAfter(e.target.key, e.keys); },
  });
  return (
    <>
      <ViewHeader viewId="drag-drop" intro={tr("Everything you can drag can also be moved with the keyboard and announced to screen readers.", "كل ما يمكن سحبه يمكن نقله أيضًا بلوحة المفاتيح ويُعلن لقارئات الشاشة.")} />
      <Spec id="drop-zone" name={tr("File drop zone", "منطقة إفلات الملفات")} primitive="DropZone + FileTrigger">
        <div className="stack">
          <DropZone getDropOperation={() => "copy"} onDrop={async (e) => add(e.items.filter(isFileDropItem).map((i) => i.name))}>
            <Icon.Upload />
            <b className="body">{tr("Drop contracts or spreadsheets here", "أفلت العقود أو جداول البيانات هنا")}</b>
            <span className="tv-desc">{tr("PDF, CSV or XLSX, up to 20 MB", "PDF أو CSV أو XLSX، حتى ٢٠ ميجابايت")}</span>
            <FileTrigger allowsMultiple onSelect={(l) => l && add([...l].map((x) => x.name))}>
              <Button variant="secondary" size="sm">{tr("Browse files", "تصفح الملفات")}</Button>
            </FileTrigger>
          </DropZone>
          {files.length > 0 && <div className="row">{files.map((n, i) => <Badge key={i} tone="navy">{n}</Badge>)}</div>}
        </div>
      </Spec>
      <Spec id="reorder-list" name={tr("Reorderable list", "قائمة قابلة لإعادة الترتيب")} primitive="GridList + useDragAndDrop" note={tr("Set the order of your pipeline stages.", "حدّد ترتيب مراحل الصفقات.")}>
        <div style={{ maxWidth: 420 }}>
          <GridList aria-label={tr("Pipeline stages", "مراحل الصفقات")} items={list.items} dragAndDropHooks={dragAndDropHooks}>
            {(s) => <GridListItem id={s.id} textValue={lang === "ar" ? s.ar : s.en}><Badge tone={s.tone} dot>{lang === "ar" ? s.ar : s.en}</Badge></GridListItem>}
          </GridList>
        </div>
      </Spec>
    </>
  );
}

export function RecordPanelView() {
  const tr = useTr();
  const [side, setSide] = useState(null);
  const [contact, setContact] = useState(CONTACTS[1]);
  const lang = useLang();
  const startLabel = lang === "ar" ? "فتح من اليمين" : "Open on the left";
  const endLabel = lang === "ar" ? "فتح من اليسار" : "Open on the right";
  return (
    <>
      <ViewHeader viewId="record-panel" intro={tr("A HubSpot-style side panel for viewing and editing one record without leaving the list. It combines Drawer, Disclosure, Select, TextField, Tabs, Tooltip and toasts.", "لوحة جانبية بأسلوب HubSpot لعرض سجل واحد وتعديله دون مغادرة القائمة. تجمع بين Drawer و Disclosure و Select و TextField و Tabs و Tooltip والإشعارات.")} />
      <Spec name={tr("Open the panel", "افتح اللوحة")} primitive="Drawer side=start | end" note={tr("Edit any field: a Save bar appears with an unsaved-changes note. Escape or clicking outside closes it.", "عدّل أي حقل لتظهر أزرار الحفظ مع تنبيه بالتغييرات غير المحفوظة. مفتاح Esc أو الضغط خارجها يغلقها.")}>
        <div className="row">
          <Button variant="secondary" onPress={() => setSide("start")}>{startLabel}</Button>
          <Button onPress={() => setSide("end")}>{endLabel}</Button>
        </div>
      </Spec>
      <Spec name={tr("Anatomy", "التكوين")} note={tr("Header with avatar and stage, quick actions, collapsible property groups, associations, and an activity timeline in tabs. The footer only asks to save when something changed.", "رأس بالصورة الرمزية والمرحلة، وإجراءات سريعة، ومجموعات خصائص قابلة للطي، والارتباطات، وسجل نشاط في علامات تبويب. التذييل يطلب الحفظ فقط عند وجود تغيير.")}>
        <pre className="code" dir="ltr"><code>{`<RecordPanel
  contact={contact}
  side="end"            // "start" | "end", mirrors in Arabic
  isOpen={open}
  onOpenChange={setOpen}
  onSave={(next) => update(next)}
/>`}</code></pre>
      </Spec>
      <RecordPanel contact={contact} isOpen={!!side} side={side ?? "end"} onOpenChange={(o) => !o && setSide(null)} onSave={setContact} />
    </>
  );
}

export function Extending() {
  const t = useT();
  const [deleted, setDeleted] = useState(false);
  return (
    <>
      <ViewHeader viewId="extending" intro={t.extendIntro} />
      <Spec id="custom-behaviour" name={t.custom} primitive="Button + local state" note={t.customNote}>
        <div className="stack">
          <div className="row">
            <ConfirmButton onConfirm={() => setDeleted(true)}>{t.delWf}</ConfirmButton>
            {deleted && <span className="status"><Icon.Check width={16} height={16} /> {t.deleted} <Button variant="ghost" size="sm" onPress={() => setDeleted(false)}>{t.undo}</Button></span>}
          </div>
          <pre className="code" dir="ltr"><code>{`export function ConfirmButton({ onConfirm, children }) {
  const [armed, setArmed] = useState(false);
  const m = useMessages(); // built-in English + Arabic strings
  return (
    <Button variant="danger"
      onPress={() => armed ? onConfirm() : setArmed(true)}
      onBlur={() => setArmed(false)}>
      {armed ? m.pressAgain : children}
    </Button>
  );
}`}</code></pre>
        </div>
      </Spec>
      <Spec id="new-component" name={t.newComp} primitive="RadioGroup + Radio" note={t.newCompNote}>
        <div className="stack">
          <Rating label={t.useful} labels={t.ratingLabels} />
          <pre className="code" dir="ltr"><code>{`export function Rating({ label, max = 5, onChange }) {
  return (
    <RadioGroup orientation="horizontal" onChange={onChange}>
      <Label>{label}</Label>
      {range(1, max).map((n) => (
        <Radio key={n} value={String(n)} aria-label={m.of(n, max)}
          className="tv-rating-dot" />
      ))}
    </RadioGroup>
  );
}`}</code></pre>
        </div>
      </Spec>
    </>
  );
}
