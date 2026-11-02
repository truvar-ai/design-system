"use client";
// Workspace apps built from the CRM kit: Conversations, Contacts, a contact's record, and Team & roles.
import { useState, useEffect, useSyncExternalStore } from "react";
import * as RAC from "react-aria-components";
import {
  ConversationInbox, CallSheet, ContactHeader, PropertyList, ActivityTimeline, MessageThread, Composer, AiAgentBar, useAiHandoff,
  ChannelBadge, PermissionMatrix, RoleList, channelName,
  Avatar, Badge, Button, SearchField, Tabs, TabList, Tab, TabPanel, Table, TableHeader, Column, SelectionColumn, TableBody, Row, Cell,
  EmptyState, TextField, toast, useFormat,
} from "../../ds.js";
import * as Icon from "@truvar-ai/design-system/icons";
import { useLang } from "../i18n.jsx";
import { useCrmData } from "../crmData.jsx";
import { STAGES } from "../data.js";
import { dateFormat, numberFormat } from "@truvar-ai/design-system";

const useTr = () => { const lang = useLang(); return (en, ar) => (lang === "ar" ? ar : en); };
function useNarrow(q = "(max-width: 760px)") {
  return useSyncExternalStore(
    (cb) => { const m = matchMedia(q); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => matchMedia(q).matches,
    () => false, // server render: the wide layout; phones switch right after
  );
}
const daysAgo = (d) => Math.max(0, Math.round((Date.now() - d) / 864e5));

/* ---------- Conversations ---------- */
export function ConversationsPage({ id }) {
  const d = useCrmData();
  const tr = useTr();
  const [call, setCall] = useState(null);
  // On phones a chat takes the whole screen: the tab bar steps aside while a conversation is open
  useEffect(() => () => document.documentElement.removeAttribute("data-chat-open"), []);
  return (
    <div className="ws-inbox-page">
      <h1 className="tv-sr">{tr("Conversations", "المحادثات")}</h1>
      <ConversationInbox conversations={d.conversations} messages={d.messages} contacts={d.contacts} team={d.team} me={d.me}
        savedReplies={d.savedReplies} templates={d.templates} onSuggest={(c) => d.suggest(c)} initialId={id}
        profileHref={(c) => "#contact/" + c.id}
        onOpenChange={(cid) => history.replaceState(null, "", "#conversations/" + cid)}
        onViewChange={(v) => document.documentElement.toggleAttribute("data-chat-open", v === "thread")}
        onCall={(c) => setCall(c)}
        onEmail={(c) => toast({ title: tr("Email draft opened", "تم فتح مسودة بريد"), description: c.email })} />
      <CallSheet isOpen={!!call} onOpenChange={(o) => !o && setCall(null)} contact={call}
        onEnd={() => toast({ tone: "success", title: tr("Call logged on the contact", "تم تسجيل المكالمة في ملف العميل") })} />
    </div>
  );
}

/* ---------- Contacts ---------- */
export function ContactsPage() {
  const d = useCrmData();
  const tr = useTr();
  const lang = useLang();
  const f = useFormat();
  const narrow = useNarrow();
  const [segment, setSegment] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(new Set());
  const all = Object.values(d.contacts);
  const SEG = {
    all: [tr("All", "الكل"), () => true],
    mine: [tr("My contacts", "جهات اتصالي"), (c) => c.owner.id === d.me.id],
    leads: [tr("Leads", "عملاء محتملون"), (c) => ["lead", "qualified"].includes(c.stage.id)],
    open: [tr("Open deals", "صفقات مفتوحة"), (c) => ["proposal", "negotiation"].includes(c.stage.id)],
    customers: [tr("Customers", "عملاء"), (c) => c.stage.id === "won"],
  };
  const q = query.trim().toLowerCase();
  const rows = all.filter(SEG[segment][1]).filter((c) => !q || [c.name, c.company, c.email].some((x) => x.toLowerCase().includes(q)));
  const money = (v) => numberFormat(lang === "ar" ? "ar-EG" : "en-US", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(v);
  const go = (id) => { location.hash = "contact/" + id; };
  const count = selected === "all" ? rows.length : selected.size;
  return (
    <>
      <div className="ws-page-head">
        <div>
          <h1 className="view-title">{tr("Contacts", "جهات الاتصال")}</h1>
          <p className="tv-desc ws-page-sub">{tr(`${f.number(all.length)} people across every channel`, `${f.number(all.length)} شخصًا عبر كل القنوات`)}</p>
        </div>
        <div className="ws-page-actions">
          <Button variant="secondary" onPress={() => toast({ title: tr("Import started", "بدأ الاستيراد") })}><Icon.Upload /><span className="ws-btn-label">{tr("Import", "استيراد")}</span></Button>
          <Button onPress={() => toast({ tone: "success", title: tr("New contact form", "نموذج جهة اتصال جديدة") })}><Icon.Plus /><span className="ws-btn-long">{tr("Add contact", "إضافة جهة اتصال")}</span><span className="ws-btn-short" aria-hidden="true">{tr("Add", "إضافة")}</span></Button>
        </div>
      </div>
      <div className="ws-toolbar">
        <RAC.ToggleButtonGroup className="tv-inbox-tabs ws-segments" selectionMode="single" disallowEmptySelection selectedKeys={[segment]}
          onSelectionChange={(k) => setSegment([...k][0])} aria-label={tr("Segments", "الشرائح")}>
          {Object.entries(SEG).map(([k, [label, fn]]) => (
            <RAC.ToggleButton key={k} id={k} className="tv-inbox-tab">{label}<span className="tv-inbox-tab-count">{f.number(all.filter(fn).length)}</span></RAC.ToggleButton>
          ))}
        </RAC.ToggleButtonGroup>
        <div className="ws-search"><SearchField aria-label={tr("Search contacts", "ابحث في جهات الاتصال")} placeholder={tr("Search name, company or email", "ابحث بالاسم أو الشركة أو البريد")} value={query} onChange={setQuery} /></div>
      </div>
      {count > 0 && !narrow && (
        <div className="tv-inbox-bulk ws-bulk" role="toolbar" aria-label={tr("Bulk actions", "إجراءات جماعية")}>
          <span>{tr(`${f.number(count)} selected`, `${f.number(count)} محددة`)}</span>
          <RAC.Button className="tv-inbox-textbtn" onPress={() => toast({ title: tr("Owner updated", "تم تحديث المسؤول") })}><Icon.UserPlus />{tr("Assign owner", "إسناد مسؤول")}</RAC.Button>
          <RAC.Button className="tv-inbox-textbtn" onPress={() => toast({ title: tr("Export ready", "التصدير جاهز") })}><Icon.Download />{tr("Export", "تصدير")}</RAC.Button>
          <RAC.Button className="tv-inbox-textbtn" onPress={() => setSelected(new Set())}>{tr("Clear", "مسح")}</RAC.Button>
        </div>
      )}
      {narrow ? (
        <RAC.GridList aria-label={tr("Contacts", "جهات الاتصال")} items={rows} className="ws-clist" onAction={go}
          renderEmptyState={() => <div className="tv-empty-mini">{tr("No contacts match.", "لا توجد جهات اتصال مطابقة.")}</div>}>
          {(c) => (
            <RAC.GridListItem id={c.id} textValue={c.name} className="ws-crow">
              <Avatar name={c.name} size={44} />
              <span className="ws-crow-main">
                <b>{c.name}</b>
                <span className="tv-desc">{c.company} · {c.title}</span>
                <span className="ws-crow-meta"><Badge tone={c.stage.tone} dot>{c.stage.label}</Badge><span className="ws-crow-ids">{c.identities.slice(0, 4).map((x) => <ChannelBadge key={x.channel} channel={x.channel} size={18} />)}</span></span>
              </span>
              <Icon.ChevronRight className="tv-notif-chev" />
            </RAC.GridListItem>
          )}
        </RAC.GridList>
      ) : (
        <div className="tv-table-scroll ws-table">
          <Table aria-label={tr("Contacts", "جهات الاتصال")} selectionMode="multiple" selectedKeys={selected} onSelectionChange={setSelected} onRowAction={go}>
            <TableHeader>
              <SelectionColumn />
              <Column isRowHeader>{tr("Name", "الاسم")}</Column>
              <Column>{tr("Company", "الشركة")}</Column>
              <Column>{tr("Stage", "المرحلة")}</Column>
              <Column>{tr("Channels", "القنوات")}</Column>
              <Column>{tr("Owner", "المسؤول")}</Column>
              <Column>{tr("Last activity", "آخر نشاط")}</Column>
              <Column align="end">{tr("Deal value", "قيمة الصفقة")}</Column>
            </TableHeader>
            <TableBody items={rows} renderEmptyState={() => <div className="tv-empty-mini">{tr("No contacts match.", "لا توجد جهات اتصال مطابقة.")}</div>}>
              {(c) => (
                <Row id={c.id}>
                  <Cell><span className="ws-person"><Avatar name={c.name} size={34} /><span><b>{c.name}</b><span className="tv-desc" dir="ltr">{c.email}</span></span></span></Cell>
                  <Cell>{c.company}</Cell>
                  <Cell><Badge tone={c.stage.tone} dot>{c.stage.label}</Badge></Cell>
                  <Cell><span className="ws-crow-ids">{c.identities.map((x) => <ChannelBadge key={x.channel} channel={x.channel} size={20} label={channelName(x.channel, lang)} />)}</span></Cell>
                  <Cell>{lang === "ar" ? c.owner.ar : c.owner.en}</Cell>
                  <Cell>{f.relative(daysAgo(c.lastActivity))}</Cell>
                  <Cell align="end">{money(c.value)}</Cell>
                </Row>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

/* ---------- One contact's record ---------- */
export function ContactDetailPage({ id }) {
  const d = useCrmData();
  const tr = useTr();
  const lang = useLang();
  const c0 = d.contacts[id];
  const conv = d.conversations.find((x) => x.contact.id === Number(id));
  const [c, setC] = useState(c0);
  const [tab, setTab] = useState("overview");
  const [timeline, setTimeline] = useState(() => (c0 ? d.timelineFor(c0.id) : []));
  const [thread, setThread] = useState(() => (conv ? d.messages[conv.id] : []));
  const [channel, setChannel] = useState(c0?.mainChannel);
  const [calling, setCalling] = useState(false);
  const handoff = useAiHandoff({ initial: conv?.ai ?? "ai", resumeAfter: 15 });
  if (!c) return <EmptyState title={tr("Contact not found", "جهة الاتصال غير موجودة")} action={<Button onPress={() => { location.hash = "contacts"; }}>{tr("All contacts", "كل جهات الاتصال")}</Button>} />;

  const send = ({ text, mode, channel: ch }) => {
    const mid = "x" + Date.now();
    if (mode === "note") {
      setThread((x) => [...x, { id: mid, from: "agent", kind: "note", author: d.me.name, text, time: new Date() }]);
      return;
    }
    handoff.touch();
    setThread((x) => [...x, { id: mid, from: "agent", kind: "text", author: d.me.name, channel: ch, text, time: new Date(), status: "sent" }]);
    setTimeout(() => setThread((x) => x.map((m) => (m.id === mid ? { ...m, status: "read" } : m))), 1800);
    setTimeline((x) => [{ id: mid, type: "message", channel: ch, title: tr(`You replied on ${channelName(ch, lang)}`, `رددت عبر ${channelName(ch, lang)}`), body: text, time: new Date() }, ...x]);
  };
  const about = [
    { id: "email", label: tr("Email", "البريد الإلكتروني"), value: c.email, ltr: true },
    { id: "phone", label: tr("Phone", "الهاتف"), value: c.phone, ltr: true },
    { id: "title", label: tr("Job title", "المسمى الوظيفي"), value: c.title },
    { id: "company", label: tr("Company", "الشركة"), value: c.company },
    { id: "location", label: tr("Location", "الموقع"), value: c.location },
    { id: "language", label: tr("Language", "اللغة"), value: c.language },
    { id: "owner", label: tr("Owner", "المسؤول"), value: c.deal.owner, editable: false },
  ];
  const dateFmt = (d, o = { day: "numeric", month: "short", year: "numeric" }) => dateFormat(lang === "ar" ? "ar-EG" : "en-US", o).format(d);
  const note = (text) => setTimeline((x) => [{ id: "n" + Date.now(), type: "note", title: tr("Note", "ملاحظة"), author: d.me.name, body: text, time: new Date() }, ...x]);
  const stages = (
    <ol className="ws-stages" aria-label={tr("Pipeline", "مراحل الصفقة")}>
      {STAGES.filter((s) => s.id !== "lost").map((s, i, arr) => {
        const cur = arr.findIndex((x) => x.id === c.stage.id);
        return <li key={s.id} className={i < cur ? "is-done" : i === cur ? "is-current" : ""} aria-current={i === cur ? "step" : undefined}>{lang === "ar" ? s.ar : s.en}</li>;
      })}
    </ol>
  );
  return (
    <div className="ws-record">
      {/* Start column: who they are, sticky while the middle scrolls */}
      <aside className="ws-record-side" aria-label={c.name}>
        <RAC.Link href="#contacts" className="ws-back"><Icon.ChevronLeft />{tr("Contacts", "جهات الاتصال")}</RAC.Link>
        <section className="tv-card ws-id-card">
          <ContactHeader layout="sidebar" contact={c}
            onNote={() => { setTab("activities"); requestAnimationFrame(() => document.querySelector(".tv-timeline-note textarea")?.focus()); }}
            onMessage={() => setTab("chat")}
            onEmail={() => { setChannel("email"); setTab("chat"); }}
            onCall={() => setCalling(true)}
            onMeeting={() => toast({ tone: "success", title: tr("Meeting link sent", "تم إرسال رابط الاجتماع"), description: c.email })} />
        </section>
        <PropertyList title={tr("About this contact", "عن جهة الاتصال")} items={about}
          onSave={(v) => { setC((x) => ({ ...x, ...v })); toast({ tone: "success", title: tr("Contact updated", "تم تحديث جهة الاتصال") }); }} />
        <section className="tv-card ws-side-card">
          <h2 className="tv-plist-title">{tr("Channels", "القنوات")}</h2>
          <ul className="tv-ids">
            {c.identities.map((x) => (
              <li key={x.channel}><ChannelBadge channel={x.channel} size={28} />
                <span className="tv-ids-text"><b>{channelName(x.channel, lang)}</b><span dir="ltr">{x.handle}</span></span>
                <RAC.Button className="tv-icon-btn ws-ids-go" aria-label={tr(`Message on ${channelName(x.channel, lang)}`, `راسله عبر ${channelName(x.channel, lang)}`)}
                  onPress={() => { setChannel(x.channel); setTab("chat"); }}><Icon.MessageCircle /></RAC.Button>
              </li>
            ))}
          </ul>
        </section>
      </aside>

      {/* Middle: everything about the relationship */}
      <div className="ws-record-main">
        <Tabs selectedKey={tab} onSelectionChange={setTab}>
          <TabList aria-label={c.name} className="tv-tablist ws-record-tabs">
            <Tab id="overview">{tr("Overview", "نظرة عامة")}</Tab>
            <Tab id="activities">{tr("Activities", "الأنشطة")}</Tab>
            <Tab id="chat">{tr("Conversation", "المحادثة")}</Tab>
            <Tab id="deals">{tr("Deals", "الصفقات")}</Tab>
          </TabList>
          <TabPanel id="overview">
            <div className="ws-record-cards">
              <section className="tv-card ws-highlights" aria-labelledby="hl-title">
                <h2 className="tv-plist-title" id="hl-title">{tr("Data highlights", "أبرز البيانات")}</h2>
                <dl>
                  <div><dt>{tr("Create date", "تاريخ الإنشاء")}</dt><dd>{dateFmt(c.source.date)}</dd></div>
                  <div><dt>{tr("Lifecycle stage", "مرحلة دورة الحياة")}</dt><dd><Badge tone={c.stage.tone} dot>{c.stage.label}</Badge></dd></div>
                  <div><dt>{tr("Last activity", "آخر نشاط")}</dt><dd>{dateFmt(timeline[0]?.time ?? c.lastActivity)}</dd></div>
                  <div><dt>{tr("Deal value", "قيمة الصفقة")}</dt><dd>{c.deal.value}</dd></div>
                </dl>
              </section>
              <section className="tv-card ws-recent" aria-labelledby="ra-title">
                <div className="tv-plist-head">
                  <h2 className="tv-plist-title" id="ra-title">{tr("Recent activities", "أحدث الأنشطة")}</h2>
                  <RAC.Button className="tv-inbox-textbtn" onPress={() => setTab("activities")}>{tr("View all", "عرض الكل")}<Icon.ChevronRight className="tv-flip" /></RAC.Button>
                </div>
                <ActivityTimeline items={timeline.slice(0, 4)} />
              </section>
              <section className="tv-card ws-deal" aria-labelledby="dl-title">
                <div className="tv-plist-head">
                  <h2 className="tv-plist-title" id="dl-title">{tr("Deals", "الصفقات")} · 1</h2>
                  <RAC.Button className="tv-inbox-textbtn" onPress={() => toast({ title: tr("New deal form", "نموذج صفقة جديدة") })}><Icon.Plus />{tr("Add", "إضافة")}</RAC.Button>
                </div>
                <span className="ws-deal-top"><b>{c.deal.name}</b><span className="ws-deal-value">{c.deal.value}</span></span>
                {stages}
                <span className="tv-desc">{tr("Owner", "المسؤول")}: {c.deal.owner} · {tr("Expected close", "الإغلاق المتوقع")}: {dateFmt(new Date(Date.now() + 18 * 864e5), { day: "numeric", month: "long" })}</span>
              </section>
            </div>
          </TabPanel>
          <TabPanel id="activities">
            <ActivityTimeline items={timeline} onAddNote={note} />
          </TabPanel>
          <TabPanel id="chat">
            <div className="ws-chat">
              <MessageThread messages={thread} label={c.name} />
              <AiAgentBar mode={handoff.mode} minutes={handoff.minutes} remaining={handoff.remaining}
                onTakeOver={handoff.takeOver} onHandBack={handoff.handBack} onMinutesChange={handoff.setMinutes} />
              <Composer channels={c.identities.map((x) => x.channel)} channel={channel} onChannelChange={setChannel} onSend={send}
                onSuggest={() => d.suggest(conv ?? { id: "x", contact: { name: c.name } })} savedReplies={d.savedReplies} templates={d.templates} />
            </div>
          </TabPanel>
          <TabPanel id="deals">
            <article className="tv-card ws-deal">
              <span className="ws-deal-top"><b>{c.deal.name}</b><span className="ws-deal-value">{c.deal.value}</span></span>
              {stages}
              <span className="tv-desc">{tr("Owner", "المسؤول")}: {c.deal.owner} · {tr("Expected close", "الإغلاق المتوقع")}: {dateFmt(new Date(Date.now() + 18 * 864e5), { day: "numeric", month: "long" })}</span>
            </article>
          </TabPanel>
        </Tabs>
      </div>

      {/* End column: what to know and do next */}
      <aside className="ws-record-aside" aria-label={tr("Summary", "ملخص")}>
        <section className="tv-card ws-side-card ws-summary">
          <h2 className="tv-plist-title"><Icon.Sparkles />{tr("AI summary", "ملخص الذكاء الاصطناعي")}</h2>
          <p dir="auto">{c.summary}</p>
          <span className="tv-desc">{tr("From 4 conversations and 2 calls", "من ٤ محادثات ومكالمتين")}</span>
        </section>
        <section className="tv-card ws-side-card">
          <h2 className="tv-plist-title">{tr("Company", "الشركة")}</h2>
          <span className="ws-company"><span className="ws-company-logo" aria-hidden="true">{c.company[0]}</span>
            <span className="tv-ids-text"><b>{c.company}</b><span dir="ltr">{c.email.split("@")[1]}</span></span></span>
        </section>
        <section className="tv-card ws-side-card">
          <h2 className="tv-plist-title">{tr("Source", "المصدر")}</h2>
          <div className="tv-source"><ChannelBadge channel={c.source.channel} size={32} />
            <span className="tv-ids-text"><b>{c.source.label}</b>{c.source.campaign && <span>{tr("Campaign", "الحملة")}: {c.source.campaign}</span>}
              <span>{dateFmt(c.source.date, { day: "numeric", month: "long", year: "numeric" })}</span></span>
          </div>
        </section>
        <section className="tv-card ws-side-card">
          <h2 className="tv-plist-title">{tr("Next steps", "الخطوات التالية")}</h2>
          <ul className="ws-tasks">
            <li><Icon.Phone />{tr("Call back about the 2-branch start", "معاودة الاتصال بخصوص البدء بفرعين")}<span className="tv-desc">{tr("Today, 3 pm", "اليوم، ٣ م")}</span></li>
            <li><Icon.FileText />{tr("Send the updated quote", "إرسال عرض السعر المحدث")}<span className="tv-desc">{tr("Tomorrow", "غدًا")}</span></li>
          </ul>
        </section>
      </aside>
      <CallSheet isOpen={calling} onOpenChange={setCalling} contact={c}
        onEnd={(s) => setTimeline((x) => [{ id: "c" + Date.now(), type: "call", title: tr(`Outbound call · ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`, `مكالمة صادرة · ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`), author: d.me.name, time: new Date() }, ...x])} />
    </div>
  );
}

/* ---------- Team & roles ---------- */
export function TeamPage() {
  const d = useCrmData();
  const tr = useTr();
  const lang = useLang();
  const f = useFormat();
  const narrow = useNarrow();
  const [members, setMembers] = useState(d.members);
  const [roles, setRoles] = useState(d.roles);
  const [roleId, setRoleId] = useState("manager");
  const [draft, setDraft] = useState(null); // unsaved permissions for the selected role
  const [inviting, setInviting] = useState(false);
  const [query, setQuery] = useState("");
  const role = roles.find((r) => r.id === roleId);
  const perms = draft ?? role.perms;
  const roleName = (id) => roles.find((r) => r.id === id)?.name;
  const q = query.trim().toLowerCase();
  const shown = members.filter((m) => !q || m.name.toLowerCase().includes(q) || m.email.includes(q));
  const pickRole = (id) => { setRoleId(id); setDraft(null); };
  const setRoleOf = (mid, rid) => { setMembers((x) => x.map((m) => (m.id === mid ? { ...m, role: rid } : m))); toast({ tone: "success", title: tr(`Role changed to ${roleName(rid)}`, `تم تغيير الدور إلى ${roleName(rid)}`) }); };
  const newRole = () => {
    const id = "custom" + Date.now();
    setRoles((x) => [...x, { id, name: tr("New custom role", "دور مخصص جديد"), description: tr("Custom role", "دور مخصص"), members: 0, tone: "neutral", perms: roles.find((r) => r.id === "agent").perms }]);
    setRoleId(id); setDraft(null);
  };
  const roleSelect = (m) => m.role === "owner" ? <Badge tone="accent">{roleName("owner")}</Badge> : (
    <RAC.Select aria-label={tr(`Role for ${m.name}`, `دور ${m.name}`)} selectedKey={m.role} onSelectionChange={(k) => setRoleOf(m.id, k)} className="tv-perm-scope">
      <RAC.Button className="tv-perm-scope-btn"><RAC.SelectValue /><Icon.ChevronDown /></RAC.Button>
      <RAC.Popover className="tv-popover" offset={4}>
        <RAC.ListBox className="tv-listbox" items={roles.filter((r) => r.id !== "owner")}>
          {(r) => <RAC.ListBoxItem id={r.id} className="tv-item" textValue={r.name}><span className="tv-item-text"><span>{r.name}</span><span className="tv-item-desc">{r.description}</span></span><Icon.Check className="tv-check-icon" /></RAC.ListBoxItem>}
        </RAC.ListBox>
      </RAC.Popover>
    </RAC.Select>
  );
  const status = (m) => <Badge tone={m.status === "active" ? "success" : "warning"} dot>{m.status === "active" ? tr("Active", "نشط") : tr("Invited", "مدعو")}</Badge>;
  return (
    <>
      <div className="ws-page-head">
        <div>
          <h1 className="view-title">{tr("Team & roles", "الفريق والأدوار")}</h1>
          <p className="tv-desc ws-page-sub">{tr("Who's in your workspace and what each role can see and do.", "من في مساحة عملك، وما يمكن لكل دور رؤيته وفعله.")}</p>
        </div>
        <div className="ws-page-actions"><Button onPress={() => setInviting(true)}><Icon.UserPlus />{tr("Invite people", "دعوة أشخاص")}</Button></div>
      </div>
      {/* The numbers at a glance */}
      <section className="ws-stats" aria-label={tr("Summary", "ملخص")}>
        {[
          [Icon.Users, tr("Members", "الأعضاء"), members.length, tr(`${f.number(new Set(members.flatMap((m) => m.teams)).size)} teams`, `${f.number(new Set(members.flatMap((m) => m.teams)).size)} فرق`)],
          [Icon.UserCheck, tr("Active", "نشطون"), members.filter((m) => m.status === "active").length, tr("Signed in this month", "سجلوا الدخول هذا الشهر")],
          [Icon.Send, tr("Pending invites", "دعوات معلقة"), members.filter((m) => m.status === "invited").length, tr("Waiting to join", "بانتظار الانضمام")],
          [Icon.Shield, tr("Roles", "الأدوار"), roles.length, tr(`${f.number(roles.filter((r) => !r.system).length)} custom`, `${f.number(roles.filter((r) => !r.system).length)} مخصصة`)],
        ].map(([I, label, value, note]) => (
          <article key={label} className="tv-stat ws-stat">
            <span className="dash-kpi-head"><span className="dash-kpi-icon" aria-hidden="true"><I /></span><span className="tv-stat-label">{label}</span></span>
            <span className="tv-stat-value">{f.number(value)}</span>
            <span className="tv-desc">{note}</span>
          </article>
        ))}
      </section>
      <Tabs defaultSelectedKey="members">
        <TabList aria-label={tr("Team & roles", "الفريق والأدوار")}>
          <Tab id="members">{tr("Members", "الأعضاء")}</Tab>
          <Tab id="roles">{tr("Roles & permissions", "الأدوار والصلاحيات")}</Tab>
        </TabList>
        <TabPanel id="members">
          <div className="ws-toolbar"><div className="ws-search"><SearchField aria-label={tr("Search members", "ابحث في الأعضاء")} placeholder={tr("Search name or email", "ابحث بالاسم أو البريد")} value={query} onChange={setQuery} /></div></div>
          {narrow ? (
            <ul className="ws-mlist">
              {shown.map((m) => (
                <li key={m.id} className="ws-mrow">
                  <Avatar name={m.name} size={44} />
                  <span className="ws-crow-main"><b>{m.name}</b><span className="tv-desc" dir="ltr">{m.email}</span><span className="ws-crow-meta">{status(m)}{roleSelect(m)}</span></span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="tv-table-scroll ws-table">
              <Table aria-label={tr("Members", "الأعضاء")}>
                <TableHeader>
                  <Column isRowHeader>{tr("Member", "العضو")}</Column>
                  <Column>{tr("Role", "الدور")}</Column>
                  <Column>{tr("Teams", "الفرق")}</Column>
                  <Column>{tr("Status", "الحالة")}</Column>
                  <Column>{tr("Last active", "آخر نشاط")}</Column>
                  <Column align="end"><span className="tv-sr">{tr("Actions", "إجراءات")}</span></Column>
                </TableHeader>
                <TableBody items={shown}>
                  {(m) => (
                    <Row id={m.id}>
                      <Cell><span className="ws-person"><Avatar name={m.name} size={34} /><span><b>{m.name}{m.id === d.me.id && <span className="tv-desc"> · {tr("You", "أنت")}</span>}</b><span className="tv-desc" dir="ltr">{m.email}</span></span></span></Cell>
                      <Cell>{roleSelect(m)}</Cell>
                      <Cell>{m.teams.length ? m.teams.join(lang === "ar" ? "، " : ", ") : "—"}</Cell>
                      <Cell>{status(m)}</Cell>
                      <Cell>{m.last ? f.relative(daysAgo(m.last)) : "—"}</Cell>
                      <Cell align="end">
                        <RAC.MenuTrigger>
                          <RAC.Button className="tv-icon-btn" aria-label={tr(`Actions for ${m.name}`, `إجراءات ${m.name}`)}><Icon.More /></RAC.Button>
                          <RAC.Popover className="tv-popover" placement="bottom end">
                            <RAC.Menu className="tv-listbox" onAction={(k) => {
                              if (k === "remove") { setMembers((x) => x.filter((y) => y.id !== m.id)); toast({ title: tr(`${m.name} removed`, `تمت إزالة ${m.name}`) }); }
                              else toast({ tone: "success", title: tr("Invite sent again", "أُعيد إرسال الدعوة") });
                            }}>
                              {m.status === "invited" && <RAC.MenuItem id="resend" className="tv-item"><Icon.Send />{tr("Resend invite", "إعادة إرسال الدعوة")}</RAC.MenuItem>}
                              <RAC.MenuItem id="remove" className="tv-item tv-item--danger" isDisabled={m.role === "owner"}><Icon.Trash />{tr("Remove from workspace", "إزالة من مساحة العمل")}</RAC.MenuItem>
                            </RAC.Menu>
                          </RAC.Popover>
                        </RAC.MenuTrigger>
                      </Cell>
                    </Row>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabPanel>
        <TabPanel id="roles">
          <div className="ws-roles">
            <div className="ws-roles-list">
              <RoleList roles={roles.map((r) => ({ ...r, members: members.filter((m) => m.role === r.id).length }))} selectedId={roleId} onSelect={pickRole} label={tr("Roles", "الأدوار")} />
              <Button variant="secondary" onPress={newRole}><Icon.Plus />{tr("New custom role", "دور مخصص جديد")}</Button>
            </div>
            <section className="ws-role-editor" aria-label={role.name}>
              <div className="ws-role-head">
                {role.system ? (
                  <div><h2 className="ws-role-title"><Icon.Lock />{role.name}</h2><p className="tv-desc">{role.description} · {tr("Built-in roles can't be changed. Duplicate one to customise it.", "لا يمكن تعديل الأدوار الأساسية. انسخ أحدها لتخصيصه.")}</p></div>
                ) : (
                  <div className="ws-role-fields">
                    <TextField label={tr("Role name", "اسم الدور")} value={role.name} onChange={(v) => setRoles((x) => x.map((r) => (r.id === role.id ? { ...r, name: v } : r)))} />
                    <TextField label={tr("Description", "الوصف")} value={role.description} onChange={(v) => setRoles((x) => x.map((r) => (r.id === role.id ? { ...r, description: v } : r)))} />
                  </div>
                )}
                {role.system && <Button variant="secondary" size="sm" onPress={() => {
                  const id = "custom" + Date.now();
                  setRoles((x) => [...x, { ...role, id, system: false, tone: "neutral", name: tr(`${role.name} (copy)`, `${role.name} (نسخة)`), members: 0 }]);
                  setRoleId(id); setDraft(null);
                }}><Icon.Copy />{tr("Duplicate", "نسخ")}</Button>}
              </div>
              <PermissionMatrix resources={d.resources} value={perms} readOnly={role.system} onChange={setDraft} label={tr(`Permissions for ${role.name}`, `صلاحيات ${role.name}`)} />
              {draft && (
                <div className="ws-savebar" role="region" aria-label={tr("Unsaved changes", "تغييرات غير محفوظة")}>
                  <span>{tr("You have unsaved changes", "لديك تغييرات غير محفوظة")}</span>
                  <Button variant="ghost" size="sm" onPress={() => setDraft(null)}>{tr("Discard", "تجاهل")}</Button>
                  <Button size="sm" onPress={() => { setRoles((x) => x.map((r) => (r.id === role.id ? { ...r, perms: draft } : r))); setDraft(null); toast({ tone: "success", title: tr("Permissions saved", "تم حفظ الصلاحيات") }); }}>{tr("Save changes", "حفظ التغييرات")}</Button>
                </div>
              )}
            </section>
          </div>
        </TabPanel>
      </Tabs>
      <InviteDialog isOpen={inviting} onOpenChange={setInviting} roles={roles.filter((r) => r.id !== "owner")}
        onInvite={(email, rid) => { setMembers((x) => [...x, { id: email, name: email.split("@")[0], email, role: rid, teams: [], status: "invited", last: null }]); toast({ tone: "success", title: tr("Invitation sent", "تم إرسال الدعوة"), description: email }); }} />
    </>
  );
}

function InviteDialog({ isOpen, onOpenChange, roles, onInvite }) {
  const tr = useTr();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("agent");
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  return (
    <RAC.ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable className="tv-overlay">
      <RAC.Modal className="tv-modal">
        <RAC.Dialog className="tv-dialog ws-invite">
          {({ close }) => (
            <form onSubmit={(e) => { e.preventDefault(); if (!valid) return; onInvite(email, role); setEmail(""); close(); }}>
              <RAC.Heading slot="title" className="tv-dialog-title">{tr("Invite people", "دعوة أشخاص")}</RAC.Heading>
              <p className="tv-desc">{tr("They'll get an email to join your workspace.", "سيصلهم بريد للانضمام إلى مساحة عملك.")}</p>
              <TextField label={tr("Email", "البريد الإلكتروني")} type="email" value={email} onChange={setEmail} autoFocus isRequired />
              <div className="tv-field">
                <span className="tv-label" id="inv-role">{tr("Role", "الدور")}</span>
                <RoleCards roles={roles} value={role} onChange={setRole} />
              </div>
              <div className="ws-dialog-actions">
                <Button variant="ghost" onPress={close}>{tr("Cancel", "إلغاء")}</Button>
                <Button type="submit" isDisabled={!valid}><Icon.Send />{tr("Send invite", "إرسال الدعوة")}</Button>
              </div>
            </form>
          )}
        </RAC.Dialog>
      </RAC.Modal>
    </RAC.ModalOverlay>
  );
}

function RoleCards({ roles, value, onChange }) {
  return (
    <RAC.RadioGroup aria-labelledby="inv-role" value={value} onChange={onChange} className="ws-rolecards">
      {roles.map((r) => (
        <RAC.Radio key={r.id} value={r.id} className="ws-rolecard">
          <span className="tv-radio-dot" />
          <span className="tv-role-text"><span className="tv-role-name">{r.name}</span><span className="tv-desc">{r.description}</span></span>
        </RAC.Radio>
      ))}
    </RAC.RadioGroup>
  );
}
