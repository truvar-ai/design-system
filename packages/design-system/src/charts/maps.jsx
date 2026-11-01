// @truvar/ui WorldMap: Natural Earth 1:110m (public domain) drawn with d3-geo, zoom with d3-zoom (ISC).
// Choropleth, continent focus, hover tooltip, selection, markers, zoom controls and a table view.
import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import * as RAC from "react-aria-components";
import { geoEqualEarth, geoPath } from "d3-geo";
import { zoom as d3zoom, zoomIdentity } from "d3-zoom";
import { select } from "d3-selection";
import { feature, merge } from "topojson-client";
import world from "./geo/world-110m.json";
import * as Icon from "../icons/icons.jsx";
import { Flag } from "../core/Flag.jsx";

const cx = (...c) => c.filter(Boolean).join(" ");
const W = 960, H = 500;
export const CONTINENTS = [
  { id: "all", en: "World", ar: "العالم" },
  { id: "Africa", en: "Africa", ar: "أفريقيا" },
  { id: "Asia", en: "Asia", ar: "آسيا" },
  { id: "Europe", en: "Europe", ar: "أوروبا" },
  { id: "North America", en: "North America", ar: "أمريكا الشمالية" },
  { id: "South America", en: "South America", ar: "أمريكا الجنوبية" },
  { id: "Oceania", en: "Oceania", ar: "أوقيانوسيا" },
  { id: "mena", en: "Middle East & North Africa", ar: "الشرق الأوسط وشمال أفريقيا" },
];
const MENA = ["EGY", "SAU", "ARE", "QAT", "KWT", "OMN", "YEM", "JOR", "LBN", "SYR", "IRQ", "IRN", "ISR", "PSX", "TUR", "LBY", "TUN", "DZA", "MAR", "SAH", "SDN", "CYP", "CYN"];

/* Countries as GeoJSON features. pov "EG" merges the three places Egypt's official view treats as part
   of another country (Taiwan → China, Northern Cyprus → Cyprus, Somaliland → Somalia). */
function buildFeatures(pov) {
  const geoms = world.objects.countries.geometries;
  const key = (g) => (pov === "EG" ? g.properties.eg || g.properties.a3 : g.properties.a3);
  const groups = new Map();
  geoms.forEach((g) => { const k = key(g); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(g); });
  const out = [];
  groups.forEach((list, k) => {
    const main = list.find((g) => g.properties.a3 === k) ?? list[0];
    const geometry = list.length > 1 ? merge(world, list) : feature(world, main).geometry;
    out.push({ type: "Feature", id: k, properties: main.properties, geometry });
  });
  return out.filter((f) => f.properties.cont !== "Antarctica");
}

const names = {};
const displayName = (lang) => {
  if (!names[lang]) { try { names[lang] = new Intl.DisplayNames([lang], { type: "region" }); } catch { names[lang] = null; } }
  return names[lang];
};
export function countryName(p, lang) {
  const dn = displayName(lang);
  if (p.iso2 && dn) { try { const n = dn.of(p.iso2); if (n && n !== p.iso2) return n; } catch {} }
  return lang === "ar" ? p.ar : p.en;
}

const T = {
  en: { zoomIn: "Zoom in", zoomOut: "Zoom out", reset: "Reset view", noData: "No data", map: "Map", table: "Table", country: "Country", view: "View", region: "Region" },
  ar: { zoomIn: "تكبير", zoomOut: "تصغير", reset: "إعادة الضبط", noData: "لا توجد بيانات", map: "خريطة", table: "جدول", country: "الدولة", view: "طريقة العرض", region: "المنطقة" },
};

export function WorldMap({
  data = {}, valueLabel, format = (v) => v, steps = 5, selected, onSelect, markers = [], pov = "EG",
  continent: continentProp, onContinentChange, height = 520, ariaLabel, showContinents = true, showTableToggle = true, interactive = true,
}) {
  const { locale } = RAC.useLocale();
  const lang = locale.startsWith("ar") ? "ar" : "en";
  const t = T[lang];
  const features = useMemo(() => buildFeatures(pov), [pov]);
  const projection = useMemo(() => geoEqualEarth().fitExtent([[8, 8], [W - 8, H - 8]], { type: "FeatureCollection", features }), [features]);
  const path = useMemo(() => geoPath(projection), [projection]);
  const svgRef = useRef(null), gRef = useRef(null), zoomRef = useRef(null), tRef = useRef(zoomIdentity);
  const [k, setK] = useState(1);
  const [hover, setHover] = useState(null);
  const [cont, setCont] = useState(continentProp ?? "all");
  const [view, setView] = useState("map");
  const continent = continentProp ?? cont;

  // value scale (quantile-ish buckets on max)
  const values = Object.values(data).filter((v) => v > 0);
  const max = values.length ? Math.max(...values) : 1;
  const bucket = (v) => (v == null || v <= 0 ? -1 : Math.min(steps - 1, Math.floor((Math.sqrt(v / max)) * steps)));
  const fillFor = (v) => {
    const b = bucket(v);
    return b < 0 ? "var(--map-empty)" : `color-mix(in srgb, var(--chart-1) ${Math.round(18 + (b / (steps - 1)) * 78)}%, var(--map-base))`;
  };
  const legend = Array.from({ length: steps }, (_, i) => {
    const lo = Math.round(max * (i / steps) ** 2), hi = Math.round(max * ((i + 1) / steps) ** 2);
    return { color: `color-mix(in srgb, var(--chart-1) ${Math.round(18 + (i / (steps - 1)) * 78)}%, var(--map-base))`, lo, hi };
  });

  // zoom behaviour
  useEffect(() => {
    if (!interactive) return;
    const svg = select(svgRef.current);
    const z = d3zoom().scaleExtent([1, 12]).translateExtent([[0, 0], [W, H]])
      .on("zoom", (e) => { tRef.current = e.transform; gRef.current?.setAttribute("transform", e.transform.toString()); setK(e.transform.k); });
    zoomRef.current = z;
    svg.call(z).on("dblclick.zoom", null);
    return () => svg.on(".zoom", null);
  }, [interactive]);

  const animateTo = useCallback((target, ms = 600) => {
    const svg = select(svgRef.current), z = zoomRef.current;
    if (!z) { gRef.current?.setAttribute("transform", target.toString()); return; }
    const from = tRef.current, t0 = performance.now();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { svg.call(z.transform, target); return; }
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    const step = (now) => {
      const p = Math.min(1, Math.max(0, (now - t0) / ms)), e = ease(p); // rAF time can precede t0
      const kk = from.k + (target.k - from.k) * e;
      const tx = from.x + (target.x - from.x) * e, ty = from.y + (target.y - from.y) * e;
      svg.call(z.transform, zoomIdentity.translate(tx, ty).scale(kk));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  const fitTo = useCallback((feats) => {
    if (!feats.length) return animateTo(zoomIdentity);
    const [[x0, y0], [x1, y1]] = path.bounds({ type: "FeatureCollection", features: feats });
    const kk = Math.min(10, 0.88 / Math.max((x1 - x0) / W, (y1 - y0) / H));
    animateTo(zoomIdentity.translate(W / 2, H / 2).scale(kk).translate(-(x0 + x1) / 2, -(y0 + y1) / 2));
  }, [path, animateTo]);

  const inFocus = (f) => continent === "all" || (continent === "mena" ? MENA.includes(f.id) : f.properties.cont === continent);
  useEffect(() => {
    if (continent === "all") animateTo(zoomIdentity);
    else fitTo(features.filter(inFocus).filter((f) => !(continent === "Europe" && ["RUS"].includes(f.id))));
  }, [continent, features]);

  const zoomBy = (factor) => {
    const z = zoomRef.current; if (!z) return;
    const cur = tRef.current, nk = Math.max(1, Math.min(12, cur.k * factor));
    animateTo(zoomIdentity.translate(W / 2, H / 2).scale(nk).translate(-(W / 2 - cur.x) / cur.k, -(H / 2 - cur.y) / cur.k), 300);
  };
  const onKey = (e) => {
    const step = 40, cur = tRef.current; let nt = null;
    if (e.key === "+" || e.key === "=") { zoomBy(1.5); e.preventDefault(); return; }
    if (e.key === "-") { zoomBy(1 / 1.5); e.preventDefault(); return; }
    if (e.key === "0") { animateTo(zoomIdentity); e.preventDefault(); return; }
    if (e.key === "ArrowLeft") nt = cur.translate(step / cur.k, 0);
    if (e.key === "ArrowRight") nt = cur.translate(-step / cur.k, 0);
    if (e.key === "ArrowUp") nt = cur.translate(0, step / cur.k);
    if (e.key === "ArrowDown") nt = cur.translate(0, -step / cur.k);
    if (nt) { e.preventDefault(); select(svgRef.current).call(zoomRef.current.transform, nt); }
  };

  const hoverInfo = hover && features.find((f) => f.id === hover.id);
  const stroke = 0.6 / Math.max(1, k || 1);
  const setContinent = (c) => { setCont(c); onContinentChange?.(c); };

  const tableRows = features.filter((f) => data[f.id] != null).sort((a, b) => data[b.id] - data[a.id]);

  return (
    <div className="tv-map">
      {(showContinents || showTableToggle) && (
        <div className="tv-map-bar">
          {showContinents ? (
            <RAC.ToggleButtonGroup aria-label={t.region} selectionMode="single" disallowEmptySelection selectedKeys={[continent]}
              onSelectionChange={(s) => setContinent([...s][0])} className="tv-segmented tv-segmented--sm tv-map-regions">
              {CONTINENTS.map((c) => (
                <RAC.ToggleButton key={c.id} id={c.id} className="tv-segment-btn">
                  <RAC.SelectionIndicator className="tv-segment-indicator" />
                  <span className="tv-segment-label">{c[lang]}</span>
                </RAC.ToggleButton>
              ))}
            </RAC.ToggleButtonGroup>
          ) : <span />}
          {showTableToggle && (
            <RAC.ToggleButtonGroup aria-label={t.view} selectionMode="single" disallowEmptySelection selectedKeys={[view]}
              onSelectionChange={(s) => setView([...s][0])} className="tv-segmented tv-segmented--sm">
              {["map", "table"].map((v) => (
                <RAC.ToggleButton key={v} id={v} className="tv-segment-btn">
                  <RAC.SelectionIndicator className="tv-segment-indicator" />
                  <span className="tv-segment-label">{t[v]}</span>
                </RAC.ToggleButton>
              ))}
            </RAC.ToggleButtonGroup>
          )}
        </div>
      )}

      {view === "map" ? (
        <div className="tv-map-stage" style={{ aspectRatio: `${W} / ${H}`, maxHeight: height }}>
          {/* Geography is never mirrored: west stays left in Arabic too. */}
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="tv-map-svg" dir="ltr" role="img" aria-label={ariaLabel}
            tabIndex={interactive ? 0 : -1} onKeyDown={interactive ? onKey : undefined} preserveAspectRatio="xMidYMid meet">
            <rect x="0" y="0" width={W} height={H} fill="transparent" />
            <g ref={gRef}>
              {features.map((f) => {
                const v = data[f.id];
                const dim = !inFocus(f);
                return (
                  <path key={f.id} data-id={f.id} d={path(f)} className={cx("tv-map-country", selected === f.id && "is-selected", hover?.id === f.id && "is-hover", dim && "is-dim")}
                    fill={fillFor(v)} strokeWidth={selected === f.id ? stroke * 3 : stroke}
                    onPointerMove={(e) => {
                      const r = svgRef.current.getBoundingClientRect();
                      setHover({ id: f.id, x: e.clientX - r.left, y: e.clientY - r.top, w: r.width });
                    }}
                    onPointerLeave={() => setHover(null)}
                    onClick={() => interactive && onSelect?.(selected === f.id ? null : f.id)} />
                );
              })}
              {markers.map((m) => {
                const [x, y] = projection([m.lon, m.lat]) || [0, 0];
                const r = (m.r ?? 5) / Math.sqrt(Math.max(1, k || 1));
                return (
                  <g key={m.id} transform={`translate(${x},${y})`} className={cx("tv-map-marker", m.live && "is-live")}>
                    {m.live && <circle r={r * 2.6} className="tv-map-pulse" />}
                    <circle r={r} className="tv-map-dot" strokeWidth={1.5 / Math.sqrt(k)} />
                    <title>{m.label}</title>
                  </g>
                );
              })}
            </g>
          </svg>

          {hoverInfo && (
            <div className="tv-map-tip" style={{ insetInlineStart: undefined, left: Math.min(hover.x + 14, hover.w - 220), top: hover.y + 14 }} role="presentation">
              <span className="tv-map-tip-name">{hoverInfo.properties.iso2 && <Flag code={hoverInfo.properties.iso2} size={14} />}{countryName(hoverInfo.properties, lang)}</span>
              <span className="tv-desc">{data[hoverInfo.id] != null ? <>{valueLabel}: <b>{format(data[hoverInfo.id])}</b></> : t.noData}</span>
            </div>
          )}

          {interactive && (
            <div className="tv-map-zoom">
              <RAC.Button className="tv-icon-btn" aria-label={t.zoomIn} onPress={() => zoomBy(1.6)}><Icon.Plus /></RAC.Button>
              <RAC.Button className="tv-icon-btn" aria-label={t.zoomOut} onPress={() => zoomBy(1 / 1.6)} isDisabled={k <= 1.01}><Icon.Minus /></RAC.Button>
              <RAC.Button className="tv-icon-btn" aria-label={t.reset} onPress={() => { setContinent("all"); animateTo(zoomIdentity); }}><Icon.Home /></RAC.Button>
            </div>
          )}

          {values.length > 0 && (
            <div className="tv-map-legend" aria-hidden="true">
              <span className="tv-map-legend-title">{valueLabel}</span>
              <div className="tv-map-legend-scale">{legend.map((l, i) => <span key={i} style={{ background: l.color }} />)}</div>
              <div className="tv-map-legend-range"><span>{format(legend[0].lo || 1)}</span><span>{format(max)}</span></div>
            </div>
          )}
        </div>
      ) : (
        <div className="tv-table-scroll tv-table-tall" style={{ maxHeight: height }}>
          <table className="tv-table">
            <thead><tr><th className="tv-th"><div className="tv-th-inner">{t.country}</div></th><th className="tv-th is-end"><div className="tv-th-inner">{valueLabel}</div></th></tr></thead>
            <tbody>{tableRows.map((f) => (
              <tr key={f.id} className={cx("tv-tr", selected === f.id && "is-selected-row")}>
                <td className="tv-td"><span className="country-cell">{f.properties.iso2 && <Flag code={f.properties.iso2} size={16} />}{countryName(f.properties, lang)}</span></td>
                <td className="tv-td is-end">{format(data[f.id])}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* All countries for pickers that pair with the map (keyboard-accessible selection) */
export function useMapCountries(pov = "EG") {
  const { locale } = RAC.useLocale();
  const lang = locale.startsWith("ar") ? "ar" : "en";
  return useMemo(() => buildFeatures(pov)
    .filter((f) => f.properties.cont !== "Seven seas (open ocean)")
    .map((f) => ({ id: f.id, iso2: f.properties.iso2, cont: f.properties.cont, pop: f.properties.pop, name: countryName(f.properties, lang) }))
    .sort((a, b) => a.name.localeCompare(b.name, lang)), [pov, lang]);
}
