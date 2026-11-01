// Truvar OS kit: system UI and agent surfaces for an agentic operating system.
// Built on React Aria + Truvar tokens. Content comes in through props.
import React, { useEffect, useState } from "react";
import * as RAC from "react-aria-components";
import * as Icon from "../icons.jsx";
import * as S from "./SystemIcons.jsx";
import { BrandAvatar, OrbitMark, Avatar } from "../index.jsx";

const cx = (...c) => c.filter(Boolean).join(" ");
const useLocale = () => RAC.useLocale().locale;

/* ---------- Clock ---------- */
export function useNow(intervalMs = 15000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), intervalMs); return () => clearInterval(id); }, [intervalMs]);
  return now;
}
export function formatTime(d, locale) { return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(d); }
export function formatDay(d, locale) { return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(d); }

/* ---------- System bar ---------- */
export function SystemBar({ user, time, battery = { level: 0.86 }, wifi = 3, devices, mic, camera, cloud = "synced", onAssistant, labels }) {
  const locale = useLocale();
  const nf = new Intl.NumberFormat(locale);
  const pct = new Intl.NumberFormat(locale, { style: "percent" }).format(battery.level);
  return (
    <header className="os-bar">
      <div className="os-bar-start">
        <RAC.TooltipTrigger delay={300}>
          <RAC.Button className="os-orb" aria-label={labels.assistant} onPress={onAssistant}><OrbitMark size={22} /></RAC.Button>
          <RAC.Tooltip className="tv-tooltip" offset={8}>{labels.assistant}</RAC.Tooltip>
        </RAC.TooltipTrigger>
        <div className="os-status" role="group" aria-label={labels.status}>
          {(mic || camera) && (
            <span className="os-privacy" role="status">
              {mic && <><S.MicIcon size={14} /><span className="os-privacy-text">{labels.micOn}</span></>}
              {camera && <><S.CameraIcon size={14} /><span className="os-privacy-text">{labels.cameraOn}</span></>}
            </span>
          )}
          {devices != null && <span className="os-stat" title={labels.devices}><S.DevicesIcon size={16} label={`${labels.devices}: ${nf.format(devices)}`} /><b>{nf.format(devices)}</b></span>}
          <span className="os-sep" aria-hidden="true" />
          <S.CloudIcon size={16} state={cloud} label={labels.cloud[cloud]} />
          <S.WifiIcon size={16} strength={wifi} off={wifi === 0} label={labels.wifi} />
          <span className="os-stat"><S.BatteryIcon size={18} level={battery.level} charging={battery.charging} label={`${labels.battery} ${pct}${battery.charging ? `, ${labels.charging}` : ""}`} /><span aria-hidden="true" className="os-pct">{pct}</span></span>
          <time className="os-time" dir="auto">{formatTime(time, locale)}</time>
        </div>
      </div>
      {user && (
        <div className="os-user"><Avatar name={user} size={28} /><span>{user}</span></div>
      )}
    </header>
  );
}

/* ---------- Voice dock ---------- */
export function VoiceDock({ state = "idle", label, onTalk, onKeyboard, onApps, labels }) {
  return (
    <nav className="os-dock" aria-label={labels.dock}>
      <RAC.TooltipTrigger delay={300}>
        <RAC.Button className="os-dock-side" aria-label={labels.apps} onPress={onApps}><S.AppsIcon size={20} /></RAC.Button>
        <RAC.Tooltip className="tv-tooltip" offset={8}>{labels.apps}</RAC.Tooltip>
      </RAC.TooltipTrigger>
      <RAC.Button className={cx("os-talk", `is-${state}`)} onPress={onTalk} aria-label={label}>
        <span className="os-talk-orb"><OrbitMark size={26} active={state !== "idle"} activity={state === "thinking" ? "searching" : "speaking"} /></span>
        <span className="os-talk-label">{label}</span>
        {state === "listening" && <span className="os-talk-bars" aria-hidden="true">{[0, 1, 2, 3, 4].map((i) => <i key={i} style={{ animationDelay: `${i * 0.12}s` }} />)}</span>}
      </RAC.Button>
      <RAC.TooltipTrigger delay={300}>
        <RAC.Button className="os-dock-side" aria-label={labels.keyboard} onPress={onKeyboard}><S.KeyboardIcon size={20} /></RAC.Button>
        <RAC.Tooltip className="tv-tooltip" offset={8}>{labels.keyboard}</RAC.Tooltip>
      </RAC.TooltipTrigger>
    </nav>
  );
}

/* ---------- Listening ---------- */
export function ListeningView({ heard, partial, onRun, onCancel, labels }) {
  const q = useLocale().startsWith("ar") ? ["«", "»"] : ["“", "”"]; // the language's own quotation marks
  return (
    <section className="os-listen" aria-label={labels.listening}>
      <span className="os-listen-pill" role="status"><span className="os-rec-dot" />{labels.listening}</span>
      <div className="os-listen-orb" aria-hidden="true">
        <span className="os-ring r1" /><span className="os-ring r2" /><span className="os-ring r3" />
        <BrandAvatar size={112} active activity="speaking" />
      </div>
      <p className="os-heard" aria-live="polite">{q[0]}{heard}{partial && <span className="os-heard-partial"> {partial}…</span>}{q[1]}</p>
      <p className="tv-desc">{labels.hint}</p>
      <div className="row" style={{ justifyContent: "center" }}>
        <RAC.Button className="tv-btn tv-btn--primary" onPress={onRun}>{labels.run}</RAC.Button>
        <RAC.Button className="tv-btn tv-btn--secondary" onPress={onCancel}>{labels.cancel}</RAC.Button>
      </div>
      <p className="os-privacy-note"><S.LockIcon size={14} />{labels.privacy}</p>
    </section>
  );
}

/* ---------- Agent task progress ---------- */
const STEP_ICON = { done: <Icon.Check />, active: <span className="os-step-spin" />, pending: null, approval: <S.ShieldIcon size={14} /> };
export function AgentTaskCard({ title, subtitle, steps, onWatch, onStop, footnote, labels }) {
  const done = steps.filter((s) => s.status === "done").length;
  const pct = Math.round(((done + (steps.some((s) => s.status === "active") ? 0.5 : 0)) / steps.length) * 100);
  return (
    <section className="os-card os-task" aria-label={title}>
      <header className="os-card-head">
        <BrandAvatar size={52} active activity="searching" />
        <div><h3 className="os-card-title">{title}</h3>{subtitle && <p className="tv-desc">{subtitle}</p>}</div>
      </header>
      <div className="os-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={title}><span style={{ width: pct + "%" }} /></div>
      <ol className="os-steps">
        {steps.map((s, i) => (
          <li key={i} className={cx("os-step", `is-${s.status}`)}>
            <span className="os-step-mark">{STEP_ICON[s.status]}</span>
            <span className="os-step-label">{s.label}</span>
            <span className="tv-sr">{labels.status[s.status]}</span>
          </li>
        ))}
      </ol>
      <footer className="os-card-foot">
        {footnote && <span className="tv-desc">{footnote}</span>}
        <div className="row">
          {onWatch && <RAC.Button className="tv-btn tv-btn--secondary tv-btn--sm" onPress={onWatch}>{labels.watch}</RAC.Button>}
          {onStop && <RAC.Button className="tv-btn tv-btn--ghost tv-btn--sm" onPress={onStop}>{labels.stop}</RAC.Button>}
        </div>
      </footer>
    </section>
  );
}

/* ---------- Approval ---------- */
export function ApprovalCard({ title, subtitle, recipient, attachment, message, onApprove, onDeny, onEdit, labels }) {
  return (
    <section className="os-card os-approval" role="alertdialog" aria-label={title}>
      <BrandAvatar size={64} />
      <h3 className="os-approval-title">{title}</h3>
      {subtitle && <p className="tv-desc os-approval-sub">{subtitle}</p>}
      <div className="os-preview">
        <div className="os-preview-head">
          <Avatar name={recipient.name} size={40} />
          <div className="os-preview-who"><b dir="auto">{recipient.name}</b><span className="tv-desc" dir="auto">{recipient.org}</span></div>
          {attachment && <span className="os-attach"><span className="os-attach-type">{attachment.type}</span><span dir="auto">{attachment.name}</span></span>}
        </div>
        <p className="os-preview-msg" dir="auto">{message}</p>
      </div>
      <div className="os-approval-actions">
        <RAC.Button className="os-choice is-yes" onPress={onApprove}><span className="os-choice-main"><Icon.Check />{labels.approve}</span><span className="os-choice-hint">{labels.approveHint}</span></RAC.Button>
        <RAC.Button className="os-choice is-no" onPress={onDeny}><span className="os-choice-main"><Icon.X />{labels.deny}</span><span className="os-choice-hint">{labels.denyHint}</span></RAC.Button>
      </div>
      <div className="os-approval-foot">
        <span className="os-listening-mini"><span className="os-mini-bars" aria-hidden="true"><i /><i /><i /><i /></span>{labels.listening}</span>
        {onEdit && <RAC.Button className="tv-link os-link-btn" onPress={onEdit}>{labels.edit}</RAC.Button>}
      </div>
    </section>
  );
}

/* ---------- Done ---------- */
export function DoneCard({ title, subtitle, followUp, stats, labels }) {
  const locale = useLocale(); const nf = new Intl.NumberFormat(locale);
  return (
    <section className="os-done" aria-label={title}>
      <div className="os-card os-done-main">
        <span className="os-done-check" aria-hidden="true"><Icon.Check /></span>
        <h3 className="os-done-title">{title}</h3>
        {subtitle && <p className="tv-desc">{subtitle}</p>}
        {followUp && (
          <div className="os-followup">
            <p className="os-followup-q"><OrbitMark size={22} />{followUp.question}</p>
            <div className="row" style={{ justifyContent: "center" }}>
              <RAC.Button className="tv-btn tv-btn--primary" onPress={followUp.onYes}>{followUp.yes}</RAC.Button>
              <RAC.Button className="tv-btn tv-btn--secondary" onPress={followUp.onLater}>{followUp.later}</RAC.Button>
            </div>
            <p className="tv-desc os-voice-hint"><S.MicIcon size={14} />{followUp.voiceHint}</p>
          </div>
        )}
      </div>
      {stats && (
        <dl className="os-done-stats">
          {stats.map((s, i) => <div key={i} className={cx("os-done-stat", s.highlight && "is-highlight")}><dt>{s.label}</dt><dd>{typeof s.value === "number" ? nf.format(s.value) : s.value}</dd></div>)}
        </dl>
      )}
    </section>
  );
}

/* ---------- Notifications ---------- */
export function NotificationCard({ icon, title, body, meta, tone = "default", onOpen }) {
  const Comp = onOpen ? RAC.Button : "div";
  return (
    <Comp className={cx("os-notif", `is-${tone}`)} {...(onOpen ? { onPress: onOpen } : {})}>
      <span className="os-notif-icon">{icon}</span>
      <span className="os-notif-text"><b dir="auto">{title}</b><span dir="auto">{body}</span></span>
      {meta && <span className="os-notif-meta">{meta}</span>}
    </Comp>
  );
}
export function NotificationStack({ lead, rest, restLabel, icons = [] }) {
  return (
    <div className="os-notif-stack">
      {lead}
      {rest > 0 && (
        <div className="os-notif-more">
          <span>{restLabel}</span>
          <span className="os-notif-more-icons">{icons.map((ic, i) => <span key={i} className="os-mini-icon">{ic.icon}{ic.count != null && <b>{ic.count}</b>}</span>)}</span>
        </div>
      )}
    </div>
  );
}

/* ---------- My work task card ---------- */
export function OSTaskCard({ icon, title, status, tone = "neutral", action, onAction, highlight }) {
  return (
    <article className={cx("os-work", highlight && "is-highlight")}>
      <span className={cx("os-work-icon", highlight && "is-gold")}>{icon}</span>
      <div className="os-work-text">
        <h4 dir="auto">{title}</h4>
        <p className={cx("os-work-status", `is-${tone}`)}>
          {tone === "done" ? <span className="os-work-dot is-done"><Icon.Check /></span> : tone === "running" ? <span className="os-work-dot is-running" /> : <span className="os-work-dot" />}
          <span dir="auto">{status}</span>
        </p>
      </div>
      {action && <RAC.Button className={cx("tv-btn tv-btn--sm", highlight ? "tv-btn--primary" : "tv-btn--secondary")} onPress={onAction}>{action}</RAC.Button>}
    </article>
  );
}

/* ---------- App windows + agent cursor ---------- */
export function AppWindow({ icon, title, badge, active, children }) {
  return (
    <section className={cx("os-window", active && "is-active")} aria-label={title}>
      <header className="os-window-head"><span className="os-window-icon">{icon}</span><h4>{title}</h4>{badge && <span className="os-window-badge"><span className="os-rec-dot" />{badge}</span>}</header>
      <div className="os-window-body">{children}</div>
    </section>
  );
}
export function AgentCursor({ x, y, label }) {
  return (
    <span className="os-cursor" style={{ left: x, top: y }} aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 3l7 18 2.5-7.5L21 11z" fill="var(--navy-900)" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" /></svg>
      <span className="os-cursor-label">{label}</span>
    </span>
  );
}

/* ---------- Devices ---------- */
export function DeviceCard({ icon, name, meta, online = true, command, action, onAction, tone, children }) {
  return (
    <article className={cx("os-device", tone && `is-${tone}`)}>
      <header className="os-device-head">
        <span className={cx("os-device-icon", tone && `is-${tone}`)}>{icon}</span>
        <div><h4 dir="auto">{name}</h4><p className="tv-desc"><span className={cx("os-online", online && "is-on")} />{meta}</p></div>
      </header>
      {children}
      {command && <p className="os-command"><S.MicIcon size={14} /><span dir="auto">“{command}”</span></p>}
      {action && <RAC.Button className="tv-btn tv-btn--secondary tv-btn--sm os-device-action" onPress={onAction}>{action}</RAC.Button>}
    </article>
  );
}
export function SmartTile({ icon, label, onLabel, offLabel, isSelected, onChange }) {
  return (
    <RAC.ToggleButton className="os-tile" isSelected={isSelected} onChange={onChange}>
      {icon}<span className="os-tile-label">{label}</span><b className="os-tile-state">{isSelected ? onLabel : offLabel}</b>
    </RAC.ToggleButton>
  );
}

/* ---------- Permissions ---------- */
export function PermissionRow({ icon, label, description, value, onChange, options, sensitive }) {
  return (
    <div className={cx("os-perm", sensitive && "is-sensitive")}>
      <span className="os-perm-icon">{icon}</span>
      <div className="os-perm-text"><b>{label}</b>{description && <span className="tv-desc">{description}</span>}</div>
      <RAC.ToggleButtonGroup aria-label={label} selectionMode="single" disallowEmptySelection selectedKeys={[value]}
        onSelectionChange={(k) => onChange([...k][0])} className="tv-segmented os-perm-seg">
        {options.map((o) => (
          <RAC.ToggleButton key={o.id} id={o.id} className={cx("tv-segment-btn", `is-${o.id}`)}>
            <RAC.SelectionIndicator className="tv-segment-indicator" />
            <span className="tv-segment-label">{o.label}</span>
          </RAC.ToggleButton>
        ))}
      </RAC.ToggleButtonGroup>
    </div>
  );
}

/* ---------- Lock screen ---------- */
export function LockScreen({ user, time, notifications, onUnlock, battery, wifi, labels, osName = "Truvar OS", device }) {
  const locale = useLocale();
  const [pw, setPw] = useState(false);
  const pct = new Intl.NumberFormat(locale, { style: "percent" }).format(battery.level);
  return (
    <section className="os-lock" aria-label={labels.locked}>
      <div className="os-lock-ambient" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <span key={i} className={`os-amb a${i}`} />)}</div>
      <div className="os-lock-center">
        <time className="os-lock-time" dir="auto">{formatTime(time, locale)}</time>
        <p className="os-lock-date">{formatDay(time, locale)}</p>
        <div className="os-lock-user"><Avatar name={user} size={88} /><b>{user}</b></div>
        {!pw ? (
          <>
            <RAC.Button className="os-unlock" onPress={onUnlock}><span className="os-unlock-icon"><S.FaceIdIcon size={22} /></span>{labels.faceUnlock}</RAC.Button>
            <RAC.Button className="tv-link os-link-btn" onPress={() => setPw(true)}>{labels.password}</RAC.Button>
          </>
        ) : (
          <form className="os-pw" onSubmit={(e) => { e.preventDefault(); onUnlock?.(); }}>
            <RAC.TextField aria-label={labels.passwordLabel} type="password" autoFocus className="tv-field"><RAC.Input className="tv-input" placeholder={labels.passwordLabel} /></RAC.TextField>
            <RAC.Button type="submit" className="tv-btn tv-btn--primary">{labels.unlock}</RAC.Button>
          </form>
        )}
        <div className="os-lock-notifs">{notifications}</div>
      </div>
      <footer className="os-lock-foot">
        <span className="os-lock-sys"><OrbitMark size={18} /><S.WifiIcon size={16} strength={wifi} label={labels.wifi} /><S.BatteryIcon size={18} level={battery.level} charging={battery.charging} label={`${labels.battery} ${pct}`} /><span aria-hidden="true">{pct}</span></span>
        <span className="os-lock-brand" dir="ltr"><b>{osName}</b>{device && <span><S.LaptopIcon size={14} />on {device}</span>}</span>
      </footer>
    </section>
  );
}

export * from "./SystemIcons.jsx";
