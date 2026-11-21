import { useMemo, useState } from "react";
import {
  ChartCard, useChartLocale, axisProps, gridProps, tooltipProps, Sparkline, Gauge, Heatmap, CHART_COLORS,
  LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart, PieChart, Pie, ChartCell, ScatterChart, Scatter, ZAxis,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Treemap,
  XAxis, YAxis, CartesianGrid, ChartTooltipBase as Tooltip, ReferenceLine, FunnelBars, RankedBars, ChartLegend, ChartTooltip,
  WorldMap, useMapCountries, countryName, CONTINENTS,
  type CountryCode, type MapMarker,
} from "@truvar-ai/design-system/charts";
import {
  CallSessionProvider, CallPlayer, MiniPlayer, Transcript, CallLogs, CostBreakdown, JsonView, CodeBlock, CopyButton, LiveCall,
  WorkflowBuilder, StereoWaveform, useCall, synthCall, encodeWav, mixToMono, findSilences, formatClock,
  type TranscriptTurn, type TranscriptEvent, type CallLogEntry, type CostItem, type LiveCallLine, type WorkflowVariable,
  type WaveformEvent, type CodeTab,
} from "@truvar-ai/design-system/voice";

/* ---------- charts: data copied from the showcase ---------- */
const rnd = (seed: number) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const r1 = rnd(7);
const DAYS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 8, 28 + i);
  const base = 420 + i * 9;
  return { d, ai: Math.round(base + r1() * 90 + (d.getDay() === 5 ? -160 : 0)), human: Math.round(180 + r1() * 50 - i * 2) };
});
const r2 = rnd(11);
const WEEKS = Array.from({ length: 12 }, (_, i) => ({ w: i + 1, phone: Math.round(5200 + i * 260 + r2() * 600), whatsapp: Math.round(2100 + i * 380 + r2() * 500), web: Math.round(900 + i * 120 + r2() * 300) }));
const MONTHS = [5, 6, 7, 8, 9, 10].map((m, i) => ({ m, booked: 820 + i * 140 + Math.round(r2() * 80), callback: 610 + i * 40 + Math.round(r2() * 60), noAnswer: 540 - i * 30 + Math.round(r2() * 60) }));
const INTENTS = [{ k: "billing", en: "Billing question", ar: "استفسار عن الفاتورة", v: 3410 }, { k: "book", en: "Book an appointment", ar: "حجز موعد", v: 2980 }];
const LANGS = [{ en: "Egyptian Arabic", ar: "العربية المصرية", v: 58 }, { en: "Gulf Arabic", ar: "العربية الخليجية", v: 17 }, { en: "English", ar: "الإنجليزية", v: 19 }];
const SENTIMENT = [{ en: "Positive", ar: "إيجابي", v: 64, c: "var(--chart-4)" }, { en: "Neutral", ar: "محايد", v: 27, c: "var(--chart-3)" }];
const r3 = rnd(23);
const SCATTER = Array.from({ length: 40 }, () => { const len = 0.5 + r3() * 9.5; return { len: +len.toFixed(1), csat: +Math.min(5, 4.7 - Math.abs(len - 3.5) * 0.25).toFixed(1), calls: Math.round(20 + r3() * 300) }; });
const RADAR = [{ k: "acc", en: "Accuracy", ar: "الدقة", a: 92, b: 81 }, { k: "lat", en: "Speed", ar: "السرعة", a: 88, b: 70 }];
const FUNNEL = [{ en: "Calls answered", ar: "مكالمات", v: 12400 }, { en: "Qualified", ar: "مؤهلة", v: 7300 }, { en: "Won", ar: "تم الفوز", v: 860 }];
const COSTS = [{ en: "Speech to text", ar: "تحويل", v: 1840 }, { en: "AI model", ar: "نموذج", v: 4120 }];
const r4 = rnd(31);
const HEAT = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => Math.round(40 + r4() * 200)));

function useC() {
  const loc = useChartLocale();
  const L = (o: { en: string; ar: string }) => (loc.lang === "ar" ? o.ar : o.en);
  const dayFmt = (d: Date) => new Intl.DateTimeFormat(loc.locale, { day: "numeric", month: "short" }).format(d);
  const monthFmt = (m: number) => new Intl.DateTimeFormat(loc.locale, { month: "short" }).format(new Date(2026, m - 1, 1));
  const xAxis = (extra?: Partial<React.ComponentProps<typeof XAxis>>) => axisProps(loc.rtl, { reversed: loc.rtl, ...extra });
  const yAxis = (extra?: Partial<React.ComponentProps<typeof YAxis>>) => axisProps(loc.rtl, { orientation: loc.rtl ? "right" : "left", width: 52, tickMargin: 8, axisLine: false, ...extra });
  return { ...loc, L, dayFmt, monthFmt, xAxis, yAxis };
}

interface TreeCellProps { x: number; y: number; width: number; height: number; name?: string; size?: number; fill?: string; depth?: number; money: (v: number) => string }
function TreeCell(props: TreeCellProps) {
  const { x, y, width, height, name, size, fill, depth, money } = props;
  if (width <= 0 || height <= 0 || depth === 0) return null;
  return <g><rect x={x} y={y} width={width} height={height} rx={6} fill={fill} /><text x={x + 10} y={y + 22}>{name}</text><text>{money(size ?? 0)}</text></g>;
}

export function Charts() {
  const c = useC();
  const { L, num, compact, pct, money, rtl } = c;
  const days = DAYS.map((d) => ({ ...d, label: c.dayFmt(d.d) }));
  const totalLang = LANGS.reduce((a, x) => a + x.v, 0);
  const overrides: Partial<React.ComponentProps<typeof XAxis>> = { interval: 3 };
  return (
    <>
      <div className="chart-palette">{CHART_COLORS.map((col, i) => <span key={i} style={{ background: col }}>chart-{i + 1}</span>)}</div>
      <ChartCard title="Calls handled per day" subtitle="Last 30 days"
        summary={`AI agent calls rose from ${days[0].ai} to ${days[29].ai} a day.`}
        legend={[{ name: "AI agent", color: "var(--chart-1)" }, { name: "Human team", color: "var(--chart-2)" }]}
        table={{ columns: [{ key: "label", label: "Day" }, { key: "ai", label: "AI agent", align: "end", format: (v) => num(v) }, { key: "human", label: "Human team", align: "end", format: (v) => num(v) }], rows: days }}>
        <LineChart data={days} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="label" {...c.xAxis({ interval: 6 })} />
          <XAxis dataKey="label" {...axisProps(rtl, overrides)} />
          <YAxis {...c.yAxis({ tickFormatter: (v: number) => compact(v) })} />
          <Tooltip {...tooltipProps((v) => num(v))} />
          <Line type="monotone" dataKey="ai" name="AI agent" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="human" name="Human team" stroke="var(--chart-2)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ChartCard>

      <ChartCard title="Call minutes by channel" headingLevel={2} height={300} summary="Minutes grew on every channel."
        table={{ columns: [{ key: "w", label: "Week", format: (v) => num(v) }, { key: "phone", label: "Phone", align: "end", format: (v) => num(v) }], rows: WEEKS }}>
        <AreaChart data={WEEKS} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>{[1, 2, 3].map((i) => <linearGradient key={i} id={`ag${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={`var(--chart-${i})`} stopOpacity={0.5} /></linearGradient>)}</defs>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="w" {...c.xAxis({ tickFormatter: (v: number) => `W${v}` })} />
          <YAxis {...c.yAxis({ tickFormatter: (v: number) => compact(v) })} />
          <Tooltip {...tooltipProps((v) => num(v), (w) => `Week ${w}`)} />
          <Area type="monotone" stackId="1" dataKey="phone" name="Phone" stroke="var(--chart-1)" fill="url(#ag1)" strokeWidth={2} />
        </AreaChart>
      </ChartCard>

      <ChartCard title="Outcomes by month" height={240} summary="Booked rose."
        table={{ columns: [{ key: "m", label: "Month", format: (v) => c.monthFmt(v) }, { key: "booked", label: "Booked", align: "end", format: (v) => num(v) }], rows: MONTHS }}>
        <BarChart data={MONTHS} margin={{ top: 8, right: 8, bottom: 0, left: 8 }} barGap={2}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="m" {...c.xAxis({ tickFormatter: c.monthFmt })} />
          <YAxis {...c.yAxis({ tickFormatter: (v: number) => compact(v) })} />
          <Tooltip {...tooltipProps((v) => num(v), c.monthFmt)} />
          <Bar dataKey="booked" stackId="s" name="Booked" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ChartCard>

      <RankedBars items={INTENTS.map((x) => ({ label: L(x), value: x.v }))} format={(v) => num(v)} />
      <RankedBars items={[{ label: "A", value: 1 }]} format={String} color="var(--chart-2)" />

      <ChartCard title="Calls and booking rate" summary="Calls rose." legend={[{ name: "Calls", color: "var(--chart-3)" }, { name: "Booking rate", color: "var(--chart-2)", dashed: true }]}>
        <ComposedChart data={MONTHS.map((m, i) => ({ m: m.m, calls: m.booked + m.callback + m.noAnswer, rate: [0.33, 0.35, 0.36, 0.38, 0.4, 0.41][i] }))}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="m" {...c.xAxis({ tickFormatter: c.monthFmt })} />
          <YAxis yAxisId="calls" {...c.yAxis({ tickFormatter: (v: number) => compact(v) })} />
          <YAxis yAxisId="rate" {...c.yAxis({ orientation: rtl ? "left" : "right", tickFormatter: (v: number) => pct(v), domain: [0.2, 0.5] })} />
          <Tooltip {...tooltipProps((v, p) => (p.dataKey === "rate" ? pct(v) : num(v)), c.monthFmt)} />
          <Bar yAxisId="calls" dataKey="calls" name="Calls" fill="var(--chart-3)" radius={[4, 4, 0, 0]} maxBarSize={36} />
          <Line yAxisId="rate" type="monotone" dataKey="rate" name="Booking rate" stroke="var(--chart-2)" strokeWidth={3} strokeDasharray="6 4" dot={{ r: 4, fill: "var(--chart-2)" }} />
        </ComposedChart>
      </ChartCard>

      <ChartCard title="Calls by language" height={240} summary="58% Egyptian Arabic."
        legend={LANGS.map((x, i) => ({ name: `${L(x)} ${pct(x.v / totalLang)}`, color: CHART_COLORS[i] }))}
        table={{ columns: [{ key: "n", label: "Language" }, { key: "v", label: "Share", align: "end", format: (v) => pct(v / 100) }], rows: LANGS.map((x) => ({ n: L(x), v: x.v })) }}>
        <PieChart>
          <Tooltip {...tooltipProps((v) => pct(v / 100))} />
          <Pie data={LANGS.map((x) => ({ name: L(x), value: x.v }))} dataKey="value" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="var(--surface)" strokeWidth={2} startAngle={90} endAngle={rtl ? 450 : -270}>
            {LANGS.map((_, i) => <ChartCell key={i} fill={CHART_COLORS[i]} />)}
            {SENTIMENT.map((x, i) => <ChartCell key={i} fill={x.c} />)}
          </Pie>
          <text x="50%" y="47%" textAnchor="middle" className="chart-center-value">{num(12400)}</text>
        </PieChart>
      </ChartCard>

      <Sparkline data={days.map((x) => ({ v: x.ai }))} height={44} />
      <Sparkline data={days.map((x, j) => ({ v: x.ai * 0.05 + j }))} color="var(--chart-6)" area={false} />
      <Sparkline data={days} dataKey="ai" />

      <ChartCard title="Call length vs satisfaction" height={260} summary="Satisfaction peaks."
        table={{ columns: [{ key: "len", label: "Minutes", format: (v) => num(v) }, { key: "csat", label: "Sat", align: "end", format: (v) => num(v) }], rows: SCATTER }}>
        <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid {...gridProps} vertical />
          <XAxis type="number" dataKey="len" name="Minutes" {...c.xAxis({ tickFormatter: (v: number) => num(v), domain: [0, 10] })} />
          <YAxis type="number" dataKey="csat" name="Satisfaction" {...c.yAxis({ domain: [1, 5], tickFormatter: (v: number) => num(v) })} />
          <ZAxis type="number" dataKey="calls" range={[30, 400]} name="Calls" />
          <ReferenceLine y={4} stroke="var(--chart-2)" strokeDasharray="4 4" />
          <Tooltip {...tooltipProps((v) => num(v))} />
          <Scatter data={SCATTER} name="Scripts" fill="var(--chart-1)" fillOpacity={0.55} stroke="var(--chart-1)" />
        </ScatterChart>
      </ChartCard>

      <ChartCard title="Agent quality" height={280} summary="Taysir leads.">
        <RadarChart data={RADAR.map((x) => ({ n: L(x), a: x.a, b: x.b }))} outerRadius="72%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="n" tick={{ fill: "var(--ink-muted)", fontSize: 12, fontFamily: "var(--font-body)" }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip {...tooltipProps((v) => num(v))} />
          <Radar dataKey="a" name="Taysir" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.22} strokeWidth={2} />
        </RadarChart>
      </ChartCard>

      <Gauge value={0.72} target={0.8} label="Calls resolved without a human" sublabel="resolved by AI · goal 80%" />
      <Gauge value={0.5} label="Half" />

      <FunnelBars stages={FUNNEL.map((x) => ({ label: L(x), value: x.v }))} format={(v) => num(v)} pct={(v) => pct(v)} convLabel="of the previous stage" />

      <ChartCard title="Cost breakdown" height={240} summary="Model is largest."
        table={{ columns: [{ key: "n", label: "Item" }, { key: "v", label: "Cost", align: "end", format: (v) => money(v) }], rows: COSTS.map((x) => ({ n: L(x), v: x.v })) }}>
        <Treemap data={COSTS.map((x, i) => ({ name: L(x), size: x.v, fill: CHART_COLORS[i] }))} dataKey="size" stroke="var(--surface)" isAnimationActive={false}
          content={<TreeCell x={0} y={0} width={0} height={0} money={money} />} />
      </ChartCard>

      <Heatmap ariaLabel="Calls peak on weekdays."
        rows={[0, 1, 2, 3, 4, 5, 6].map((d) => new Intl.DateTimeFormat(c.locale, { weekday: "short" }).format(new Date(2026, 9, 25 + d)))}
        cols={Array.from({ length: 24 }, (_, h) => (h % 3 === 0 ? num(h) : ""))}
        values={HEAT} max={Math.max(...HEAT.flat())} format={(v) => num(v)}
        cellLabel={(r, _c, v) => `${r}: ${num(v)}`} />

      <ChartLegend items={[{ name: "x", color: "red" }]} />
      <ChartTooltip active payload={[{ name: "a", value: 1, color: "red", payload: { fill: "blue" } }]} label="L" valueFormat={(v) => v.toFixed(1)} labelFormat={(l) => String(l)} />
    </>
  );
}

/* ---------- maps ---------- */
const CALLS: Record<CountryCode, number> = { EGY: 48210, SAU: 21480, ARE: 17320, KWT: 6120 };
const CITIES = [{ id: "cai", lon: 31.24, lat: 30.04, en: "Cairo", ar: "القاهرة", live: 214 }];

export function Maps() {
  const countries = useMapCountries("EG");
  const [selected, setSelected] = useState("EGY");
  const [pov, setPov] = useState<"EG" | "default">("EG");
  const sel = countries.find((c) => c.id === selected);
  const markers: MapMarker[] = CITIES.map((c) => ({ id: c.id, lon: c.lon, lat: c.lat, r: 3 + Math.sqrt(c.live) / 3, live: true, label: `${c.en}: ${c.live} live calls` }));
  const trend = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ v: (CALLS[selected] ?? 0) / 30 * (0.8 + 0.4 * Math.abs(Math.sin(i))) })), [selected]);
  return (
    <>
      <WorldMap data={CALLS} valueLabel="Calls this month" format={(v) => v.toLocaleString()} selected={selected} onSelect={(id) => id && setSelected(id)} pov={pov}
        ariaLabel="World map of calls by country." />
      <WorldMap markers={markers} continent="mena" showContinents={false} showTableToggle={false} height={420} ariaLabel="Live calls" />
      <WorldMap steps={6} interactive={false} onContinentChange={(id) => console.log(id)} />
      <button onClick={() => setPov(pov === "EG" ? "default" : "EG")}>{sel?.name} {sel?.iso2 ?? "-"} {sel?.cont} {sel?.pop}</button>
      <Sparkline data={trend} height={44} />
      <span>{countryName({ iso2: "EG", en: "Egypt", ar: "مصر" }, "ar")} {CONTINENTS.map((c) => c.en).join()}</span>
    </>
  );
}

/* ---------- voice ---------- */
const DURATION = 46.4;
const TURNS: TranscriptTurn[] = [
  { id: "t1", speaker: "agent", start: 0.6, end: 4.4, latency: null, text: { en: "Hi Nadia, this is Taysir from Nile Clinics.", ar: "مرحبًا نادية" } },
  { id: "t2", speaker: "customer", start: 5.1, end: 7.4, text: { en: "Oh hi.", ar: "أهلًا." } },
  { id: "t3", speaker: "agent", start: 7.9, end: 11.6, latency: 510, text: "No problem." },
];
const EVENTS: TranscriptEvent[] = [
  { t: 14.4, kind: "tool", label: { en: "Tool: check_availability", ar: "أداة: check_availability" } },
  { t: 26.6, kind: "interrupt", label: { en: "Caller interrupted", ar: "قاطع المتصل" } },
  { t: 45.6, kind: "end", label: "Customer ended the call" },
];
const LOGS: CallLogEntry[] = [
  { t: 0, level: "checkpoint", msg: "Call started (web, eu-central-1)", clock: "15:53:19:404" },
  { t: 17.2, level: "warning", msg: "Slow tool response (2.7 s).", clock: "15:53:36:604" },
];
const COST: CostItem[] = [
  { label: { en: "Speech to text", ar: "تحويل الكلام إلى نص" }, cost: 0.0121, detail: { en: "Arabic + English, 0.77 min", ar: "عربي وإنجليزي" } },
  { label: "Truvar platform", cost: 0.0387 },
];
const LIVE_SCRIPT: LiveCallLine[] = [
  { speaker: "agent", dur: 3.2, latency: 640, text: { en: "Hi, this is Taysir from Nile Clinics. How can I help?", ar: "مرحبًا، معك تيسير" } },
  { speaker: "customer", dur: 2.6, text: { en: "I'd like to book a check-up.", ar: "أريد حجز فحص." } },
];
const VARS: WorkflowVariable[] = [
  { id: "first_name", label: { en: "First name", ar: "الاسم الأول" }, example: { en: "Nadia", ar: "نادية" } },
  { id: "company", label: "Company" },
];
const METADATA = { id: "2720e463", type: "webCall", language: ["ar-EG", "en"], metrics: { turns: 12 } };
const SNIPPETS: CodeTab[] = [
  { id: "curl", label: "cURL", lang: "bash", code: `curl https://api.truvar.ai/v1/calls/${METADATA.id}` },
  { id: "js", label: "JavaScript", lang: "js", code: "const call = await truvar.calls.get(id);" },
];

function Seeker() {
  const s = useCall();
  if (!s) return null;
  return <button onClick={() => { s.seek(s.time + 10); void s.play(); s.pause(); s.setRate(1.5); s.setSkip(true); s.setMute("agent", true); s.solo("customer"); s.download("mono", "x"); }}>{formatClock(s.time)} {s.peaks[0].length} {s.silences.length} {s.mute.agent ? "m" : ""}</button>;
}

export function Voice() {
  const recording = useMemo(() => synthCall(TURNS, DURATION), []);
  const waveEvents = EVENTS.map((e): WaveformEvent => ({ t: e.t, kind: e.kind, label: typeof e.label === "string" ? e.label : e.label.en }));
  const mono = mixToMono(recording.left, recording.right);
  const blob: Blob = encodeWav([mono], recording.sampleRate);
  const stereo: Blob = encodeWav([recording.left, recording.right]);
  const sil = findSilences(recording.left, recording.right, recording.sampleRate, { minSec: 1, threshold: 0.02 });
  void blob; void stereo; void sil;
  return (
    <>
      <CallSessionProvider recording={recording}>
        <CallPlayer events={waveEvents} filename="call-c1" side={<Transcript turns={TURNS} events={EVENTS} maxHeight={460} />} onEvent={(e) => console.log(e.t)} />
        <CallPlayer expandable={false} />
        <MiniPlayer />
        <StereoWaveform height={84} events={waveEvents} />
        <Seeker />
        <Transcript turns={TURNS} events={EVENTS} />
        <CallLogs logs={LOGS} maxHeight="50vh" />
        <CostBreakdown items={COST} minutes={DURATION / 60} currency="EGP" />
      </CallSessionProvider>
      <JsonView value={METADATA} title="call.json" />
      <CodeBlock tabs={SNIPPETS} />
      <CopyButton text="abc" size="sm" label="Copy call ID" onCopied={(ok) => ok || console.warn("no")} />
      <LiveCall agentName="Taysir" script={LIVE_SCRIPT} onStart={() => {}} onEnd={() => {}} />
      <WorkflowBuilder vars={VARS} />
      <WorkflowBuilder vars={VARS} height="80vh" />
    </>
  );
}
