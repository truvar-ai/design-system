// Contact record: header with quick actions, editable properties, and the activity timeline.
import React, { useState, useEffect } from "react";
import * as RAC from "react-aria-components";
import * as Icon from "../icons/icons.jsx";
import { Avatar, Button, Badge, TextField, toast } from "../core/index.jsx";
import { ChannelBadge, ChannelIcon, channelName } from "./channels.jsx";
import { useCrm } from "./i18n.js";
import { numberFormat } from "../core/format.js";

const cx = (...c) => c.filter(Boolean).join(" ");

/* Call sheet: rings, connects, counts the call, and offers mute, hold and hang up.
   contact: { name, phone }. onEnd(seconds) when the call ends. */
export function CallSheet({ isOpen, onOpenChange, contact, onEnd }) {
  const { t, locale } = useCrm();
  const [state, setState] = useState("ringing");
  const [secs, setSecs] = useState(0);
  const [muted, setMuted] = useState(false);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    setState("ringing"); setSecs(0); setMuted(false); setHeld(false);
    const a = setTimeout(() => setState("live"), 1800);
    return () => clearTimeout(a);
  }, [isOpen]);
  useEffect(() => {
    if (state !== "live" || !isOpen) return;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [state, isOpen]);
  const two = numberFormat(locale, { minimumIntegerDigits: 2 });
  const end = () => { onEnd?.(secs); onOpenChange(false); };
  return (
    <RAC.ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} className="tv-overlay">
      <RAC.Modal className="tv-modal tv-call">
        <RAC.Dialog className="tv-call-dialog" aria-label={`${t.call} ${contact?.name ?? ""}`}>
          <Avatar name={contact?.name ?? "?"} size={88} />
          <RAC.Heading slot="title" className="tv-call-name">{contact?.name}</RAC.Heading>
          <p className="tv-desc" dir="ltr">{contact?.phone}</p>
          <p className="tv-call-state" role="status">
            {state === "ringing" ? t.calling : held ? t.onHold : `${two.format(Math.floor(secs / 60))}:${two.format(secs % 60)}`}
          </p>
          <div className="tv-call-controls">
            <RAC.ToggleButton className="tv-call-btn" isSelected={muted} onChange={setMuted} isDisabled={state !== "live"}><Icon.MicOff /><span>{t.mute}</span></RAC.ToggleButton>
            <RAC.ToggleButton className="tv-call-btn" isSelected={held} onChange={setHeld} isDisabled={state !== "live"}><Icon.Pause /><span>{t.hold}</span></RAC.ToggleButton>
            <RAC.Button className="tv-call-btn is-end" onPress={end} autoFocus><Icon.PhoneOff /><span>{t.hangUp}</span></RAC.Button>
          </div>
        </RAC.Dialog>
      </RAC.Modal>
    </RAC.ModalOverlay>
  );
}

/* contact: { name, title, company, stage: { label, tone }, tags, identities: [{ channel, handle }] }
   Actions you leave out aren't shown. */
export function ContactHeader({ contact: c, onMessage, onCall, onEmail, onMeeting, onNote, extra, layout = "row" }) {
  const { t, lang } = useCrm();
  if (layout === "sidebar") {
    const copy = () => navigator.clipboard?.writeText(c.email).then(() => toast({ tone: "success", title: t.copied, description: c.email }));
    const Q = ({ on, icon, label }) => on ? <RAC.Button className="tv-quick" onPress={on}>{icon}<span>{label}</span></RAC.Button> : null;
    return (
      <header className="tv-chead is-sidebar">
        <div className="tv-chead-id">
          <Avatar name={c.name} src={c.photo} size={56} />
          <div className="tv-chead-main">
            <h1 className="tv-chead-name">{c.name}</h1>
            {(c.title || c.company) && <p className="tv-chead-sub">{[c.title, c.company].filter(Boolean).join(" · ")}</p>}
          </div>
        </div>
        {c.email && (
          <span className="tv-chead-email">
            <a href={`mailto:${c.email}`} dir="ltr">{c.email}</a>
            <RAC.Button className="tv-icon-btn" aria-label={`${t.copy} ${c.email}`} onPress={copy}><Icon.Copy /></RAC.Button>
          </span>
        )}
        <div className="tv-chead-badges">
          {c.stage && <Badge tone={c.stage.tone ?? "neutral"} dot>{c.stage.label}</Badge>}
          {c.tags?.map((x) => <span key={x} className="tv-tag-chip"><Icon.Tag />{x}</span>)}
        </div>
        <div className="tv-chead-quick">
          <Q on={onNote} icon={<Icon.StickyNote />} label={t.note} />
          <Q on={onMessage} icon={<Icon.MessageCircle />} label={t.message} />
          <Q on={onEmail} icon={<Icon.Mail />} label={t.email} />
          <Q on={onCall} icon={<Icon.Phone />} label={t.call} />
          <Q on={onMeeting} icon={<Icon.Calendar />} label={t.meeting} />
          {extra}
        </div>
      </header>
    );
  }
  return (
    <header className="tv-chead">
      <Avatar name={c.name} size={72} />
      <div className="tv-chead-main">
        <h1 className="tv-chead-name">{c.name}</h1>
        {(c.title || c.company) && <p className="tv-chead-sub">{[c.title, c.company].filter(Boolean).join(" · ")}</p>}
        <div className="tv-chead-badges">
          {c.stage && <Badge tone={c.stage.tone ?? "neutral"} dot>{c.stage.label}</Badge>}
          {c.tags?.map((x) => <span key={x} className="tv-tag-chip"><Icon.Tag />{x}</span>)}
        </div>
        {c.identities?.length > 0 && (
          <ul className="tv-chead-ids" aria-label={t.identities}>
            {c.identities.map((x) => <li key={x.channel}><ChannelBadge channel={x.channel} size={22} label={`${channelName(x.channel, lang)}: ${x.handle}`} /></li>)}
          </ul>
        )}
      </div>
      <div className="tv-chead-actions">
        {onMessage && <Button onPress={onMessage}><Icon.MessageCircle />{t.message}</Button>}
        {onCall && <Button variant="secondary" onPress={onCall}><Icon.Phone />{t.call}</Button>}
        {onEmail && <Button variant="secondary" onPress={onEmail}><Icon.Mail />{t.email}</Button>}
        {onMeeting && <Button variant="secondary" onPress={onMeeting}><Icon.Calendar />{t.meeting}</Button>}
        {extra}
      </div>
    </header>
  );
}

/* A card of properties. Editable ones switch to fields when you press Edit; Save reports the new values. */
export function PropertyList({ title, items, onSave, editable = true }) {
  const { t } = useCrm();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const start = () => { setDraft(Object.fromEntries(items.map((i) => [i.id, i.value ?? ""]))); setEditing(true); };
  return (
    <section className="tv-card tv-plist" aria-label={title}>
      <div className="tv-plist-head">
        <h2 className="tv-plist-title">{title}</h2>
        {editable && onSave && !editing && <RAC.Button className="tv-inbox-textbtn" onPress={start}><Icon.Pencil />{t.edit}</RAC.Button>}
      </div>
      {editing ? (
        <form className="tv-plist-form" onSubmit={(e) => { e.preventDefault(); onSave(draft); setEditing(false); }}>
          {items.map((i) => i.editable === false
            ? <div key={i.id} className="tv-plist-static"><span className="tv-label">{i.label}</span><span>{i.display ?? i.value}</span></div>
            : <TextField key={i.id} label={i.label} value={draft[i.id]} onChange={(v) => setDraft((d) => ({ ...d, [i.id]: v }))} type={i.type} />)}
          <div className="tv-plist-actions">
            <Button size="sm" variant="ghost" onPress={() => setEditing(false)}>{t.cancel}</Button>
            <Button size="sm" type="submit">{t.save}</Button>
          </div>
        </form>
      ) : (
        <dl className="tv-props">
          {items.map((i) => <React.Fragment key={i.id}><dt>{i.label}</dt><dd dir={i.ltr ? "ltr" : "auto"}>{i.display ?? i.value ?? "—"}</dd></React.Fragment>)}
        </dl>
      )}
    </section>
  );
}

/* Timeline item: { id, type: "call" | "email" | "message" | "note" | "meeting" | "stage" | "deal" | "form" | "ai",
   title, body, time: Date, author, channel } */
const TYPE_ICON = { call: Icon.Phone, email: Icon.Mail, message: Icon.MessageCircle, note: Icon.StickyNote, meeting: Icon.Calendar,
  stage: Icon.TrendUp, deal: Icon.Briefcase, form: Icon.FileText, ai: Icon.Sparkles };
const FILTERS = { all: null, note: ["note"], call: ["call"], message: ["message", "email"], meeting: ["meeting"] };

export function ActivityTimeline({ items, onAddNote, labels }) {
  const { t, day, time, lang } = useCrm();
  const [filter, setFilter] = useState("all");
  const [note, setNote] = useState("");
  const L = { all: t.allActivity, note: lang === "ar" ? "الملاحظات" : "Notes", call: lang === "ar" ? "المكالمات" : "Calls",
    message: lang === "ar" ? "الرسائل" : "Messages", meeting: lang === "ar" ? "الاجتماعات" : "Meetings", ...labels };
  const shown = items.filter((i) => !FILTERS[filter] || FILTERS[filter].includes(i.type)).sort((a, b) => b.time - a.time);
  const groups = [];
  for (const i of shown) {
    const k = i.time.toDateString();
    if (!groups.length || groups[groups.length - 1].k !== k) groups.push({ k, d: i.time, items: [] });
    groups[groups.length - 1].items.push(i);
  }
  return (
    <section className="tv-timeline" aria-label={t.activity}>
      {onAddNote && (
        <form className="tv-timeline-note" onSubmit={(e) => { e.preventDefault(); if (note.trim()) { onAddNote(note.trim()); setNote(""); } }}>
          <RAC.TextField aria-label={t.logNote} value={note} onChange={setNote} className="tv-timeline-note-field">
            <RAC.TextArea className="tv-input" rows={2} placeholder={t.logNote} dir="auto" />
          </RAC.TextField>
          <Button size="sm" type="submit" isDisabled={!note.trim()}><Icon.StickyNote />{t.save}</Button>
        </form>
      )}
      <RAC.ToggleButtonGroup className="tv-timeline-filters" selectionMode="single" disallowEmptySelection selectedKeys={[filter]}
        onSelectionChange={(k) => setFilter([...k][0])} aria-label={t.filter}>
        {Object.keys(FILTERS).map((k) => <RAC.ToggleButton key={k} id={k} className="tv-inbox-tab">{L[k]}</RAC.ToggleButton>)}
      </RAC.ToggleButtonGroup>
      {groups.length === 0 && <p className="tv-empty-mini">{t.empty}</p>}
      {groups.map((g) => (
        <div key={g.k} className="tv-timeline-day">
          <h3 className="tv-timeline-date">{day(g.d)}</h3>
          <ol className="tv-timeline-list">
            {g.items.map((i) => {
              const I = TYPE_ICON[i.type] ?? Icon.Info;
              return (
                <li key={i.id} className={cx("tv-tl", `is-${i.type}`)}>
                  <span className="tv-tl-icon" aria-hidden="true">{i.channel && i.type === "message" ? <ChannelBadge channel={i.channel} size={32} /> : <I />}</span>
                  <div className="tv-tl-body">
                    <div className="tv-tl-head"><b dir="auto">{i.title}</b><span className="tv-tl-time">{time(i.time)}</span></div>
                    {(i.author || i.channel) && (
                      <span className="tv-desc tv-tl-meta">{i.author}{i.author && i.channel ? " · " : ""}{i.channel && <><ChannelIcon channel={i.channel} size={12} />{channelName(i.channel, lang)}</>}</span>
                    )}
                    {i.body && <p className="tv-tl-text" dir="auto">{i.body}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </section>
  );
}
