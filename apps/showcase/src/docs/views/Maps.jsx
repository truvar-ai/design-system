import React, { useState, useMemo } from "react";
import {
  WorldMap, useMapCountries, countryName, Flag, ComboBox, Item, Badge, Select, Sparkline, useFormat, Button,
} from "../../ds.js";
import * as Icon from "@truvar-ai/design-system/icons";
import { useTr, useLang } from "../i18n.jsx";
import { Spec, ViewHeader } from "../ui.jsx";

/* Sample: calls handled per country this month (ADM0_A3 codes) */
const CALLS = {
  EGY: 48210, SAU: 21480, ARE: 17320, KWT: 6120, QAT: 5480, OMN: 3110, JOR: 4210, MAR: 5930, DZA: 2410, TUN: 1980, LBY: 860, IRQ: 2730,
  LBN: 1240, PSX: 760, SDN: 940, GBR: 7340, FRA: 3920, DEU: 4410, ITA: 1220, ESP: 1480, NLD: 980, TUR: 2650, USA: 9810, CAN: 2140,
  BRA: 640, IND: 3820, PAK: 1530, IDN: 880, MYS: 720, NGA: 1310, KEN: 980, ZAF: 1160, ETH: 420, AUS: 1050, CHN: 1420, JPN: 560,
};
const CITIES = [
  { id: "cai", lon: 31.24, lat: 30.04, en: "Cairo", ar: "القاهرة", live: 214 }, { id: "alx", lon: 29.92, lat: 31.2, en: "Alexandria", ar: "الإسكندرية", live: 63 },
  { id: "ruh", lon: 46.68, lat: 24.71, en: "Riyadh", ar: "الرياض", live: 121 }, { id: "jed", lon: 39.19, lat: 21.49, en: "Jeddah", ar: "جدة", live: 58 },
  { id: "dxb", lon: 55.27, lat: 25.2, en: "Dubai", ar: "دبي", live: 97 }, { id: "doh", lon: 51.53, lat: 25.29, en: "Doha", ar: "الدوحة", live: 31 },
  { id: "kwi", lon: 47.98, lat: 29.37, en: "Kuwait City", ar: "مدينة الكويت", live: 26 }, { id: "amm", lon: 35.93, lat: 31.95, en: "Amman", ar: "عمّان", live: 22 },
  { id: "cas", lon: -7.59, lat: 33.57, en: "Casablanca", ar: "الدار البيضاء", live: 29 }, { id: "lon", lon: -0.13, lat: 51.51, en: "London", ar: "لندن", live: 44 },
  { id: "nyc", lon: -74.0, lat: 40.71, en: "New York", ar: "نيويورك", live: 37 }, { id: "bah", lon: 50.58, lat: 26.23, en: "Manama", ar: "المنامة", live: 12 },
];

export function Maps() {
  const tr = useTr(); const lang = useLang(); const f = useFormat();
  const countries = useMapCountries("EG");
  const [selected, setSelected] = useState("EGY");
  const [pov, setPov] = useState("EG");
  const sel = countries.find((c) => c.id === selected);
  const total = Object.values(CALLS).reduce((a, b) => a + b, 0);
  const rank = Object.entries(CALLS).sort((a, b) => b[1] - a[1]).findIndex(([k]) => k === selected) + 1;
  const trend = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ v: (CALLS[selected] ?? 0) / 30 * (0.8 + 0.4 * Math.abs(Math.sin(i * 0.9 + selected.length))) })), [selected]);
  const markers = CITIES.map((c) => ({ id: c.id, lon: c.lon, lat: c.lat, r: 3 + Math.sqrt(c.live) / 3, live: true, label: `${lang === "ar" ? c.ar : c.en}: ${f.number(c.live)} ${tr("live calls", "مكالمة جارية")}` }));
  const liveTotal = CITIES.reduce((a, c) => a + c.live, 0);

  return (
    <>
      <ViewHeader viewId="maps" intro={tr(
        "An interactive world map for call and customer data: colour countries by a value, focus a region, zoom and pan, pick a country, and place live markers. Borders come from Natural Earth (public domain).",
        "خريطة عالمية تفاعلية لبيانات المكالمات والعملاء: لوّن الدول حسب قيمة، وركّز على منطقة، وكبّر وحرّك، واختر دولة، وضع علامات مباشرة. الحدود من Natural Earth (ملكية عامة).")} />

      <Spec id="world-map" name={tr("Choropleth map", "خريطة ملونة حسب القيمة")} primitive="WorldMap (d3-geo + d3-zoom)" wide
        note={tr("Darker means more. Drag to pan, scroll or use the buttons to zoom, click a country to select it. With the keyboard: focus the map, then arrows pan, + and − zoom, 0 resets; or pick a country from the list.", "الأغمق يعني أكثر. اسحب للتحريك، واستخدم عجلة الفأرة أو الأزرار للتكبير، واضغط على دولة لاختيارها. بلوحة المفاتيح: ركّز على الخريطة ثم استخدم الأسهم للتحريك و+ و− للتكبير و0 لإعادة الضبط، أو اختر دولة من القائمة.")}>
        <div className="map-layout">
          <WorldMap data={CALLS} valueLabel={tr("Calls this month", "مكالمات هذا الشهر")} format={(v) => f.number(v, { notation: "compact", maximumFractionDigits: 1 })}
            selected={selected} onSelect={(id) => id && setSelected(id)} pov={pov}
            ariaLabel={tr(`World map of calls by country. Egypt has the most, ${f.number(CALLS.EGY)} calls.`, `خريطة العالم للمكالمات حسب الدولة. مصر في المقدمة بعدد ${f.number(CALLS.EGY)} مكالمة.`)} />
          <aside className="map-panel">
            <ComboBox label={tr("Country", "الدولة")} items={countries} selectedKey={selected} onSelectionChange={(k) => k && setSelected(k)} placeholder={tr("Search countries", "ابحث في الدول")}>
              {(c) => <Item id={c.id} textValue={c.name}>{c.name}</Item>}
            </ComboBox>
            {sel && (
              <div className="map-detail">
                <div className="map-detail-head">
                  {sel.iso2 && <Flag code={sel.iso2} size={28} />}
                  <div><b>{sel.name}</b><span className="tv-desc">{tr(sel.cont, { Africa: "أفريقيا", Asia: "آسيا", Europe: "أوروبا", "North America": "أمريكا الشمالية", "South America": "أمريكا الجنوبية", Oceania: "أوقيانوسيا" }[sel.cont] ?? sel.cont)}</span></div>
                </div>
                {CALLS[selected] != null ? (
                  <>
                    <div className="map-detail-stat"><span className="tv-desc">{tr("Calls this month", "مكالمات هذا الشهر")}</span><b>{f.number(CALLS[selected])}</b></div>
                    <div className="row" style={{ gap: 6 }}>
                      <Badge tone="navy">{tr(`#${rank} of ${Object.keys(CALLS).length}`, `المرتبة ${f.number(rank)} من ${f.number(Object.keys(CALLS).length)}`)}</Badge>
                      <Badge tone="neutral">{f.number(CALLS[selected] / total, { style: "percent", maximumFractionDigits: 1 })} {tr("of all calls", "من كل المكالمات")}</Badge>
                    </div>
                    <span className="tv-desc">{tr("Daily calls, last 14 days", "المكالمات اليومية، آخر ١٤ يومًا")}</span>
                    <Sparkline data={trend} height={44} />
                  </>
                ) : <p className="tv-desc" style={{ margin: 0 }}>{tr("No calls from this country yet.", "لا توجد مكالمات من هذه الدولة بعد.")}</p>}
              </div>
            )}
          </aside>
        </div>
      </Spec>

      <Spec id="live-map" name={tr("Live markers", "علامات مباشرة")} primitive="WorldMap markers" wide
        note={tr("City markers sized by live calls, with a gentle pulse that stops for people who prefer less motion. Hover a marker for its city and count.", "علامات للمدن بحجم المكالمات الجارية، مع نبض هادئ يتوقف لمن يفضّلون حركة أقل. مرّر المؤشر على علامة لترى المدينة والعدد.")}>
        <div className="stack">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="live-count"><span className="live-dot" aria-hidden="true" />{tr(`${liveTotal} calls happening now`, `${f.number(liveTotal)} مكالمة جارية الآن`)}</span>
          </div>
          <WorldMap markers={markers} continent="mena" showContinents={false} showTableToggle={false} height={420}
            ariaLabel={tr("Live calls in the Middle East and North Africa, busiest in Cairo, Riyadh and Dubai.", "المكالمات الجارية في الشرق الأوسط وشمال أفريقيا، والأكثر في القاهرة والرياض ودبي.")} />
        </div>
      </Spec>

      <Spec id="map-borders" name={tr("Border view", "عرض الحدود")} primitive={'WorldMap pov="EG" | "default"'}
        note={tr("Natural Earth draws borders by who controls territory. Egypt's view merges three areas: Taiwan into China, Northern Cyprus into Cyprus and Somaliland into Somalia. Halaib is shown as Egyptian in both.", "ترسم Natural Earth الحدود حسب السيطرة الفعلية. وجهة نظر مصر تدمج ثلاث مناطق: تايوان مع الصين، وشمال قبرص مع قبرص، وأرض الصومال مع الصومال. وتظهر حلايب مصرية في الحالتين.")}>
        <div className="stack">
          <div style={{ maxWidth: 320 }}>
            <Select label={tr("Borders", "الحدود")} selectedKey={pov} onSelectionChange={setPov}
              items={[{ id: "EG", n: tr("Egypt's official view (default)", "وجهة نظر مصر الرسمية (افتراضي)") }, { id: "default", n: tr("De facto control (Natural Earth)", "السيطرة الفعلية (Natural Earth)") }]}>
              {(o) => <Item id={o.id}>{o.n}</Item>}
            </Select>
          </div>
          <p className="tv-desc" style={{ margin: 0 }}>{tr("This setting changes the choropleth map above.", "هذا الإعداد يغيّر الخريطة الملونة بالأعلى.")}</p>
        </div>
      </Spec>
    </>
  );
}
