// Audio helpers for the voice components.
// synthCall() builds a believable stereo call recording in the browser (agent = left, customer = right)
// so demos need no audio files. encodeWav() / mixToMono() power the downloads. findSilences() powers "skip silence".
import { numberFormat } from "../core/format.js";

const SR = 16000;

/* Speech-like signal: a voiced tone with a gliding pitch, a few harmonics shaped like formants,
   a syllable envelope (~4.5 per second) and a little breath noise. Quiet and soft on purpose. */
function speak(out, startSec, durSec, { pitch, bright, seed }) {
  let s = seed;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const start = Math.floor(startSec * SR), n = Math.floor(durSec * SR);
  let phase = 0;
  const syll = 4.2 + rand() * 1.2;
  for (let i = 0; i < n && start + i < out.length; i++) {
    const t = i / SR;
    const f0 = pitch * (1 + 0.09 * Math.sin(2 * Math.PI * 0.7 * t + seed) + 0.04 * Math.sin(2 * Math.PI * 2.3 * t));
    phase += (2 * Math.PI * f0) / SR;
    const voiced = Math.sin(phase) + 0.5 * Math.sin(2 * phase) * bright + 0.28 * Math.sin(3 * phase) + 0.16 * Math.sin(5 * phase) * bright;
    const env = Math.max(0, Math.sin(Math.PI * ((t * syll) % 1))) ** 1.6;
    const word = 0.55 + 0.45 * Math.sin(2 * Math.PI * 0.9 * t + seed * 3);
    const fade = Math.min(1, t / 0.06, (durSec - t) / 0.12);
    out[start + i] += (voiced * 0.16 * env * word + (rand() - 0.5) * 0.012 * env) * fade;
  }
}

/* turns: [{ speaker: "agent" | "customer", start, end }] → { left, right, duration, sampleRate } */
export function synthCall(turns, duration) {
  const len = Math.ceil(duration * SR);
  const left = new Float32Array(len), right = new Float32Array(len);
  let r = 99;
  const noise = () => (r = (r * 16807) % 2147483647) / 2147483647 - 0.5;
  for (let i = 0; i < len; i++) { left[i] = noise() * 0.002; right[i] = noise() * 0.003; } // line hiss
  turns.forEach((tn, i) => {
    const dur = tn.end - tn.start;
    if (tn.speaker === "agent") speak(left, tn.start, dur, { pitch: 196, bright: 1, seed: 11 + i });
    else speak(right, tn.start, dur, { pitch: 128, bright: 0.7, seed: 37 + i });
  });
  return { left, right, duration, sampleRate: SR };
}

/* 16-bit PCM WAV, 1 or 2 channels */
export function encodeWav(channels, sampleRate = SR) {
  const nCh = channels.length, len = channels[0].length;
  const buf = new ArrayBuffer(44 + len * nCh * 2), v = new DataView(buf);
  const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); v.setUint32(4, 36 + len * nCh * 2, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, nCh, true); v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * nCh * 2, true); v.setUint16(32, nCh * 2, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, len * nCh * 2, true);
  let o = 44;
  for (let i = 0; i < len; i++) for (let c = 0; c < nCh; c++) {
    const x = Math.max(-1, Math.min(1, channels[c][i]));
    v.setInt16(o, x < 0 ? x * 0x8000 : x * 0x7fff, true); o += 2;
  }
  return new Blob([buf], { type: "audio/wav" });
}
export function mixToMono(left, right) {
  const m = new Float32Array(left.length);
  for (let i = 0; i < m.length; i++) m[i] = (left[i] + right[i]) * 0.5;
  return m;
}

/* Silences where both channels stay quiet for at least minSec. Returns [{ start, end }] in seconds. */
export function findSilences(left, right, sampleRate = SR, { minSec = 1.2, threshold = 0.012 } = {}) {
  const win = Math.floor(sampleRate * 0.05);
  const out = [];
  let quietStart = null;
  for (let i = 0; i < left.length; i += win) {
    let e = 0;
    for (let j = i; j < Math.min(i + win, left.length); j++) e = Math.max(e, Math.abs(left[j]), Math.abs(right[j]));
    const t = i / sampleRate;
    if (e < threshold) { if (quietStart == null) quietStart = t; }
    else if (quietStart != null) { if (t - quietStart >= minSec) out.push({ start: quietStart, end: t }); quietStart = null; }
  }
  const total = left.length / sampleRate;
  if (quietStart != null && total - quietStart >= minSec) out.push({ start: quietStart, end: total });
  return out;
}

/* Peaks for drawing (one value per bucket, per channel) */
export function computePeaks(data, buckets = 800) {
  const size = Math.floor(data.length / buckets) || 1, peaks = new Float32Array(buckets);
  for (let b = 0; b < buckets; b++) {
    let m = 0;
    for (let i = b * size; i < (b + 1) * size && i < data.length; i++) m = Math.max(m, Math.abs(data[i]));
    peaks[b] = m;
  }
  return peaks;
}

export const formatClock = (sec, locale = "en-US") => {
  const s = Math.max(0, Math.floor(sec || 0));
  const nf = numberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false });
  const m = Math.floor(s / 60);
  return `${numberFormat(locale, { useGrouping: false }).format(m)}:${nf.format(s % 60)}`;
};
