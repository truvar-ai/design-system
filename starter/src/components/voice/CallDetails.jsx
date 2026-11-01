// Transcript (synced to audio), call logs, cost breakdown, JSON viewer, code block.
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as RAC from "react-aria-components";
import * as Icon from "../icons.jsx";
import { useCall } from "./CallPlayer.jsx";
import { formatClock } from "./audio.js";

const cx = (...c) => c.filter(Boolean).join(" ");
const useLang = () => (RAC.useLocale().locale.startsWith("ar") ? "ar" : "en");
const L = (lang, o) => (o && typeof o === "object" && "en" in o ? (lang === "ar" ? o.ar : o.en) : o);

async function copy(text) { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } }
export function CopyButton({ text, label, onCopied, size }) {
  const lang = useLang();
  const [done, setDone] = useState(false);
  return (
    <RAC.TooltipTrigger delay={300}>
      <RAC.Button className={cx("tv-icon-btn", size === "sm" && "is-sm")} aria-label={label ?? (lang === "ar" ? "نسخ" : "Copy")}
        onPress={async () => { const ok = await copy(text); setDone(ok); onCopied?.(ok); setTimeout(() => setDone(false), 1500); }}>
        {done ? <Icon.Check /> : <Icon.Copy />}
      </RAC.Button>
      <RAC.Tooltip className="tv-tooltip" offset={6}>{done ? (lang === "ar" ? "تم النسخ" : "Copied") : (label ?? (lang === "ar" ? "نسخ" : "Copy"))}</RAC.Tooltip>
    </RAC.TooltipTrigger>
  );
}

/* ---------------- Transcript ---------------- */
const TT = {
  en: { agent: "Agent", customer: "Customer", follow: "Follow along", helpful: "Good response", unhelpful: "Bad response",
    why: "What went wrong?", reasons: ["Wrong information", "Interrupted the caller", "Too long", "Wrong tone", "Other"], note: "Add a note (optional)",
    send: "Send feedback", sent: "Thanks. Feedback saved.", jump: "Play from here", tool: "Tool" },
  ar: { agent: "الوكيل", customer: "العميل", follow: "متابعة التشغيل", helpful: "رد جيد", unhelpful: "رد سيئ",
    why: "ما المشكلة؟", reasons: ["معلومة خاطئة", "قاطع المتصل", "طويل جدًا", "نبرة غير مناسبة", "أخرى"], note: "أضف ملاحظة (اختياري)",
    send: "إرسال الملاحظة", sent: "شكرًا. تم حفظ ملاحظتك.", jump: "التشغيل من هنا", tool: "أداة" },
};

function Feedback({ value, onChange }) {
  const lang = useLang(); const t = TT[lang];
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(null);
  const triggerRef = useRef(null);
  return (
    <span className="tv-fb">
      <RAC.TooltipTrigger delay={300}>
        <RAC.ToggleButton className="tv-icon-btn is-sm tv-fb-btn" aria-label={t.helpful} isSelected={value === "up"} onChange={(v) => onChange(v ? "up" : null)}><Icon.ThumbUp /></RAC.ToggleButton>
        <RAC.Tooltip className="tv-tooltip" offset={6}>{t.helpful}</RAC.Tooltip>
      </RAC.TooltipTrigger>
      <RAC.TooltipTrigger delay={300}>
        <RAC.ToggleButton ref={triggerRef} className="tv-icon-btn is-sm tv-fb-btn is-down" aria-label={t.unhelpful} isSelected={value?.startsWith?.("down")}
          onChange={(v) => { if (v) setOpen(true); else onChange(null); }}><Icon.ThumbDown /></RAC.ToggleButton>
        <RAC.Tooltip className="tv-tooltip" offset={6}>{t.unhelpful}</RAC.Tooltip>
      </RAC.TooltipTrigger>
      <RAC.Popover triggerRef={triggerRef} isOpen={open} onOpenChange={setOpen} className="tv-popover tv-fb-pop" placement="bottom start" offset={6}>
        <RAC.Dialog className="tv-popover-dialog" aria-label={t.why}>
          <p className="tv-popover-title">{t.why}</p>
          <RAC.TagGroup selectionMode="single" selectedKeys={reason ? [reason] : []} onSelectionChange={(k) => setReason([...k][0])} aria-label={t.why} className="tv-field">
            <RAC.TagList className="tv-taglist">{t.reasons.map((r, i) => <RAC.Tag key={i} id={String(i)} className="tv-tag">{r}</RAC.Tag>)}</RAC.TagList>
          </RAC.TagGroup>
          <RAC.TextField className="tv-field" style={{ marginTop: 12 }} aria-label={t.note}><RAC.TextArea className="tv-input" rows={2} placeholder={t.note} /></RAC.TextField>
          <div className="tv-dialog-actions" style={{ marginTop: 12 }}>
            <RAC.Button className="tv-btn tv-btn--primary tv-btn--sm" isDisabled={reason == null} onPress={() => { onChange("down:" + reason); setOpen(false); }}>{t.send}</RAC.Button>
          </div>
        </RAC.Dialog>
      </RAC.Popover>
    </span>
  );
}

export function Transcript({ turns, events = [], maxHeight = 420 }) {
  const lang = useLang(); const t = TT[lang]; const { locale } = RAC.useLocale();
  const s = useCall();
  const [follow, setFollow] = useState(true);
  const [fb, setFb] = useState({});
  const listRef = useRef(null);
  const now = s?.time ?? 0;
  const items = useMemo(() => [...turns.map((x) => ({ ...x, type: "turn" })), ...events.map((e) => ({ ...e, start: e.t, type: "event" }))].sort((a, b) => a.start - b.start), [turns, events]);
  const currentId = turns.find((x) => now >= x.start && now < x.end + 0.4)?.id;
  useEffect(() => {
    if (!follow || !s?.playing || !currentId) return;
    const el = listRef.current?.querySelector(`[data-turn="${currentId}"]`);
    const box = listRef.current;
    if (el && box) box.scrollTo({ top: el.offsetTop - box.clientHeight / 3, behavior: "smooth" });
  }, [currentId, follow, s?.playing]);
  return (
    <div className="tv-transcript">
      <div className="tv-transcript-bar">
        <RAC.Switch isSelected={follow} onChange={setFollow} className="tv-switch"><span className="tv-switch-track" />{t.follow}</RAC.Switch>
      </div>
      <ol className="tv-transcript-list" ref={listRef} style={{ maxHeight }}>
        {items.map((it, i) => it.type === "event" ? (
          <li key={"e" + i} className={cx("tv-tx-event", `is-${it.kind}`)}>
            <span className="tv-tx-event-pill">{it.kind === "tool" ? <Icon.Zap /> : it.kind === "end" ? <Icon.PhoneOff /> : <Icon.Info />}{L(lang, it.label)}</span>
            <span className="tv-tx-time" dir="ltr">{formatClock(it.start, locale)}</span>
          </li>
        ) : (
          <li key={it.id} data-turn={it.id} className={cx("tv-tx", `is-${it.speaker}`, currentId === it.id && "is-current", now > it.end && "is-past")}>
            <div className="tv-tx-bubble">
              <span className="tv-tx-who">{t[it.speaker]}</span>
              <p className="tv-tx-text" dir="auto">{L(lang, it.text)}</p>
            </div>
            <div className="tv-tx-meta">
              <RAC.Button className="tv-tx-time tv-tx-seek" onPress={() => { s?.seek(it.start); s?.play(); }} aria-label={`${t.jump} ${formatClock(it.start, locale)}`}>
                <Icon.Play width={10} height={10} /><span dir="ltr">{formatClock(it.start, locale)}</span>
              </RAC.Button>
              {it.speaker === "agent" && <Feedback value={fb[it.id]} onChange={(v) => setFb((f) => ({ ...f, [it.id]: v }))} />}
              {it.latency != null && <span className="tv-tx-latency">{new Intl.NumberFormat(locale, { style: "unit", unit: "millisecond", unitDisplay: "short" }).format(it.latency)}</span>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------------- Call logs ---------------- */
const LEVELS = ["checkpoint", "log", "tool", "warning", "error"];
const LT = {
  en: { levels: { checkpoint: "Checkpoint", log: "Log", tool: "Tool", warning: "Warning", error: "Error" }, search: "Search logs", none: "No log lines match.", count: (a, b) => `${a} of ${b} lines`, filter: "Levels" },
  ar: { levels: { checkpoint: "نقطة تحقق", log: "سجل", tool: "أداة", warning: "تحذير", error: "خطأ" }, search: "ابحث في السجلات", none: "لا توجد سطور مطابقة.", count: (a, b) => `${a} من ${b} سطر`, filter: "المستويات" },
};
export function CallLogs({ logs, maxHeight = 380 }) {
  const lang = useLang(); const t = LT[lang]; const { locale } = RAC.useLocale();
  const s = useCall();
  const [levels, setLevels] = useState(new Set(LEVELS));
  const [q, setQ] = useState("");
  const shown = logs.filter((l) => levels.has(l.level) && (!q || l.msg.toLowerCase().includes(q.toLowerCase())));
  const now = s?.time ?? -1;
  const currentIdx = shown.reduce((acc, l, i) => (l.t <= now ? i : acc), -1);
  const nf = new Intl.NumberFormat(locale);
  return (
    <div className="tv-logs">
      <div className="tv-logs-bar">
        <RAC.ToggleButtonGroup aria-label={t.filter} selectionMode="multiple" selectedKeys={levels} onSelectionChange={setLevels} className="tv-logs-levels">
          {LEVELS.map((lv) => (
            <RAC.ToggleButton key={lv} id={lv} className={cx("tv-level-toggle", `is-${lv}`)}>
              <span className="tv-level-dot" />{t.levels[lv]}<span className="tv-level-count">{nf.format(logs.filter((l) => l.level === lv).length)}</span>
            </RAC.ToggleButton>
          ))}
        </RAC.ToggleButtonGroup>
        <RAC.SearchField aria-label={t.search} value={q} onChange={setQ} className="tv-field tv-search tv-logs-search">
          <RAC.Group className="tv-group"><Icon.Search className="tv-search-icon" /><RAC.Input className="tv-input" placeholder={t.search} dir="ltr" /></RAC.Group>
        </RAC.SearchField>
      </div>
      <p className="tv-desc" aria-live="polite" style={{ margin: 0 }}>{t.count(nf.format(shown.length), nf.format(logs.length))}</p>
      <ol className="tv-logs-list" style={{ maxHeight }} dir="ltr">
        {shown.length === 0 && <li className="tv-empty-mini">{t.none}</li>}
        {shown.map((l, i) => (
          <li key={i} className={cx("tv-log", i === currentIdx && "is-current")}>
            <RAC.Button className="tv-log-btn" onPress={() => s?.seek(l.t)}>
              <span className="tv-log-time">{l.clock}</span>
              <span className={cx("tv-log-level", `is-${l.level}`)}>[{l.level.toUpperCase()}]</span>
              <span className="tv-log-msg">{l.msg}</span>
            </RAC.Button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------------- Cost breakdown ---------------- */
export function CostBreakdown({ items, minutes, currency = "USD" }) {
  const lang = useLang(); const { locale } = RAC.useLocale();
  const money = (v, d = 2) => new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  const total = items.reduce((a, b) => a + b.cost, 0);
  const t = lang === "ar" ? { total: "الإجمالي", perMin: "للدقيقة", share: "توزيع التكلفة" } : { total: "Total", perMin: "/ min", share: "Cost share" };
  return (
    <div className="tv-cost">
      <div className="tv-cost-bar" role="img" aria-label={t.share}>
        {items.map((it, i) => <span key={i} style={{ width: `${(it.cost / total) * 100}%`, background: `var(--chart-${(i % 6) + 1})` }} title={L(lang, it.label)} />)}
      </div>
      <dl className="tv-cost-list">
        {items.map((it, i) => (
          <div key={i} className="tv-cost-row">
            <dt><span className="tv-chart-dot" style={{ background: `var(--chart-${(i % 6) + 1})` }} />{L(lang, it.label)}{it.detail && <span className="tv-desc">{L(lang, it.detail)}</span>}</dt>
            <dd><b>{money(it.cost)}</b><span className="tv-desc">{money(it.cost / minutes, 3)} {t.perMin}</span></dd>
          </div>
        ))}
        <div className="tv-cost-row is-total"><dt>{t.total}</dt><dd><b>{money(total)}</b><span className="tv-desc">{money(total / minutes, 3)} {t.perMin}</span></dd></div>
      </dl>
    </div>
  );
}

/* ---------------- JSON viewer ---------------- */
function JsonNode({ k, v, depth, last }) {
  const [open, setOpen] = useState(depth < 2);
  const isObj = v && typeof v === "object";
  const keyEl = k != null ? <><span className="j-key">"{k}"</span><span className="j-punc">: </span></> : null;
  const comma = last ? "" : ",";
  if (!isObj) {
    const cls = typeof v === "string" ? "j-str" : typeof v === "number" ? "j-num" : v == null ? "j-null" : "j-bool";
    return <div className="j-line" style={{ paddingInlineStart: depth * 16 }}>{keyEl}<span className={cls}>{typeof v === "string" ? `"${v}"` : String(v)}</span>{comma}</div>;
  }
  const entries = Array.isArray(v) ? v.map((x, i) => [null, x]) : Object.entries(v);
  const [o, c] = Array.isArray(v) ? ["[", "]"] : ["{", "}"];
  return (
    <div>
      <div className="j-line" style={{ paddingInlineStart: depth * 16 }}>
        <button type="button" className="j-toggle" aria-expanded={open} onClick={() => setOpen(!open)} aria-label={open ? "Collapse" : "Expand"}>
          <Icon.ChevronRight width={12} height={12} style={{ transform: open ? "rotate(90deg)" : "none" }} />
        </button>
        {keyEl}<span className="j-punc">{o}</span>{!open && <><span className="j-more">{entries.length} {Array.isArray(v) ? "items" : "keys"}</span><span className="j-punc">{c}</span>{comma}</>}
      </div>
      {open && entries.map(([kk, vv], i) => <JsonNode key={i} k={kk} v={vv} depth={depth + 1} last={i === entries.length - 1} />)}
      {open && <div className="j-line" style={{ paddingInlineStart: depth * 16 }}><span className="j-punc">{c}</span>{comma}</div>}
    </div>
  );
}
export function JsonView({ value, title, maxHeight = 360 }) {
  const text = JSON.stringify(value, null, 2);
  return (
    <div className="tv-code" dir="ltr">
      <div className="tv-code-head"><span className="tv-code-title"><Icon.Braces width={14} height={14} />{title ?? "JSON"}</span><CopyButton text={text} size="sm" /></div>
      <div className="tv-code-body tv-json" style={{ maxHeight }}><JsonNode v={value} depth={0} last /></div>
    </div>
  );
}

/* ---------------- Code block with tabs ---------------- */
const KW = /\b(const|let|var|await|async|function|return|import|from|export|new|if|else|for|of|in|def|print|true|false|null|None|True|False)\b/g;
function highlight(line, lang) {
  const out = []; let rest = line; let key = 0;
  const rules = [
    [/^(\s*(#|\/\/).*)/, "c-com"], [/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/, "c-str"],
    [/^(-{1,2}[A-Za-z][\w-]*)/, lang === "bash" ? "c-flag" : null], [/^(\b\d+(?:\.\d+)?\b)/, "c-num"],
    [/^(\b(?:const|let|var|await|async|function|return|import|from|export|new|if|else|for|of|in|def|print|true|false|null|None|True|False|curl)\b)/, "c-kw"],
  ];
  while (rest.length) {
    let matched = false;
    for (const [re, cls] of rules) {
      if (!cls) continue;
      const m = rest.match(re);
      if (m) { out.push(<span key={key++} className={cls}>{m[1]}</span>); rest = rest.slice(m[1].length); matched = true; break; }
    }
    if (!matched) { const ch = rest.match(/^[\s\S][\w]*/)[0]; out.push(ch); rest = rest.slice(ch.length); }
  }
  return out;
}
export function CodeBlock({ tabs, maxHeight = 360 }) {
  const [tab, setTab] = useState(tabs[0].id);
  const cur = tabs.find((x) => x.id === tab);
  const lines = cur.code.split("\n");
  return (
    <div className="tv-code" dir="ltr">
      <div className="tv-code-head">
        <RAC.Tabs selectedKey={tab} onSelectionChange={setTab} className="tv-code-tabs">
          <RAC.TabList aria-label="Language" className="tv-code-tablist">
            {tabs.map((x) => <RAC.Tab key={x.id} id={x.id} className="tv-code-tab">{x.label}<RAC.SelectionIndicator className="tv-code-tab-ind" /></RAC.Tab>)}
          </RAC.TabList>
        </RAC.Tabs>
        <CopyButton text={cur.code} size="sm" />
      </div>
      <pre className="tv-code-body" style={{ maxHeight }} tabIndex={0} aria-label={`${cur.label} code`}>
        <code>{lines.map((l, i) => <span key={i} className="c-line"><span className="c-ln" aria-hidden="true">{i + 1}</span><span>{highlight(l, cur.lang)}</span>{"\n"}</span>)}</code>
      </pre>
    </div>
  );
}
