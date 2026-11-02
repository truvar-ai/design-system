// Event calendar: month, week, day and agenda views. Click an empty slot to create, an event to open it.
import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import * as RAC from "react-aria-components";
import * as Icon from "../icons/icons.jsx";
import { useCrm } from "./i18n.js";
import { dateFormat } from "../core/format.js";

const cx = (...c) => c.filter(Boolean).join(" ");
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const sameDay = (a, b) => a.toDateString() === b.toDateString();
const startOfWeek = (d) => addDays(startOfDay(d), -startOfDay(d).getDay()); // Sunday, the first working day in Egypt and the Gulf
export const CALENDAR_VIEWS = ["month", "week", "day", "agenda"];

function useNarrow() {
  return useSyncExternalStore((cb) => { const q = matchMedia("(max-width: 760px)"); q.addEventListener("change", cb); return () => q.removeEventListener("change", cb); },
    () => matchMedia("(max-width: 760px)").matches, () => false);
}
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(id); }, []);
  return now;
}

/* events: [{ id, title, start: Date, end: Date, type, location, allDay }]
   types: { [type]: { label, tone } } where tone is one of info, success, accent, warning, danger, neutral.
   onSelectSlot(start, end) for a new event; onSelectEvent(event) to open one. */
export function EventCalendar({ events, types = {}, date: dateProp, onDateChange, view: viewProp, onViewChange,
  onSelectSlot, onSelectEvent, startHour = 7, endHour = 21, label }) {
  const { t, locale, num } = useCrm();
  const narrow = useNarrow();
  const now = useNow();
  const [dateState, setDateState] = useState(() => dateProp ?? new Date());
  const [viewState, setViewState] = useState(() => viewProp ?? (narrow ? "agenda" : "week"));
  const date = dateProp ?? dateState;
  const view = viewProp ?? viewState;
  const setDate = (d) => { setDateState(d); onDateChange?.(d); };
  const setView = (v) => { setViewState(v); onViewChange?.(v); };
  const step = (dir) => {
    const d = new Date(date);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir * (view === "week" ? 7 : view === "agenda" ? 7 : 1));
    setDate(d);
  };
  const fmt = (o) => dateFormat(locale, o);
  const weekStart = startOfWeek(date);
  const title = view === "month" ? fmt({ month: "long", year: "numeric" }).format(date)
    : view === "day" ? fmt({ weekday: "long", day: "numeric", month: "long" }).format(date)
    : fmt({ month: "short", day: "numeric" }).formatRange?.(weekStart, addDays(weekStart, 6)) ?? fmt({ month: "long", year: "numeric" }).format(date);
  const tone = (e) => types[e.type]?.tone ?? "info";
  const sorted = useMemo(() => [...events].sort((a, b) => a.start - b.start), [events]);
  const onDay = (d) => sorted.filter((e) => sameDay(e.start, d));
  const time = fmt({ hour: "numeric", minute: "2-digit" });

  const Chip = ({ e, compact }) => (
    <RAC.Button className={cx("tv-cal-chip", `is-${tone(e)}`, compact && "is-compact")} onPress={() => onSelectEvent?.(e)}
      aria-label={`${e.title}, ${time.format(e.start)}`}>
      {!compact && <span className="tv-cal-chip-time">{time.format(e.start)}</span>}<span className="tv-cal-chip-title">{e.title}</span>
    </RAC.Button>
  );

  return (
    <div className="tv-cal" role="group" aria-label={label ?? t.calendar}>
      <div className="tv-cal-bar">
        <div className="tv-cal-nav">
          <RAC.Button className="tv-cal-today" onPress={() => setDate(new Date())}>{t.today}</RAC.Button>
          <RAC.Button className="tv-icon-btn" aria-label={t.previous} onPress={() => step(-1)}><Icon.ChevronLeft className="tv-flip" /></RAC.Button>
          <RAC.Button className="tv-icon-btn" aria-label={t.next} onPress={() => step(1)}><Icon.ChevronRight className="tv-flip" /></RAC.Button>
          <h2 className="tv-cal-title" aria-live="polite">{title}</h2>
        </div>
        <RAC.ToggleButtonGroup className="tv-segmented tv-cal-views" selectionMode="single" disallowEmptySelection selectedKeys={[view]}
          onSelectionChange={(k) => setView([...k][0])} aria-label={t.view}>
          {CALENDAR_VIEWS.map((v) => (
            <RAC.ToggleButton key={v} id={v} className="tv-segment-btn"><RAC.SelectionIndicator className="tv-segment-indicator" /><span className="tv-segment-label">{t.views[v]}</span></RAC.ToggleButton>
          ))}
        </RAC.ToggleButtonGroup>
      </div>

      {view === "month" && (() => {
        const first = new Date(date.getFullYear(), date.getMonth(), 1);
        const gridStart = startOfWeek(first);
        const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
        const max = narrow ? 0 : 3;
        return (
          <div className="tv-cal-month">
            {days.slice(0, 7).map((d) => <span key={"h" + d} className="tv-cal-dow">{fmt({ weekday: narrow ? "narrow" : "short" }).format(d)}</span>)}
            {days.map((d) => {
              const list = onDay(d);
              const other = d.getMonth() !== date.getMonth();
              return (
                <div key={d.toISOString()} className={cx("tv-cal-cell", other && "is-other", sameDay(d, now) && "is-today")}>
                  <RAC.Button className="tv-cal-daynum" aria-label={fmt({ weekday: "long", day: "numeric", month: "long" }).format(d)}
                    onPress={() => { setDate(d); setView("day"); }}>{num(d.getDate())}</RAC.Button>
                  {narrow ? (list.length > 0 && <span className="tv-cal-dots" aria-label={`${num(list.length)}`}>{list.slice(0, 3).map((e) => <i key={e.id} className={`is-${tone(e)}`} />)}</span>) : (
                    <>
                      {list.slice(0, max).map((e) => <Chip key={e.id} e={e} />)}
                      {list.length > max && <RAC.Button className="tv-cal-more" onPress={() => { setDate(d); setView("day"); }}>{t.moreEvents(num(list.length - max))}</RAC.Button>}
                    </>
                  )}
                  <RAC.Button className="tv-cal-slot" aria-label={`${t.newEvent}, ${fmt({ day: "numeric", month: "long" }).format(d)}`}
                    onPress={() => { const s = new Date(d); s.setHours(10); onSelectSlot?.(s, new Date(+s + 3600e3)); }} />
                </div>
              );
            })}
          </div>
        );
      })()}

      {(view === "week" || view === "day") && (() => {
        const days = view === "day" ? [startOfDay(date)] : Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
        const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
        const H = 52;
        const place = (list) => {
          // Overlapping events share the width side by side
          const lanes = [];
          const out = list.map((e) => {
            let lane = lanes.findIndex((end) => end <= e.start);
            if (lane < 0) { lane = lanes.length; lanes.push(e.end); } else lanes[lane] = e.end;
            return { e, lane };
          });
          return out.map((o) => ({ ...o, lanes: Math.max(1, ...out.filter((x) => x.e.start < o.e.end && x.e.end > o.e.start).map((x) => x.lane + 1)) }));
        };
        return (
          <div className="tv-cal-week" style={{ "--cols": days.length, "--hour": H + "px" }}>
            <div className="tv-cal-week-head">
              <span />
              {days.map((d) => (
                <RAC.Button key={d.toISOString()} className={cx("tv-cal-wday", sameDay(d, now) && "is-today")} onPress={() => { setDate(d); setView("day"); }}>
                  <span>{fmt({ weekday: "short" }).format(d)}</span><b>{num(d.getDate())}</b>
                </RAC.Button>
              ))}
            </div>
            <div className="tv-cal-grid">
              <div className="tv-cal-hours">{hours.map((h) => <span key={h}>{fmt({ hour: "numeric" }).format(new Date(2026, 0, 1, h))}</span>)}</div>
              {days.map((d) => (
                <div key={d.toISOString()} className={cx("tv-cal-col", sameDay(d, now) && "is-today")}>
                  {hours.map((h) => {
                    const s = new Date(d); s.setHours(h, 0, 0, 0);
                    return <RAC.Button key={h} className="tv-cal-hourslot" aria-label={`${t.newEvent}, ${fmt({ weekday: "long", hour: "numeric" }).format(s)}`}
                      onPress={() => onSelectSlot?.(s, new Date(+s + 3600e3))} />;
                  })}
                  {place(onDay(d).filter((e) => !e.allDay)).map(({ e, lane, lanes }) => {
                    const top = Math.max(0, (e.start.getHours() + e.start.getMinutes() / 60 - startHour) * H);
                    const height = Math.max(22, ((e.end - e.start) / 3600e3) * H - 2);
                    return (
                      <RAC.Button key={e.id} className={cx("tv-cal-event", `is-${tone(e)}`, height < 40 && "is-short")} onPress={() => onSelectEvent?.(e)}
                        style={{ top, height, insetInlineStart: `calc(${(lane / lanes) * 100}% + 2px)`, width: `calc(${100 / lanes}% - 4px)` }}
                        aria-label={`${e.title}, ${time.format(e.start)} – ${time.format(e.end)}`}>
                        <span className="tv-cal-event-title">{e.title}</span>
                        <span className="tv-cal-event-time">{time.format(e.start)} – {time.format(e.end)}</span>
                        {e.location && height > 60 && <span className="tv-cal-event-time">{e.location}</span>}
                      </RAC.Button>
                    );
                  })}
                  {sameDay(d, now) && now.getHours() >= startHour && now.getHours() < endHour && (
                    <span className="tv-cal-now" style={{ top: (now.getHours() + now.getMinutes() / 60 - startHour) * H }} aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {view === "agenda" && (() => {
        const from = startOfDay(date);
        const days = Array.from({ length: 14 }, (_, i) => addDays(from, i)).map((d) => ({ d, list: onDay(d) })).filter((x) => x.list.length);
        if (!days.length) return <p className="tv-empty-mini">{t.noEvents}</p>;
        return (
          <div className="tv-cal-agenda">
            {days.map(({ d, list }) => (
              <section key={d.toISOString()} className="tv-cal-aday">
                <h3 className={cx("tv-cal-adate", sameDay(d, now) && "is-today")}><b>{num(d.getDate())}</b><span>{fmt({ weekday: "long", month: "long" }).format(d)}</span></h3>
                <ul>
                  {list.map((e) => (
                    <li key={e.id}>
                      <RAC.Button className={cx("tv-cal-aitem", `is-${tone(e)}`)} onPress={() => onSelectEvent?.(e)}>
                        <span className="tv-cal-atime">{e.allDay ? t.allDay : <>{time.format(e.start)}<span>{time.format(e.end)}</span></>}</span>
                        <span className="tv-cal-abar" aria-hidden="true" />
                        <span className="tv-cal-atext"><b>{e.title}</b>{(e.location || types[e.type]) && <span>{[types[e.type]?.label, e.location].filter(Boolean).join(" · ")}</span>}</span>
                      </RAC.Button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
