// Website widget: the AI agent a business embeds on its own site. It doesn't only chat, it acts:
// it shows its steps, offers times, asks before committing, collects details, books, hands over to a person,
// takes voice notes and voice calls. Every part is controlled: the host app (or our backend later) owns the conversation.
import { useState, useEffect, useRef, useLayoutEffect, useSyncExternalStore, useId } from "react";
import * as RAC from "react-aria-components";
import * as Icon from "../icons/icons.jsx";
import { Avatar, BrandAvatar, PhoneField } from "../core/index.jsx";
import { useWidget } from "./i18n.js";

const cx = (...c) => c.filter(Boolean).join(" ");
const PHONE = "(max-width: 640px)";
function usePhoneViewport() {
  return useSyncExternalStore(
    (cb) => { const q = matchMedia(PHONE); q.addEventListener("change", cb); return () => q.removeEventListener("change", cb); },
    () => matchMedia(PHONE).matches, () => false);
}

// Text on the accent: whichever of white or near-black reads better (WCAG contrast)
export function onAccent(hex) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || "");
  if (!m) return "#ffffff";
  const [r, g, b] = m.slice(1).map((h) => { const c = parseInt(h, 16) / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return 1.05 / (L + 0.05) >= (L + 0.05) / 0.056 ? "#ffffff" : "#0b1220";
}

// Shows widget parts on their own (outside WebWidget) with the business's accent
export function WidgetScope({ accent = "#0f6e5c", className, children, ...props }) {
  const { dir } = useWidget();
  return <div {...props} dir={dir} className={cx("tvw-scope", className)} style={{ "--tvw-accent": accent, "--tvw-on-accent": onAccent(accent), ...props.style }}>{children}</div>;
}

/* =====================================================================
   AGENT AVATAR: the business's photo or logo, or the orbit mark. A dot shows if anyone is there.
   ===================================================================== */
export function AgentAvatar({ agent, size = 36, status, active = false }) {
  return (
    <span className="tvw-avatar" style={{ width: size, height: size }}>
      {agent.avatar ? <Avatar name={agent.name} src={agent.avatar} size={size} /> : <BrandAvatar size={size} label={agent.name} active={active} />}
      {status && <span className={cx("tvw-presence", `is-${status}`)} aria-hidden="true" />}
    </span>
  );
}

/* =====================================================================
   LAUNCHER + TEASER
   ===================================================================== */
export function WidgetLauncher({ isOpen, onPress, unread = 0, variant = "icon", text, label, buttonRef }) {
  const { t, num } = useWidget();
  const name = label ?? (isOpen ? t.close : t.open);
  return (
    <RAC.Button ref={buttonRef} className={cx("tvw-launcher", variant === "label" && !isOpen && "has-label", isOpen && "is-open")}
      onPress={onPress} aria-expanded={isOpen} aria-label={!isOpen && unread ? `${name}, ${t.newMessage(unread)}` : name}>
      <span className="tvw-launcher-icon" aria-hidden="true"><Icon.MessageCircle className="tvw-i-chat" /><Icon.ChevronDown className="tvw-i-close" /></span>
      {variant === "label" && !isOpen && <span className="tvw-launcher-text">{text ?? t.widget}</span>}
      {!isOpen && unread > 0 && <span className="tvw-launcher-badge" aria-hidden="true">{num(unread)}</span>}
    </RAC.Button>
  );
}

export function WidgetTeaser({ agent, text, onOpen, onDismiss }) {
  const { t } = useWidget();
  return (
    <div className="tvw-teaser" role="status">
      <RAC.Button className="tvw-teaser-body" onPress={onOpen}>
        <AgentAvatar agent={agent} size={32} status="online" />
        <span className="tvw-teaser-text"><b>{agent.name}</b><span dir="auto">{text}</span></span>
      </RAC.Button>
      <RAC.Button className="tvw-teaser-x" aria-label={t.dismiss} onPress={onDismiss}><Icon.X /></RAC.Button>
    </div>
  );
}

/* =====================================================================
   THREAD ITEMS
   item.type: text | voice | file | steps | slots | form | confirm | cards | result | event | rating | call
   item.from: visitor | agent | human (with item.author { name, avatar })
   ===================================================================== */
function Bubble({ item, children }) {
  const { time } = useWidget();
  return (
    <div className={cx("tvw-msg", item.from === "visitor" ? "is-out" : "is-in", item.from === "human" && "is-human")}>
      <div className="tvw-bubble">{children}</div>
      {item.time && <span className="tvw-msg-time">{time(item.time)}{item.from === "visitor" && item.status === "read" && <Icon.CheckCheck className="tvw-read" />}</span>}
    </div>
  );
}

function Wave({ seed = 7, bars = 26, progress = 0 }) {
  let s = seed;
  const h = Array.from({ length: bars }, () => { s = (s * 16807) % 2147483647; return 22 + (s % 78); });
  return <span className="tvw-wave" aria-hidden="true">{h.map((v, i) => <i key={i} className={i / bars < progress ? "is-played" : undefined} style={{ height: v + "%" }} />)}</span>;
}

// Voice note: plays back on a simulated clock (wire `src` to a real <audio> later)
function VoiceNote({ item }) {
  const { t, clock } = useWidget();
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [showText, setShowText] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setPos((p) => {
      if (p + 0.1 >= item.duration) { setPlaying(false); return 0; }
      return p + 0.1;
    }), 100);
    return () => clearInterval(id);
  }, [playing, item.duration]);
  return (
    <Bubble item={item}>
      <span className="tvw-voice">
        <RAC.Button className="tvw-play" aria-label={playing ? t.pause : t.play} onPress={() => setPlaying((p) => !p)}>{playing ? <Icon.Pause /> : <Icon.Play />}</RAC.Button>
        <Wave seed={item.id.length * 31 + item.duration} progress={pos / item.duration} />
        <span className="tvw-voice-dur" dir="ltr">{clock(playing || pos ? pos : item.duration)}</span>
      </span>
      {item.transcript && (
        <>
          <RAC.Button className="tvw-linkbtn" aria-expanded={showText} onPress={() => setShowText((v) => !v)}>{showText ? t.hideTranscript : t.showTranscript}</RAC.Button>
          {showText && <p className="tvw-transcript" dir="auto">{item.transcript}</p>}
        </>
      )}
    </Bubble>
  );
}

// What the agent is doing, as it does it. Collapses to one line when finished.
export function AgentSteps({ item }) {
  const { t, num } = useWidget();
  const done = item.steps.every((s) => s.state === "done");
  const running = item.steps.find((s) => s.state === "running");
  const [open, setOpen] = useState(!done);
  const was = useRef(done);
  useEffect(() => { if (done && !was.current) setOpen(false); was.current = done; }, [done]);
  const listId = useId();
  return (
    <div className={cx("tvw-steps", done && "is-done")}>
      <RAC.Button className="tvw-steps-head" aria-expanded={open} aria-controls={listId} onPress={() => setOpen((o) => !o)}>
        <span className="tvw-steps-state" aria-hidden="true">{done ? <Icon.Check /> : <span className="tvw-spinner" />}</span>
        <span className="tvw-steps-title" aria-live="polite">{done ? t.stepsDone(item.steps.length, num) : running?.label ?? t.working}</span>
        <Icon.ChevronDown className="tvw-steps-chev" />
      </RAC.Button>
      {open && (
        <ol className="tvw-steps-list" id={listId}>
          {item.steps.map((s, i) => (
            <li key={i} className={`is-${s.state}`}>
              <span className="tvw-step-icon" aria-hidden="true">{s.state === "done" ? <Icon.Check /> : s.state === "running" ? <span className="tvw-spinner" /> : s.state === "failed" ? <Icon.X /> : null}</span>
              <span>{s.label}{s.detail && <small>{s.detail}</small>}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Card({ item, icon, title, badge, children, className }) {
  return (
    <section className={cx("tvw-card", className)} aria-label={title}>
      {(title || badge) && <header className="tvw-card-head">{icon}<b>{title}</b>{badge}</header>}
      {children}
    </section>
  );
}

// Days, then times. Picking one is the visitor's reply.
export function SlotPicker({ item, onAction }) {
  const { t } = useWidget();
  const [day, setDay] = useState(item.selected?.day ?? item.days[0]?.id);
  const d = item.days.find((x) => x.id === day);
  const locked = !!item.selected;
  return (
    <Card item={item} icon={<Icon.Calendar />} title={item.title ?? t.pickTime} className="tvw-slots"
      badge={locked && <span className="tvw-chip is-success"><Icon.Check />{t.chosen}</span>}>
      <RAC.ToggleButtonGroup className="tvw-days" selectionMode="single" disallowEmptySelection selectedKeys={[day]} onSelectionChange={(k) => setDay([...k][0])}
        aria-label={item.title ?? t.pickTime} isDisabled={locked}>
        {item.days.map((x) => (
          <RAC.ToggleButton key={x.id} id={x.id} className="tvw-day"><span>{x.weekday}</span><b>{x.date}</b></RAC.ToggleButton>
        ))}
      </RAC.ToggleButtonGroup>
      {d?.slots.length ? (
        <div className="tvw-times" role="group" aria-label={`${d.weekday} ${d.date}`}>
          {d.slots.map((s) => {
            const on = item.selected?.slot === s.id && item.selected?.day === day;
            return (
              <RAC.Button key={s.id} className={cx("tvw-time", on && "is-selected")} isDisabled={locked && !on} aria-pressed={on}
                onPress={() => !locked && onAction?.(item, "pick", { day, slot: s.id, label: `${d.weekday} ${d.date}, ${s.label}` })}>{s.label}</RAC.Button>
            );
          })}
        </div>
      ) : <p className="tvw-muted">{t.noSlots}</p>}
    </Card>
  );
}

// A short form inside the chat. Once sent, it shows what was shared.
export function InlineForm({ item, onAction }) {
  const { t } = useWidget();
  const [values, setValues] = useState({});
  const [phoneOk, setPhoneOk] = useState(false);
  if (item.submitted) {
    return (
      <Card item={item} icon={<Icon.UserCheck />} title={item.title} badge={<span className="tvw-chip is-success"><Icon.Check />{t.sentDetails}</span>}>
        <dl className="tvw-rows">{item.fields.map((f) => <div key={f.name}><dt>{f.label}</dt><dd dir="auto">{item.submitted[f.name]}</dd></div>)}</dl>
      </Card>
    );
  }
  const ready = item.fields.every((f) => !f.required || (f.type === "phone" ? phoneOk : (values[f.name] ?? "").trim()));
  return (
    <Card item={item} icon={<Icon.User />} title={item.title} className="tvw-form">
      <RAC.Form className="tvw-form-body" onSubmit={(e) => { e.preventDefault(); if (ready) onAction?.(item, "submit", values); }}>
        {item.fields.map((f) => f.type === "phone" ? (
          <PhoneField key={f.name} label={f.label} isRequired={f.required} defaultCountry={f.country ?? "EG"}
            onChange={(p) => { setPhoneOk(p.isValid); setValues((v) => ({ ...v, [f.name]: p.e164 })); }} />
        ) : (
          <RAC.TextField key={f.name} className="tv-field" isRequired={f.required} type={f.type ?? "text"} value={values[f.name] ?? ""}
            onChange={(x) => setValues((v) => ({ ...v, [f.name]: x }))} autoComplete={f.autoComplete}>
            <RAC.Label className="tv-label">{f.label}</RAC.Label>
            <RAC.Input className="tv-input" dir={f.type === "email" ? "ltr" : "auto"} placeholder={f.placeholder} />
          </RAC.TextField>
        ))}
        <RAC.Button type="submit" className="tvw-btn is-primary" isDisabled={!ready}>{item.submitLabel ?? t.submit}</RAC.Button>
      </RAC.Form>
    </Card>
  );
}

// Before anything that commits the visitor (a booking, an order), the agent asks.
export function WidgetApproval({ item, onAction }) {
  const { t } = useWidget();
  const state = item.state ?? "pending";
  return (
    <Card item={item} icon={<Icon.Shield />} title={item.title} className={cx("tvw-approve", `is-${state}`)}
      badge={<span className={cx("tvw-chip", state === "confirmed" ? "is-success" : state === "cancelled" ? "is-muted" : "is-warn")}>
        {state === "confirmed" ? <><Icon.Check />{t.confirmed}</> : state === "cancelled" ? t.cancelled : t.needsApproval}</span>}>
      <dl className="tvw-rows">{item.rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd dir="auto">{v}</dd></div>)}</dl>
      {item.note && <p className="tvw-muted">{item.note}</p>}
      {state === "pending" && (
        <div className="tvw-card-actions">
          <RAC.Button className="tvw-btn is-primary" onPress={() => onAction?.(item, "confirm")}><Icon.Check />{item.confirmLabel ?? t.confirm}</RAC.Button>
          <RAC.Button className="tvw-btn" onPress={() => onAction?.(item, "change")}>{item.changeLabel ?? t.change}</RAC.Button>
        </div>
      )}
    </Card>
  );
}

// Services or products the visitor can pick from. Scrolls sideways.
export function ChoiceCards({ item, onAction }) {
  const { t } = useWidget();
  return (
    <div className="tvw-cards" role="list" aria-label={item.title}>
      {item.cards.map((c) => (
        <article key={c.id} className={cx("tvw-choice", item.selected === c.id && "is-selected")} role="listitem">
          {c.image ? <img src={c.image} alt="" className="tvw-choice-img" /> : <span className="tvw-choice-icon" aria-hidden="true">{c.icon ?? <Icon.Sparkles />}</span>}
          <b dir="auto">{c.title}</b>
          {c.subtitle && <span className="tvw-muted" dir="auto">{c.subtitle}</span>}
          {c.price && <span className="tvw-choice-price">{c.price}</span>}
          <RAC.Button className="tvw-btn is-soft" isDisabled={!!item.selected} onPress={() => onAction?.(item, "choose", c)}>
            {item.selected === c.id ? <><Icon.Check />{t.chosen}</> : c.actionLabel ?? t.choose}
          </RAC.Button>
        </article>
      ))}
    </div>
  );
}

// What got done: the booking, the order, the ticket. With follow-up actions.
export function ResultCard({ item, onAction }) {
  return (
    <section className={cx("tvw-result", `is-${item.tone ?? "success"}`)} aria-label={item.title}>
      <span className="tvw-result-icon" aria-hidden="true">{item.tone === "danger" ? <Icon.X /> : <Icon.Check />}</span>
      <b className="tvw-result-title">{item.title}</b>
      {item.subtitle && <span className="tvw-muted">{item.subtitle}</span>}
      {item.rows && <dl className="tvw-rows">{item.rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd dir="auto">{v}</dd></div>)}</dl>}
      {item.actions && (
        <div className="tvw-card-actions">
          {item.actions.map((a) => <RAC.Button key={a.id} className="tvw-btn is-soft" onPress={() => onAction?.(item, a.id)}>{a.icon}{a.label}</RAC.Button>)}
        </div>
      )}
    </section>
  );
}

function RatingCard({ item, onAction }) {
  const { t } = useWidget();
  const faces = ["😞", "🙁", "😐", "🙂", "🤩"];
  return (
    <section className="tvw-rating" aria-label={t.rateTitle}>
      <b>{item.value ? t.rateThanks : item.title ?? t.rateTitle}</b>
      <RAC.RadioGroup className="tvw-faces" orientation="horizontal" aria-label={t.rateLabel} value={item.value ? String(item.value) : null}
        isDisabled={!!item.value} onChange={(v) => onAction?.(item, "rate", Number(v))}>
        {faces.map((f, i) => (
          <RAC.Radio key={i} value={String(i + 1)} className="tvw-face" aria-label={t.rating[i]}>{f}</RAC.Radio>
        ))}
      </RAC.RadioGroup>
    </section>
  );
}

function CallItem({ item }) {
  const { t, clock } = useWidget();
  return (
    <section className="tvw-callitem" aria-label={t.callSummary}>
      <span className="tvw-callitem-icon" aria-hidden="true"><Icon.Phone /></span>
      <span className="tvw-callitem-text"><b>{t.call} · <span dir="ltr">{clock(item.duration)}</span></b>{item.summary && <span dir="auto">{item.summary}</span>}</span>
    </section>
  );
}

export function WidgetItem({ item, onAction }) {
  switch (item.type) {
    case "voice": return <VoiceNote item={item} />;
    case "file": return <Bubble item={item}><span className="tvw-file"><Icon.FileText /><span><b dir="auto">{item.name}</b><small>{item.size}</small></span></span></Bubble>;
    case "steps": return <AgentSteps item={item} />;
    case "slots": return <SlotPicker item={item} onAction={onAction} />;
    case "form": return <InlineForm item={item} onAction={onAction} />;
    case "confirm": return <WidgetApproval item={item} onAction={onAction} />;
    case "cards": return <ChoiceCards item={item} onAction={onAction} />;
    case "result": return <ResultCard item={item} onAction={onAction} />;
    case "rating": return <RatingCard item={item} onAction={onAction} />;
    case "call": return <CallItem item={item} />;
    case "event": return <p className="tvw-event" role="note">{item.icon}{item.text}</p>;
    default: return <Bubble item={item}><p dir="auto">{item.text}</p></Bubble>;
  }
}

// The conversation. Who's speaking is shown once at the start of each run of messages.
export function WidgetThread({ items, agent, typing, onAction }) {
  const { t } = useWidget();
  const end = useRef(null);
  // Scroll only the chat, never the page around the widget
  useLayoutEffect(() => {
    const box = end.current?.closest(".tvw-body");
    box?.scrollTo({ top: box.scrollHeight, behavior: items.length > 1 ? "smooth" : "auto" });
  }, [items, typing]);
  let last = null;
  return (
    <div className="tvw-thread" role="log" aria-live="polite" aria-relevant="additions">
      {items.map((it) => {
        const who = it.type === "event" ? null : it.from === "human" ? "human:" + it.author?.name : it.from ?? "agent";
        const head = who && who !== "visitor" && who !== last;
        last = who ?? last;
        return (
          <div key={it.id} className={cx("tvw-row", it.from === "visitor" && "is-out", it.type !== "text" && it.type !== "voice" && it.type !== "file" && it.from !== "visitor" && "is-wide")}>
            {head && (
              <span className="tvw-author">
                {it.from === "human" ? <Avatar name={it.author.name} src={it.author.avatar} size={20} /> : <AgentAvatar agent={agent} size={20} />}
                <b>{it.from === "human" ? it.author.name : agent.name}</b>
                <span>{it.from === "human" ? it.author.role ?? t.teammate : t.aiAgent}</span>
              </span>
            )}
            <WidgetItem item={it} onAction={onAction} />
          </div>
        );
      })}
      {typing && (
        <div className="tvw-row">
          <span className="tvw-typing" role="status" aria-label={t.typing(typeof typing === "string" ? typing : agent.name)}><i /><i /><i /></span>
        </div>
      )}
      <span ref={end} />
    </div>
  );
}

/* =====================================================================
   COMPOSER: text, attachments, voice notes. Mic when empty, send when there's text (like WhatsApp).
   ===================================================================== */
export function WidgetComposer({ onSend, onVoiceNote, onAttach, voiceNotes = true, attachments = true, suggestions = [], onSuggestion,
  placeholder, isPhone, inputRef }) {
  const { t, clock } = useWidget();
  const [text, setText] = useState("");
  const [rec, setRec] = useState(null); // seconds while recording
  const own = useRef(null);
  const ref = inputRef ?? own;
  const recording = rec !== null;
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setRec((s) => (s === null ? s : s + 0.1)), 100);
    return () => clearInterval(id);
  }, [recording]);
  // Grows with the text up to five lines
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 132) + "px";
  }, [text, ref]);
  const send = () => { const v = text.trim(); if (!v) return; onSend?.(v); setText(""); ref.current?.focus(); };
  const stop = (keep) => { if (keep && rec > 0.5) onVoiceNote?.({ duration: Math.round(rec) }); setRec(null); };

  return (
    <div className="tvw-composer">
      {suggestions.length > 0 && rec === null && (
        <div className="tvw-suggest" role="group" aria-label={t.suggestions}>
          {suggestions.map((s) => <RAC.Button key={s} className="tvw-suggestion" onPress={() => onSuggestion?.(s)}>{s}</RAC.Button>)}
        </div>
      )}
      {rec !== null ? (
        <div className="tvw-recbar" role="status" aria-label={t.recording}>
          <RAC.Button className="tvw-icon-btn is-danger" aria-label={t.cancelRecording} onPress={() => stop(false)}><Icon.Trash /></RAC.Button>
          <span className="tvw-rec-dot" aria-hidden="true" />
          <span className="tvw-rec-time" dir="ltr">{clock(rec)}</span>
          <span className="tvw-rec-wave" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ animationDelay: `${(i * 97) % 600}ms` }} />)}</span>
          <RAC.Button className="tvw-send" aria-label={t.stopSend} onPress={() => stop(true)}><Icon.Send className="tv-flip" /></RAC.Button>
        </div>
      ) : (
        <div className="tvw-inputbar">
          {attachments && (
            <RAC.FileTrigger onSelect={(f) => f && onAttach?.([...f])}>
              <RAC.Button className="tvw-icon-btn" aria-label={t.attach}><Icon.Paperclip /></RAC.Button>
            </RAC.FileTrigger>
          )}
          <textarea ref={ref} className="tvw-input" rows={1} value={text} dir="auto" aria-label={placeholder ?? t.message} placeholder={placeholder ?? t.message}
            enterKeyHint={isPhone ? "enter" : "send"} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !isPhone && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
          {text.trim() || !voiceNotes ? (
            <RAC.Button className="tvw-send" aria-label={t.send} isDisabled={!text.trim()} onPress={send}><Icon.Send className="tv-flip" /></RAC.Button>
          ) : (
            <RAC.Button className="tvw-send is-mic" aria-label={t.record} onPress={() => setRec(0)}><Icon.Mic /></RAC.Button>
          )}
        </div>
      )}
    </div>
  );
}

/* =====================================================================
   LIVE VOICE CALL, inside the widget
   call: { state: "connecting" | "live" | "ended", elapsed, muted, speaker: "agent" | "visitor" | null, captions: [{ from, text }] }
   ===================================================================== */
export function WidgetCall({ agent, call, onMuteChange, onSpeakerChange, onEnd, onBack }) {
  const { t, clock } = useWidget();
  const { state, elapsed = 0, muted, loud, speaker, captions = [] } = call;
  const status = state === "connecting" ? t.connecting : state === "ended" ? t.ended
    : muted ? t.unmute : speaker === "agent" ? t.speaking(agent.name) : speaker === "visitor" ? t.youSpeaking : t.listening;
  return (
    <div className={cx("tvw-call", `is-${state}`, speaker && `is-${speaker}-speaking`)}>
      <div className="tvw-call-center">
        <span className="tvw-call-orb">
          <span className="tvw-call-ring" aria-hidden="true" /><span className="tvw-call-ring is-2" aria-hidden="true" />
          <AgentAvatar agent={agent} size={112} active={state === "connecting" || speaker === "agent"} />
        </span>
        <h3 className="tvw-call-name">{agent.name}</h3>
        <p className="tvw-call-status" aria-live="polite">
          {state === "live" && <span className="tvw-call-time" dir="ltr">{clock(elapsed)}</span>}{status}
        </p>
      </div>
      <ol className="tvw-captions" aria-live="polite" aria-label={t.transcript}>
        {captions.slice(-2).map((c, i) => <li key={captions.length - 2 + i} className={`is-${c.from}`}><b>{c.from === "agent" ? agent.name : t.you}</b><span dir="auto">{c.text}</span></li>)}
      </ol>
      <div className="tvw-call-controls">
        {state === "ended" ? (
          <RAC.Button className="tvw-btn is-primary is-wide" onPress={onBack}><Icon.MessageCircle />{t.returnToChat}</RAC.Button>
        ) : (
          <>
            <span className="tvw-ctl">
              <RAC.ToggleButton className="tvw-round" isSelected={!!muted} onChange={onMuteChange} isDisabled={state !== "live"} aria-label={muted ? t.unmute : t.mute}>{muted ? <Icon.MicOff /> : <Icon.Mic />}</RAC.ToggleButton>
              <span aria-hidden="true">{muted ? t.unmute : t.mute}</span>
            </span>
            <span className="tvw-ctl">
              <RAC.Button className="tvw-round is-end" onPress={onEnd} aria-label={t.endCall}><Icon.PhoneOff /></RAC.Button>
              <span aria-hidden="true">{t.endCall}</span>
            </span>
            <span className="tvw-ctl">
              <RAC.ToggleButton className="tvw-round" isSelected={!!loud} onChange={onSpeakerChange} isDisabled={state !== "live"} aria-label={t.speaker}>{loud ? <Icon.Volume /> : <Icon.Headphones />}</RAC.ToggleButton>
              <span aria-hidden="true">{t.speaker}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* =====================================================================
   HOME: the first screen. Greeting, ways to start, and a call if it's on.
   ===================================================================== */
export function WidgetHome({ agent, business, greeting, subtitle, actions = [], onAction, onAsk, onCall, recent, onRecent, team = [] }) {
  const { t } = useWidget();
  return (
    <div className="tvw-home">
      <div className="tvw-home-hero">
        <div className="tvw-home-brand">
          {business?.logo ? <img src={business.logo} alt="" className="tvw-home-logo" /> : <b>{business?.name}</b>}
          <span className="tvw-home-team" aria-hidden="true">
            {team.slice(0, 3).map((p) => <Avatar key={p.name} name={p.name} src={p.avatar} size={30} />)}
            <AgentAvatar agent={agent} size={30} />
          </span>
        </div>
        <h2 className="tvw-home-title">{greeting ?? t.hi} 👋<span>{subtitle ?? t.howHelp}</span></h2>
      </div>
      <div className="tvw-home-body">
        {recent && (
          <RAC.Button className="tvw-tile is-recent" onPress={onRecent}>
            <AgentAvatar agent={agent} size={36} />
            <span className="tvw-tile-text"><b>{t.continueChat}</b><span dir="auto">{recent}</span></span>
            <Icon.ChevronRight className="tvw-tile-go tv-flip" />
          </RAC.Button>
        )}
        <RAC.Button className="tvw-tile is-ask" onPress={onAsk}>
          <span className="tvw-tile-text"><b>{t.askAnything}</b><span>{t.askSub}</span></span>
          <span className="tvw-tile-send" aria-hidden="true"><Icon.Send className="tv-flip" /></span>
        </RAC.Button>
        {actions.length > 0 && (
          <div className="tvw-actions" role="group" aria-label={t.suggestions}>
            {actions.map((a) => (
              <RAC.Button key={a.id} className="tvw-action" onPress={() => onAction?.(a.id)}>
                <span className="tvw-action-icon" aria-hidden="true">{a.icon}</span>
                <span className="tvw-tile-text"><b>{a.label}</b>{a.description && <span>{a.description}</span>}</span>
                <Icon.ChevronRight className="tvw-tile-go tv-flip" />
              </RAC.Button>
            ))}
          </div>
        )}
        {onCall && (
          <RAC.Button className="tvw-tile is-call" onPress={onCall}>
            <span className="tvw-action-icon is-accent" aria-hidden="true"><Icon.Phone /></span>
            <span className="tvw-tile-text"><b>{t.talkNow(agent.name)}</b><span>{t.talkSub}</span></span>
          </RAC.Button>
        )}
      </div>
    </div>
  );
}

/* =====================================================================
   THE WIDGET: launcher, teaser and panel. Floats over the host page; on phones the panel is full screen.
   contained: positions inside the nearest positioned parent instead of the viewport (previews, docs).
   layout: "auto" follows the screen, "phone" forces the full-screen layout (a phone frame on a desktop page).
   ===================================================================== */
export function WebWidget({
  isOpen: openProp, defaultOpen = false, onOpenChange, view: viewProp, onViewChange,
  agent, business, team, accent = "#0f6e5c", position = "end", launcher = "icon", launcherText,
  teaser, onTeaserDismiss, unread = 0,
  greeting, subtitle, homeActions = [], onHomeAction, recent,
  items = [], typing = false, suggestions = [], onSend, onSuggestion, onVoiceNote, onAttach, onItemAction,
  features = {}, call, onCallStart, onCallEnd, onCallMute, onCallSpeaker,
  menuItems = [], onMenuAction, poweredBy = "Truvar", privacyNote = true,
  contained = false, layout = "auto", label,
}) {
  const { t, dir } = useWidget();
  const f = { voiceNotes: true, attachments: true, call: true, ...features };
  const [openState, setOpenState] = useState(defaultOpen);
  const isOpen = openProp ?? openState;
  const setOpen = (o) => { setOpenState(o); onOpenChange?.(o); };
  // The back gesture closes the widget with the latest setOpen (it includes the caller's onOpenChange)
  const setOpenRef = useRef(setOpen);
  setOpenRef.current = setOpen;
  const [viewState, setViewState] = useState("home");
  const view = viewProp ?? viewState;
  const setView = (v) => { setViewState(v); onViewChange?.(v); };

  const phoneViewport = usePhoneViewport();
  const phone = layout === "phone" || (layout === "auto" && phoneViewport);
  // Full screen over the real page (not just inside a preview frame)
  const takeover = isOpen && phone && layout === "auto";

  // Keep the panel mounted for its closing animation
  const [mounted, setMounted] = useState(isOpen);
  useEffect(() => {
    if (isOpen) { setMounted(true); return; }
    const id = setTimeout(() => setMounted(false), 220);
    return () => clearTimeout(id);
  }, [isOpen]);

  const launcherRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const close = () => { setOpen(false); requestAnimationFrame(() => launcherRef.current?.focus()); };

  // Focus: the message box when chatting on a computer, otherwise the panel itself (no keyboard popping up on phones)
  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(() => (view === "chat" && !phone ? inputRef.current : panelRef.current)?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(id);
  }, [isOpen, view, phone]);

  // Phone take-over: the page underneath stops scrolling, the status bar takes the header colour,
  // the back gesture closes the widget, and the panel tracks the visible area above the keyboard.
  useEffect(() => {
    if (!takeover) return;
    const root = document.documentElement;
    const meta = document.querySelector('meta[name="theme-color"]');
    const before = meta?.content;
    meta?.setAttribute("content", accent);
    root.dataset.widgetOpen = "";
    const vv = window.visualViewport;
    const fit = () => {
      if (!vv || !panelRef.current) return;
      panelRef.current.style.setProperty("--tvw-vh", vv.height + "px");
      panelRef.current.style.setProperty("--tvw-top", vv.offsetTop + "px");
    };
    fit(); vv?.addEventListener("resize", fit); vv?.addEventListener("scroll", fit);
    history.pushState({ tvWidget: true }, "");
    let popped = false;
    const onPop = () => { popped = true; setOpenRef.current(false); };
    addEventListener("popstate", onPop);
    return () => {
      removeEventListener("popstate", onPop);
      vv?.removeEventListener("resize", fit); vv?.removeEventListener("scroll", fit);
      delete root.dataset.widgetOpen;
      if (before) meta?.setAttribute("content", before);
      if (!popped && history.state?.tvWidget) history.back();
    };
  }, [takeover, accent]);

  const onKeyDown = (e) => { if (e.key === "Escape" && !e.defaultPrevented) { e.stopPropagation(); close(); } };
  const startCall = () => { setView("call"); onCallStart?.(); };
  const menu = [...menuItems, ...(menuItems.length ? [] : [{ id: "new", label: t.newChat, icon: <Icon.Plus /> }, { id: "email", label: t.emailChat, icon: <Icon.Mail /> }])];

  const style = { "--tvw-accent": accent, "--tvw-on-accent": onAccent(accent) };
  return (
    <div className={cx("tvw", `is-${position}`, contained && "is-contained", phone && "is-phone", takeover && "is-takeover")} style={style} dir={dir}>
      {mounted && (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the dialog closes on Escape
        <section ref={panelRef} tabIndex={-1} className={cx("tvw-panel", `is-${view}`, isOpen ? "is-open" : "is-closing")}
          role="dialog" aria-modal={phone ? true : undefined} aria-label={label ?? `${agent.name}, ${business?.name ?? t.widget}`} onKeyDown={onKeyDown}>
          {view !== "home" && (
            <header className="tvw-head">
              <RAC.Button className="tvw-icon-btn" aria-label={t.back} onPress={() => (view === "call" && call?.state !== "ended" ? (onCallEnd?.(), setView("chat")) : setView(view === "call" ? "chat" : "home"))}>
                <Icon.ChevronLeft className="tv-flip" />
              </RAC.Button>
              <AgentAvatar agent={agent} size={36} status={agent.status ?? "online"} />
              <span className="tvw-head-text"><b>{agent.name}</b><span>{agent.subtitle ?? t.repliesInstantly}</span></span>
              {f.call && view === "chat" && <RAC.Button className="tvw-icon-btn" aria-label={t.startCall} onPress={startCall}><Icon.Phone /></RAC.Button>}
              {view === "chat" && (
                <RAC.MenuTrigger>
                  <RAC.Button className="tvw-icon-btn" aria-label={t.menu}><Icon.More /></RAC.Button>
                  <RAC.Popover className="tv-popover tvw-menu" placement="bottom end" offset={6}>
                    <RAC.Menu className="tv-listbox" onAction={(k) => onMenuAction?.(k)} aria-label={t.menu}>
                      {menu.map((m) => <RAC.MenuItem key={m.id} id={m.id} className="tv-item" textValue={m.label}>{m.icon}<span className="tv-item-text">{m.label}</span></RAC.MenuItem>)}
                    </RAC.Menu>
                  </RAC.Popover>
                </RAC.MenuTrigger>
              )}
              <RAC.Button className="tvw-icon-btn" aria-label={t.minimize} onPress={close}><Icon.ChevronDown /></RAC.Button>
            </header>
          )}
          {view === "home" && <RAC.Button className="tvw-icon-btn tvw-home-close" aria-label={t.minimize} onPress={close}><Icon.ChevronDown /></RAC.Button>}

          <div className="tvw-body">
            {view === "home" && (
              <WidgetHome agent={agent} business={business} team={team} greeting={greeting} subtitle={subtitle} actions={homeActions} recent={recent}
                onRecent={() => setView("chat")} onAsk={() => setView("chat")} onCall={f.call ? startCall : undefined}
                onAction={(id) => { setView("chat"); onHomeAction?.(id); }} />
            )}
            {view === "chat" && <WidgetThread items={items} agent={agent} typing={typing} onAction={onItemAction} />}
            {view === "call" && call && (
              <WidgetCall agent={agent} call={call} onMuteChange={onCallMute} onSpeakerChange={onCallSpeaker}
                onEnd={() => onCallEnd?.()} onBack={() => setView("chat")} />
            )}
          </div>

          {view === "chat" && (
            <WidgetComposer onSend={onSend} onVoiceNote={onVoiceNote} onAttach={onAttach} voiceNotes={f.voiceNotes} attachments={f.attachments}
              suggestions={typing ? [] : suggestions} onSuggestion={onSuggestion ?? onSend} isPhone={phone} inputRef={inputRef} />
          )}
          {view !== "call" && (
            <footer className="tvw-foot">
              {privacyNote && view === "home" && <span>{t.privacy}</span>}
              {poweredBy && <span className="tvw-powered"><Icon.Zap />{t.poweredBy(poweredBy)}</span>}
            </footer>
          )}
        </section>
      )}
      {!isOpen && teaser && <WidgetTeaser agent={agent} text={teaser} onOpen={() => setOpen(true)} onDismiss={onTeaserDismiss} />}
      <WidgetLauncher buttonRef={launcherRef} isOpen={isOpen} onPress={() => (isOpen ? close() : setOpen(true))} unread={unread} variant={launcher} text={launcherText} />
    </div>
  );
}
