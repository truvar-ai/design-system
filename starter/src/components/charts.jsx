// @truvar/ui charts: Recharts (MIT) styled with Truvar tokens.
// Every chart sits in a ChartCard with a summary for screen readers and a "Table" view of the same data.
import React, { useState, useId } from "react";
import * as RAC from "react-aria-components";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart, PieChart, Pie, Cell as RCell,
  ScatterChart, Scatter, ZAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, FunnelChart, Funnel,
  LabelList, Treemap, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ReferenceLine,
} from "recharts";

const cx = (...c) => c.filter(Boolean).join(" ");
export const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)"];

export function useChartLocale() {
  const { locale, direction } = RAC.useLocale();
  const rtl = direction === "rtl";
  const nf = (o) => new Intl.NumberFormat(locale, o);
  return {
    locale, rtl, lang: locale.startsWith("ar") ? "ar" : "en",
    num: (v, o) => nf(o).format(v),
    compact: (v) => nf({ notation: "compact", maximumFractionDigits: 1 }).format(v),
    pct: (v, d = 0) => nf({ style: "percent", maximumFractionDigits: d }).format(v),
    money: (v) => nf({ style: "currency", currency: "EGP", notation: "compact", maximumFractionDigits: 1 }).format(v),
  };
}

const axisTick = { fill: "var(--ink-muted)", fontSize: 12, fontFamily: "var(--font-body)" };
export const axisProps = (rtl, extra = {}) => ({ tick: axisTick, tickLine: false, axisLine: { stroke: "var(--border)" }, ...extra });
export const gridProps = { stroke: "var(--border)", strokeDasharray: "0", vertical: false };

/* Tooltip in Truvar style */
export function ChartTooltip({ active, payload, label, valueFormat, labelFormat }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tv-chart-tip">
      {label != null && <p className="tv-chart-tip-label">{labelFormat ? labelFormat(label) : label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="tv-chart-tip-row">
          <span className="tv-chart-dot" style={{ background: p.color || p.payload?.fill }} />
          <span className="tv-chart-tip-name">{p.name}</span>
          <b>{valueFormat ? valueFormat(p.value, p) : p.value}</b>
        </p>
      ))}
    </div>
  );
}
export const tooltipProps = (valueFormat, labelFormat) => ({
  content: <ChartTooltip valueFormat={valueFormat} labelFormat={labelFormat} />,
  cursor: { fill: "color-mix(in srgb, var(--ink) 6%, transparent)", stroke: "var(--border-strong)", strokeWidth: 1 },
  wrapperStyle: { outline: "none" },
  isAnimationActive: false,
});

export function ChartLegend({ items }) {
  return (
    <ul className="tv-chart-legend">
      {items.map((it) => (
        <li key={it.name}><span className={cx("tv-chart-dot", it.dashed && "is-dashed")} style={{ background: it.color }} />{it.name}</li>
      ))}
    </ul>
  );
}

/* ChartCard: title, legend, chart/table toggle. `table` = { columns: [{key,label,format?,align?}], rows } */
export function ChartCard({ title, subtitle, summary, legend, table, height = 260, children, actions }) {
  const { lang } = useChartLocale();
  const [view, setView] = useState("chart");
  const id = useId();
  const t = lang === "ar" ? { chart: "رسم", table: "جدول", view: "طريقة العرض" } : { chart: "Chart", table: "Table", view: "View" };
  return (
    <figure className="tv-chart-card" aria-labelledby={id + "t"}>
      <header className="tv-chart-head">
        <div className="tv-chart-titles">
          <h4 id={id + "t"} className="tv-chart-title">{title}</h4>
          {subtitle && <p className="tv-desc">{subtitle}</p>}
        </div>
        <div className="tv-chart-actions">
          {actions}
          {table && (
            <RAC.ToggleButtonGroup aria-label={t.view} selectionMode="single" disallowEmptySelection selectedKeys={[view]}
              onSelectionChange={(k) => setView([...k][0])} className="tv-segmented tv-segmented--sm">
              {["chart", "table"].map((k) => (
                <RAC.ToggleButton key={k} id={k} className="tv-segment-btn">
                  <RAC.SelectionIndicator className="tv-segment-indicator" />
                  <span className="tv-segment-label">{t[k]}</span>
                </RAC.ToggleButton>
              ))}
            </RAC.ToggleButtonGroup>
          )}
        </div>
      </header>
      {legend && view === "chart" && <ChartLegend items={legend} />}
      {view === "chart" ? (
        <div className="tv-chart-body" role="img" aria-label={summary} style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
        </div>
      ) : (
        <div className="tv-table-scroll tv-chart-table" style={{ maxHeight: height + 40 }}>
          <table className="tv-table">
            <thead><tr>{table.columns.map((c) => <th key={c.key} className={cx("tv-th", c.align === "end" && "is-end")}><div className="tv-th-inner">{c.label}</div></th>)}</tr></thead>
            <tbody>{table.rows.map((r, i) => (
              <tr key={i} className="tv-tr">{table.columns.map((c) => <td key={c.key} className={cx("tv-td", c.align === "end" && "is-end")}>{c.format ? c.format(r[c.key], r) : r[c.key]}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <figcaption className="tv-sr">{summary}</figcaption>
    </figure>
  );
}

/* Sparkline for stat tiles */
export function Sparkline({ data, dataKey = "v", color = "var(--chart-1)", height = 36, area = true }) {
  const Chart = area ? AreaChart : LineChart;
  const id = useId().replace(/:/g, "");
  return (
    <div className="tv-spark" style={{ height }} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={"sg" + id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {area
            ? <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#sg${id})`} isAnimationActive={false} dot={false} />
            : <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}

/* Gauge: a half ring with a value, built in SVG (no chart library needed) */
export function Gauge({ value, label, sublabel, target }) {
  const { pct } = useChartLocale();
  const r = 80, c = Math.PI * r, v = Math.max(0, Math.min(1, value));
  const tAngle = target != null ? Math.PI * (1 - target) : null;
  return (
    <div className="tv-gauge" role="img" aria-label={`${label}: ${pct(v)}`}>
      <svg viewBox="0 0 200 116" className="tv-gauge-svg">
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="var(--border)" strokeWidth="16" strokeLinecap="round" />
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="var(--chart-1)" strokeWidth="16" strokeLinecap="round"
          strokeDasharray={`${c * v} ${c}`} className="tv-gauge-value" />
        {tAngle != null && (
          <line x1={100 + 64 * Math.cos(tAngle)} y1={100 - 64 * Math.sin(tAngle)} x2={100 + 96 * Math.cos(tAngle)} y2={100 - 96 * Math.sin(tAngle)}
            stroke="var(--chart-2)" strokeWidth="3" strokeLinecap="round" />
        )}
      </svg>
      <div className="tv-gauge-text"><b>{pct(v)}</b><span>{sublabel}</span></div>
    </div>
  );
}

/* Funnel: stepped bars, each with its count and the conversion from the previous stage.
   Plain HTML (an ordered list), so it reads naturally to screen readers and wraps in Arabic. */
export function FunnelBars({ stages, format, pct, convLabel }) {
  const max = stages[0]?.value || 1;
  return (
    <ol className="tv-funnel">
      {stages.map((s, i) => (
        <li key={i} className="tv-funnel-row">
          <span className="tv-funnel-label">{s.label}</span>
          <span className="tv-funnel-track">
            <span className="tv-funnel-bar" style={{ width: `${Math.max(4, (s.value / max) * 100)}%`, background: `color-mix(in srgb, var(--chart-1) ${100 - i * 15}%, var(--surface))` }} />
          </span>
          <span className="tv-funnel-value">{format(s.value)}</span>
          <span className="tv-funnel-conv">{i > 0 ? <>{pct(s.value / stages[i - 1].value)}<span className="tv-sr"> {convLabel}</span></> : ""}</span>
        </li>
      ))}
    </ol>
  );
}

/* Ranked bars: horizontal bars sorted largest first, as an HTML list (mirrors correctly in Arabic). */
export function RankedBars({ items, format, color = "var(--chart-1)" }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ol className="tv-ranked">
      {items.map((it, i) => (
        <li key={i} className="tv-ranked-row">
          <span className="tv-ranked-label">{it.label}</span>
          <span className="tv-ranked-track"><span className="tv-ranked-bar" style={{ width: `${(it.value / max) * 100}%`, background: color }} /></span>
          <span className="tv-ranked-value">{format(it.value)}</span>
        </li>
      ))}
    </ol>
  );
}

/* Heatmap: rows × columns grid with a sequential scale */
export function Heatmap({ rows, cols, values, max, format, ariaLabel, cellLabel }) {
  return (
    <div className="tv-heatmap" role="img" aria-label={ariaLabel}>
      <div className="tv-heatmap-grid" style={{ gridTemplateColumns: `auto repeat(${cols.length}, minmax(14px, 1fr))` }}>
        <span />
        {cols.map((c, j) => <span key={j} className="tv-heatmap-col">{c}</span>)}
        {rows.map((r, i) => (
          <React.Fragment key={i}>
            <span className="tv-heatmap-row">{r}</span>
            {cols.map((c, j) => {
              const v = values[i][j];
              return <span key={j} className="tv-heatmap-cell" title={cellLabel ? cellLabel(r, c, v) : `${r} ${c}: ${format(v)}`}
                style={{ background: `color-mix(in srgb, var(--chart-1) ${Math.round(8 + 88 * (v / max))}%, var(--surface))` }} />;
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart, PieChart, Pie, RCell as ChartCell,
  ScatterChart, Scatter, ZAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, FunnelChart, Funnel,
  LabelList, Treemap, XAxis, YAxis, CartesianGrid, RTooltip as ChartTooltipBase, ReferenceLine,
};
