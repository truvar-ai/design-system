"use client";
// Opportunities (pipeline board and list) and Calendar, built from the CRM kit.
import { useState, useMemo } from "react";
import * as RAC from "react-aria-components";
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import {
  PipelineBoard, EventCalendar, Avatar, Badge, Button, SearchField, Table, TableHeader, Column, TableBody, Row, Cell,
  Calendar, Checkbox, TextField, NumberField, ConfirmDialog, toast, useFormat,
} from "../../ds.js";
import * as Icon from "@truvar-ai/design-system/icons";
import { useLang } from "../i18n.jsx";
import { CONTACTS, OWNERS, STAGES } from "../data.js";
import { dateFormat } from "@truvar-ai/design-system";

const useTr = () => { const lang = useLang(); return (en, ar) => (lang === "ar" ? ar : en); };
const PROB = { lead: 10, qualified: 25, proposal: 50, negotiation: 75, won: 100, lost: 0 };
const dayFrom = (n, h = 0, m = 0) => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(h, m, 0, 0); return d; };

/* ---------- Opportunities ---------- */
const EXTRA = [
  [1, "Nile Foods: Alexandria branch", "qualified", 260000, 21], [2, "Delta Freight: Fleet tracking add-on", "lead", 140000, 40],
  [4, "Alex Pharma: Call recordings vault", "proposal", 320000, 12], [7, "Cairo Fintech: KYC voice checks", "negotiation", 410000, 6],
  [9, "Aswan Solar: Quote bot", "qualified", 95000, 25], [12, "Hurghada Marine: Bookings line", "lead", 180000, 33],
];

function useDeals() {
  const lang = useLang();
  return useMemo(() => {
    const nm = (o) => (lang === "ar" ? o.ar : o.en);
    const deal = (id, c, title, stage, value, inDays) => ({
      id, stage, title, company: c.company, value, contactId: c.id,
      contact: { name: nm(c) }, owner: { name: nm(OWNERS.find((o) => o.id === c.owner)) }, ownerId: c.owner,
      closeDate: dayFrom(inDays), overdue: inDays < 0 && stage !== "won" && stage !== "lost",
    });
    return [
      ...CONTACTS.map((c, i) => deal("d" + c.id, c, lang === "ar" ? `${c.company}: خطة النمو` : `${c.company}: Growth plan`, c.stage, c.value, [8, -2, 15, -30, 30, -9, 4, 18, 3, 45, -20, 10][i])),
      ...EXTRA.map(([cid, title, stage, value, inDays], i) => deal("x" + i, CONTACTS.find((c) => c.id === cid), title, stage, value, inDays)),
    ];
  }, [lang]);
}

export function OpportunitiesPage() {
  const tr = useTr();
  const lang = useLang();
  const f = useFormat();
  const initial = useDeals();
  const [deals, setDeals] = useState(initial);
  const [view, setView] = useState("board");
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState("all");
  const [adding, setAdding] = useState(null);
  const [lost, setLost] = useState(null);
  const money = (v) => f.number(v, { style: "currency", currency: "EGP", notation: "compact", maximumFractionDigits: 1 });
  const moneyFull = (v) => f.number(v, { style: "currency", currency: "EGP", maximumFractionDigits: 0 });
  const stages = STAGES.map((s) => ({ id: s.id, label: lang === "ar" ? s.ar : s.en, tone: s.tone, probability: PROB[s.id] }));
  const q = query.trim().toLowerCase();
  const shown = deals.filter((d) => (owner === "all" || d.ownerId === owner) && (!q || [d.title, d.company, d.contact.name].some((x) => x.toLowerCase().includes(q))));
  const open = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const won = deals.filter((d) => d.stage === "won"), lostD = deals.filter((d) => d.stage === "lost");
  const stageName = (id) => stages.find((s) => s.id === id)?.label;

  const onChange = (next, { ids, to }) => {
    if (to === "lost") { setLost({ next, ids }); return; } // ask why before losing a deal
    setDeals(next);
    const d = next.find((x) => x.id === ids[0]);
    if (to === "won") toast({ tone: "success", title: tr("Deal won 🎉", "تم الفوز بالصفقة 🎉"), description: `${d.title} · ${moneyFull(d.value)}` });
    else toast({ title: tr(`Moved to ${stageName(to)}`, `نُقلت إلى ${stageName(to)}`), description: d.title });
  };

  return (
    <>
      <div className="ws-page-head">
        <div>
          <h1 className="view-title">{tr("Opportunities", "الفرص")}</h1>
          <p className="tv-desc ws-page-sub">{tr("Every deal from first call to signed contract. Drag a card to move it to the next stage.", "كل صفقة من أول مكالمة حتى توقيع العقد. اسحب البطاقة لنقلها إلى المرحلة التالية.")}</p>
        </div>
        <div className="ws-page-actions"><Button onPress={() => setAdding("lead")}><Icon.Plus />{tr("Add deal", "إضافة صفقة")}</Button></div>
      </div>

      <section className="ws-stats" aria-label={tr("Summary", "ملخص")}>
        {[
          [Icon.Briefcase, tr("Open pipeline", "المسار المفتوح"), money(open.reduce((a, d) => a + d.value, 0)), tr(`${f.number(open.length)} open deals`, `${f.number(open.length)} صفقة مفتوحة`)],
          [Icon.TrendUp, tr("Weighted forecast", "التوقع المرجّح"), money(open.reduce((a, d) => a + d.value * PROB[d.stage] / 100, 0)), tr("Value × stage probability", "القيمة × احتمال المرحلة")],
          [Icon.CheckCircle, tr("Won this quarter", "مكسوبة هذا الربع"), money(won.reduce((a, d) => a + d.value, 0)), tr(`${f.number(won.length)} deals`, `${f.number(won.length)} صفقات`)],
          [Icon.Zap, tr("Win rate", "معدل الفوز"), f.number(won.length / Math.max(1, won.length + lostD.length), { style: "percent" }), tr("Won of closed deals", "المكسوبة من المغلقة")],
        ].map(([I, label, value, note]) => (
          <article key={label} className="tv-stat ws-stat">
            <span className="dash-kpi-head"><span className="dash-kpi-icon" aria-hidden="true"><I /></span><span className="tv-stat-label">{label}</span></span>
            {/* On the narrowest phones the amount may wrap before its currency, never inside a word */}
            <span className="tv-stat-value">{value.replace(/\u00a0(?=[^\u00a0]*$)/, " ")}</span><span className="tv-desc">{note}</span>
          </article>
        ))}
      </section>

      <div className="ws-toolbar">
        <RAC.ToggleButtonGroup className="tv-segmented" selectionMode="single" disallowEmptySelection selectedKeys={[view]} onSelectionChange={(k) => setView([...k][0])} aria-label={tr("View", "العرض")}>
          {[["board", Icon.Kanban, tr("Board", "لوحة")], ["list", Icon.List, tr("List", "قائمة")]].map(([id, I, l]) => (
            <RAC.ToggleButton key={id} id={id} className="tv-segment-btn"><RAC.SelectionIndicator className="tv-segment-indicator" /><span className="tv-segment-label"><I />{l}</span></RAC.ToggleButton>
          ))}
        </RAC.ToggleButtonGroup>
        <RAC.ToggleButtonGroup className="tv-inbox-tabs" selectionMode="single" disallowEmptySelection selectedKeys={[owner]} onSelectionChange={(k) => setOwner([...k][0])} aria-label={tr("Owner", "المسؤول")}>
          <RAC.ToggleButton id="all" className="tv-inbox-tab">{tr("Everyone", "الجميع")}</RAC.ToggleButton>
          <RAC.ToggleButton id="amira" className="tv-inbox-tab">{tr("My deals", "صفقاتي")}</RAC.ToggleButton>
        </RAC.ToggleButtonGroup>
        <div className="ws-search"><SearchField aria-label={tr("Search deals", "ابحث في الصفقات")} placeholder={tr("Search deals, companies or contacts", "ابحث في الصفقات أو الشركات أو العملاء")} value={query} onChange={setQuery} /></div>
      </div>

      {view === "board" ? (
        <PipelineBoard stages={stages} deals={shown} format={money} label={tr("Pipeline", "مسار الصفقات")}
          onChange={(next, info) => onChange([...next, ...deals.filter((d) => !shown.includes(d) && !next.some((n) => n.id === d.id))], info)}
          onOpen={(d) => { location.hash = "contact/" + d.contactId; }} onAdd={(s) => setAdding(s.id)} />
      ) : (
        <div className="tv-table-scroll ws-table">
          <Table aria-label={tr("Deals", "الصفقات")} onRowAction={(id) => { location.hash = "contact/" + deals.find((d) => d.id === id).contactId; }}>
            <TableHeader>
              <Column isRowHeader>{tr("Deal", "الصفقة")}</Column>
              <Column>{tr("Stage", "المرحلة")}</Column>
              <Column>{tr("Contact", "جهة الاتصال")}</Column>
              <Column>{tr("Owner", "المسؤول")}</Column>
              <Column>{tr("Close date", "تاريخ الإغلاق")}</Column>
              <Column align="end">{tr("Probability", "الاحتمال")}</Column>
              <Column align="end">{tr("Value", "القيمة")}</Column>
            </TableHeader>
            <TableBody items={shown}>
              {(d) => {
                const s = stages.find((x) => x.id === d.stage);
                return (
                  <Row id={d.id}>
                    <Cell><span className="ws-person"><span><b>{d.title}</b><span className="tv-desc">{d.company}</span></span></span></Cell>
                    <Cell><Badge tone={s.tone} dot>{s.label}</Badge></Cell>
                    <Cell><span className="ws-person"><Avatar name={d.contact.name} size={28} />{d.contact.name}</span></Cell>
                    <Cell>{d.owner.name}</Cell>
                    <Cell><span className={d.overdue ? "ws-late" : undefined}>{dateFormat(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "short", year: "numeric" }).format(d.closeDate)}</span></Cell>
                    <Cell align="end">{f.number(PROB[d.stage] / 100, { style: "percent" })}</Cell>
                    <Cell align="end">{moneyFull(d.value)}</Cell>
                  </Row>
                );
              }}
            </TableBody>
          </Table>
        </div>
      )}

      <AddDealDialog stage={adding} stages={stages} onClose={() => setAdding(null)}
        onAdd={(d) => { setDeals((x) => [{ ...d, id: "n" + Date.now(), contactId: 1, contact: { name: tr("Nadia Kamel", "نادية كامل") }, owner: { name: tr("Amira Hassan", "أميرة حسن") }, ownerId: "amira", closeDate: dayFrom(30) }, ...x]); toast({ tone: "success", title: tr("Deal added", "تمت إضافة الصفقة"), description: d.title }); }} />
      <ConfirmDialog isOpen={!!lost} onOpenChange={(o) => !o && setLost(null)} tone="danger" icon={<Icon.XCircle />}
        title={tr("Mark this deal as lost?", "تحديد الصفقة كخاسرة؟")} confirmLabel={tr("Mark as lost", "تحديد كخاسرة")}
        onConfirm={() => { setDeals(lost.next); toast({ title: tr("Deal marked as lost", "تم تحديد الصفقة كخاسرة") }); }}>
        {tr("It moves out of the open pipeline and stops counting toward the forecast. You can move it back at any time.", "ستخرج من المسار المفتوح ولن تُحتسب في التوقعات. يمكنك إعادتها في أي وقت.")}
      </ConfirmDialog>
    </>
  );
}

function AddDealDialog({ stage, stages, onClose, onAdd }) {
  const tr = useTr();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [value, setValue] = useState(100000);
  return (
    <RAC.ModalOverlay isOpen={!!stage} onOpenChange={(o) => !o && onClose()} isDismissable className="tv-overlay">
      <RAC.Modal className="tv-modal">
        <RAC.Dialog className="tv-dialog ws-invite">
          {({ close }) => (
            <form onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; onAdd({ title, company: company || "—", value, stage }); setTitle(""); setCompany(""); close(); }}>
              <RAC.Heading slot="title" className="tv-dialog-title">{tr("Add deal", "إضافة صفقة")}</RAC.Heading>
              <p className="tv-desc">{tr(`Adds to ${stages.find((s) => s.id === stage)?.label ?? ""}.`, `تُضاف إلى ${stages.find((s) => s.id === stage)?.label ?? ""}.`)}</p>
              <TextField label={tr("Deal name", "اسم الصفقة")} value={title} onChange={setTitle} autoFocus isRequired />
              <TextField label={tr("Company", "الشركة")} value={company} onChange={setCompany} />
              <NumberField label={tr("Value", "القيمة")} value={value} onChange={setValue} minValue={0} step={10000} formatOptions={{ style: "currency", currency: "EGP", maximumFractionDigits: 0 }} />
              <div className="ws-dialog-actions">
                <Button variant="ghost" onPress={close}>{tr("Cancel", "إلغاء")}</Button>
                <Button type="submit" isDisabled={!title.trim()}><Icon.Plus />{tr("Add deal", "إضافة صفقة")}</Button>
              </div>
            </form>
          )}
        </RAC.Dialog>
      </RAC.Modal>
    </RAC.ModalOverlay>
  );
}

/* ---------- Calendar ---------- */
function useEvents() {
  const lang = useLang();
  return useMemo(() => {
    const tr = (en, ar) => (lang === "ar" ? ar : en);
    const ev = (id, type, en, ar, day, h, m, mins, loc) => ({ id, type, title: tr(en, ar), start: dayFrom(day, h, m), end: new Date(+dayFrom(day, h, m) + mins * 60000), location: loc && tr(...loc) });
    return [
      ev("e1", "meeting", "Weekly sales sync", "اجتماع المبيعات الأسبوعي", 0, 9, 30, 45, ["Room 2", "قاعة ٢"]),
      ev("e2", "call", "Call Nadia Kamel", "اتصال بنادية كامل", 0, 11, 0, 30, ["Phone", "هاتف"]),
      ev("e3", "demo", "Demo: Cairo Fintech", "عرض تجريبي: Cairo Fintech", 0, 13, 0, 60, ["Google Meet", "Google Meet"]),
      ev("e4", "task", "Send Delta Freight terms", "إرسال شروط Delta Freight", 0, 15, 0, 30),
      ev("e5", "call", "Follow-up: Aswan Solar", "متابعة: Aswan Solar", 1, 10, 0, 30, ["Phone", "هاتف"]),
      ev("e6", "meeting", "Contract review: Alex Pharma", "مراجعة العقد: Alex Pharma", 1, 12, 30, 90, ["Alex Pharma HQ", "مقر Alex Pharma"]),
      ev("e7", "demo", "Demo: Hurghada Marine", "عرض تجريبي: Hurghada Marine", 2, 11, 0, 60, ["Zoom", "Zoom"]),
      ev("e8", "meeting", "Onboarding kickoff: Mansoura Dairy", "بدء التهيئة: Mansoura Dairy", 2, 14, 0, 60, ["Teams", "Teams"]),
      ev("e9", "call", "Quarterly check-in: Giza Motors", "متابعة ربع سنوية: Giza Motors", 3, 9, 0, 30),
      ev("e10", "task", "Prepare Q4 forecast", "إعداد توقعات الربع الرابع", 3, 13, 0, 120),
      ev("e11", "demo", "Demo: Red Sea Resorts", "عرض تجريبي: Red Sea Resorts", 4, 16, 0, 60, ["Google Meet", "Google Meet"]),
      ev("e12", "meeting", "Team retro", "مراجعة الفريق", -1, 15, 0, 60, ["Room 1", "قاعة ١"]),
      ev("e13", "call", "Call Tarek Saleh", "اتصال بطارق صالح", -2, 10, 30, 30),
      ev("e14", "demo", "Demo: Port Said Logistics", "عرض تجريبي: Port Said Logistics", 7, 11, 0, 60),
      ev("e15", "meeting", "Partner lunch", "غداء مع شريك", 9, 13, 0, 90, ["Zamalek", "الزمالك"]),
      ev("e16", "call", "Renewal call: Nile Foods", "مكالمة تجديد: Nile Foods", 12, 12, 0, 30),
    ];
  }, [lang]);
}

export function CalendarPage() {
  const tr = useTr();
  const f = useFormat();
  const lang = useLang();
  const initial = useEvents();
  const [events, setEvents] = useState(initial);
  const [date, setDate] = useState(() => new Date());
  const [shownTypes, setShownTypes] = useState(["meeting", "call", "demo", "task"]);
  const [draft, setDraft] = useState(null); // new event
  const [openEv, setOpenEv] = useState(null);
  const types = {
    meeting: { label: tr("Meetings", "اجتماعات"), tone: "info" }, call: { label: tr("Calls", "مكالمات"), tone: "success" },
    demo: { label: tr("Demos", "عروض تجريبية"), tone: "violet" }, task: { label: tr("Tasks", "مهام"), tone: "warning" },
  };
  const loc = lang === "ar" ? "ar-EG" : "en-US";
  const time = (d) => dateFormat(loc, { hour: "numeric", minute: "2-digit" }).format(d);
  const now = new Date();
  const upcoming = events.filter((e) => e.start > now).sort((a, b) => a.start - b.start).slice(0, 3);
  const cd = new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return (
    <div className="ws-calpage">
      <aside className="ws-cal-side">
        <Button onPress={() => { const s = new Date(); s.setHours(s.getHours() + 1, 0, 0, 0); setDraft({ start: s, end: new Date(+s + 3600e3) }); }}><Icon.Plus />{tr("New event", "حدث جديد")}</Button>
        <Calendar aria-label={tr("Pick a date", "اختر تاريخًا")} value={cd} onChange={(v) => setDate(v.toDate(getLocalTimeZone()))} />
        <section className="ws-cal-types" aria-labelledby="cal-types">
          <h2 className="settings-label" id="cal-types">{tr("My calendars", "تقويماتي")}</h2>
          {Object.entries(types).map(([id, t]) => (
            <Checkbox key={id} isSelected={shownTypes.includes(id)} onChange={(on) => setShownTypes((x) => (on ? [...x, id] : x.filter((y) => y !== id)))}>
              <span className={`ws-cal-swatch is-${t.tone}`} aria-hidden="true" />{t.label}<span className="tv-desc ws-cal-n">{f.number(events.filter((e) => e.type === id).length)}</span>
            </Checkbox>
          ))}
        </section>
        <section className="ws-cal-types" aria-labelledby="cal-up">
          <h2 className="settings-label" id="cal-up">{tr("Up next", "التالي")}</h2>
          {upcoming.map((e) => (
            <RAC.Button key={e.id} className={`ws-cal-next is-${types[e.type].tone}`} onPress={() => setOpenEv(e)}>
              <b>{e.title}</b><span className="tv-desc">{dateFormat(loc, { weekday: "short", hour: "numeric", minute: "2-digit" }).format(e.start)}</span>
            </RAC.Button>
          ))}
        </section>
      </aside>
      <div className="ws-cal-main">
        <h1 className="tv-sr">{tr("Calendar", "التقويم")}</h1>
        <EventCalendar events={events.filter((e) => shownTypes.includes(e.type))} types={types} date={date} onDateChange={setDate}
          onSelectSlot={(start, end) => setDraft({ start, end })} onSelectEvent={setOpenEv} />
      </div>

      <EventDialog draft={draft} types={types} onClose={() => setDraft(null)} time={time}
        onSave={(e) => { setEvents((x) => [...x, { ...e, id: "u" + Date.now() }]); toast({ tone: "success", title: tr("Event added", "تمت إضافة الحدث"), description: e.title }); }} />

      <RAC.ModalOverlay isOpen={!!openEv} onOpenChange={(o) => !o && setOpenEv(null)} isDismissable className="tv-overlay">
        <RAC.Modal className="tv-modal">
          <RAC.Dialog className="tv-dialog ws-event">
            {({ close }) => openEv && (
              <>
                <span className={`ws-event-type is-${types[openEv.type].tone}`}><span className="ws-cal-swatch" />{types[openEv.type].label.replace(/s$/, "")}</span>
                <RAC.Heading slot="title" className="tv-dialog-title">{openEv.title}</RAC.Heading>
                <ul className="ws-event-facts">
                  <li><Icon.Calendar />{dateFormat(loc, { weekday: "long", day: "numeric", month: "long" }).format(openEv.start)}</li>
                  <li><Icon.Clock />{time(openEv.start)} – {time(openEv.end)}</li>
                  {openEv.location && <li><Icon.MapPin />{openEv.location}</li>}
                </ul>
                <div className="ws-dialog-actions">
                  <Button variant="ghost" onPress={() => { setEvents((x) => x.filter((y) => y.id !== openEv.id)); close(); toast({ title: tr("Event deleted", "تم حذف الحدث") }); }}><Icon.Trash />{tr("Delete", "حذف")}</Button>
                  {/meet|zoom|teams/i.test(openEv.location ?? "") && <Button variant="secondary" onPress={() => toast({ title: tr("Joining…", "جارٍ الانضمام…") })}><Icon.Video />{tr("Join", "انضمام")}</Button>}
                  <Button onPress={close}>{tr("Done", "تم")}</Button>
                </div>
              </>
            )}
          </RAC.Dialog>
        </RAC.Modal>
      </RAC.ModalOverlay>
    </div>
  );
}

function EventDialog({ draft, types, onClose, onSave, time }) {
  const tr = useTr();
  const lang = useLang();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("meeting");
  const [mins, setMins] = useState(60);
  return (
    <RAC.ModalOverlay isOpen={!!draft} onOpenChange={(o) => !o && onClose()} isDismissable className="tv-overlay">
      <RAC.Modal className="tv-modal">
        <RAC.Dialog className="tv-dialog ws-invite">
          {({ close }) => draft && (
            <form onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; onSave({ title, type, start: draft.start, end: new Date(+draft.start + mins * 60000) }); setTitle(""); close(); }}>
              <RAC.Heading slot="title" className="tv-dialog-title">{tr("New event", "حدث جديد")}</RAC.Heading>
              <p className="tv-desc">{dateFormat(lang === "ar" ? "ar-EG" : "en-US", { weekday: "long", day: "numeric", month: "long" }).format(draft.start)} · {time(draft.start)}</p>
              <TextField label={tr("Title", "العنوان")} value={title} onChange={setTitle} autoFocus isRequired placeholder={tr("e.g. Demo with Nile Foods", "مثال: عرض تجريبي مع Nile Foods")} />
              <div className="tv-field">
                <span className="tv-label" id="ev-type">{tr("Type", "النوع")}</span>
                <RAC.RadioGroup aria-labelledby="ev-type" value={type} onChange={setType} orientation="horizontal" className="ws-ev-types">
                  {Object.entries(types).map(([id, t]) => <RAC.Radio key={id} value={id} className={`ws-ev-type is-${t.tone}`}><span className="ws-cal-swatch" />{t.label}</RAC.Radio>)}
                </RAC.RadioGroup>
              </div>
              <div className="tv-field">
                <span className="tv-label" id="ev-len">{tr("Length", "المدة")}</span>
                <RAC.RadioGroup aria-labelledby="ev-len" value={String(mins)} onChange={(v) => setMins(Number(v))} orientation="horizontal" className="ws-ev-types">
                  {[15, 30, 60, 90].map((m) => <RAC.Radio key={m} value={String(m)} className="ws-ev-type">{tr(`${m} min`, `${m} دقيقة`)}</RAC.Radio>)}
                </RAC.RadioGroup>
              </div>
              <div className="ws-dialog-actions">
                <Button variant="ghost" onPress={close}>{tr("Cancel", "إلغاء")}</Button>
                <Button type="submit" isDisabled={!title.trim()}>{tr("Save event", "حفظ الحدث")}</Button>
              </div>
            </form>
          )}
        </RAC.Dialog>
      </RAC.Modal>
    </RAC.ModalOverlay>
  );
}
