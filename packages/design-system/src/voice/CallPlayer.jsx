// Stereo call player: one shared session (audio element + Web Audio gains per channel) drives
// the mini, standard and expanded players, the transcript and the logs, so they all stay in sync.
import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as RAC from "react-aria-components";
import WaveSurfer from "wavesurfer.js";
import * as Icon from "../icons/icons.jsx";
import { encodeWav, mixToMono, findSilences, computePeaks, formatClock } from "./audio.js";
import { numberFormat } from "../core/format.js";

const cx = (...c) => c.filter(Boolean).join(" ");
const CallCtx = createContext(null);
export const useCall = () => useContext(CallCtx);
const useLang = () => (RAC.useLocale().locale.startsWith("ar") ? "ar" : "en");

const T = {
  en: { play: "Play", pause: "Pause", back: "Back 10 seconds", fwd: "Forward 10 seconds", seek: "Position", speed: "Playback speed",
    skip: "Skip silence", download: "Download", stereo: "Stereo recording (WAV)", mono: "Mono recording (WAV)", expand: "Expand player",
    mute: "Mute", unmute: "Unmute", solo: "Listen to only this channel", agent: "Agent", customer: "Customer", left: "Left", right: "Right",
    of: "of", recording: "Call recording", events: "Call events", close: "Close" },
  ar: { play: "تشغيل", pause: "إيقاف مؤقت", back: "رجوع ١٠ ثوانٍ", fwd: "تقديم ١٠ ثوانٍ", seek: "الموضع", speed: "سرعة التشغيل",
    skip: "تخطي الصمت", download: "تنزيل", stereo: "تسجيل ستيريو (WAV)", mono: "تسجيل أحادي (WAV)", expand: "توسيع المشغل",
    mute: "كتم", unmute: "إلغاء الكتم", solo: "الاستماع لهذه القناة فقط", agent: "الوكيل", customer: "العميل", left: "يسار", right: "يمين",
    of: "من", recording: "تسجيل المكالمة", events: "أحداث المكالمة", close: "إغلاق" },
};
export const usePlayerText = () => T[useLang()];

/* ---------------- Session ---------------- */
export function CallSessionProvider({ recording, children }) {
  const { left, right, sampleRate, duration } = recording;
  const url = useMemo(() => URL.createObjectURL(encodeWav([left, right], sampleRate)), [left, right, sampleRate]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  const peaks = useMemo(() => [computePeaks(left, 900), computePeaks(right, 900)], [left, right]);
  const silences = useMemo(() => findSilences(left, right, sampleRate), [left, right, sampleRate]);

  const audioRef = useRef(null);
  if (!audioRef.current && typeof Audio !== "undefined") { audioRef.current = new Audio(); audioRef.current.preload = "auto"; }
  const graph = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [rate, setRateState] = useState(1);
  const [skip, setSkip] = useState(false);
  const [mute, setMute] = useState({ agent: false, customer: false });
  const skipRef = useRef(skip); skipRef.current = skip;

  useEffect(() => { const a = audioRef.current; a.src = url; a.load(); }, [url]);

  // Web Audio: split L/R so each channel has its own gain (mute / solo)
  const ensureGraph = () => {
    if (graph.current) return graph.current;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    const src = ctx.createMediaElementSource(audioRef.current);
    const split = ctx.createChannelSplitter(2), merge = ctx.createChannelMerger(2);
    const gL = ctx.createGain(), gR = ctx.createGain();
    src.connect(split); split.connect(gL, 0); split.connect(gR, 1);
    gL.connect(merge, 0, 0); gR.connect(merge, 0, 1); merge.connect(ctx.destination);
    graph.current = { ctx, gL, gR };
    return graph.current;
  };
  useEffect(() => {
    const g = graph.current; if (!g) return;
    g.gL.gain.setTargetAtTime(mute.agent ? 0 : 1, g.ctx.currentTime, 0.02);
    g.gR.gain.setTargetAtTime(mute.customer ? 0 : 1, g.ctx.currentTime, 0.02);
  }, [mute]);

  // time updates (smooth while playing) and skip-silence
  useEffect(() => {
    const a = audioRef.current;
    let raf;
    const tick = () => {
      const t = a.currentTime;
      if (skipRef.current && !a.paused) {
        const s = silences.find((x) => t >= x.start + 0.25 && t < x.end - 0.3);
        if (s) a.currentTime = s.end - 0.3;
      }
      setTime(a.currentTime);
      if (!a.paused) raf = requestAnimationFrame(tick);
    };
    const onPlay = () => { setPlaying(true); raf = requestAnimationFrame(tick); };
    const onPause = () => { setPlaying(false); cancelAnimationFrame(raf); setTime(a.currentTime); };
    const onSeek = () => setTime(a.currentTime);
    a.addEventListener("play", onPlay); a.addEventListener("pause", onPause); a.addEventListener("ended", onPause); a.addEventListener("seeked", onSeek);
    return () => { cancelAnimationFrame(raf); a.removeEventListener("play", onPlay); a.removeEventListener("pause", onPause); a.removeEventListener("ended", onPause); a.removeEventListener("seeked", onSeek); };
  }, [silences]);

  useEffect(() => () => { audioRef.current?.pause(); graph.current?.ctx.close?.(); }, []);

  const play = useCallback(async () => {
    const g = ensureGraph();
    if (g?.ctx.state === "suspended") await g.ctx.resume();
    try { await audioRef.current.play(); } catch {}
  }, []);
  const pause = useCallback(() => audioRef.current.pause(), []);
  const seek = useCallback((t) => { const a = audioRef.current; a.currentTime = Math.max(0, Math.min(duration, t)); setTime(a.currentTime); }, [duration]);
  const setRate = (r) => { audioRef.current.playbackRate = r; setRateState(r); };
  const download = (kind, filename = "call") => {
    const blob = kind === "mono" ? encodeWav([mixToMono(left, right)], sampleRate) : encodeWav([left, right], sampleRate);
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${filename}-${kind}.wav`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const value = {
    audio: audioRef.current, url, peaks, silences, duration, time, playing, rate, skip, mute,
    play, pause, toggle: () => (playing ? pause() : play()), seek, setRate, setSkip,
    setMute: (ch, v) => { ensureGraph(); setMute((m) => ({ ...m, [ch]: v })); },
    solo: (ch) => { ensureGraph(); setMute({ agent: ch !== "agent", customer: ch !== "customer" }); },
    download,
  };
  return <CallCtx.Provider value={value}>{children}</CallCtx.Provider>;
}

/* ---------------- Theme-aware colours for canvas ---------------- */
function useCssColors(names) {
  const key = names.join(" ");
  // Read once mounted: there is no page to read on the server, and the canvas only draws in the browser
  const [c, setC] = useState(() => Object.fromEntries(names.map((n) => [n, "#888"])));
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      return Object.fromEntries(key.split(" ").map((n) => [n, cs.getPropertyValue(n).trim() || "#888"]));
    };
    setC(read());
    const mo = new MutationObserver(() => setC(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)"); const on = () => setC(read());
    mq.addEventListener?.("change", on);
    return () => { mo.disconnect(); mq.removeEventListener?.("change", on); };
  }, [key]);
  return c;
}
/* Opaque blend of a colour with the surface. (wavesurfer masks the progress layer with the unplayed
   waveform, so a transparent unplayed colour would make the played colour transparent too.) */
const hexRgb = (hex) => { const h = hex.replace("#", ""); return h.length === 6 ? [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) : null; };
const blend = (hex, baseHex, a) => {
  const c = hexRgb(hex), b = hexRgb(baseHex); if (!c || !b) return hex;
  return `rgb(${c.map((v, i) => Math.round(v * a + b[i] * (1 - a))).join(",")})`;
};

/* ---------------- Stereo waveform (wavesurfer.js, split channels) ---------------- */
export function StereoWaveform({ height = 52, events = [], onEvent }) {
  const s = useCall();
  const t = usePlayerText();
  const ref = useRef(null);
  const colors = useCssColors(["--chart-1", "--chart-2", "--ink-muted", "--surface"]);
  useEffect(() => {
    if (!ref.current) return;
    const ws = WaveSurfer.create({
      // Pass the same url the session already set: wavesurfer then leaves the media source alone
      // (with no url it clears the src). Peaks + duration mean it doesn't re-decode the audio.
      container: ref.current, media: s.audio, url: s.url, peaks: s.peaks, duration: s.duration, height,
      barWidth: 2, barGap: 1.5, barRadius: 2, normalize: true, cursorWidth: 2, cursorColor: colors["--ink-muted"],
      dragToSeek: true, interact: true,
      splitChannels: [
        { waveColor: blend(colors["--chart-1"], colors["--surface"], 0.3), progressColor: colors["--chart-1"], height },
        { waveColor: blend(colors["--chart-2"], colors["--surface"], 0.38), progressColor: colors["--chart-2"], height },
      ],
    });
    return () => ws.destroy();
  }, [s.audio, s.url, s.peaks, s.duration, height, colors]);
  const pct = (x) => `${(x / s.duration) * 100}%`;
  return (
    <div className="tv-wave" dir="ltr">
      <div className="tv-wave-lanes">
        <ChannelLabel ch="agent" />
        <ChannelLabel ch="customer" />
      </div>
      <div className="tv-wave-stage">
        <div ref={ref} className="tv-wave-canvas" aria-hidden="true" />
        {s.skip && s.silences.map((x, i) => <span key={i} className="tv-wave-silence" style={{ left: pct(x.start), width: pct(x.end - x.start) }} />)}
        <div className="tv-wave-events" aria-label={t.events} role="list">
          {events.map((e, i) => (
            <span key={i} role="listitem" className="tv-wave-event-wrap" style={{ left: pct(e.t) }}>
              <RAC.TooltipTrigger delay={200}>
                <RAC.Button className={cx("tv-wave-event", `is-${e.kind}`)} aria-label={`${e.label}, ${formatClock(e.t)}`}
                  onPress={() => { s.seek(e.t); onEvent?.(e); }} />
                <RAC.Tooltip className="tv-tooltip" offset={6}>{e.label} · <span dir="ltr">{formatClock(e.t)}</span></RAC.Tooltip>
              </RAC.TooltipTrigger>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChannelLabel({ ch }) {
  const s = useCall(); const t = usePlayerText();
  const muted = s.mute[ch];
  return (
    <div className={cx("tv-lane", `is-${ch}`, muted && "is-muted")}>
      <span className="tv-lane-dot" aria-hidden="true" />
      <span className="tv-lane-name">{t[ch]}<span className="tv-lane-side">{ch === "agent" ? "L" : "R"}</span></span>
      <span className="tv-lane-btns">
        <RAC.TooltipTrigger delay={300}>
          <RAC.ToggleButton className="tv-icon-btn tv-lane-btn" isSelected={muted} onChange={(v) => s.setMute(ch, v)} aria-label={`${muted ? t.unmute : t.mute} ${t[ch]}`}>
            {muted ? <Icon.VolumeX /> : <Icon.Volume />}
          </RAC.ToggleButton>
          <RAC.Tooltip className="tv-tooltip" offset={6}>{muted ? t.unmute : t.mute}</RAC.Tooltip>
        </RAC.TooltipTrigger>
        <RAC.TooltipTrigger delay={300}>
          <RAC.Button className="tv-icon-btn tv-lane-btn tv-lane-solo" onPress={() => s.solo(ch)} aria-label={`${t.solo}: ${t[ch]}`}>
            <Icon.Headphones />
          </RAC.Button>
          <RAC.Tooltip className="tv-tooltip" offset={6}>{t.solo}</RAC.Tooltip>
        </RAC.TooltipTrigger>
      </span>
    </div>
  );
}

/* ---------------- Controls ---------------- */
const RATES = [0.75, 1, 1.25, 1.5, 2];
function PlayButton({ size = "md" }) {
  const s = useCall(); const t = usePlayerText();
  return (
    <RAC.Button className={cx("tv-play", `is-${size}`)} onPress={s.toggle} aria-label={s.playing ? t.pause : t.play}>
      {s.playing ? <Icon.Pause /> : <Icon.Play />}
    </RAC.Button>
  );
}
function Clock() {
  const s = useCall(); const { locale } = RAC.useLocale();
  return <span className="tv-clock" dir="ltr"><b>{formatClock(s.time, locale)}</b><span> / {formatClock(s.duration, locale)}</span></span>;
}
function Scrubber({ compact }) {
  const s = useCall(); const t = usePlayerText(); const { locale } = RAC.useLocale();
  return (
    <RAC.Slider aria-label={t.seek} className={cx("tv-scrub", compact && "is-compact")} minValue={0} maxValue={s.duration} step={0.1}
      value={s.time} onChange={s.seek} dir="ltr"
      formatOptions={undefined} aria-valuetext={`${formatClock(s.time, locale)} ${t.of} ${formatClock(s.duration, locale)}`}>
      <RAC.SliderTrack className="tv-scrub-track">
        {({ state }) => (
          <>
            <span className="tv-scrub-fill" style={{ width: `${state.getThumbPercent(0) * 100}%` }} />
            <RAC.SliderThumb className="tv-scrub-thumb" aria-valuetext={`${formatClock(s.time, locale)} ${t.of} ${formatClock(s.duration, locale)}`} />
          </>
        )}
      </RAC.SliderTrack>
    </RAC.Slider>
  );
}
function SpeedMenu() {
  const s = useCall(); const t = usePlayerText(); const { locale } = RAC.useLocale();
  const fmt = (r) => `${numberFormat(locale, { maximumFractionDigits: 2 }).format(r)}×`;
  return (
    <RAC.MenuTrigger>
      <RAC.Button className="tv-chip-btn" aria-label={`${t.speed}: ${fmt(s.rate)}`}>{fmt(s.rate)}</RAC.Button>
      <RAC.Popover className="tv-popover" offset={6}>
        <RAC.Menu className="tv-listbox" selectionMode="single" selectedKeys={[String(s.rate)]} onSelectionChange={(k) => s.setRate(Number([...k][0]))} aria-label={t.speed}>
          {RATES.map((r) => <RAC.MenuItem key={r} id={String(r)} textValue={fmt(r)} className="tv-item">{fmt(r)}<Icon.Check className="tv-check-icon" /></RAC.MenuItem>)}
        </RAC.Menu>
      </RAC.Popover>
    </RAC.MenuTrigger>
  );
}
function DownloadMenu({ filename }) {
  const s = useCall(); const t = usePlayerText();
  return (
    <RAC.MenuTrigger>
      <RAC.TooltipTrigger delay={300}>
        <RAC.Button className="tv-icon-btn" aria-label={t.download}><Icon.Download /></RAC.Button>
        <RAC.Tooltip className="tv-tooltip" offset={6}>{t.download}</RAC.Tooltip>
      </RAC.TooltipTrigger>
      <RAC.Popover className="tv-popover" offset={6} placement="bottom end">
        <RAC.Menu className="tv-listbox" onAction={(k) => s.download(k, filename)} aria-label={t.download}>
          <RAC.MenuItem id="stereo" className="tv-item"><Icon.Headphones />{t.stereo}</RAC.MenuItem>
          <RAC.MenuItem id="mono" className="tv-item"><Icon.Volume />{t.mono}</RAC.MenuItem>
        </RAC.Menu>
      </RAC.Popover>
    </RAC.MenuTrigger>
  );
}

/* ---------------- Player sizes ---------------- */
export function MiniPlayer() {
  return (
    <div className="tv-player tv-player--mini">
      <PlayButton size="sm" />
      <Scrubber compact />
      <Clock />
    </div>
  );
}

export function CallPlayer({ events = [], filename = "call", expandable = true, side, onEvent }) {
  const s = useCall(); const t = usePlayerText();
  const [open, setOpen] = useState(false);
  return (
    <div className="tv-player">
      <StereoWaveform events={events} onEvent={onEvent} />
      <div className="tv-player-bar">
        <div className="tv-player-main">
          <RAC.Button className="tv-icon-btn" aria-label={t.back} onPress={() => s.seek(s.time - 10)}><Icon.Back10 /></RAC.Button>
          <PlayButton />
          <RAC.Button className="tv-icon-btn" aria-label={t.fwd} onPress={() => s.seek(s.time + 10)}><Icon.Fwd10 /></RAC.Button>
          <Clock />
        </div>
        <div className="tv-player-tools">
          <RAC.Switch isSelected={s.skip} onChange={s.setSkip} className="tv-switch tv-player-skip"><span className="tv-switch-track" />{t.skip}</RAC.Switch>
          <SpeedMenu />
          <DownloadMenu filename={filename} />
          {expandable && (
            <RAC.TooltipTrigger delay={300}>
              <RAC.Button className="tv-icon-btn" aria-label={t.expand} onPress={() => setOpen(true)}><Icon.Maximize /></RAC.Button>
              <RAC.Tooltip className="tv-tooltip" offset={6}>{t.expand}</RAC.Tooltip>
            </RAC.TooltipTrigger>
          )}
        </div>
      </div>
      {expandable && (
        <RAC.ModalOverlay isOpen={open} onOpenChange={setOpen} isDismissable className="tv-overlay">
          <RAC.Modal className="tv-modal tv-player-modal">
            <RAC.Dialog className="tv-dialog tv-player-dialog" aria-label={t.recording}>
              {({ close }) => (
                <>
                  <div className="tv-player-modal-head">
                    <RAC.Heading slot="title" className="tv-drawer-title">{t.recording}</RAC.Heading>
                    <RAC.Button className="tv-icon-btn" aria-label={t.close} onPress={close}><Icon.X /></RAC.Button>
                  </div>
                  <div className={cx("tv-player-modal-body", side && "has-side")}>
                    <div className="tv-player-modal-main">
                      <StereoWaveform height={84} events={events} onEvent={onEvent} />
                      <Scrubber />
                      <div className="tv-player-bar">
                        <div className="tv-player-main">
                          <RAC.Button className="tv-icon-btn" aria-label={t.back} onPress={() => s.seek(s.time - 10)}><Icon.Back10 /></RAC.Button>
                          <PlayButton size="lg" />
                          <RAC.Button className="tv-icon-btn" aria-label={t.fwd} onPress={() => s.seek(s.time + 10)}><Icon.Fwd10 /></RAC.Button>
                          <Clock />
                        </div>
                        <div className="tv-player-tools">
                          <RAC.Switch isSelected={s.skip} onChange={s.setSkip} className="tv-switch tv-player-skip"><span className="tv-switch-track" />{t.skip}</RAC.Switch>
                          <SpeedMenu />
                          <DownloadMenu filename={filename} />
                        </div>
                      </div>
                    </div>
                    {side && <div className="tv-player-modal-side">{side}</div>}
                  </div>
                </>
              )}
            </RAC.Dialog>
          </RAC.Modal>
        </RAC.ModalOverlay>
      )}
    </div>
  );
}
