// Pipeline board: deals in stage columns. Drag a card to another stage or reorder within one
// (mouse, touch, keyboard and screen readers, via React Aria drag and drop); every card also has a "Move to" menu.
import * as RAC from "react-aria-components";
import * as Icon from "../icons/icons.jsx";
import { Avatar } from "../core/index.jsx";
import { useCrm } from "./i18n.js";
import { dateFormat } from "../core/format.js";

const cx = (...c) => c.filter(Boolean).join(" ");
const TYPE = "application/x-tv-deal";

/* stages: [{ id, label, tone, probability }]
   deals: [{ id, stage, title, company, value, contact: { name, src }, owner: { name }, closeDate: Date, overdue }]
   onChange(nextDeals, { ids, to }) after a move. format(value) formats money. onOpen(deal) when a card is opened. */
export function PipelineBoard({ stages, deals, onChange, format = String, onOpen, onAdd, label }) {
  const { t } = useCrm();
  const move = (ids, to, target) => {
    const moving = ids.map((id) => deals.find((d) => d.id === id)).filter(Boolean).map((d) => ({ ...d, stage: to }));
    let rest = deals.filter((d) => !ids.includes(d.id));
    let at = rest.length;
    if (target) {
      const i = rest.findIndex((d) => d.id === target.key);
      if (i >= 0) at = target.position === "after" ? i + 1 : i;
    } else {
      // Dropped on the column itself: goes to the end of that stage
      const last = rest.map((d) => d.stage).lastIndexOf(to);
      at = last >= 0 ? last + 1 : rest.length;
    }
    rest.splice(at, 0, ...moving);
    onChange?.(rest, { ids, to });
  };
  return (
    <div className="tv-pipe" role="group" aria-label={label ?? t.pipeline}>
      {stages.map((s) => (
        <PipelineColumn key={s.id} stage={s} stages={stages} deals={deals.filter((d) => d.stage === s.id)}
          move={move} format={format} onOpen={onOpen} onAdd={onAdd} />
      ))}
    </div>
  );
}

function PipelineColumn({ stage, stages, deals, move, format, onOpen, onAdd }) {
  const { t, num, locale } = useCrm();
  const ids = async (items) => Promise.all(items.filter(RAC.isTextDropItem).map((i) => i.getText(TYPE)));
  const { dragAndDropHooks } = RAC.useDragAndDrop({
    getItems: (keys) => [...keys].map((k) => ({ [TYPE]: String(k), "text/plain": deals.find((d) => d.id === k)?.title ?? "" })),
    acceptedDragTypes: [TYPE],
    getDropOperation: () => "move",
    onReorder: (e) => move([...e.keys], stage.id, { key: e.target.key, position: e.target.dropPosition }),
    onInsert: async (e) => move(await ids(e.items), stage.id, { key: e.target.key, position: e.target.dropPosition }),
    onRootDrop: async (e) => move(await ids(e.items), stage.id, null),
    renderDropIndicator: (target) => <RAC.DropIndicator target={target} className="tv-pipe-indicator" />,
  });
  const total = deals.reduce((a, d) => a + d.value, 0);
  const dateFmt = dateFormat(locale, { day: "numeric", month: "short" });
  return (
    <section className={cx("tv-pipe-col", `is-${stage.tone ?? "neutral"}`)} aria-label={stage.label}>
      <header className="tv-pipe-head">
        <span className="tv-pipe-title"><span className="tv-pipe-dot" aria-hidden="true" />{stage.label}<span className="tv-pipe-count">{num(deals.length)}</span></span>
        <span className="tv-pipe-total">{format(total)}{stage.probability != null && <span className="tv-desc"> · {num(stage.probability)}%</span>}</span>
      </header>
      <RAC.GridList aria-label={stage.label} items={deals} dragAndDropHooks={dragAndDropHooks} className="tv-pipe-list"
        selectionMode="none" onAction={(k) => onOpen?.(deals.find((d) => d.id === k))}
        renderEmptyState={() => <div className="tv-pipe-empty">{t.dropHere}</div>}>
        {(d) => (
          <RAC.GridListItem id={d.id} textValue={`${d.title}, ${format(d.value)}`} className="tv-pipe-card">
            <span className="tv-pipe-card-top">
              <RAC.Button slot="drag" className="tv-pipe-grip" aria-label={t.drag}><Icon.Grip /></RAC.Button>
              <span className="tv-pipe-card-title">{d.title}</span>
              <RAC.MenuTrigger>
                <RAC.Button className="tv-icon-btn tv-pipe-more" aria-label={`${t.moveTo}: ${d.title}`}><Icon.More /></RAC.Button>
                <RAC.Popover className="tv-popover" placement="bottom end" offset={4}>
                  <p className="tv-pop-title">{t.moveTo}</p>
                  <RAC.Menu className="tv-listbox" aria-label={t.moveTo} disabledKeys={[stage.id]} onAction={(k) => move([d.id], k, null)}>
                    {stages.map((s) => (
                      <RAC.MenuItem key={s.id} id={s.id} className={cx("tv-item", "tv-pipe-moveitem", `is-${s.tone ?? "neutral"}`)} textValue={s.label}>
                        <span className="tv-pipe-dot" aria-hidden="true" />{s.label}{s.id === stage.id && <Icon.Check className="tv-pipe-here" />}
                      </RAC.MenuItem>
                    ))}
                  </RAC.Menu>
                </RAC.Popover>
              </RAC.MenuTrigger>
            </span>
            <span className="tv-pipe-company">{d.company}</span>
            <span className="tv-pipe-value">{format(d.value)}</span>
            <span className="tv-pipe-card-foot">
              {d.contact && <Avatar name={d.contact.name} src={d.contact.src} size={24} />}
              <span className={cx("tv-pipe-date", d.overdue && "is-late")}><Icon.Calendar />{dateFmt.format(d.closeDate)}</span>
              {d.owner && <span className="tv-pipe-owner" title={d.owner.name}>{d.owner.name.split(" ")[0]}</span>}
            </span>
          </RAC.GridListItem>
        )}
      </RAC.GridList>
      {onAdd && <RAC.Button className="tv-pipe-add" onPress={() => onAdd(stage)}><Icon.Plus />{t.addDeal}</RAC.Button>}
    </section>
  );
}
