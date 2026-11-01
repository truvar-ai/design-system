// @truvar/ui — the rest of the React Aria set, plus brand components React Aria leaves to each design system.
import React, { useState, useEffect, useSyncExternalStore } from "react";
import * as RAC from "react-aria-components";
import * as Icon from "../icons/icons.jsx";
import { Button, Checkbox, OrbitMark, TextField, useMessages } from "./index.jsx";

const cx = (...c) => c.filter(Boolean).join(" ");

const M = {
  en: { close: "Close", dismiss: "Dismiss", prev: "Previous page", next: "Next page", page: (n) => `Page ${n}`,
        pagination: "Pagination", drag: "Drag to reorder", expand: "Expand", cancel: "Cancel",
        typeToConfirm: (w) => `Type ${w} to confirm`, notifications: "Notifications", markRead: "Mark all as read",
        nothingNew: "You're all caught up.", from: "From", to: "To", hue: "Hue", color: "Colour" },
  ar: { close: "إغلاق", dismiss: "تجاهل", prev: "الصفحة السابقة", next: "الصفحة التالية", page: (n) => `الصفحة ${n}`,
        pagination: "التنقل بين الصفحات", drag: "اسحب لإعادة الترتيب", expand: "توسيع", cancel: "إلغاء",
        typeToConfirm: (w) => `اكتب ${w} للتأكيد`, notifications: "الإشعارات", markRead: "تحديد الكل كمقروء",
        nothingNew: "لا يوجد جديد.", from: "من", to: "إلى", hue: "درجة اللون", color: "اللون" },
};
export function useM() {
  const { locale } = RAC.useLocale();
  return M[locale.split("-")[0]] ?? M.en;
}
export function useFormat() {
  const { locale } = RAC.useLocale();
  return {
    number: (n, o) => new Intl.NumberFormat(locale, o).format(n),
    money: (n) => new Intl.NumberFormat(locale, { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(n),
    moneyShort: (n) => new Intl.NumberFormat(locale, { style: "currency", currency: "EGP", notation: "compact", maximumFractionDigits: 1 }).format(n),
    relative: (days) => new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(-days, "day"),
    locale,
  };
}

/* =========================================================
   BUTTONS & ACTIONS
   ========================================================= */
export function ToggleButton({ children, icon, ...props }) {
  return <RAC.ToggleButton {...props} className="tv-toggle">{icon}{children}</RAC.ToggleButton>;
}
export function ToggleButtonGroup({ children, ...props }) {
  return <RAC.ToggleButtonGroup {...props} className="tv-segmented">{children}</RAC.ToggleButtonGroup>;
}
export function SegmentButton({ children, icon, ...props }) {
  return (
    <RAC.ToggleButton {...props} className="tv-segment-btn">
      <RAC.SelectionIndicator className="tv-segment-indicator" />
      <span className="tv-segment-label">{icon}{children}</span>
    </RAC.ToggleButton>
  );
}
export function Link({ children, standalone, ...props }) {
  return <RAC.Link {...props} className={cx("tv-link", standalone && "tv-link--standalone")}>{children}</RAC.Link>;
}
export const FileTrigger = RAC.FileTrigger;
export function Toolbar({ children, ...props }) {
  return <RAC.Toolbar {...props} className="tv-toolbar">{children}</RAC.Toolbar>;
}
export const Separator = (p) => <RAC.Separator {...p} className={cx("tv-sep", p.orientation === "vertical" && "tv-sep--v")} />;

/* =========================================================
   FORM FIELDS
   ========================================================= */
const FieldError = () => (
  <RAC.FieldError className="tv-error">
    {(v) => <><Icon.Alert width={14} height={14} />{v.validationErrors.join(" ")}</>}
  </RAC.FieldError>
);
const Desc = ({ children }) => children ? <RAC.Text slot="description" className="tv-desc">{children}</RAC.Text> : null;

export function NumberField({ label, description, ...props }) {
  return (
    <RAC.NumberField {...props} className="tv-field">
      <RAC.Label className="tv-label">{label}</RAC.Label>
      <RAC.Group className="tv-group tv-number">
        <RAC.Button slot="decrement" className="tv-icon-btn"><Icon.Minus /></RAC.Button>
        <RAC.Input className="tv-input" />
        <RAC.Button slot="increment" className="tv-icon-btn"><Icon.Plus /></RAC.Button>
      </RAC.Group>
      <Desc>{description}</Desc>
      <FieldError />
    </RAC.NumberField>
  );
}

export function CheckboxGroup({ label, description, children, ...props }) {
  return (
    <RAC.CheckboxGroup {...props} className="tv-radiogroup">
      <RAC.Label className="tv-label">{label}</RAC.Label>
      <div className="tv-radio-row">{children}</div>
      <Desc>{description}</Desc>
      <FieldError />
    </RAC.CheckboxGroup>
  );
}

/* Radio cards: same RadioGroup behaviour, larger hit area with a title and description */
export function RadioCard({ title, description, value, badge }) {
  return (
    <RAC.Radio value={value} className="tv-radio-card">
      <span className="tv-radio-dot" />
      <span className="tv-radio-card-body">
        <span className="tv-radio-card-title">{title}{badge}</span>
        <span className="tv-desc">{description}</span>
      </span>
    </RAC.Radio>
  );
}

export function Form({ children, ...props }) {
  return <RAC.Form {...props} className="tv-form">{children}</RAC.Form>;
}

/* =========================================================
   DATES & TIMES
   ========================================================= */
const Segments = (props) => (
  <RAC.DateInput {...props} className="tv-dateinput">
    {(seg) => <RAC.DateSegment segment={seg} className="tv-segment" />}
  </RAC.DateInput>
);
const CalendarHeader = () => (
  <header>
    <RAC.Button slot="previous" className="tv-icon-btn"><Icon.ChevronLeft className="tv-flip" /></RAC.Button>
    <RAC.Heading />
    <RAC.Button slot="next" className="tv-icon-btn"><Icon.ChevronRight className="tv-flip" /></RAC.Button>
  </header>
);

export function DateField({ label, description, ...props }) {
  return (
    <RAC.DateField {...props} className="tv-field">
      <RAC.Label className="tv-label">{label}</RAC.Label>
      <div className="tv-dategroup"><Segments /></div>
      <Desc>{description}</Desc>
      <FieldError />
    </RAC.DateField>
  );
}
export function TimeField({ label, description, ...props }) {
  return (
    <RAC.TimeField {...props} className="tv-field">
      <RAC.Label className="tv-label">{label}</RAC.Label>
      <div className="tv-dategroup"><Segments /><Icon.Clock className="tv-field-icon" /></div>
      <Desc>{description}</Desc>
      <FieldError />
    </RAC.TimeField>
  );
}
export function Calendar(props) {
  return (
    <RAC.Calendar {...props} className="tv-calendar tv-calendar--card">
      <CalendarHeader />
      <RAC.CalendarGrid>{(date) => <RAC.CalendarCell date={date} className="tv-cell" />}</RAC.CalendarGrid>
    </RAC.Calendar>
  );
}
export function RangeCalendar(props) {
  return (
    <RAC.RangeCalendar {...props} className="tv-calendar tv-calendar--card tv-range">
      <CalendarHeader />
      <RAC.CalendarGrid>{(date) => <RAC.CalendarCell date={date} className="tv-cell" />}</RAC.CalendarGrid>
    </RAC.RangeCalendar>
  );
}
export function DateRangePicker({ label, description, ...props }) {
  const m = useMessages();
  return (
    <RAC.DateRangePicker {...props} className="tv-field">
      <RAC.Label className="tv-label">{label}</RAC.Label>
      <RAC.Group className="tv-dategroup">
        <div className="tv-range-inputs">
          <Segments slot="start" />
          <span aria-hidden="true" className="tv-range-dash">–</span>
          <Segments slot="end" />
        </div>
        <RAC.Button className="tv-icon-btn" style={{ marginInlineEnd: 4 }}><Icon.Calendar /></RAC.Button>
      </RAC.Group>
      <Desc>{description}</Desc>
      <FieldError />
      <RAC.Popover className="tv-popover" offset={6} style={{ maxHeight: "none" }}>
        <RAC.Dialog className="tv-focus" aria-label={m.chooseDate}>
          <RAC.RangeCalendar className="tv-calendar tv-range">
            <CalendarHeader />
            <RAC.CalendarGrid>{(date) => <RAC.CalendarCell date={date} className="tv-cell" />}</RAC.CalendarGrid>
          </RAC.RangeCalendar>
        </RAC.Dialog>
      </RAC.Popover>
    </RAC.DateRangePicker>
  );
}

/* =========================================================
   SELECTION & COLLECTIONS
   ========================================================= */
export function ListBox({ children, ...props }) {
  return <RAC.ListBox {...props} className="tv-listbox tv-listbox--card">{children}</RAC.ListBox>;
}
export function ListBoxSection({ title, children, ...props }) {
  return (
    <RAC.ListBoxSection {...props} className="tv-section">
      <RAC.Header className="tv-section-head">{title}</RAC.Header>
      {children}
    </RAC.ListBoxSection>
  );
}

/* Drag handle.
   React Aria disables pointer events on the drag button (the mouse drags the whole row; the button is for
   keyboard and screen-reader dragging). Two browser details then get in the way of grabbing the grip:
   1. the cursor comes from whatever is under the pointer, so the grip zone owns the "grab" cursor;
   2. in a Table, pressing a cell moves focus into the button inside it, and that focus move cancels the
      native drag. While the pointer is down on the grip we mark the button inert so focus stays on the
      cell, then restore it, so keyboard dragging keeps working. */
function DragHandle({ label }) {
  const onPointerDown = (e) => {
    const btn = e.currentTarget.querySelector(".tv-drag-btn");
    if (!btn) return;
    btn.inert = true;
    const restore = () => {
      btn.inert = false;
      ["pointerup", "pointercancel", "dragend", "drop"].forEach((t) => window.removeEventListener(t, restore, true));
    };
    ["pointerup", "pointercancel", "dragend", "drop"].forEach((t) => window.addEventListener(t, restore, true));
  };
  return (
    <span className="tv-drag-zone" onPointerDownCapture={onPointerDown}>
      <Icon.Grip className="tv-drag-icon" />
      <RAC.Button slot="drag" className="tv-drag-btn" aria-label={label} />
    </span>
  );
}

export function GridList({ children, ...props }) {
  return <RAC.GridList {...props} className="tv-gridlist">{children}</RAC.GridList>;
}
export function GridListItem({ children, textValue, actions, ...props }) {
  const m = useM();
  return (
    <RAC.GridListItem {...props} textValue={textValue} className="tv-gridlist-item">
      {({ selectionMode, allowsDragging }) => (
        <>
          {allowsDragging && <DragHandle label={m.drag} />}
          {selectionMode === "multiple" && <Checkbox slot="selection" />}
          <div className="tv-gridlist-content">{children}</div>
          {actions}
        </>
      )}
    </RAC.GridListItem>
  );
}

/* Command menu: Autocomplete = search field + filtered menu, focus stays in the field */
export function CommandMenu({ label, placeholder, items, onAction, children, renderEmpty }) {
  const { contains } = RAC.useFilter({ sensitivity: "base" });
  return (
    <div className="tv-command">
      <RAC.Autocomplete filter={contains}>
        <RAC.SearchField aria-label={label} className="tv-command-search" autoFocus>
          <Icon.Search className="tv-search-icon" />
          <RAC.Input className="tv-input" placeholder={placeholder} dir="auto" />
        </RAC.SearchField>
        <RAC.Menu items={items} onAction={onAction} className="tv-listbox tv-command-list"
          renderEmptyState={renderEmpty}>
          {children}
        </RAC.Menu>
      </RAC.Autocomplete>
    </div>
  );
}

/* =========================================================
   NAVIGATION
   ========================================================= */
export function Breadcrumbs({ items, ...props }) {
  return (
    <RAC.Breadcrumbs {...props} className="tv-breadcrumbs">
      {items.map((it, i) => (
        <RAC.Breadcrumb key={i} className="tv-crumb">
          <RAC.Link href={it.href} className="tv-crumb-link">{it.label}</RAC.Link>
          {i < items.length - 1 && <Icon.ChevronRight className="tv-crumb-sep tv-flip" />}
        </RAC.Breadcrumb>
      ))}
    </RAC.Breadcrumbs>
  );
}
export function Disclosure({ title, children, badge, ...props }) {
  return (
    <RAC.Disclosure {...props} className="tv-disclosure">
      <RAC.Heading className="tv-disclosure-heading">
        <RAC.Button slot="trigger" className="tv-disclosure-trigger">
          <Icon.ChevronRight className="tv-disclosure-chevron tv-flip" />
          <span>{title}</span>{badge}
        </RAC.Button>
      </RAC.Heading>
      <RAC.DisclosurePanel className="tv-disclosure-panel">
        <div className="tv-disclosure-inner">{children}</div>
      </RAC.DisclosurePanel>
    </RAC.Disclosure>
  );
}
export function Accordion({ children, ...props }) {
  return <RAC.DisclosureGroup {...props} className="tv-accordion">{children}</RAC.DisclosureGroup>;
}

export function Pagination({ page, pageCount, onChange }) {
  const m = useM();
  const f = useFormat();
  const pages = [];
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <nav className="tv-pagination" aria-label={m.pagination}>
      <RAC.Button className="tv-icon-btn" aria-label={m.prev} isDisabled={page <= 1} onPress={() => onChange(page - 1)}>
        <Icon.ChevronLeft className="tv-flip" />
      </RAC.Button>
      {pages.map((p, i) => p === "…"
        ? <span key={"e" + i} className="tv-page-gap" aria-hidden="true">…</span>
        : <RAC.Button key={p} className="tv-page" aria-label={m.page(f.number(p))}
            aria-current={p === page ? "page" : undefined} onPress={() => onChange(p)}>{f.number(p)}</RAC.Button>)}
      <RAC.Button className="tv-icon-btn" aria-label={m.next} isDisabled={page >= pageCount} onPress={() => onChange(page + 1)}>
        <Icon.ChevronRight className="tv-flip" />
      </RAC.Button>
    </nav>
  );
}

/* =========================================================
   OVERLAYS
   ========================================================= */
/* Drawer: a Modal pinned to the start or end edge. "start" is left in English and right in Arabic. */
export function Drawer({ isOpen, onOpenChange, side = "end", title, subtitle, header, children, footer, width = 480 }) {
  const m = useM();
  return (
    <RAC.ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable className="tv-overlay tv-overlay--drawer">
      <RAC.Modal className="tv-drawer" data-side={side} style={{ "--drawer-w": width + "px" }}>
        <RAC.Dialog className="tv-drawer-dialog">
          {({ close }) => (
            <>
              <div className="tv-drawer-head">
                <div className="tv-drawer-head-main">
                  {header ?? (
                    <>
                      <RAC.Heading slot="title" className="tv-drawer-title">{title}</RAC.Heading>
                      {subtitle && <p className="tv-desc" style={{ margin: 0 }}>{subtitle}</p>}
                    </>
                  )}
                </div>
                <RAC.Button className="tv-icon-btn" aria-label={m.close} onPress={close}><Icon.X /></RAC.Button>
              </div>
              <div className="tv-drawer-body">{typeof children === "function" ? children({ close }) : children}</div>
              {footer && <div className="tv-drawer-foot">{typeof footer === "function" ? footer({ close }) : footer}</div>}
            </>
          )}
        </RAC.Dialog>
      </RAC.Modal>
    </RAC.ModalOverlay>
  );
}

/* Controlled dialog with an optional "type the name to confirm" guard */
export function ConfirmDialog({ isOpen, onOpenChange, title, children, confirmLabel, tone = "primary", requireText, onConfirm, icon, size }) {
  const m = useM();
  const [typed, setTyped] = useState("");
  useEffect(() => { if (!isOpen) setTyped(""); }, [isOpen]);
  const blocked = requireText && typed.trim() !== requireText;
  return (
    <RAC.ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={tone !== "danger"} className="tv-overlay">
      <RAC.Modal className={cx("tv-modal", size === "full" && "tv-modal--full")}>
        <RAC.Dialog className="tv-dialog" role={tone === "danger" ? "alertdialog" : "dialog"}>
          {({ close }) => (
            <>
              {icon && <div className={cx("tv-dialog-icon", `is-${tone}`)}>{icon}</div>}
              <RAC.Heading slot="title">{title}</RAC.Heading>
              <div className="tv-dialog-body">{children}</div>
              {requireText && (
                <TextField label={m.typeToConfirm(requireText)} value={typed} onChange={setTyped} autoFocus />
              )}
              <div className="tv-dialog-actions">
                <Button variant="ghost" onPress={close}>{m.cancel}</Button>
                <Button variant={tone === "danger" ? "danger-solid" : "primary"} isDisabled={blocked}
                  onPress={() => { onConfirm?.(); close(); }}>{confirmLabel}</Button>
              </div>
            </>
          )}
        </RAC.Dialog>
      </RAC.Modal>
    </RAC.ModalOverlay>
  );
}

export function InfoPopover({ trigger, title, children, placement = "bottom" }) {
  return (
    <RAC.DialogTrigger>
      {trigger}
      <RAC.Popover className="tv-popover tv-popover--info" placement={placement} offset={10}>
        <RAC.OverlayArrow className="tv-arrow">
          <svg width={14} height={8} viewBox="0 0 14 8"><path d="M0 0 L7 7 L14 0" /></svg>
        </RAC.OverlayArrow>
        <RAC.Dialog className="tv-popover-dialog">
          {title && <RAC.Heading slot="title" className="tv-popover-title">{title}</RAC.Heading>}
          {children}
        </RAC.Dialog>
      </RAC.Popover>
    </RAC.DialogTrigger>
  );
}

export function MenuSection({ title, children, ...props }) {
  return (
    <RAC.MenuSection {...props} className="tv-section">
      {title && <RAC.Header className="tv-section-head">{title}</RAC.Header>}
      {children}
    </RAC.MenuSection>
  );
}
export function SelectableMenuItem({ children, ...props }) {
  return (
    <RAC.MenuItem {...props} textValue={typeof children === "string" ? children : props.textValue} className="tv-item">
      {children}
      <Icon.Check className="tv-check-icon" />
    </RAC.MenuItem>
  );
}
export function Submenu({ label, icon, children }) {
  return (
    <RAC.SubmenuTrigger>
      <RAC.MenuItem textValue={label} className="tv-item">{icon}{label}<Icon.ChevronRight className="tv-submenu-chev tv-flip" /></RAC.MenuItem>
      <RAC.Popover className="tv-popover" offset={-4}>
        <RAC.Menu className="tv-listbox">{children}</RAC.Menu>
      </RAC.Popover>
    </RAC.SubmenuTrigger>
  );
}

/* =========================================================
   FEEDBACK
   ========================================================= */
/* Toasts — React Aria's ToastQueue + ToastRegion. Call toast({...}) from anywhere. */
export const toastQueue = new RAC.UNSTABLE_ToastQueue({ maxVisibleToasts: 4 });
export function toast(content, options = {}) {
  return toastQueue.add(content, { timeout: content.action ? 8000 : 5000, ...options });
}
const TONE_ICON = { success: Icon.CheckCircle, danger: Icon.XCircle, warning: Icon.AlertTriangle, info: Icon.Info };
export function ToastRegion() {
  const m = useM();
  return (
    <RAC.UNSTABLE_ToastRegion queue={toastQueue} className="tv-toast-region">
      {({ toast: t }) => {
        const I = TONE_ICON[t.content.tone ?? "info"];
        return (
          <RAC.UNSTABLE_Toast toast={t} className={cx("tv-toast", `is-${t.content.tone ?? "info"}`)}>
            <I className="tv-toast-icon" />
            <RAC.UNSTABLE_ToastContent className="tv-toast-content">
              <RAC.Text slot="title" className="tv-toast-title">{t.content.title}</RAC.Text>
              {t.content.description && <RAC.Text slot="description" className="tv-toast-desc">{t.content.description}</RAC.Text>}
            </RAC.UNSTABLE_ToastContent>
            {t.content.action && (
              <RAC.Button className="tv-toast-action" onPress={() => { t.content.action.onAction(); toastQueue.close(t.key); }}>
                {t.content.action.label}
              </RAC.Button>
            )}
            <RAC.Button slot="close" className="tv-icon-btn tv-toast-close" aria-label={m.close}><Icon.X /></RAC.Button>
          </RAC.UNSTABLE_Toast>
        );
      }}
    </RAC.UNSTABLE_ToastRegion>
  );
}

/* Inline alert banner. Danger uses role="alert"; the rest are polite status messages. */
export function Banner({ tone = "info", title, children, action, onDismiss }) {
  const m = useM();
  const I = TONE_ICON[tone];
  return (
    <div className={cx("tv-banner", `is-${tone}`)} role={tone === "danger" ? "alert" : "status"}>
      <I className="tv-banner-icon" />
      <div className="tv-banner-body">
        {title && <p className="tv-banner-title">{title}</p>}
        {children && <p className="tv-banner-text">{children}</p>}
        {action && <div className="tv-banner-actions">{action}</div>}
      </div>
      {onDismiss && <RAC.Button className="tv-icon-btn" aria-label={m.dismiss} onPress={onDismiss}><Icon.X /></RAC.Button>}
    </div>
  );
}

export function ProgressBar({ label, showValue = true, ...props }) {
  return (
    <RAC.ProgressBar {...props} className="tv-progress">
      {({ percentage, valueText, isIndeterminate }) => (
        <>
          <div className="tv-progress-head">
            <RAC.Label className="tv-label">{label}</RAC.Label>
            {showValue && !isIndeterminate && <span className="tv-progress-value">{valueText}</span>}
          </div>
          <div className="tv-progress-track">
            <div className={cx("tv-progress-fill", isIndeterminate && "is-indeterminate")} style={isIndeterminate ? undefined : { width: percentage + "%" }} />
          </div>
        </>
      )}
    </RAC.ProgressBar>
  );
}
/* Meter: a known quantity within a range. Over 90% turns danger, and the label says so too. */
export function Meter({ label, warnAt = 75, dangerAt = 90, statusText, ...props }) {
  return (
    <RAC.Meter {...props} className="tv-progress">
      {({ percentage, valueText }) => {
        const tone = percentage >= dangerAt ? "danger" : percentage >= warnAt ? "warning" : "ok";
        return (
          <>
            <div className="tv-progress-head">
              <RAC.Label className="tv-label">{label}</RAC.Label>
              <span className={cx("tv-progress-value", `is-${tone}`)}>{valueText}{statusText?.[tone] ? ` · ${statusText[tone]}` : ""}</span>
            </div>
            <div className="tv-progress-track">
              <div className={cx("tv-progress-fill", `is-${tone}`)} style={{ width: percentage + "%" }} />
            </div>
          </>
        );
      }}
    </RAC.Meter>
  );
}

export function Skeleton({ lines = 3, avatar }) {
  return (
    <div className="tv-skeleton" aria-hidden="true">
      {avatar && <span className="tv-skel tv-skel--avatar" />}
      <div className="tv-skel-lines">
        {Array.from({ length: lines }, (_, i) => <span key={i} className="tv-skel" style={{ width: `${[92, 76, 54, 68][i % 4]}%` }} />)}
      </div>
    </div>
  );
}

/* Notification centre: bell button + popover list (GridList) */
export function NotificationCenter({ items, onMarkAllRead, onOpenItem, label }) {
  const m = useM();
  const unread = items.filter((i) => i.unread).length;
  const f = useFormat();
  return (
    <RAC.DialogTrigger>
      <RAC.Button className="tv-icon-btn tv-bell" aria-label={`${label ?? m.notifications}${unread ? ` (${f.number(unread)})` : ""}`}>
        <Icon.Bell />
        {unread > 0 && <span className="tv-bell-count" aria-hidden="true">{f.number(unread)}</span>}
      </RAC.Button>
      <RAC.Popover className="tv-popover tv-notif-pop" placement="bottom end" offset={8}>
        <RAC.Dialog className="tv-notif-dialog" aria-label={m.notifications}>
          <div className="tv-notif-head">
            <RAC.Heading slot="title" className="tv-popover-title">{m.notifications}</RAC.Heading>
            {unread > 0 && <Button variant="ghost" size="sm" onPress={onMarkAllRead}>{m.markRead}</Button>}
          </div>
          <RAC.GridList aria-label={m.notifications} items={items} className="tv-notif-list" onAction={onOpenItem}
            renderEmptyState={() => <div className="tv-empty-mini">{m.nothingNew}</div>}>
            {(n) => (
              <RAC.GridListItem id={n.id} textValue={n.title} className={cx("tv-notif", n.unread && "is-unread")}>
                <span className="tv-notif-icon">{n.icon}</span>
                <span className="tv-notif-text">
                  <span className="tv-notif-title">{n.title}</span>
                  <span className="tv-desc">{n.time}</span>
                </span>
                {n.unread && <span className="tv-unread-dot" aria-hidden="true" />}
              </RAC.GridListItem>
            )}
          </RAC.GridList>
        </RAC.Dialog>
      </RAC.Popover>
    </RAC.DialogTrigger>
  );
}

/* =========================================================
   BRAND COMPONENTS (plain elements styled with tokens)
   ========================================================= */
export function Badge({ tone = "neutral", children, dot }) {
  return <span className={cx("tv-badge", `is-${tone}`)}>{dot && <span className="tv-badge-dot" />}{children}</span>;
}
export function Card({ children, className, ...props }) {
  return <div {...props} className={cx("tv-card", className)}>{children}</div>;
}
export function StatTile({ label, value, delta, deltaLabel, trend = "up", good = true }) {
  const I = trend === "up" ? Icon.TrendUp : Icon.TrendDown;
  return (
    <div className="tv-stat">
      <span className="tv-stat-label">{label}</span>
      <span className="tv-stat-value">{value}</span>
      {delta && <span className={cx("tv-stat-delta", good ? "is-good" : "is-bad")}><I />{delta} <span className="tv-desc">{deltaLabel}</span></span>}
    </div>
  );
}
const AV_TONES = ["navy", "bronze", "slate", "green"];
export function Avatar({ name, size = 32, tone }) {
  const initials = /[\u0600-\u06FF]/.test(name) ? name.trim()[0] : name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
  const t = tone ?? AV_TONES[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % AV_TONES.length];
  return <span className={cx("tv-avatar-i", `is-${t}`)} style={{ width: size, height: size, fontSize: size * 0.38 }} title={name}>{initials}</span>;
}
export function EmptyState({ title, children, action, icon }) {
  return (
    <div className="tv-empty">
      <div className="tv-empty-art">{icon ?? <OrbitMark size={56} />}</div>
      <p className="tv-empty-title">{title}</p>
      {children && <p className="tv-desc tv-empty-text">{children}</p>}
      {action}
    </div>
  );
}

/* =========================================================
   TABLES
   ========================================================= */
export function Table({ children, className, ...props }) {
  return <RAC.Table {...props} className={cx("tv-table", className)}>{children}</RAC.Table>;
}
export function TableHeader({ children, ...props }) {
  return <RAC.TableHeader {...props} className="tv-thead">{children}</RAC.TableHeader>;
}
export function Column({ children, allowsSorting, resizable, align, ...props }) {
  return (
    <RAC.Column {...props} allowsSorting={allowsSorting} className={cx("tv-th", align === "end" && "is-end")}>
      {({ sortDirection, allowsSorting: s }) => (
        <div className="tv-th-inner">
          <span className="tv-th-label">{children}</span>
          {s && (
            <span className={cx("tv-sort", sortDirection && "is-active")} aria-hidden="true">
              {sortDirection === "descending" ? <Icon.ArrowDown /> : <Icon.ArrowUp />}
            </span>
          )}
          {resizable && <RAC.ColumnResizer className="tv-resizer" />}
        </div>
      )}
    </RAC.Column>
  );
}
export function SelectionColumn() {
  return <RAC.Column className="tv-th tv-th--check"><Checkbox slot="selection" /></RAC.Column>;
}
export function DragColumn() {
  return <RAC.Column className="tv-th tv-th--check" aria-label=" " />;
}
export function TableBody(props) {
  return <RAC.TableBody {...props} className="tv-tbody" />;
}
export function Row({ children, ...props }) {
  const m = useM();
  const { selectionMode, selectionBehavior, allowsDragging } = RAC.useTableOptions();
  return (
    <RAC.Row {...props} className="tv-tr">
      {allowsDragging && <RAC.Cell className="tv-td tv-td--check"><DragHandle label={m.drag} /></RAC.Cell>}
      {selectionMode === "multiple" && selectionBehavior === "toggle" && <RAC.Cell className="tv-td tv-td--check"><Checkbox slot="selection" /></RAC.Cell>}
      {children}
    </RAC.Row>
  );
}
export function Cell({ children, align, ...props }) {
  return <RAC.Cell {...props} className={cx("tv-td", align === "end" && "is-end")}>{children}</RAC.Cell>;
}
export function ResizableTable({ children }) {
  return <RAC.ResizableTableContainer className="tv-table-scroll tv-table-resizable">{children}</RAC.ResizableTableContainer>;
}

/* =========================================================
   TREE (expandable rows)
   ========================================================= */
export function Tree({ children, className, ...props }) {
  return <RAC.Tree {...props} className={cx("tv-tree", className)}>{children}</RAC.Tree>;
}
export function TreeItem({ title, textValue, children, cells, icon, ...props }) {
  const m = useM();
  return (
    <RAC.TreeItem {...props} textValue={textValue ?? (typeof title === "string" ? title : "")} className="tv-tree-item">
      <RAC.TreeItemContent>
        {({ hasChildItems, level }) => (
          <div className="tv-tree-row" style={{ "--level": level }}>
            <div className="tv-tree-main">
              {hasChildItems
                ? <RAC.Button slot="chevron" className="tv-icon-btn tv-tree-chev" aria-label={m.expand}><Icon.ChevronRight className="tv-flip" /></RAC.Button>
                : <span className="tv-tree-spacer" />}
              {icon}
              <span className="tv-tree-title">{title}</span>
            </div>
            {cells}
          </div>
        )}
      </RAC.TreeItemContent>
      {children}
    </RAC.TreeItem>
  );
}

/* =========================================================
   COLOUR
   ========================================================= */
export function ColorPickerPanel({ label, swatches = [], ...props }) {
  const m = useM();
  return (
    <RAC.ColorPicker {...props}>
      <div className="tv-colorpicker">
        <RAC.ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" className="tv-color-area">
          <RAC.ColorThumb className="tv-color-thumb" />
        </RAC.ColorArea>
        <RAC.ColorSlider colorSpace="hsb" channel="hue" className="tv-color-slider">
          <RAC.Label className="tv-label">{m.hue}</RAC.Label>
          <RAC.SliderOutput className="tv-desc" />
          <RAC.SliderTrack className="tv-color-track">
            <RAC.ColorThumb className="tv-color-thumb" />
          </RAC.SliderTrack>
        </RAC.ColorSlider>
        <RAC.ColorField className="tv-field">
          <RAC.Label className="tv-label">{label ?? m.color}</RAC.Label>
          <RAC.Input className="tv-input" dir="ltr" />
        </RAC.ColorField>
        {swatches.length > 0 && (
          <RAC.ColorSwatchPicker className="tv-swatch-picker">
            {swatches.map((s) => (
              <RAC.ColorSwatchPickerItem key={s} color={s} className="tv-swatch-item">
                <RAC.ColorSwatch className="tv-swatch" />
              </RAC.ColorSwatchPickerItem>
            ))}
          </RAC.ColorSwatchPicker>
        )}
      </div>
    </RAC.ColorPicker>
  );
}
export function ColorWheel(props) {
  return (
    <RAC.ColorWheel outerRadius={96} innerRadius={70} {...props} className="tv-color-wheel">
      <RAC.ColorWheelTrack className="tv-wheel-track" />
      <RAC.ColorThumb className="tv-color-thumb" />
    </RAC.ColorWheel>
  );
}
export const ColorSwatch = (p) => <RAC.ColorSwatch {...p} className="tv-swatch" />;

/* =========================================================
   DRAG & DROP
   ========================================================= */
export function DropZone({ children, ...props }) {
  return <RAC.DropZone {...props} className="tv-dropzone">{children}</RAC.DropZone>;
}
export { useDragAndDrop, useListData, useFilter, isTextDropItem, isFileDropItem } from "react-aria-components";
