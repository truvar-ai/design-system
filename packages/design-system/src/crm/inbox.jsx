// Conversations: one inbox for every channel. List, thread, composer, AI handoff and contact panel,
// usable one by one or together as <ConversationInbox>.
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as RAC from "react-aria-components";
import * as Icon from "../icons/icons.jsx";
import { Avatar, Button, Checkbox, Badge, EmptyState, SearchField, Drawer, Disclosure, toast } from "../core/index.jsx";
import { ChannelIcon, ChannelBadge, ChannelAvatar, ChannelLabel, channelName } from "./channels.jsx";
import { useCrm } from "./i18n.js";
import { numberFormat } from "../core/format.js";

const cx = (...c) => c.filter(Boolean).join(" ");

/* =====================================================================
   AI HANDOFF
   The AI agent answers until a person takes over. While a person handles the conversation,
   a timer runs; each reply restarts it. If no one replies before it ends, the AI agent resumes.
   resumeAfter is in minutes; null means the AI stays paused until handed back.
   ===================================================================== */
export const RESUME_OPTIONS = [1, 5, 15, 30, 60, null];

// State for one conversation: { mode: "ai" | "human", minutes, resumeAt }
export const aiStart = (mode = "ai", minutes = 15) => ({ mode, minutes, resumeAt: mode === "human" && minutes != null ? Date.now() + minutes * 60000 : null });
export const aiTakeOver = (s) => ({ ...s, mode: "human", resumeAt: s.minutes == null ? null : Date.now() + s.minutes * 60000 });
export const aiHandBack = (s) => ({ ...s, mode: "ai", resumeAt: null });
export const aiTouch = (s) => aiTakeOver(s); // a reply from a person (re)starts the timer
export const aiSetMinutes = (s, minutes) => ({ ...s, minutes, resumeAt: s.mode === "human" && minutes != null ? Date.now() + minutes * 60000 : null });

// One ticking clock, only while some timer is running
function useNow(active) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

/* Standalone hook for one conversation */
export function useAiHandoff({ initial = "ai", resumeAfter = 15, onChange } = {}) {
  const [s, setS] = useState(() => aiStart(initial, resumeAfter));
  const now = useNow(s.mode === "human" && s.resumeAt != null);
  useEffect(() => {
    if (s.mode === "human" && s.resumeAt && now >= s.resumeAt) { setS(aiHandBack); onChange?.("ai", "timeout"); }
  }, [now]); // eslint-disable-line react-hooks/exhaustive-deps
  return {
    ...s, remaining: s.resumeAt ? Math.max(0, s.resumeAt - now) : null,
    takeOver: () => { setS(aiTakeOver); onChange?.("human", "takeover"); },
    handBack: () => { setS(aiHandBack); onChange?.("ai", "handback"); },
    touch: () => setS(aiTouch),
    setMinutes: (m) => setS((x) => aiSetMinutes(x, m)),
  };
}

function useClock() {
  const { locale } = useCrm();
  const two = numberFormat(locale, { minimumIntegerDigits: 2 });
  return (ms) => { const s = Math.ceil(ms / 1000); return `${two.format(Math.floor(s / 60))}:${two.format(s % 60)}`; };
}

/* The bar above the composer: who is answering, and the controls to switch */
export function AiAgentBar({ mode, minutes, remaining, onTakeOver, onHandBack, onMinutesChange, options = RESUME_OPTIONS }) {
  const { t, num } = useCrm();
  const clock = useClock();
  const optLabel = (m) => (m == null ? t.never : m >= 60 ? t.hour(num(m / 60)) : t.min(num(m)));
  if (mode === "ai") {
    return (
      <div className="tv-aibar is-ai" role="status">
        <span className="tv-aibar-icon"><Icon.Sparkles /></span>
        <div className="tv-aibar-text"><strong>{t.aiActive}</strong><span className="tv-desc">{t.aiActiveSub}</span></div>
        <Button size="sm" variant="secondary" onPress={onTakeOver}><Icon.UserCheck />{t.takeOver}</Button>
      </div>
    );
  }
  return (
    <div className="tv-aibar is-human" role="status">
      <span className="tv-aibar-icon"><Icon.UserCheck /></span>
      <div className="tv-aibar-text">
        <strong>{t.youHandle}</strong>
        <span className="tv-desc" aria-live="off">{minutes == null ? t.aiPaused : t.aiResumesIn(clock(remaining ?? minutes * 60000))}</span>
      </div>
      <RAC.MenuTrigger>
        <RAC.Button className="tv-aibar-timer" aria-label={`${t.resumeAfter}: ${optLabel(minutes)}`}>
          <Icon.Clock />{optLabel(minutes)}<Icon.ChevronDown />
        </RAC.Button>
        <RAC.Popover className="tv-popover" placement="top end" offset={6}>
          <p className="tv-pop-title">{t.resumeAfter}</p>
          <RAC.Menu className="tv-listbox" aria-label={t.resumeAfter} selectionMode="single" selectedKeys={[String(minutes)]}
            onAction={(k) => onMinutesChange?.(k === "null" ? null : Number(k))}>
            {options.map((m) => (
              <RAC.MenuItem key={String(m)} id={String(m)} className="tv-item" textValue={optLabel(m)}>
                {optLabel(m)}<Icon.Check className="tv-check-icon" />
              </RAC.MenuItem>
            ))}
          </RAC.Menu>
        </RAC.Popover>
      </RAC.MenuTrigger>
      <Button size="sm" variant="secondary" onPress={onHandBack}><Icon.Bot />{t.handBack}</Button>
    </div>
  );
}

/* =====================================================================
   CONVERSATION LIST
   item: { id, contact: { name }, channel, preview, lastFrom: "contact" | "agent" | "ai", time: Date,
           unread, status: "open" | "snoozed" | "closed", assignee: { id, name } | null, ai: "ai" | "human",
           priority: "high", sla: { label, overdue }, tags: [string] }
   ===================================================================== */
export function ConversationItemContent({ c }) {
  const { t, when, num, lang } = useCrm();
  return (
    <>
      <ChannelAvatar avatar={<Avatar name={c.contact.name} size={44} />} channel={c.channel} size={44} />
      <span className="tv-conv-main">
        <span className="tv-conv-top">
          <span className="tv-conv-name">{c.contact.name}</span>
          {c.priority === "high" && <span className="tv-conv-pri" title="!" aria-hidden="true" />}
          <span className="tv-conv-time">{when(c.time)}</span>
        </span>
        <span className="tv-conv-bottom">
          <span className="tv-conv-preview" dir="auto">
            {c.lastFrom === "agent" && <b>{t.you}: </b>}
            {c.lastFrom === "ai" && <Icon.Sparkles className="tv-conv-ai-icon" aria-label={t.aiAgent} />}
            {c.preview}
          </span>
          {c.unread > 0 && <span className="tv-conv-count" aria-label={`${num(c.unread)}`}>{num(c.unread)}</span>}
        </span>
        <span className="tv-conv-meta">
          <span className="tv-conv-chip"><ChannelIcon channel={c.channel} size={12} />{channelName(c.channel, lang)}</span>
          {c.ai === "ai" && <span className="tv-conv-chip is-ai"><Icon.Sparkles />{t.aiAgent}</span>}
          {c.assignee && c.ai !== "ai" && <span className="tv-conv-chip"><Icon.User />{c.assignee.name}</span>}
          {c.sla?.overdue && <span className="tv-conv-chip is-late"><Icon.Clock />{c.sla.label}</span>}
        </span>
      </span>
    </>
  );
}

export function ConversationList({ items, selectedId, onSelect, selecting = false, selectedKeys, onSelectionChange, label }) {
  const { t } = useCrm();
  return (
    <RAC.GridList aria-label={label ?? t.conversations} items={items} className="tv-conv-list"
      selectionMode={selecting ? "multiple" : "single"} selectionBehavior={selecting ? "toggle" : "replace"}
      disallowEmptySelection={!selecting}
      selectedKeys={selecting ? selectedKeys : selectedId ? [selectedId] : []}
      onSelectionChange={(keys) => {
        if (selecting) return onSelectionChange?.(keys);
        const k = [...keys][0];
        if (k != null) onSelect?.(k);
      }}
      onAction={selecting ? undefined : (k) => onSelect?.(k)}
      renderEmptyState={() => <div className="tv-empty-mini">{t.noConversations}</div>}>
      {(c) => (
        <RAC.GridListItem id={c.id} textValue={`${c.contact.name}. ${c.preview}`}
          className={cx("tv-conv", c.unread > 0 && "is-unread", c.status !== "open" && "is-muted")}>
          {selecting && <Checkbox slot="selection" />}
          <ConversationItemContent c={c} />
        </RAC.GridListItem>
      )}
    </RAC.GridList>
  );
}

/* =====================================================================
   MESSAGES
   message: { id, from: "contact" | "agent" | "ai" | "system", kind: "text" | "image" | "file" | "voice" | "call" | "note" | "event",
              channel, text, time: Date, author, status: "sent" | "delivered" | "read" | "failed",
              file: { name, size }, image: { src, alt }, voice: { duration }, call: { direction, duration, outcome } }
   ===================================================================== */
function Ticks({ status }) {
  const { t } = useCrm();
  if (!status) return null;
  if (status === "failed") return <span className="tv-msg-failed"><Icon.Alert />{t.failed}</span>;
  const I = status === "sent" ? Icon.Check : Icon.CheckCheck;
  return <I className={cx("tv-msg-ticks", status === "read" && "is-read")} role="img" aria-label={t[status]} />;
}

function Wave({ seed = 7, bars = 28 }) {
  let s = seed;
  const h = Array.from({ length: bars }, () => { s = (s * 16807) % 2147483647; return 25 + (s % 70); });
  return <span className="tv-msg-wave" aria-hidden="true">{h.map((v, i) => <i key={i} style={{ height: v + "%" }} />)}</span>;
}

export function MessageBubble({ m, showAuthor = true, onRetry }) {
  const { t, time, lang } = useCrm();
  if (m.kind === "event") {
    return <div className="tv-msg-event" role="note"><span>{m.text}</span><span className="tv-msg-event-time">{time(m.time)}</span></div>;
  }
  if (m.kind === "note") {
    return (
      <div className="tv-msg-note">
        <span className="tv-msg-note-head"><Icon.StickyNote /><b>{m.author}</b><span>{t.internalNote}</span><span className="tv-msg-time">{time(m.time)}</span></span>
        <p dir="auto">{m.text}</p>
      </div>
    );
  }
  const side = m.from === "contact" ? "is-in" : "is-out";
  return (
    <div className={cx("tv-msg", side, m.from === "ai" && "is-ai")}>
      {showAuthor && m.from !== "contact" && (
        <span className="tv-msg-author">{m.from === "ai" ? <><Icon.Sparkles />{t.aiAgent}</> : m.author}</span>
      )}
      <div className="tv-msg-bubble">
        {m.kind === "image" && (
          m.image?.src ? <img className="tv-msg-img" src={m.image.src} alt={m.image.alt ?? ""} />
            : <span className="tv-msg-img is-placeholder" role="img" aria-label={m.image?.alt}><Icon.ImageIcon /><span>{m.image?.alt}</span></span>
        )}
        {m.kind === "file" && (
          <span className="tv-msg-file"><span className="tv-msg-file-icon"><Icon.FileText /></span>
            <span className="tv-msg-file-text"><b dir="auto">{m.file.name}</b><span>{m.file.size}</span></span>
            <RAC.Button className="tv-icon-btn" aria-label={`${m.file.name}`}><Icon.Download /></RAC.Button>
          </span>
        )}
        {m.kind === "voice" && (
          <span className="tv-msg-voice">
            <RAC.Button className="tv-msg-play" aria-label="Play"><Icon.Play /></RAC.Button>
            <Wave seed={m.id.length * 31} /><span className="tv-msg-dur">{m.voice.duration}</span>
          </span>
        )}
        {m.kind === "call" && (
          <span className="tv-msg-call">
            <span className="tv-msg-call-icon"><Icon.Phone /></span>
            <span className="tv-msg-file-text"><b>{m.call.title}</b><span>{m.call.duration} · {m.call.outcome}</span></span>
            <RAC.Button className="tv-msg-play" aria-label="Play recording"><Icon.Play /></RAC.Button>
          </span>
        )}
        {m.text && m.kind !== "call" && <p dir="auto">{m.text}</p>}
        <span className="tv-msg-foot">
          {m.channel && <ChannelIcon channel={m.channel} size={11} label={channelName(m.channel, lang)} />}
          <span>{time(m.time)}</span>
          {side === "is-out" && <Ticks status={m.status} />}
        </span>
      </div>
      {m.status === "failed" && onRetry && <RAC.Button className="tv-msg-retry" onPress={() => onRetry(m)}>{t.retry}</RAC.Button>}
    </div>
  );
}

export function MessageThread({ messages, onRetry, label }) {
  const { day } = useCrm();
  const ref = useRef(null);
  useEffect(() => { const el = ref.current; if (el) el.scrollTop = el.scrollHeight; }, [messages.length]);
  const rows = [];
  let lastDay = "", prev = null;
  for (const m of messages) {
    const d = m.time.toDateString();
    if (d !== lastDay) { rows.push(<div className="tv-msg-day" key={"d" + d}><span>{day(m.time)}</span></div>); lastDay = d; prev = null; }
    // Consecutive messages from the same sender within 5 minutes don't repeat the author line
    const grouped = prev && prev.from === m.from && prev.author === m.author && m.time - prev.time < 5 * 60000 && prev.kind !== "event" && prev.kind !== "note";
    rows.push(<MessageBubble key={m.id} m={m} showAuthor={!grouped} onRetry={onRetry} />);
    prev = m;
  }
  return <div className="tv-thread" ref={ref} role="log" aria-label={label} aria-live="polite" aria-relevant="additions" tabIndex={0}>{rows}</div>;
}

/* =====================================================================
   COMPOSER
   ===================================================================== */
const EMOJI = ["😊", "🙏", "👍", "🎉", "✅", "❤️", "😂", "🤝", "📞", "📅", "💡", "🔥", "👋", "😅", "🙌", "⭐"];

export function Composer({ channels = ["whatsapp"], channel, onChannelChange, onSend, onSuggest, savedReplies = [], templates = [],
  windowClosed = false, contactName, disabled }) {
  const { t, lang } = useCrm();
  const [mode, setMode] = useState("reply");
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [suggestion, setSuggestion] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [template, setTemplate] = useState(templates[0]?.id);
  const area = useRef(null);
  const ch = channel ?? channels[0];
  const note = mode === "note";
  const locked = !note && windowClosed && ch === "whatsapp";
  const send = () => {
    const body = text.trim();
    if (!body && !files.length) return;
    onSend?.({ text: body, mode, channel: ch, files });
    setText(""); setFiles([]); setSuggestion(null);
    area.current?.focus();
  };
  const suggest = async () => {
    if (!onSuggest) return;
    setThinking(true);
    try { setSuggestion(await onSuggest()); } finally { setThinking(false); }
  };
  const insert = (s) => { setText((x) => (x ? x + (x.endsWith(" ") ? "" : " ") : "") + s); area.current?.focus(); };
  return (
    <div className={cx("tv-composer", note && "is-note")}>
      <div className="tv-composer-top">
        <RAC.ToggleButtonGroup className="tv-segmented tv-composer-mode" selectionMode="single" disallowEmptySelection
          selectedKeys={[mode]} onSelectionChange={(k) => setMode([...k][0])} aria-label={t.reply}>
          <RAC.ToggleButton id="reply" className="tv-segment-btn"><RAC.SelectionIndicator className="tv-segment-indicator" /><span className="tv-segment-label"><Icon.Reply />{t.reply}</span></RAC.ToggleButton>
          <RAC.ToggleButton id="note" className="tv-segment-btn"><RAC.SelectionIndicator className="tv-segment-indicator" /><span className="tv-segment-label"><Icon.StickyNote />{t.internalNote}</span></RAC.ToggleButton>
        </RAC.ToggleButtonGroup>
        {!note && (
          <RAC.MenuTrigger>
            <RAC.Button className="tv-composer-via" aria-label={`${t.replyVia}: ${channelName(ch, lang)}`}>
              <span className="tv-desc">{t.replyVia}</span><ChannelLabel channel={ch} /><Icon.ChevronDown />
            </RAC.Button>
            <RAC.Popover className="tv-popover" placement="top start" offset={6}>
              <p className="tv-pop-title">{t.replyVia}</p>
              <RAC.Menu className="tv-listbox" aria-label={t.replyVia} selectionMode="single" selectedKeys={[ch]} onAction={(k) => onChannelChange?.(k)}>
                {channels.map((c) => (
                  <RAC.MenuItem key={c} id={c} className="tv-item" textValue={channelName(c, lang)}><ChannelLabel channel={c} size={16} /><Icon.Check className="tv-check-icon" /></RAC.MenuItem>
                ))}
              </RAC.Menu>
            </RAC.Popover>
          </RAC.MenuTrigger>
        )}
      </div>

      {suggestion && !note && (
        <div className="tv-composer-suggest" role="status">
          <span className="tv-composer-suggest-head"><Icon.Sparkles />{t.suggestion}</span>
          <p dir="auto">{suggestion}</p>
          <span className="tv-composer-suggest-actions">
            <Button size="sm" onPress={() => { setText(suggestion); setSuggestion(null); area.current?.focus(); }}>{t.useIt}</Button>
            <Button size="sm" variant="ghost" onPress={() => setSuggestion(null)}>{t.dismiss}</Button>
          </span>
        </div>
      )}

      {locked ? (
        <div className="tv-composer-locked">
          <p className="tv-desc"><Icon.Lock />{t.windowClosed}</p>
          <div className="tv-composer-template">
            <RAC.Select aria-label={t.template} selectedKey={template} onSelectionChange={setTemplate} className="tv-composer-select">
              <RAC.Button className="tv-select-btn"><RAC.SelectValue /><Icon.ChevronDown className="tv-select-chev" /></RAC.Button>
              <RAC.Popover className="tv-popover"><RAC.ListBox className="tv-listbox" items={templates}>{(x) => <RAC.ListBoxItem id={x.id} className="tv-item" textValue={x.title}>{x.title}</RAC.ListBoxItem>}</RAC.ListBox></RAC.Popover>
            </RAC.Select>
            <Button size="sm" onPress={() => { const x = templates.find((y) => y.id === template); if (x) onSend?.({ text: x.text, mode: "reply", channel: ch, template: x.id }); }}><Icon.Send />{t.sendTemplate}</Button>
          </div>
        </div>
      ) : (
        <>
          {files.length > 0 && (
            <ul className="tv-composer-files">
              {files.map((f, i) => (
                <li key={i}><Icon.Paperclip /><span dir="auto">{f.name}</span>
                  <RAC.Button className="tv-icon-btn" aria-label={`${t.dismiss} ${f.name}`} onPress={() => setFiles((x) => x.filter((_, j) => j !== i))}><Icon.X /></RAC.Button>
                </li>
              ))}
            </ul>
          )}
          <RAC.TextField aria-label={note ? t.internalNote : t.reply} value={text} onChange={setText} isDisabled={disabled} className="tv-composer-field">
            <RAC.TextArea ref={area} rows={1} dir="auto" className="tv-composer-input" enterKeyHint="send"
              placeholder={note ? t.typeNote : t.typeReply(channelName(ch, lang))}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
          </RAC.TextField>
          <div className="tv-composer-tools">
            <RAC.DialogTrigger>
              <RAC.Button className="tv-icon-btn" aria-label={t.emoji}><Icon.Smile /></RAC.Button>
              <RAC.Popover className="tv-popover" placement="top start" offset={6}>
                <RAC.Dialog className="tv-emoji" aria-label={t.emoji}>
                  {({ close }) => EMOJI.map((e) => <RAC.Button key={e} className="tv-emoji-btn" onPress={() => { insert(e); close(); }} aria-label={e}>{e}</RAC.Button>)}
                </RAC.Dialog>
              </RAC.Popover>
            </RAC.DialogTrigger>
            <RAC.FileTrigger allowsMultiple onSelect={(list) => list && setFiles((x) => [...x, ...Array.from(list)])}>
              <RAC.Button className="tv-icon-btn" aria-label={t.attach}><Icon.Paperclip /></RAC.Button>
            </RAC.FileTrigger>
            {savedReplies.length > 0 && (
              <RAC.MenuTrigger>
                <RAC.Button className="tv-icon-btn" aria-label={t.savedReplies}><Icon.Reply /></RAC.Button>
                <RAC.Popover className="tv-popover tv-composer-saved" placement="top start" offset={6}>
                  <p className="tv-pop-title">{t.savedReplies}</p>
                  <RAC.Menu className="tv-listbox" aria-label={t.savedReplies} onAction={(k) => { const r = savedReplies.find((x) => x.id === k); if (r) insert(r.text); }}>
                    {savedReplies.map((r) => (
                      <RAC.MenuItem key={r.id} id={r.id} className="tv-item" textValue={r.title}>
                        <span className="tv-item-text"><span>{r.title}</span><span className="tv-item-desc">{r.text}</span></span>
                      </RAC.MenuItem>
                    ))}
                  </RAC.Menu>
                </RAC.Popover>
              </RAC.MenuTrigger>
            )}
            {onSuggest && !note && (
              <RAC.Button className="tv-composer-ai" onPress={suggest} isPending={thinking} aria-label={t.suggest}>
                <Icon.Sparkles /><span>{t.suggest}</span>
              </RAC.Button>
            )}
            <span className="tv-composer-hint">{t.enterHint}</span>
            <Button size="sm" className="tv-composer-send" onPress={send} isDisabled={!text.trim() && !files.length} aria-label={t.send}>
              <Icon.Send /><span>{note ? t.save : t.send}</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/* =====================================================================
   CONTACT PANEL
   contact: { id, name, title, company, email, phone, location, language, identities: [{ channel, handle }],
              source: { channel, label, date, campaign }, deal: { name, stage, tone, value, owner }, tags, history: [{ id, channel, title, time }], summary }
   ===================================================================== */
export function ContactPanel({ contact: c, onCall, onEmail, profileHref, onClose }) {
  const { t, day, lang } = useCrm();
  if (!c) return null;
  return (
    <aside className="tv-cpanel" aria-label={t.details}>
      <div className="tv-cpanel-head">
        {onClose && <RAC.Button className="tv-icon-btn tv-cpanel-close" aria-label={t.close} onPress={onClose}><Icon.X /></RAC.Button>}
        <Avatar name={c.name} size={64} />
        <h3 className="tv-cpanel-name">{c.name}</h3>
        {(c.title || c.company) && <p className="tv-desc">{[c.title, c.company].filter(Boolean).join(" · ")}</p>}
        <div className="tv-cpanel-quick">
          <RAC.Button className="tv-quick" onPress={onCall}><Icon.Phone /><span>{t.call}</span></RAC.Button>
          <RAC.Button className="tv-quick" onPress={onEmail}><Icon.Mail /><span>{t.email}</span></RAC.Button>
          {profileHref && <RAC.Link className="tv-quick" href={profileHref}><Icon.ExternalLink /><span>{t.openProfile}</span></RAC.Link>}
        </div>
      </div>
      {c.summary && (
        <div className="tv-cpanel-summary"><span className="tv-cpanel-summary-head"><Icon.Sparkles />{t.summary}</span><p dir="auto">{c.summary}</p></div>
      )}
      <Disclosure title={t.about} defaultExpanded>
        <dl className="tv-props">
          {c.email && <><dt>{t.email}</dt><dd dir="ltr">{c.email}</dd></>}
          {c.phone && <><dt>{t.phone}</dt><dd dir="ltr">{c.phone}</dd></>}
          {c.location && <><dt>{t.location}</dt><dd>{c.location}</dd></>}
          {c.language && <><dt>{t.language}</dt><dd>{c.language}</dd></>}
        </dl>
      </Disclosure>
      {c.identities?.length > 0 && (
        <Disclosure title={t.identities} defaultExpanded>
          <ul className="tv-ids">
            {c.identities.map((x) => <li key={x.channel + x.handle}><ChannelBadge channel={x.channel} size={22} /><span className="tv-ids-text"><b>{channelName(x.channel, lang)}</b><span dir="ltr">{x.handle}</span></span></li>)}
          </ul>
        </Disclosure>
      )}
      {c.source && (
        <Disclosure title={t.source} defaultExpanded>
          <div className="tv-source">
            <ChannelBadge channel={c.source.channel} size={28} />
            <span className="tv-ids-text"><b>{c.source.label}</b>{c.source.campaign && <span>{t.campaign}: {c.source.campaign}</span>}<span>{t.firstTouch}: {day(c.source.date)}</span></span>
          </div>
        </Disclosure>
      )}
      {c.deal && (
        <Disclosure title={t.deal} defaultExpanded>
          <div className="tv-deal">
            <b>{c.deal.name}</b>
            <span className="tv-deal-row"><Badge tone={c.deal.tone ?? "neutral"} dot>{c.deal.stage}</Badge><span className="tv-deal-value">{c.deal.value}</span></span>
            {c.deal.owner && <span className="tv-desc">{t.owner}: {c.deal.owner}</span>}
          </div>
        </Disclosure>
      )}
      {c.tags?.length > 0 && (
        <Disclosure title={t.tags} defaultExpanded>
          <div className="tv-tags">{c.tags.map((x) => <span key={x} className="tv-tag-chip"><Icon.Tag />{x}</span>)}</div>
        </Disclosure>
      )}
      {c.history?.length > 0 && (
        <Disclosure title={t.history}>
          <ul className="tv-ids">
            {c.history.map((h) => <li key={h.id}><ChannelIcon channel={h.channel} size={16} /><span className="tv-ids-text"><b dir="auto">{h.title}</b><span>{day(h.time)}</span></span></li>)}
          </ul>
        </Disclosure>
      )}
    </aside>
  );
}

/* =====================================================================
   INBOX: everything together. Three panes when there is room, two on tablets, one at a time on phones.
   Pass the data; the inbox keeps its own working state and reports changes through the callbacks.
   ===================================================================== */
function useWidth(ref) {
  const [w, setW] = useState(1200);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

export function ConversationInbox({ conversations, messages, contacts, team = [], me, savedReplies, templates, onSuggest,
  profileHref, initialId, onOpenChange, onViewChange, onSend, onCall, onEmail, aiResumeAfter = 15, className }) {
  const { t, lang, num } = useCrm();
  const root = useRef(null);
  const width = useWidth(root);
  const layout = width >= 1180 ? 3 : width >= 720 ? 2 : 1;
  const [convs, setConvs] = useState(() => conversations.map((c) => (c.id === initialId ? { ...c, unread: 0 } : c)));
  const [msgs, setMsgs] = useState(messages);
  const [ai, setAi] = useState(() => Object.fromEntries(conversations.map((c) => [c.id, aiStart(c.ai ?? "ai", aiResumeAfter)])));
  const [selectedId, setSelectedId] = useState(initialId ?? null);
  const [view, setView] = useState(initialId ? "thread" : "list");
  const [tab, setTab] = useState("all");
  const [status, setStatus] = useState("open");
  const [chFilter, setChFilter] = useState(new Set());
  const [query, setQuery] = useState("");
  const [selecting, setSelecting] = useState(false);
  const [bulk, setBulk] = useState(new Set());
  const [panel, setPanel] = useState(true);   // inline panel, wide layout
  const [drawer, setDrawer] = useState(false); // panel as a drawer, smaller layouts
  const [channelFor, setChannelFor] = useState({});

  useEffect(() => { onViewChange?.(layout === 1 ? view : "both"); }, [view, layout]); // eslint-disable-line react-hooks/exhaustive-deps
  const running = Object.values(ai).some((s) => s.mode === "human" && s.resumeAt);
  const now = useNow(running);
  const add = useCallback((id, m) => setMsgs((x) => ({ ...x, [id]: [...(x[id] ?? []), { id: "m" + Math.random().toString(36).slice(2), time: new Date(), ...m }] })), []);

  // Resume the AI where a timer ran out
  useEffect(() => {
    for (const [id, s] of Object.entries(ai)) {
      if (s.mode === "human" && s.resumeAt && now >= s.resumeAt) {
        setAi((x) => ({ ...x, [id]: aiHandBack(x[id]) }));
        setConvs((x) => x.map((c) => (c.id === id ? { ...c, ai: "ai" } : c)));
        add(id, { from: "system", kind: "event", text: t.aiResumed });
      }
    }
  }, [now]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => ({
    mine: convs.filter((c) => c.status === status && c.assignee?.id === me?.id).length,
    unassigned: convs.filter((c) => c.status === status && !c.assignee).length,
    all: convs.filter((c) => c.status === status).length,
  }), [convs, status, me]);
  const q = query.trim().toLowerCase();
  const visible = convs
    .filter((c) => c.status === status)
    .filter((c) => (tab === "mine" ? c.assignee?.id === me?.id : tab === "unassigned" ? !c.assignee : true))
    .filter((c) => !chFilter.size || chFilter.has(c.channel))
    .filter((c) => !q || c.contact.name.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q))
    .sort((a, b) => b.time - a.time);

  const sel = convs.find((c) => c.id === selectedId);
  const contact = sel && contacts[sel.contact.id];
  const s = sel && ai[sel.id];

  const open = (id) => {
    setSelectedId(id); setView("thread");
    setConvs((x) => x.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
    onOpenChange?.(id);
  };
  // j / k move through the list, e closes, r writes a reply (not while typing)
  useEffect(() => {
    const on = (e) => {
      if (e.target.closest?.("input, textarea, [contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (!root.current?.contains(document.activeElement) && document.activeElement !== document.body) return;
      const i = visible.findIndex((c) => c.id === selectedId);
      if (e.key === "j" && visible[i + 1]) open(visible[i + 1].id);
      else if (e.key === "k" && i > 0) open(visible[i - 1].id);
      else if (e.key === "e" && sel) setStatusOf(sel.id, sel.status === "closed" ? "open" : "closed");
      else if (e.key === "r") root.current?.querySelector(".tv-composer-input")?.focus();
      else return;
      e.preventDefault();
    };
    addEventListener("keydown", on);
    return () => removeEventListener("keydown", on);
  });

  const setStatusOf = (id, st) => {
    setConvs((x) => x.map((c) => (c.id === id ? { ...c, status: st } : c)));
    toast({ tone: "success", title: st === "closed" ? t.closed : st === "snoozed" ? t.snoozed : t.open });
  };
  const assign = (ids, person) => {
    setConvs((x) => x.map((c) => (ids.includes(c.id) ? { ...c, assignee: person } : c)));
    ids.forEach((id) => add(id, { from: "system", kind: "event", text: person ? `${t.assignTo} ${person.name}` : t.unassign }));
  };
  const takeOver = (id) => {
    setAi((x) => ({ ...x, [id]: aiTakeOver(x[id]) }));
    setConvs((x) => x.map((c) => (c.id === id ? { ...c, ai: "human", assignee: c.assignee ?? me } : c)));
    add(id, { from: "system", kind: "event", text: t.tookOver(me?.name ?? t.you) });
  };
  const handBack = (id) => {
    setAi((x) => ({ ...x, [id]: aiHandBack(x[id]) }));
    setConvs((x) => x.map((c) => (c.id === id ? { ...c, ai: "ai" } : c)));
    add(id, { from: "system", kind: "event", text: t.handedBack(me?.name ?? t.you) });
  };
  const send = ({ text, mode, channel, files }) => {
    const id = sel.id;
    if (mode === "note") { add(id, { from: "agent", kind: "note", author: me?.name, text }); return; }
    if (ai[id].mode === "ai") takeOver(id);
    else setAi((x) => ({ ...x, [id]: aiTouch(x[id]) }));
    const mid = "m" + Math.random().toString(36).slice(2);
    const base = { id: mid, from: "agent", author: me?.name, channel, time: new Date(), status: "sent" };
    const out = files?.length ? files.map((f, i) => ({ ...base, id: mid + i, kind: "file", file: { name: f.name, size: `${Math.max(1, Math.round(f.size / 1024))} KB` }, text: i === 0 ? text : "" })) : [{ ...base, kind: "text", text }];
    setMsgs((x) => ({ ...x, [id]: [...(x[id] ?? []), ...out] }));
    setConvs((x) => x.map((c) => (c.id === id ? { ...c, preview: text || out[0].file?.name, lastFrom: "agent", time: new Date(), assignee: c.assignee ?? me } : c)));
    // Delivery and read receipts arrive the way the channel reports them
    const mark = (st) => setMsgs((x) => ({ ...x, [id]: x[id].map((m) => (out.some((o) => o.id === m.id) ? { ...m, status: st } : m)) }));
    setTimeout(() => mark("delivered"), 900);
    setTimeout(() => mark("read"), 2600);
    onSend?.({ conversationId: id, text, channel });
  };

  const assignMenu = (ids, trigger) => (
    <RAC.MenuTrigger>
      {trigger}
      <RAC.Popover className="tv-popover" placement="bottom end" offset={6}>
        <p className="tv-pop-title">{t.assignTo}</p>
        <RAC.Menu className="tv-listbox" aria-label={t.assignTo} onAction={(k) => assign(ids, k === "none" ? null : team.find((p) => p.id === k))}>
          {team.map((p) => (
            <RAC.MenuItem key={p.id} id={p.id} className="tv-item" textValue={p.name}>
              <Avatar name={p.name} size={24} /><span className="tv-item-text">{p.id === me?.id ? `${p.name} (${t.me})` : p.name}</span>
            </RAC.MenuItem>
          ))}
          <RAC.MenuItem id="none" className="tv-item" textValue={t.unassign}><Icon.X />{t.unassign}</RAC.MenuItem>
        </RAC.Menu>
      </RAC.Popover>
    </RAC.MenuTrigger>
  );

  const showList = layout > 1 || view === "list";
  const showThread = layout > 1 || view === "thread";
  const inlinePanel = layout === 3 && panel && contact;
  const usedChannels = [...new Set(convs.map((c) => c.channel))];

  const listPane = (
    <section className="tv-inbox-list" aria-label={t.conversations}>
      <div className="tv-inbox-list-head">
        <div className="tv-inbox-title-row">
          <h2 className="tv-inbox-title">{t.conversations}</h2>
          <RAC.Button className="tv-inbox-textbtn" onPress={() => { setSelecting((x) => !x); setBulk(new Set()); }}>{selecting ? t.cancel : t.select}</RAC.Button>
        </div>
        <SearchField aria-label={t.search} placeholder={t.search} value={query} onChange={setQuery} />
        <div className="tv-inbox-filters">
          <RAC.ToggleButtonGroup className="tv-inbox-tabs" selectionMode="single" disallowEmptySelection selectedKeys={[tab]} onSelectionChange={(k) => setTab([...k][0])} aria-label={t.conversations}>
            {["mine", "unassigned", "all"].map((k) => (
              <RAC.ToggleButton key={k} id={k} className="tv-inbox-tab">{t[k]}<span className="tv-inbox-tab-count">{num(counts[k])}</span></RAC.ToggleButton>
            ))}
          </RAC.ToggleButtonGroup>
          <RAC.MenuTrigger>
            <RAC.Button className={cx("tv-icon-btn", (chFilter.size > 0 || status !== "open") && "is-on")} aria-label={t.filter}><Icon.Filter /></RAC.Button>
            <RAC.Popover className="tv-popover tv-inbox-filter-pop" placement="bottom end" offset={6}>
              <p className="tv-pop-title">{t.status}</p>
              <RAC.Menu className="tv-listbox" aria-label={t.status} selectionMode="single" selectedKeys={[status]} onSelectionChange={(k) => k !== "all" && [...k][0] && setStatus([...k][0])}>
                {["open", "snoozed", "closed"].map((k) => <RAC.MenuItem key={k} id={k} className="tv-item" textValue={t[k]}>{t[k]}<Icon.Check className="tv-check-icon" /></RAC.MenuItem>)}
              </RAC.Menu>
              <p className="tv-pop-title">{t.channels}</p>
              <RAC.Menu className="tv-listbox" aria-label={t.channels} selectionMode="multiple" selectedKeys={chFilter} onSelectionChange={(k) => setChFilter(k === "all" ? new Set(usedChannels) : new Set(k))}>
                {usedChannels.map((c) => <RAC.MenuItem key={c} id={c} className="tv-item" textValue={channelName(c, lang)}><ChannelLabel channel={c} size={16} /><Icon.Check className="tv-check-icon" /></RAC.MenuItem>)}
              </RAC.Menu>
            </RAC.Popover>
          </RAC.MenuTrigger>
        </div>
        {(chFilter.size > 0 || status !== "open") && (
          <div className="tv-inbox-active-filters">
            {status !== "open" && <span className="tv-tag-chip">{t[status]}</span>}
            {[...chFilter].map((c) => <span key={c} className="tv-tag-chip"><ChannelIcon channel={c} size={12} />{channelName(c, lang)}</span>)}
            <RAC.Button className="tv-inbox-textbtn" onPress={() => { setChFilter(new Set()); setStatus("open"); }}>{t.clearFilters}</RAC.Button>
          </div>
        )}
      </div>
      {selecting && (
        <div className="tv-inbox-bulk" role="toolbar" aria-label={t.selected(num(bulk.size))}>
          <span>{t.selected(num(bulk === "all" ? visible.length : bulk.size))}</span>
          {assignMenu(bulk === "all" ? visible.map((c) => c.id) : [...bulk], <RAC.Button className="tv-inbox-textbtn" isDisabled={!bulk.size}>{t.assign}</RAC.Button>)}
          <RAC.Button className="tv-inbox-textbtn" isDisabled={!bulk.size} onPress={() => { (bulk === "all" ? visible.map((c) => c.id) : [...bulk]).forEach((id) => setConvs((x) => x.map((c) => (c.id === id ? { ...c, status: "closed" } : c)))); setBulk(new Set()); setSelecting(false); }}>{t.close}</RAC.Button>
        </div>
      )}
      <ConversationList items={visible} selectedId={selectedId} onSelect={open} selecting={selecting} selectedKeys={bulk} onSelectionChange={setBulk} />
    </section>
  );

  const threadPane = sel ? (
    <section className="tv-inbox-thread" aria-label={sel.contact.name}>
      <header className="tv-inbox-thread-head">
        {layout === 1 && <RAC.Button className="tv-icon-btn tv-inbox-back" aria-label={t.back} onPress={() => setView("list")}><Icon.ChevronLeft /></RAC.Button>}
        <RAC.Button className="tv-inbox-who" onPress={() => (layout === 3 ? setPanel((x) => !x) : setDrawer(true))} aria-label={`${sel.contact.name}, ${t.details}`}>
          <ChannelAvatar avatar={<Avatar name={sel.contact.name} size={36} />} channel={sel.channel} size={36} />
          <span className="tv-inbox-who-text"><b>{sel.contact.name}</b><span className="tv-desc"><ChannelLabel channel={sel.channel} size={12} />{contact?.company ? ` · ${contact.company}` : ""}</span></span>
        </RAC.Button>
        <div className="tv-inbox-actions">
          {onCall && <RAC.Button className="tv-icon-btn" aria-label={t.call} onPress={() => onCall(contact)}><Icon.Phone /></RAC.Button>}
          {assignMenu([sel.id], <RAC.Button className="tv-inbox-assign" aria-label={`${t.assign}: ${sel.assignee?.name ?? t.unassigned}`}>{sel.assignee ? <Avatar name={sel.assignee.name} size={24} /> : <Icon.UserPlus />}<span>{sel.assignee?.name ?? t.assign}</span></RAC.Button>)}
          <RAC.MenuTrigger>
            <RAC.Button className="tv-icon-btn" aria-label={t.snooze}><Icon.Clock /></RAC.Button>
            <RAC.Popover className="tv-popover" placement="bottom end" offset={6}>
              <p className="tv-pop-title">{t.snooze}</p>
              <RAC.Menu className="tv-listbox" aria-label={t.snooze} onAction={() => setStatusOf(sel.id, "snoozed")}>
                {Object.entries(t.snoozeFor).map(([k, v]) => <RAC.MenuItem key={k} id={k} className="tv-item">{v}</RAC.MenuItem>)}
              </RAC.Menu>
            </RAC.Popover>
          </RAC.MenuTrigger>
          <Button size="sm" variant={sel.status === "closed" ? "secondary" : "primary"} className="tv-inbox-close" aria-label={sel.status === "closed" ? t.reopen : t.close}
            onPress={() => setStatusOf(sel.id, sel.status === "closed" ? "open" : "closed")}>
            {sel.status === "closed" ? <><Icon.Inbox /><span className="tv-inbox-label">{t.reopen}</span></> : <><Icon.Check /><span className="tv-inbox-label">{t.close}</span></>}
          </Button>
          <RAC.Button className={cx("tv-icon-btn", layout === 3 && panel && "is-on")} aria-label={t.details} aria-pressed={layout === 3 ? panel : undefined}
            onPress={() => (layout === 3 ? setPanel((x) => !x) : setDrawer(true))}><Icon.Info /></RAC.Button>
        </div>
      </header>
      <MessageThread messages={msgs[sel.id] ?? []} label={sel.contact.name} />
      <AiAgentBar mode={s.mode} minutes={s.minutes} remaining={s.resumeAt ? s.resumeAt - now : null}
        onTakeOver={() => takeOver(sel.id)} onHandBack={() => handBack(sel.id)}
        onMinutesChange={(m) => setAi((x) => ({ ...x, [sel.id]: aiSetMinutes(x[sel.id], m) }))} />
      <Composer key={sel.id} channels={contact?.identities?.map((x) => x.channel) ?? [sel.channel]} channel={channelFor[sel.id] ?? sel.channel}
        onChannelChange={(c) => setChannelFor((x) => ({ ...x, [sel.id]: c }))} onSend={send}
        onSuggest={onSuggest ? () => onSuggest(sel, msgs[sel.id]) : undefined} savedReplies={savedReplies} templates={templates}
        windowClosed={sel.windowClosed} contactName={sel.contact.name} />
    </section>
  ) : (
    <section className="tv-inbox-thread is-empty"><EmptyState icon={<Icon.MessageCircle />} title={t.conversations}>{t.empty}</EmptyState></section>
  );

  return (
    <div ref={root} className={cx("tv-inbox", className)} data-layout={layout} data-view={view} data-panel={inlinePanel ? "" : undefined}>
      {showList && listPane}
      {showThread && threadPane}
      {inlinePanel && (
        <div className="tv-inbox-panel">
          <ContactPanel contact={contact} profileHref={profileHref?.(contact)} onCall={() => onCall?.(contact)} onEmail={() => onEmail?.(contact)} />
        </div>
      )}
      {layout < 3 && contact && (
        <Drawer isOpen={drawer} onOpenChange={setDrawer} side="end" width={380} title={t.details}>
          <ContactPanel contact={contact} profileHref={profileHref?.(contact)} onCall={() => onCall?.(contact)} onEmail={() => onEmail?.(contact)} />
        </Drawer>
      )}
    </div>
  );
}
