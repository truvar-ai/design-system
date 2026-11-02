// Live call widget. States: idle → connecting → live → ended.
// Wire `onStart` / `onEnd` / `onMute` to your WebRTC or telephony client; the demo drives it with a script.
import { useEffect, useRef, useState } from "react";
import * as RAC from "react-aria-components";
import * as Icon from "../icons/icons.jsx";
import { BrandAvatar } from "../core/index.jsx";
import { formatClock } from "./audio.js";
import { numberFormat } from "../core/format.js";

const cx = (...c) => c.filter(Boolean).join(" ");
const useLang = () => (RAC.useLocale().locale.startsWith("ar") ? "ar" : "en");
const T = {
  en: { start: "Start test call", connecting: "Connecting", live: "Live", ended: "Call ended", mute: "Mute microphone", unmute: "Unmute microphone",
    end: "End call", again: "Call again", latency: "Latency", you: "You", speaking: "is speaking", listening: "Listening", muted: "Microphone off",
    mic: "Your microphone level", summary: (d, n) => `Lasted ${d}. ${n} turns.`, simulated: "Demo audio is simulated." },
  ar: { start: "بدء مكالمة تجريبية", connecting: "جارٍ الاتصال", live: "مباشر", ended: "انتهت المكالمة", mute: "كتم الميكروفون", unmute: "إلغاء كتم الميكروفون",
    end: "إنهاء المكالمة", again: "اتصل مرة أخرى", latency: "زمن الاستجابة", you: "أنت", speaking: "يتحدث", listening: "يستمع", muted: "الميكروفون مغلق",
    mic: "مستوى ميكروفونك", summary: (d, n) => `استمرت ${d}. ${n} أدوار.`, simulated: "صوت العرض محاكى." },
};

export function LiveCall({ agentName, script, onStart, onEnd }) {
  const lang = useLang(); const t = T[lang]; const { locale } = RAC.useLocale();
  const [state, setState] = useState("idle");
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [lines, setLines] = useState([]);
  const [speaker, setSpeaker] = useState(null);
  const [level, setLevel] = useState(0);
  const [latency, setLatency] = useState(null);
  const timers = useRef([]);
  const t0 = useRef(0);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => () => clear(), []);

  // timer + simulated mic level
  useEffect(() => {
    if (state !== "live") return;
    const id = setInterval(() => {
      setElapsed((Date.now() - t0.current) / 1000);
      setLevel(muted ? 0 : speaker === "customer" ? 0.35 + Math.random() * 0.6 : Math.random() * 0.12);
    }, 110);
    return () => clearInterval(id);
  }, [state, muted, speaker]);

  const start = () => {
    clear(); setLines([]); setElapsed(0); setSpeaker(null); setLatency(null); setState("connecting"); onStart?.();
    timers.current.push(setTimeout(() => {
      setState("live"); t0.current = Date.now();
      let at = 400;
      script.forEach((line, i) => {
        timers.current.push(setTimeout(() => { setSpeaker(line.speaker); if (line.speaker === "agent") setLatency(line.latency); }, at));
        timers.current.push(setTimeout(() => setLines((l) => [...l, { ...line, id: i }]), at + 300));
        at += line.dur * 1000;
        timers.current.push(setTimeout(() => setSpeaker(null), at - 250));
      });
      timers.current.push(setTimeout(() => end(), at + 800));
    }, 1300));
  };
  const end = () => { clear(); setSpeaker(null); setState("ended"); onEnd?.(); };

  const L = (o) => (lang === "ar" ? o.ar : o.en);
  const status = state === "connecting" ? t.connecting : state === "live" ? t.live : state === "ended" ? t.ended : null;
  const latTone = latency == null ? "" : latency < 800 ? "is-good" : latency < 1300 ? "is-ok" : "is-slow";
  const nf = numberFormat(locale);

  return (
    <div className={cx("tv-live", `is-${state}`)}>
      <div className="tv-live-top">
        {status && (
          <span className={cx("tv-live-status", `is-${state}`)} role="status">
            <span className="tv-live-status-dot" />{status}{state === "live" && <span dir="ltr" className="tv-live-timer">{formatClock(elapsed, locale)}</span>}
          </span>
        )}
        {latency != null && state === "live" && <span className={cx("tv-live-latency", latTone)}>{t.latency} <b>{numberFormat(locale, { style: "unit", unit: "millisecond", unitDisplay: "short" }).format(latency)}</b></span>}
      </div>

      <div className="tv-live-center">
        <BrandAvatar size={104} active={state === "connecting" || speaker === "agent"} activity={state === "connecting" ? "searching" : "speaking"} label={agentName} />
        <p className="tv-live-name">{agentName}</p>
        <p className="tv-desc tv-live-sub" aria-live="polite">
          {state === "idle" && t.simulated}
          {state === "connecting" && "…"}
          {state === "live" && (muted ? t.muted : speaker === "agent" ? `${agentName} ${t.speaking}` : speaker === "customer" ? `${t.you} ${t.speaking}` : t.listening)}
          {state === "ended" && t.summary(formatClock(elapsed, locale), nf.format(lines.length))}
        </p>
        {state === "live" && (
          <div className="tv-live-meter" role="meter" aria-label={t.mic} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level * 100)}>
            {Array.from({ length: 9 }, (_, i) => {
              const h = Math.max(0.12, level * (1 - Math.abs(i - 4) / 6) * (0.75 + 0.5 * ((i * 37) % 7) / 7));
              return <span key={i} style={{ transform: `scaleY(${h})` }} />;
            })}
          </div>
        )}
      </div>

      {lines.length > 0 && (
        <ol className="tv-live-lines" aria-live="polite">
          {lines.slice(-3).map((l) => (
            <li key={l.id} className={cx("tv-live-line", `is-${l.speaker}`)}><b>{l.speaker === "agent" ? agentName : t.you}</b><span dir="auto">{L(l.text)}</span></li>
          ))}
        </ol>
      )}

      <div className="tv-live-controls">
        {(state === "idle" || state === "ended") && (
          <RAC.Button className="tv-btn tv-btn--primary tv-live-start" onPress={start}><Icon.Phone />{state === "ended" ? t.again : t.start}</RAC.Button>
        )}
        {(state === "connecting" || state === "live") && (
          <>
            <RAC.TooltipTrigger delay={300}>
              <RAC.ToggleButton className="tv-live-round" isSelected={muted} onChange={setMuted} aria-label={muted ? t.unmute : t.mute} isDisabled={state !== "live"}>
                {muted ? <Icon.MicOff /> : <Icon.Mic />}
              </RAC.ToggleButton>
              <RAC.Tooltip className="tv-tooltip" offset={6}>{muted ? t.unmute : t.mute}</RAC.Tooltip>
            </RAC.TooltipTrigger>
            <RAC.TooltipTrigger delay={300}>
              <RAC.Button className="tv-live-round is-end" onPress={end} aria-label={t.end}><Icon.PhoneOff /></RAC.Button>
              <RAC.Tooltip className="tv-tooltip" offset={6}>{t.end}</RAC.Tooltip>
            </RAC.TooltipTrigger>
          </>
        )}
      </div>
    </div>
  );
}
