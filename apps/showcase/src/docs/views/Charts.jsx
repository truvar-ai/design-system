import React from "react";
import {
  ChartCard, useChartLocale, axisProps, gridProps, tooltipProps, Sparkline, Gauge, Heatmap, CHART_COLORS,
  LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart, PieChart, Pie, ChartCell, ScatterChart, Scatter, ZAxis,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, FunnelChart, Funnel, LabelList, Treemap,
  XAxis, YAxis, CartesianGrid, ChartTooltipBase as Tooltip, ReferenceLine, StatTile, FunnelBars, RankedBars,
} from "../../ds.js";
import { useTr } from "../i18n.jsx";
import { Spec, ViewHeader } from "../ui.jsx";

/* ---------- deterministic sample data ---------- */
const rnd = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const r1 = rnd(7);
const DAYS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 8, 28 + i);
  const base = 420 + i * 9;
  return { d, ai: Math.round(base + r1() * 90 + (d.getDay() === 5 ? -160 : 0)), human: Math.round(180 + r1() * 50 - i * 2 + (d.getDay() === 5 ? -70 : 0)) };
});
const r2 = rnd(11);
const WEEKS = Array.from({ length: 12 }, (_, i) => ({ w: i + 1, phone: Math.round(5200 + i * 260 + r2() * 600), whatsapp: Math.round(2100 + i * 380 + r2() * 500), web: Math.round(900 + i * 120 + r2() * 300) }));
const MONTHS = [5, 6, 7, 8, 9, 10].map((m, i) => ({ m, booked: 820 + i * 140 + Math.round(r2() * 80), callback: 610 + i * 40 + Math.round(r2() * 60), noAnswer: 540 - i * 30 + Math.round(r2() * 60) }));
const INTENTS = [
  { k: "billing", en: "Billing question", ar: "استفسار عن الفاتورة", v: 3410 }, { k: "book", en: "Book an appointment", ar: "حجز موعد", v: 2980 },
  { k: "status", en: "Order status", ar: "حالة الطلب", v: 2310 }, { k: "cancel", en: "Cancel or change", ar: "إلغاء أو تعديل", v: 1490 },
  { k: "complaint", en: "Complaint", ar: "شكوى", v: 980 }, { k: "other", en: "Other", ar: "أخرى", v: 640 },
];
const LANGS = [{ en: "Egyptian Arabic", ar: "العربية المصرية", v: 58 }, { en: "Gulf Arabic", ar: "العربية الخليجية", v: 17 }, { en: "English", ar: "الإنجليزية", v: 19 }, { en: "French", ar: "الفرنسية", v: 6 }];
const SENTIMENT = [{ en: "Positive", ar: "إيجابي", v: 64, c: "var(--chart-4)" }, { en: "Neutral", ar: "محايد", v: 27, c: "var(--chart-3)" }, { en: "Negative", ar: "سلبي", v: 9, c: "var(--chart-6)" }];
const r3 = rnd(23);
const SCATTER = Array.from({ length: 40 }, () => { const len = 0.5 + r3() * 9.5; return { len: +len.toFixed(1), csat: +Math.min(5, Math.max(1.6, 4.7 - Math.abs(len - 3.5) * 0.25 + (r3() - 0.5) * 0.9)).toFixed(1), calls: Math.round(20 + r3() * 300) }; });
const RADAR = [
  { k: "acc", en: "Accuracy", ar: "الدقة", a: 92, b: 81 }, { k: "lat", en: "Speed", ar: "السرعة", a: 88, b: 70 }, { k: "tone", en: "Tone", ar: "النبرة", a: 79, b: 90 },
  { k: "res", en: "Resolution", ar: "حل المشكلة", a: 84, b: 76 }, { k: "comp", en: "Compliance", ar: "الالتزام", a: 97, b: 88 }, { k: "up", en: "Upsell", ar: "البيع الإضافي", a: 61, b: 72 },
];
const FUNNEL = [
  { en: "Calls answered", ar: "مكالمات تم الرد عليها", v: 12400 }, { en: "Qualified", ar: "مؤهلة", v: 7300 },
  { en: "Meeting booked", ar: "تم حجز اجتماع", v: 3900 }, { en: "Proposal sent", ar: "عرض مُرسل", v: 2100 }, { en: "Won", ar: "تم الفوز", v: 860 },
];
const COSTS = [
  { en: "Speech to text", ar: "تحويل الكلام إلى نص", v: 1840 }, { en: "AI model", ar: "نموذج الذكاء الاصطناعي", v: 4120 },
  { en: "Text to speech", ar: "تحويل النص إلى كلام", v: 2630 }, { en: "Telephony", ar: "الاتصالات", v: 1510 }, { en: "Platform", ar: "المنصة", v: 2260 },
];
const r4 = rnd(31);
const HEAT = Array.from({ length: 7 }, (_, d) => Array.from({ length: 24 }, (_, h) => {
  const work = h >= 9 && h <= 21 ? 1 : 0.15; const peak = Math.exp(-((h - 13) ** 2) / 18) + 0.6 * Math.exp(-((h - 19) ** 2) / 6);
  const weekend = d === 5 ? 0.45 : d === 6 ? 0.8 : 1;
  return Math.round((40 + 260 * peak * work) * weekend + r4() * 25);
}));

/* ---------- helpers ---------- */
function useC() {
  const tr = useTr();
  const loc = useChartLocale();
  const L = (o) => (loc.lang === "ar" ? o.ar : o.en);
  const dayFmt = (d) => new Intl.DateTimeFormat(loc.locale, { day: "numeric", month: "short" }).format(d);
  const monthFmt = (m) => new Intl.DateTimeFormat(loc.locale, { month: "short" }).format(new Date(2026, m - 1, 1));
  // In Arabic, time runs right to left and the value axis sits on the right.
  const xAxis = (extra) => axisProps(loc.rtl, { reversed: loc.rtl, ...extra });
  const yAxis = (extra) => axisProps(loc.rtl, { orientation: loc.rtl ? "right" : "left", width: 52, tickMargin: 8, axisLine: false, ...extra });
  return { tr, ...loc, L, dayFmt, monthFmt, xAxis, yAxis };
}

export function Charts() {
  const c = useC();
  const { tr, L, num, compact, pct, money, rtl } = c;
  const days = DAYS.map((d) => ({ ...d, label: c.dayFmt(d.d) }));
  const totalLang = LANGS.reduce((a, x) => a + x.v, 0);

  return (
    <>
      <ViewHeader viewId="charts" intro={tr(
        "Every chart uses the Truvar palette, formats numbers for the reader's language, flips its time axis in Arabic, and has a Table view with the same data for screen readers and for copying.",
        "كل رسم يستخدم ألوان Truvar، وينسق الأرقام حسب لغة القارئ، ويعكس محور الوقت في العربية، ويحتوي على عرض جدول بنفس البيانات لقارئات الشاشة وللنسخ.")} />

      <Spec id="chart-palette" name={tr("Palette", "الألوان")} primitive="--chart-1 … --chart-6"
        note={tr("Navy and gold lead. Dark theme lightens navy so it stays visible. Red is kept for negative values only.", "الكحلي والذهبي في المقدمة. في الوضع الداكن يُفتّح الكحلي ليبقى ظاهرًا. والأحمر للقيم السلبية فقط.")}>
        <div className="chart-palette">{CHART_COLORS.map((col, i) => <span key={i} className="chart-swatch"><i style={{ background: col }} /><code dir="ltr">chart-{i + 1}</code></span>)}</div>
      </Spec>

      <Spec id="line-chart" name={tr("Line chart", "رسم خطي")} primitive="LineChart" wide note={tr("Trends over time. Two series at most per chart keeps it readable.", "للاتجاهات عبر الزمن. سلسلتان كحد أقصى لكل رسم تُبقيه واضحًا.")}>
        <ChartCard title={tr("Calls handled per day", "المكالمات اليومية")} subtitle={tr("Last 30 days", "آخر ٣٠ يومًا")}
          summary={tr(`AI agent calls rose from ${days[0].ai} to ${days[29].ai} a day; the human team handled about ${days[29].human}.`, `ارتفعت مكالمات الوكيل الذكي من ${num(days[0].ai)} إلى ${num(days[29].ai)} يوميًا، وتعامل الفريق البشري مع نحو ${num(days[29].human)}.`)}
          legend={[{ name: tr("AI agent", "الوكيل الذكي"), color: "var(--chart-1)" }, { name: tr("Human team", "الفريق البشري"), color: "var(--chart-2)" }]}
          table={{ columns: [{ key: "label", label: tr("Day", "اليوم") }, { key: "ai", label: tr("AI agent", "الوكيل الذكي"), align: "end", format: (v) => num(v) }, { key: "human", label: tr("Human team", "الفريق البشري"), align: "end", format: (v) => num(v) }], rows: days }}>
          <LineChart data={days} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...c.xAxis({ interval: 6 })} />
            <YAxis {...c.yAxis({ tickFormatter: (v) => compact(v) })} />
            <Tooltip {...tooltipProps((v) => num(v))} />
            <Line type="monotone" dataKey="ai" name={tr("AI agent", "الوكيل الذكي")} stroke="var(--chart-1)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="human" name={tr("Human team", "الفريق البشري")} stroke="var(--chart-2)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ChartCard>
      </Spec>

      <Spec id="area-chart" name={tr("Stacked area", "مساحات متراكمة")} primitive="AreaChart" wide note={tr("Parts of a growing total.", "أجزاء من إجمالي متزايد.")}>
        <ChartCard title={tr("Call minutes by channel", "دقائق المكالمات حسب القناة")} subtitle={tr("Last 12 weeks", "آخر ١٢ أسبوعًا")}
          summary={tr("Minutes grew on every channel; WhatsApp grew fastest.", "زادت الدقائق في كل القنوات، وكانت واتساب الأسرع نموًا.")}
          legend={[{ name: tr("Phone", "الهاتف"), color: "var(--chart-1)" }, { name: "WhatsApp", color: "var(--chart-2)" }, { name: tr("Web widget", "أداة الموقع"), color: "var(--chart-3)" }]}
          table={{ columns: [{ key: "w", label: tr("Week", "الأسبوع"), format: (v) => num(v) }, { key: "phone", label: tr("Phone", "الهاتف"), align: "end", format: (v) => num(v) }, { key: "whatsapp", label: "WhatsApp", align: "end", format: (v) => num(v) }, { key: "web", label: tr("Web widget", "أداة الموقع"), align: "end", format: (v) => num(v) }], rows: WEEKS }}>
          <AreaChart data={WEEKS} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <defs>{[1, 2, 3].map((i) => <linearGradient key={i} id={`ag${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={`var(--chart-${i})`} stopOpacity={0.5} /><stop offset="100%" stopColor={`var(--chart-${i})`} stopOpacity={0.08} /></linearGradient>)}</defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="w" {...c.xAxis({ tickFormatter: (v) => tr(`W${v}`, `أ${num(v)}`) })} />
            <YAxis {...c.yAxis({ tickFormatter: (v) => compact(v) })} />
            <Tooltip {...tooltipProps((v) => num(v), (w) => tr(`Week ${w}`, `الأسبوع ${num(w)}`))} />
            <Area type="monotone" stackId="1" dataKey="phone" name={tr("Phone", "الهاتف")} stroke="var(--chart-1)" fill="url(#ag1)" strokeWidth={2} />
            <Area type="monotone" stackId="1" dataKey="whatsapp" name="WhatsApp" stroke="var(--chart-2)" fill="url(#ag2)" strokeWidth={2} />
            <Area type="monotone" stackId="1" dataKey="web" name={tr("Web widget", "أداة الموقع")} stroke="var(--chart-3)" fill="url(#ag3)" strokeWidth={2} />
          </AreaChart>
        </ChartCard>
      </Spec>

      <Spec id="bar-charts" name={tr("Bar charts", "الأعمدة")} primitive="BarChart" wide note={tr("Grouped bars compare categories side by side; stacked bars show the mix inside each total.", "الأعمدة المجمعة تقارن الفئات جنبًا إلى جنب، والمتراكمة تُظهر التركيب داخل كل إجمالي.")}>
        <div className="chart-grid">
          {[["grouped", tr("Outcomes by month", "النتائج حسب الشهر"), undefined], ["stacked", tr("Outcome mix by month", "تركيب النتائج حسب الشهر"), "s"]].map(([k, title, stack]) => (
            <ChartCard key={k} title={title} subtitle={tr("May to October", "مايو إلى أكتوبر")} height={240}
              summary={tr("Booked meetings rose every month while unanswered calls fell.", "زادت الاجتماعات المحجوزة كل شهر بينما قلّت المكالمات التي لم يُرد عليها.")}
              legend={[{ name: tr("Booked", "محجوز"), color: "var(--chart-1)" }, { name: tr("Call back", "معاودة الاتصال"), color: "var(--chart-2)" }, { name: tr("No answer", "لم يرد"), color: "var(--chart-3)" }]}
              table={{ columns: [{ key: "m", label: tr("Month", "الشهر"), format: (v) => c.monthFmt(v) }, { key: "booked", label: tr("Booked", "محجوز"), align: "end", format: (v) => num(v) }, { key: "callback", label: tr("Call back", "معاودة الاتصال"), align: "end", format: (v) => num(v) }, { key: "noAnswer", label: tr("No answer", "لم يرد"), align: "end", format: (v) => num(v) }], rows: MONTHS }}>
              <BarChart data={MONTHS} margin={{ top: 8, right: 8, bottom: 0, left: 8 }} barGap={2}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="m" {...c.xAxis({ tickFormatter: c.monthFmt })} />
                <YAxis {...c.yAxis({ tickFormatter: (v) => compact(v) })} />
                <Tooltip {...tooltipProps((v) => num(v), c.monthFmt)} />
                <Bar dataKey="booked" stackId={stack} name={tr("Booked", "محجوز")} fill="var(--chart-1)" radius={stack ? 0 : [4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="callback" stackId={stack} name={tr("Call back", "معاودة الاتصال")} fill="var(--chart-2)" radius={stack ? 0 : [4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="noAnswer" stackId={stack} name={tr("No answer", "لم يرد")} fill="var(--chart-3)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ChartCard>
          ))}
        </div>
      </Spec>

      <Spec id="ranked-bars" name={tr("Ranked bars", "أعمدة مرتبة")} primitive="RankedBars (HTML)" wide note={tr("Horizontal bars for long labels, sorted largest first. Built as a list, so labels never collide with bars and it mirrors in Arabic.", "أعمدة أفقية للتسميات الطويلة، مرتبة من الأكبر. مبنية كقائمة فلا تتداخل التسميات مع الأعمدة وتنعكس في العربية.")}>
        <div className="tv-chart-card">
          <h4 className="tv-chart-title">{tr("Why customers call", "لماذا يتصل العملاء")}</h4>
          <p className="tv-desc" style={{ margin: 0 }}>{tr("Top intents this month", "أهم الأسباب هذا الشهر")}</p>
          <RankedBars items={INTENTS.map((x) => ({ label: L(x), value: x.v }))} format={(v) => num(v)} />
        </div>
      </Spec>

      <Spec id="combo-chart" name={tr("Bars with a line", "أعمدة مع خط")} primitive="ComposedChart" wide note={tr("Volume as bars on one axis, a rate as a line on the other. Each axis is labelled so the two scales aren't confused.", "الحجم كأعمدة على محور، والمعدل كخط على المحور الآخر، مع تسمية كل محور حتى لا يختلط المقياسان.")}>
        <ChartCard title={tr("Calls and booking rate", "المكالمات ومعدل الحجز")} height={260}
          summary={tr("Calls rose each month and the booking rate climbed from 33% to 41%.", "زادت المكالمات كل شهر وارتفع معدل الحجز من ٣٣٪ إلى ٤١٪.")}
          legend={[{ name: tr("Calls", "المكالمات"), color: "var(--chart-3)" }, { name: tr("Booking rate", "معدل الحجز"), color: "var(--chart-2)", dashed: true }]}
          table={{ columns: [{ key: "m", label: tr("Month", "الشهر"), format: (v) => c.monthFmt(v) }, { key: "calls", label: tr("Calls", "المكالمات"), align: "end", format: (v) => num(v) }, { key: "rate", label: tr("Booking rate", "معدل الحجز"), align: "end", format: (v) => pct(v) }],
            rows: MONTHS.map((m, i) => ({ m: m.m, calls: m.booked + m.callback + m.noAnswer, rate: [0.33, 0.35, 0.36, 0.38, 0.4, 0.41][i] })) }}>
          <ComposedChart data={MONTHS.map((m, i) => ({ m: m.m, calls: m.booked + m.callback + m.noAnswer, rate: [0.33, 0.35, 0.36, 0.38, 0.4, 0.41][i] }))} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="m" {...c.xAxis({ tickFormatter: c.monthFmt })} />
            <YAxis yAxisId="calls" {...c.yAxis({ tickFormatter: (v) => compact(v) })} />
            <YAxis yAxisId="rate" {...c.yAxis({ orientation: rtl ? "left" : "right", tickFormatter: (v) => pct(v), domain: [0.2, 0.5] })} />
            <Tooltip {...tooltipProps((v, p) => (p.dataKey === "rate" ? pct(v) : num(v)), c.monthFmt)} />
            <Bar yAxisId="calls" dataKey="calls" name={tr("Calls", "المكالمات")} fill="var(--chart-3)" radius={[4, 4, 0, 0]} maxBarSize={36} />
            <Line yAxisId="rate" type="monotone" dataKey="rate" name={tr("Booking rate", "معدل الحجز")} stroke="var(--chart-2)" strokeWidth={3} strokeDasharray="6 4" dot={{ r: 4, fill: "var(--chart-2)" }} />
          </ComposedChart>
        </ChartCard>
      </Spec>

      <Spec id="pie-donut" name={tr("Donut and pie", "الحلقة والدائرة")} primitive="PieChart" wide note={tr("For parts of one whole, with five slices or fewer. The donut's centre carries the total.", "لأجزاء كلٍّ واحد، بخمسة أجزاء أو أقل. مركز الحلقة يحمل الإجمالي.")}>
        <div className="chart-grid">
          <ChartCard title={tr("Calls by language", "المكالمات حسب اللغة")} height={240}
            summary={tr("58% of calls were in Egyptian Arabic.", "كانت ٥٨٪ من المكالمات بالعربية المصرية.")}
            legend={LANGS.map((x, i) => ({ name: `${L(x)} ${pct(x.v / totalLang)}`, color: CHART_COLORS[i] }))}
            table={{ columns: [{ key: "n", label: tr("Language", "اللغة") }, { key: "v", label: tr("Share", "النسبة"), align: "end", format: (v) => pct(v / 100) }], rows: LANGS.map((x) => ({ n: L(x), v: x.v })) }}>
            <PieChart>
              <Tooltip {...tooltipProps((v) => pct(v / 100))} />
              <Pie data={LANGS.map((x) => ({ name: L(x), value: x.v }))} dataKey="value" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="var(--surface)" strokeWidth={2} startAngle={90} endAngle={rtl ? 450 : -270}>
                {LANGS.map((_, i) => <ChartCell key={i} fill={CHART_COLORS[i]} />)}
              </Pie>
              <text x="50%" y="47%" textAnchor="middle" className="chart-center-value">{num(12400)}</text>
              <text x="50%" y="58%" textAnchor="middle" className="chart-center-label">{tr("calls", "مكالمة")}</text>
            </PieChart>
          </ChartCard>
          <ChartCard title={tr("Caller sentiment", "انطباع المتصلين")} height={240}
            summary={tr("64% positive, 27% neutral, 9% negative.", "٦٤٪ إيجابي، ٢٧٪ محايد، ٩٪ سلبي.")}
            legend={SENTIMENT.map((x) => ({ name: `${L(x)} ${pct(x.v / 100)}`, color: x.c }))}
            table={{ columns: [{ key: "n", label: tr("Sentiment", "الانطباع") }, { key: "v", label: tr("Share", "النسبة"), align: "end", format: (v) => pct(v / 100) }], rows: SENTIMENT.map((x) => ({ n: L(x), v: x.v })) }}>
            <PieChart>
              <Tooltip {...tooltipProps((v) => pct(v / 100))} />
              <Pie data={SENTIMENT.map((x) => ({ name: L(x), value: x.v }))} dataKey="value" outerRadius="92%" stroke="var(--surface)" strokeWidth={2} startAngle={90} endAngle={rtl ? 450 : -270}>
                {SENTIMENT.map((x, i) => <ChartCell key={i} fill={x.c} />)}
              </Pie>
            </PieChart>
          </ChartCard>
        </div>
      </Spec>

      <Spec id="sparklines" name={tr("Sparklines", "خطوط مصغّرة")} primitive="Sparkline + StatTile" wide note={tr("Tiny trends inside stat tiles. Decorative: the number and the change carry the meaning.", "اتجاهات صغيرة داخل مربعات الإحصاءات. زخرفية، والمعنى يحمله الرقم ونسبة التغير.")}>
        <div className="stat-grid">
          {[["Calls today", "مكالمات اليوم", 1284, "var(--chart-1)", 0.14, true], ["Avg. handling time", "متوسط مدة المكالمة", "3:12", "var(--chart-2)", -0.08, true], ["Escalations", "التحويلات لموظف", 41, "var(--chart-6)", 0.22, false]].map(([en, ar, v, col, d, good], i) => (
            <div key={i} className="spark-tile">
              <StatTile label={tr(en, ar)} value={typeof v === "number" ? num(v) : <span dir="ltr">{v}</span>} trend={d > 0 ? "up" : "down"} good={good} delta={pct(Math.abs(d))} deltaLabel={tr("vs last week", "عن الأسبوع الماضي")} />
              <Sparkline data={days.map((x, j) => ({ v: x.ai * (i === 2 ? 0.05 : 1) + (i === 1 ? -j * 4 : 0) }))} color={col} />
            </div>
          ))}
        </div>
      </Spec>

      <Spec id="scatter-chart" name={tr("Scatter and bubble", "تشتت وفقاعات")} primitive="ScatterChart + ZAxis" wide note={tr("Relationships between two measures; bubble size adds a third.", "العلاقة بين مقياسين، وحجم الفقاعة يضيف ثالثًا.")}>
        <ChartCard title={tr("Call length vs satisfaction", "مدة المكالمة مقابل الرضا")} subtitle={tr("Each bubble is an agent script; size is number of calls", "كل فقاعة نص وكيل، والحجم عدد المكالمات")} height={260}
          summary={tr("Satisfaction peaks for calls of about three to four minutes.", "يبلغ الرضا ذروته في المكالمات التي تستغرق ثلاث إلى أربع دقائق تقريبًا.")}
          table={{ columns: [{ key: "len", label: tr("Minutes", "الدقائق"), format: (v) => num(v) }, { key: "csat", label: tr("Satisfaction (1–5)", "الرضا (١–٥)"), align: "end", format: (v) => num(v) }, { key: "calls", label: tr("Calls", "المكالمات"), align: "end", format: (v) => num(v) }], rows: SCATTER }}>
          <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <CartesianGrid {...gridProps} vertical />
            <XAxis type="number" dataKey="len" name={tr("Minutes", "الدقائق")} {...c.xAxis({ tickFormatter: (v) => num(v), domain: [0, 10] })} />
            <YAxis type="number" dataKey="csat" name={tr("Satisfaction", "الرضا")} {...c.yAxis({ domain: [1, 5], tickFormatter: (v) => num(v) })} />
            <ZAxis type="number" dataKey="calls" range={[30, 400]} name={tr("Calls", "المكالمات")} />
            <ReferenceLine y={4} stroke="var(--chart-2)" strokeDasharray="4 4" />
            <Tooltip {...tooltipProps((v) => num(v))} />
            <Scatter data={SCATTER} name={tr("Scripts", "النصوص")} fill="var(--chart-1)" fillOpacity={0.55} stroke="var(--chart-1)" />
          </ScatterChart>
        </ChartCard>
      </Spec>

      <Spec id="radar-chart" name={tr("Radar", "رادار")} primitive="RadarChart" note={tr("Compares profiles across five to eight qualities.", "يقارن ملفين عبر خمس إلى ثماني صفات.")}>
        <ChartCard title={tr("Agent quality", "جودة الوكلاء")} height={280}
          summary={tr("Taysir leads on accuracy and compliance; Nour leads on tone and upsell.", "يتقدم تيسير في الدقة والالتزام، وتتقدم نور في النبرة والبيع الإضافي.")}
          legend={[{ name: tr("Taysir", "تيسير"), color: "var(--chart-1)" }, { name: tr("Nour", "نور"), color: "var(--chart-2)" }]}
          table={{ columns: [{ key: "n", label: tr("Quality", "الصفة") }, { key: "a", label: tr("Taysir", "تيسير"), align: "end", format: (v) => num(v) }, { key: "b", label: tr("Nour", "نور"), align: "end", format: (v) => num(v) }], rows: RADAR.map((x) => ({ n: L(x), a: x.a, b: x.b })) }}>
          <RadarChart data={RADAR.map((x) => ({ n: L(x), a: x.a, b: x.b }))} outerRadius="72%">
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="n" tick={{ fill: "var(--ink-muted)", fontSize: 12, fontFamily: "var(--font-body)" }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip {...tooltipProps((v) => num(v))} />
            <Radar dataKey="a" name={tr("Taysir", "تيسير")} stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.22} strokeWidth={2} />
            <Radar dataKey="b" name={tr("Nour", "نور")} stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.22} strokeWidth={2} />
          </RadarChart>
        </ChartCard>
      </Spec>

      <Spec id="gauge" name={tr("Gauge", "مؤشر")} primitive="SVG" note={tr("One number against a target. The gold tick marks the goal.", "رقم واحد مقابل هدف، والعلامة الذهبية تحدد الهدف.")}>
        <div className="chart-card-plain">
          <Gauge value={0.72} target={0.8} label={tr("Calls resolved without a human", "مكالمات حُلّت دون موظف")} sublabel={tr("resolved by AI · goal 80%", "حلها الذكاء الاصطناعي · الهدف ٨٠٪")} />
        </div>
      </Spec>

      <Spec id="funnel-chart" name={tr("Funnel", "قمع")} primitive="FunnelBars (HTML)" note={tr("Drop-off between ordered stages. Each step shows its count and the conversion from the step before.", "التسرب بين مراحل مرتبة. كل مرحلة تُظهر عددها ونسبة التحويل من المرحلة السابقة.")}>
        <div className="tv-chart-card">
          <h4 className="tv-chart-title">{tr("From call to customer", "من المكالمة إلى العميل")}</h4>
          <p className="tv-desc" style={{ margin: 0 }}>{tr("12,400 answered calls led to 860 won deals, 7% overall.", "أدت ١٢٬٤٠٠ مكالمة إلى ٨٦٠ صفقة ناجحة، بنسبة ٧٪ إجمالًا.")}</p>
          <div className="tv-funnel-head" aria-hidden="true"><span>{tr("Stage", "المرحلة")}</span><span /><span>{tr("Count", "العدد")}</span><span>{tr("Step", "التحويل")}</span></div>
          <FunnelBars stages={FUNNEL.map((x) => ({ label: L(x), value: x.v }))} format={(v) => num(v)} pct={(v) => pct(v)} convLabel={tr("of the previous stage", "من المرحلة السابقة")} />
        </div>
      </Spec>

      <Spec id="treemap-chart" name={tr("Treemap", "خريطة شجرية")} primitive="Treemap" note={tr("Sizes of many parts at once, such as where the money goes.", "أحجام أجزاء كثيرة معًا، مثل أين يُنفق المال.")}>
        <ChartCard title={tr("Cost breakdown", "تفصيل التكلفة")} subtitle={tr("This month", "هذا الشهر")} height={240}
          summary={tr("The AI model is the largest cost at 33%.", "نموذج الذكاء الاصطناعي هو أكبر تكلفة بنسبة ٣٣٪.")}
          table={{ columns: [{ key: "n", label: tr("Item", "البند") }, { key: "v", label: tr("Cost", "التكلفة"), align: "end", format: (v) => money(v) }], rows: COSTS.map((x) => ({ n: L(x), v: x.v })) }}>
          <Treemap data={COSTS.map((x, i) => ({ name: L(x), size: x.v, fill: CHART_COLORS[i], ink: `var(--chart-ink-${i + 1})` }))} dataKey="size" stroke="var(--surface)" isAnimationActive={false}
            content={<TreeCell money={money} />} />
        </ChartCard>
      </Spec>

      <Spec id="heatmap" name={tr("Heatmap", "خريطة حرارية")} primitive="CSS grid" wide note={tr("Two dimensions of time at once. Hover a cell for its exact value; the scale runs from light to dark.", "بُعدان للوقت معًا. مرّر المؤشر على خلية لترى قيمتها، والمقياس يتدرج من الفاتح إلى الداكن.")}>
        <div className="tv-chart-card">
          <h4 className="tv-chart-title">{tr("When customers call", "متى يتصل العملاء")}</h4>
          <Heatmap ariaLabel={tr("Calls peak on weekdays around 1 pm and 7 pm.", "تبلغ المكالمات ذروتها في أيام العمل نحو الواحدة ظهرًا والسابعة مساءً.")}
            rows={[0, 1, 2, 3, 4, 5, 6].map((d) => new Intl.DateTimeFormat(c.locale, { weekday: "short" }).format(new Date(2026, 9, 25 + d)))}
            cols={Array.from({ length: 24 }, (_, h) => (h % 3 === 0 ? num(h) : ""))}
            values={HEAT} max={Math.max(...HEAT.flat())} format={(v) => num(v)}
            cellLabel={(r, _c, v) => `${r}: ${num(v)}`} />
          <div className="tv-heatmap-scale"><span>{tr("Fewer", "أقل")}</span><i /><span>{tr("More calls", "مكالمات أكثر")}</span></div>
        </div>
      </Spec>
    </>
  );
}

function TreeCell(props) {
  const { x, y, width, height, name, size, fill, index, depth, money } = props;
  if (width <= 0 || height <= 0 || depth === 0) return null;
  const ink = String(fill).replace("--chart-", "--chart-ink-"); // label colour paired with the tile colour
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={6} fill={fill} stroke="var(--surface)" strokeWidth={3} />
      {width > 70 && height > 38 && (
        <>
          <text x={x + 10} y={y + 22} className="chart-tree-name" fill={ink} stroke="none">{name}</text>
          <text x={x + 10} y={y + 40} className="chart-tree-value" fill={ink} stroke="none">{money(size)}</text>
        </>
      )}
    </g>
  );
}
