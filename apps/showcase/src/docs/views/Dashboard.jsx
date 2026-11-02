"use client";
// Business owner's dashboard: what the AI agents saved, what they earned, and what needs a decision today.
import { useState } from "react";
import {
  ChartCard, useChartLocale, axisProps, gridProps, tooltipProps, Sparkline, Gauge, FunnelBars, RankedBars,
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ChartTooltipBase as Tooltip,
  ProgressBar, Badge, Button, SegmentedControl, Avatar, toast, Heatmap, WorldMap,
} from "../../ds.js";
import * as Icon from "@truvar-ai/design-system/icons";
import { ViewHeader } from "../ui.jsx";
import { dateFormat } from "@truvar-ai/design-system";

/* ---------- sample data (deterministic) ---------- */
const rnd = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const r = rnd(5);
const SPARK = (base, step) => Array.from({ length: 14 }, (_, i) => ({ v: Math.round(base + i * step + r() * base * 0.12) }));
// Per period: how much bigger than a month
const SCALE = { month: 1, quarter: 3, year: 12 };
// Money the agents saved (staff hours they took on) against what Truvar cost, per month
const MONTHS = [5, 6, 7, 8, 9, 10].map((m, i) => ({ m, saved: 96000 + i * 18000 + Math.round(r() * 9000), spent: 21000 + i * 1200 + Math.round(r() * 2000) }));
const FUNNEL = [
  { en: "Calls answered", ar: "مكالمات تم الرد عليها", v: 12400 }, { en: "Qualified leads", ar: "عملاء مؤهلون", v: 7300 },
  { en: "Meetings booked", ar: "اجتماعات محجوزة", v: 3900 }, { en: "Proposals sent", ar: "عروض مُرسلة", v: 2100 }, { en: "Deals won", ar: "صفقات مكسوبة", v: 860 },
];
// Calls by weekday (Sunday first) and hour: the shape of a working week in Egypt and the Gulf
const r2 = rnd(19);
const HEAT = Array.from({ length: 7 }, (_, d) => Array.from({ length: 24 }, (_, h) => {
  const work = h >= 9 && h <= 22 ? 1 : 0.12;
  const peak = Math.exp(-((h - 13) ** 2) / 14) + 0.75 * Math.exp(-((h - 20) ** 2) / 5);
  const day = d === 5 ? 0.35 : d === 6 ? 0.7 : 1; // Friday quiet, Saturday picking up
  return Math.round((30 + 240 * peak * work) * day + r2() * 20);
}));
// Revenue influenced by country (ADM0_A3), this month in EGP
const REVENUE = { EGY: 2140000, SAU: 980000, ARE: 760000, KWT: 210000, QAT: 190000, JOR: 120000, MAR: 140000, OMN: 90000, BHR: 70000, GBR: 160000, USA: 110000, DEU: 60000, TUR: 50000 };
const CITY = [
  { id: "cai", lon: 31.24, lat: 30.04, en: "Cairo", ar: "القاهرة", n: 412 }, { id: "alx", lon: 29.92, lat: 31.2, en: "Alexandria", ar: "الإسكندرية", n: 138 },
  { id: "ruh", lon: 46.68, lat: 24.71, en: "Riyadh", ar: "الرياض", n: 196 }, { id: "jed", lon: 39.19, lat: 21.49, en: "Jeddah", ar: "جدة", n: 88 },
  { id: "dxb", lon: 55.27, lat: 25.2, en: "Dubai", ar: "دبي", n: 174 }, { id: "doh", lon: 51.53, lat: 25.29, en: "Doha", ar: "الدوحة", n: 52 },
  { id: "kwi", lon: 47.98, lat: 29.37, en: "Kuwait City", ar: "مدينة الكويت", n: 61 }, { id: "amm", lon: 35.93, lat: 31.95, en: "Amman", ar: "عمّان", n: 40 },
  { id: "cas", lon: -7.59, lat: 33.57, en: "Casablanca", ar: "الدار البيضاء", n: 47 },
];
const COUNTRY_NAMES = { EGY: ["Egypt", "مصر"], SAU: ["Saudi Arabia", "السعودية"], ARE: ["UAE", "الإمارات"], KWT: ["Kuwait", "الكويت"], QAT: ["Qatar", "قطر"], GBR: ["United Kingdom", "المملكة المتحدة"], MAR: ["Morocco", "المغرب"] };
const HOURS = [
  { en: "Answering questions", ar: "الرد على الأسئلة", v: 128 }, { en: "Booking appointments", ar: "حجز المواعيد", v: 84 },
  { en: "Qualifying leads", ar: "تأهيل العملاء", v: 61 }, { en: "Follow-up calls", ar: "مكالمات المتابعة", v: 39 },
];

export function Dashboard() {
  const loc = useChartLocale();
  const { num, compact, pct, money, rtl, lang } = loc;
  const tr = (en, ar) => (lang === "ar" ? ar : en);
  const L = (o) => (lang === "ar" ? o.ar : o.en);
  const [period, setPeriod] = useState("month");
  const k = SCALE[period];
  const monthFmt = (m) => dateFormat(loc.locale, { month: "short" }).format(new Date(2026, m - 1, 1));
  const xAxis = (extra) => axisProps(rtl, { reversed: rtl, ...extra });
  const yAxis = (extra) => axisProps(rtl, { orientation: rtl ? "right" : "left", width: 56, tickMargin: 8, axisLine: false, ...extra });

  const hours = 312 * k, hourly = 600;           // EGP an hour of staff time
  const saved = hours * hourly, spent = 29000 * k;
  const roi = saved / spent;
  const KPIS = [
    { icon: <Icon.Clock />, label: tr("Time saved", "الوقت الموفَّر"), value: tr(`${num(hours)} h`, `${num(hours)} ساعة`),
      delta: pct(0.18), note: tr(`≈ ${money(saved)} in staff time`, `≈ ${money(saved)} من وقت الموظفين`), spark: SPARK(20, 1.4), color: "var(--chart-1)" },
    { icon: <Icon.Zap />, label: tr("Return on investment", "العائد على الاستثمار"), value: `${num(+roi.toFixed(1))}×`,
      delta: `${num(0.8)}×`, note: tr(`${money(saved)} saved for ${money(spent)} spent`, `وفّرت ${money(saved)} مقابل ${money(spent)}`), spark: SPARK(5, 0.12), color: "var(--chart-2)" },
    { icon: <Icon.TrendUp />, label: tr("Revenue from AI-booked deals", "إيرادات صفقات حجزها الذكاء الاصطناعي"), value: money(1600000 * k),
      delta: pct(0.24), note: tr(`${num(287 * k)} deals the AI booked`, `${num(287 * k)} صفقة حجزها الذكاء الاصطناعي`), spark: SPARK(100, 6), color: "var(--chart-4)" },
    { icon: <Icon.Phone />, label: tr("Calls handled", "المكالمات المُعالجة"), value: compact(12400 * k),
      delta: pct(0.09), note: tr("72% with no staff needed", "٧٢٪ دون الحاجة إلى موظف"), spark: SPARK(800, 22), color: "var(--chart-1)" },
  ];
  const ATTENTION = [
    { tone: "danger", badge: tr("At risk", "معرّضة للخسارة"), who: "Delta Freight", text: tr("EGP 1.25M deal: no reply for 6 days after the proposal.", "صفقة بقيمة ١٫٢٥ مليون ج.م.: لا رد منذ ٦ أيام بعد العرض."), action: tr("Call now", "اتصل الآن") },
    { tone: "warning", badge: tr("Unhappy", "غير راضٍ"), who: "Cairo Fintech", text: tr("2 negative calls this week about billing.", "مكالمتان سلبيتان هذا الأسبوع بخصوص الفواتير."), action: tr("Review calls", "راجع المكالمات") },
    { tone: "accent", badge: tr("Renewal", "تجديد"), who: "Nile Foods", text: tr("Contract renews in 14 days. Usage is up 40%: offer an upgrade.", "يتجدد العقد خلال ١٤ يومًا. الاستخدام ارتفع ٤٠٪: اعرض الترقية."), action: tr("Send offer", "أرسل العرض") },
  ];

  return (
    <>
      <ViewHeader viewId="dashboard" intro={tr(
        "Built entirely from the design system: stat cards, progress, charts, badges and buttons. Written for a business owner: what the AI agents saved, what they earned, and what needs your decision today.",
        "مبنية بالكامل من نظام التصميم: بطاقات الأرقام والتقدم والرسوم والشارات والأزرار. مكتوبة لصاحب العمل: ما وفّره وكلاء الذكاء الاصطناعي، وما حققوه، وما يحتاج قرارك اليوم.")} />

      <div className="dash-toolbar">
        <SegmentedControl aria-label={tr("Period", "الفترة")} value={period} onChange={setPeriod}
          options={[{ id: "month", label: tr("This month", "هذا الشهر") }, { id: "quarter", label: tr("Quarter", "الربع") }, { id: "year", label: tr("Year", "السنة") }]} />
        <Button variant="secondary" size="sm" onPress={() => toast({ tone: "success", title: tr("Report sent to your email", "أُرسل التقرير إلى بريدك") })}>
          <Icon.Download /><span className="ws-btn-label">{tr("Export report", "تصدير التقرير")}</span>
        </Button>
      </div>

      {/* KPIs: the four numbers an owner asks about first */}
      <section className="dash-kpis" aria-label={tr("Key numbers", "الأرقام الرئيسية")}>
        {KPIS.map((x) => (
          <article className="tv-stat dash-kpi" key={x.label}>
            <span className="dash-kpi-head"><span className="dash-kpi-icon" aria-hidden="true">{x.icon}</span><span className="tv-stat-label">{x.label}</span></span>
            <span className="tv-stat-value">{x.value}</span>
            <span className="tv-stat-delta is-good"><Icon.TrendUp />{x.delta} <span className="tv-desc">{tr("vs last period", "مقارنة بالفترة السابقة")}</span></span>
            <Sparkline data={x.spark} color={x.color} height={40} />
            <span className="tv-desc dash-kpi-note">{x.note}</span>
          </article>
        ))}
      </section>

      {/* The goal, full width */}
      <section className="tv-card dash-goal" aria-labelledby="dash-goal-title">
        <div className="dash-goal-head">
          <div>
            <h2 className="dash-h" id="dash-goal-title">{tr("Q4 revenue goal", "هدف إيرادات الربع الرابع")}</h2>
            <p className="tv-desc dash-goal-sub">{tr(`${money(4260000)} of ${money(6000000)} closed · 58 days left`, `تم إغلاق ${money(4260000)} من ${money(6000000)} · متبقٍ ٥٨ يومًا`)}</p>
          </div>
          <Badge tone="success" dot>{tr("9 days ahead of plan", "متقدم ٩ أيام عن الخطة")}</Badge>
        </div>
        <ProgressBar label={tr("Closed revenue", "الإيرادات المغلقة")} value={71} className="dash-goal-bar"
          valueLabel={pct(0.71)} />
        <div className="dash-goal-subs">
          <ProgressBar label={tr("Calls resolved without staff · goal 80%", "مكالمات حُلّت دون موظف · الهدف ٨٠٪")} value={72} valueLabel={pct(0.72)} />
          <ProgressBar label={tr("Meetings booked · goal 5,000", "اجتماعات محجوزة · الهدف ٥٬٠٠٠")} value={3900} maxValue={5000} valueLabel={`${num(3900)} / ${num(5000)}`} />
          <ProgressBar label={tr("Customer satisfaction · goal 4.5", "رضا العملاء · الهدف ٤٫٥")} value={4.6} maxValue={5} valueLabel={`${num(4.6)} / ${num(5)}`} />
        </div>
      </section>

      {/* Money in vs money out, and how much runs on its own */}
      <div className="dash-row dash-row--2-1">
        <ChartCard title={tr("Saved vs spent", "الموفَّر مقابل المُنفَق")} subtitle={tr("Staff time the agents took on, against what Truvar cost · May to October", "وقت الموظفين الذي تولّاه الوكلاء مقابل تكلفة Truvar · مايو إلى أكتوبر")}
          summary={tr("Savings grew every month while cost stayed almost flat, so each pound spent returns more.", "زاد التوفير كل شهر بينما بقيت التكلفة شبه ثابتة، فكل جنيه يُنفَق يعود بأكثر.")}
          legend={[{ name: tr("Saved", "الموفَّر"), color: "var(--chart-1)" }, { name: tr("Spent", "المُنفَق"), color: "var(--chart-2)" }]}
          table={{ columns: [{ key: "m", label: tr("Month", "الشهر"), format: monthFmt }, { key: "saved", label: tr("Saved", "الموفَّر"), align: "end", format: (v) => money(v) }, { key: "spent", label: tr("Spent", "المُنفَق"), align: "end", format: (v) => money(v) }], rows: MONTHS }}>
          <ComposedChart data={MONTHS} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="m" {...xAxis({ tickFormatter: monthFmt })} />
            <YAxis {...yAxis({ tickFormatter: (v) => compact(v) })} />
            <Tooltip {...tooltipProps((v) => money(v), monthFmt)} />
            <Bar dataKey="saved" name={tr("Saved", "الموفَّر")} fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={36} />
            <Line type="monotone" dataKey="spent" name={tr("Spent", "المُنفَق")} stroke="var(--chart-2)" strokeWidth={2.5} dot={{ r: 3 }} />
          </ComposedChart>
        </ChartCard>
        <div className="tv-chart-card dash-gauge">
          <h3 className="tv-chart-title">{tr("Handled start to finish by AI", "عولجت بالكامل بالذكاء الاصطناعي")}</h3>
          <p className="tv-desc" style={{ margin: 0 }}>{tr("Share of calls that needed no one from your team", "نسبة المكالمات التي لم تحتج أحدًا من فريقك")}</p>
          <Gauge value={0.72} target={0.8} label={tr("Resolved by AI", "حلها الذكاء الاصطناعي")} sublabel={tr("goal 80%", "الهدف ٨٠٪")} />
        </div>
      </div>

      {/* Where the pipeline comes from, and where the saved hours went */}
      <div className="dash-row">
        <div className="tv-chart-card">
          <h3 className="tv-chart-title">{tr("From call to closed deal", "من المكالمة إلى الصفقة")}</h3>
          <p className="tv-desc" style={{ margin: 0 }}>{tr("This month, every stage handled or booked by the agents", "هذا الشهر، كل مرحلة عالجها الوكلاء أو حجزوها")}</p>
          <FunnelBars stages={FUNNEL.map((x) => ({ label: L(x), value: x.v * k }))} format={(v) => num(v)} pct={(v) => pct(v)} convLabel={tr("of the previous stage", "من المرحلة السابقة")} />
        </div>
        <div className="tv-chart-card">
          <h3 className="tv-chart-title">{tr("Where the saved hours went", "أين ذهبت الساعات الموفَّرة")}</h3>
          <p className="tv-desc" style={{ margin: 0 }}>{tr("Work your team no longer does by hand", "عمل لم يعد فريقك يؤديه يدويًا")}</p>
          <RankedBars items={HOURS.map((x) => ({ label: L(x), value: x.v * k }))} format={(v) => tr(`${num(v)} h`, `${num(v)} ساعة`)} color="var(--chart-4)" />
        </div>
      </div>

      {/* When customers reach you: staff for the peaks, let the AI agent cover the rest */}
      <section className="tv-chart-card dash-heat" aria-labelledby="dash-heat-title">
        <div className="dash-goal-head">
          <div>
            <h3 className="tv-chart-title" id="dash-heat-title">{tr("Busiest hours", "أوقات الذروة")}</h3>
            <p className="tv-desc" style={{ margin: 0 }}>{tr("Calls and messages by day and hour, last 4 weeks", "المكالمات والرسائل حسب اليوم والساعة، آخر ٤ أسابيع")}</p>
          </div>
          <Badge tone="accent"><Icon.Sparkles />{tr("Tip: add one person 7–10 pm, Sunday to Thursday", "اقتراح: أضف شخصًا من ٧ إلى ١٠ مساءً، من الأحد إلى الخميس")}</Badge>
        </div>
        <Heatmap ariaLabel={tr("Busiest on weekdays around 1 pm and 8 pm; Friday is quiet.", "الذروة في أيام العمل نحو الواحدة ظهرًا والثامنة مساءً؛ والجمعة هادئة.")}
          rows={[0, 1, 2, 3, 4, 5, 6].map((d) => dateFormat(loc.locale, { weekday: "short" }).format(new Date(2026, 10, 1 + d)))}
          cols={Array.from({ length: 24 }, (_, h) => (h % 3 === 0 ? num(h) : ""))}
          values={HEAT.map((row) => row.map((v) => Math.round(v * k)))} max={Math.max(...HEAT.flat()) * k} format={(v) => num(v)}
          cellLabel={(row, _c, v) => `${row}: ${num(v)}`} />
      </section>

      {/* Where the money comes from */}
      <div className="dash-row dash-row--2-1">
        <div className="tv-chart-card dash-map">
          <h3 className="tv-chart-title">{tr("Where your customers are", "أين عملاؤك")}</h3>
          <p className="tv-desc" style={{ margin: 0 }}>{tr("Revenue from AI-booked deals by country. Darker means more.", "إيرادات الصفقات التي حجزها الذكاء الاصطناعي حسب الدولة. الأغمق يعني أكثر.")}</p>
          <WorldMap data={Object.fromEntries(Object.entries(REVENUE).map(([c, v]) => [c, v * k]))} valueLabel={tr("Revenue", "الإيرادات")} format={(v) => money(v)}
            continent="mena" showContinents={false} height={340}
            ariaLabel={tr("Map of revenue by country: Egypt first, then Saudi Arabia and the UAE.", "خريطة الإيرادات حسب الدولة: مصر أولًا، ثم السعودية والإمارات.")} />
        </div>
        <div className="tv-chart-card">
          <h3 className="tv-chart-title">{tr("Top countries", "أعلى الدول")}</h3>
          <p className="tv-desc" style={{ margin: 0 }}>{tr("Share of revenue", "حصة من الإيرادات")}</p>
          <RankedBars items={Object.entries(REVENUE).filter(([c]) => COUNTRY_NAMES[c]).sort((a, b) => b[1] - a[1]).map(([c, v]) => ({ label: COUNTRY_NAMES[c][lang === "ar" ? 1 : 0], value: v * k }))}
            format={(v) => money(v)} color="var(--chart-1)" />
        </div>
      </div>

      <div className="tv-chart-card dash-map">
        <div className="dash-goal-head">
          <div>
            <h3 className="tv-chart-title">{tr("Customers by city", "العملاء حسب المدينة")}</h3>
            <p className="tv-desc" style={{ margin: 0 }}>{tr("Active customers. Bigger means more.", "العملاء النشطون. الأكبر يعني أكثر.")}</p>
          </div>
          <span className="tv-desc">{tr(`${num(CITY.reduce((a, c) => a + c.n, 0))} customers in ${num(CITY.length)} cities`, `${num(CITY.reduce((a, c) => a + c.n, 0))} عميل في ${num(CITY.length)} مدن`)}</span>
        </div>
        <WorldMap markers={CITY.map((c) => ({ id: c.id, lon: c.lon, lat: c.lat, r: 3 + Math.sqrt(c.n) / 2.6, label: `${lang === "ar" ? c.ar : c.en}: ${num(c.n)}` }))}
          continent="mena" showContinents={false} showTableToggle={false} height={360}
          ariaLabel={tr("Customers by city: most in Cairo, then Riyadh and Dubai.", "العملاء حسب المدينة: الأكثر في القاهرة، ثم الرياض ودبي.")} />
      </div>

      {/* Decisions for today */}
      <section className="tv-card dash-attention" aria-labelledby="dash-att-title">
        <div className="dash-goal-head">
          <h2 className="dash-h" id="dash-att-title">{tr("Needs your attention", "يحتاج انتباهك")}</h2>
          <span className="tv-desc">{tr("3 items", "٣ عناصر")}</span>
        </div>
        <ul className="dash-att-list">
          {ATTENTION.map((a) => (
            <li className="dash-att-item" key={a.who}>
              <Avatar name={a.who} size={40} />
              <div className="dash-att-text">
                <span className="dash-att-who">{a.who} <Badge tone={a.tone}>{a.badge}</Badge></span>
                <span className="tv-desc">{a.text}</span>
              </div>
              <Button size="sm" variant="secondary" onPress={() => toast({ tone: "success", title: a.action, description: a.who })}>{a.action}</Button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

