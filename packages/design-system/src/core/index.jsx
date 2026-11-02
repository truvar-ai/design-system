// @truvar-ai/design-system — Truvar.ai components built on React Aria Components.
// React Aria supplies behaviour + accessibility; this file supplies the Truvar look and API.
import { useState, useRef, useEffect } from "react";
import * as RAC from "react-aria-components";
import * as Icon from "../icons/icons.jsx";
import { OrbitMark } from "../brand/Brand.jsx";
import { numberFormat } from "./format.js";

/* Built-in strings, so every product gets the same wording in both languages */
const MESSAGES = {
  en: { choose: "Choose an option", noMatches: "No matches. Try another name.", chooseDate: "Choose a date",
        pressAgain: "Press again to confirm", notRated: "Not rated yet", of: (n, m) => `${n} of ${m}`, remove: "Remove", clear: "Clear search" },
  ar: { choose: "اختر خيارًا", noMatches: "لا توجد نتائج. جرّب اسمًا آخر.", chooseDate: "اختر تاريخًا",
        pressAgain: "اضغط مرة أخرى للتأكيد", notRated: "لم تُقيَّم بعد", of: (n, m) => `${n} من ${m}`, remove: "إزالة", clear: "مسح البحث" },
};
export function useMessages() {
  const { locale } = RAC.useLocale();
  return MESSAGES[locale.split("-")[0]] ?? MESSAGES.en;
}
const useNumber = () => {
  const { locale } = RAC.useLocale();
  return (n) => numberFormat(locale).format(n);
};

const cx = (...c) => c.filter(Boolean).join(" ");

/* ---------- Button ---------- */
export function Button({ variant = "primary", size = "md", className, children, ...props }) {
  return (
    <RAC.Button
      {...props}
      className={(s) => cx("tv-btn", `tv-btn--${variant}`, size === "sm" && "tv-btn--sm",
        typeof className === "function" ? className(s) : className)}
    >
      {(rp) => (
        <>
          {rp.isPending && <OrbitMark size={18} active />}
          {typeof children === "function" ? children(rp) : children}
        </>
      )}
    </RAC.Button>
  );
}

export function IconButton({ label, children, ...props }) {
  return <RAC.Button aria-label={label} className="tv-icon-btn" {...props}>{children}</RAC.Button>;
}

/* ---------- Shared field parts ---------- */
const FieldError = ({ children }) => (
  <RAC.FieldError className="tv-error">
    {(v) => <><Icon.Alert width={14} height={14} />{children ?? v.validationErrors.join(" ")}</>}
  </RAC.FieldError>
);
const Description = ({ children }) => children ? <RAC.Text slot="description" className="tv-desc">{children}</RAC.Text> : null;

/* ---------- TextField ---------- */
export function TextField({ label, description, errorMessage, placeholder, multiline, ...props }) {
  return (
    <RAC.TextField {...props} className="tv-field">
      <RAC.Label className="tv-label">{label}</RAC.Label>
      {multiline ? <RAC.TextArea className="tv-input" rows={3} placeholder={placeholder} dir="auto" />
                 : <RAC.Input className="tv-input" placeholder={placeholder} dir={props.type === "email" || props.type === "url" ? "ltr" : "auto"} />}
      <Description>{description}</Description>
      <FieldError>{errorMessage}</FieldError>
    </RAC.TextField>
  );
}

/* ---------- Checkbox / Switch / Radio ---------- */
export function Checkbox({ children, ...props }) {
  return (
    <RAC.Checkbox {...props} className="tv-check">
      {({ isIndeterminate }) => (
        <>
          <span className="tv-check-box">{isIndeterminate ? <Icon.Minus /> : <Icon.Check />}</span>
          {children}
        </>
      )}
    </RAC.Checkbox>
  );
}

export function Switch({ children, ...props }) {
  return (
    <RAC.Switch {...props} className="tv-switch">
      <span className="tv-switch-track" />
      {children}
    </RAC.Switch>
  );
}

export function RadioGroup({ label, description, children, cards, ...props }) {
  return (
    <RAC.RadioGroup {...props} className="tv-radiogroup">
      <RAC.Label className="tv-label">{label}</RAC.Label>
      <div className={cx("tv-radio-row", cards && "tv-radio-row--cards")}>{children}</div>
      <Description>{description}</Description>
      <FieldError />
    </RAC.RadioGroup>
  );
}
export function Radio({ children, ...props }) {
  return <RAC.Radio {...props} className="tv-radio"><span className="tv-radio-dot" />{children}</RAC.Radio>;
}

/* ---------- ListBox items (shared by Select / ComboBox) ---------- */
// icon: shown before the label, in the list and in the Select button once chosen (logos, avatars, flags)
export function Item({ children, description, icon, ...props }) {
  const textValue = props.textValue ?? (typeof children === "string" ? children : undefined);
  return (
    <RAC.ListBoxItem {...props} textValue={textValue} className="tv-item">
      {icon && <span className="tv-item-icon" aria-hidden="true">{icon}</span>}
      <span className="tv-item-text">
        <RAC.Text slot="label">{children}</RAC.Text>
        {description && <RAC.Text slot="description" className="tv-item-desc">{description}</RAC.Text>}
      </span>
      <Icon.Check className="tv-check-icon" />
    </RAC.ListBoxItem>
  );
}

/* ---------- Select ---------- */
export function Select({ label, description, placeholder, items, children, ...props }) {
  const m = useMessages();
  return (
    <RAC.Select {...props} placeholder={placeholder ?? m.choose} className="tv-field">
      {label && <RAC.Label className="tv-label">{label}</RAC.Label>}
      <RAC.Button className="tv-select-btn">
        <RAC.SelectValue className="tv-select-value" />
        <Icon.ChevronDown className="tv-select-chev" />
      </RAC.Button>
      <Description>{description}</Description>
      <FieldError />
      <RAC.Popover className="tv-popover" offset={6}>
        <RAC.ListBox className="tv-listbox" items={items}>{children}</RAC.ListBox>
      </RAC.Popover>
    </RAC.Select>
  );
}

/* ---------- ComboBox ---------- */
export function ComboBox({ label, description, placeholder, items, children, ...props }) {
  const m = useMessages();
  return (
    <RAC.ComboBox {...props} className="tv-field">
      <RAC.Label className="tv-label">{label}</RAC.Label>
      <RAC.Group className="tv-group">
        <RAC.Input className="tv-input" placeholder={placeholder} />
        <RAC.Button className="tv-icon-btn"><Icon.ChevronDown /></RAC.Button>
      </RAC.Group>
      <Description>{description}</Description>
      <FieldError />
      <RAC.Popover className="tv-popover" offset={6}>
        <RAC.ListBox className="tv-listbox" items={items}
          renderEmptyState={() => <div className="tv-item tv-desc">{m.noMatches}</div>}>
          {children}
        </RAC.ListBox>
      </RAC.Popover>
    </RAC.ComboBox>
  );
}

/* ---------- TagGroup (chips) ---------- */
export function TagGroup({ label, items, children, ...props }) {
  return (
    <RAC.TagGroup {...props} className="tv-field">
      <RAC.Label className="tv-label">{label}</RAC.Label>
      <RAC.TagList className="tv-taglist" items={items}>{children}</RAC.TagList>
    </RAC.TagGroup>
  );
}
export function Tag({ children, ...props }) {
  const m = useMessages();
  const textValue = typeof children === "string" ? children : undefined;
  return (
    <RAC.Tag {...props} textValue={textValue} className="tv-tag">
      {({ allowsRemoving }) => (
        <>
          {children}
          {allowsRemoving && <RAC.Button slot="remove" className="tv-icon-btn" aria-label={m.remove}><Icon.X /></RAC.Button>}
        </>
      )}
    </RAC.Tag>
  );
}

/* ---------- Tabs ---------- */
export const Tabs = (p) => <RAC.Tabs {...p} className="tv-tabs" />;
export const TabList = (p) => <RAC.TabList {...p} className="tv-tablist" />;
export const Tab = ({ children, ...p }) => (
  <RAC.Tab {...p} className="tv-tab">
    {children}
    <RAC.SelectionIndicator className="tv-tab-indicator" />
  </RAC.Tab>
);
export const TabPanel = (p) => <RAC.TabPanel {...p} className="tv-tabpanel" />;

/* ---------- Slider (one thumb or a range) ---------- */
export function Slider({ label, thumbLabels, ...props }) {
  return (
    <RAC.Slider {...props} className="tv-slider">
      {/* Without a visible label, the slider is named by aria-label; an empty label would leave it unnamed */}
      {label && <RAC.Label className="tv-label">{label}</RAC.Label>}
      <RAC.SliderOutput />
      <RAC.SliderTrack className="tv-slider-track">
        {({ state }) => {
          const n = state.values.length;
          const a = n > 1 ? state.getThumbPercent(0) : 0;
          const b = state.getThumbPercent(n - 1);
          return (
            <>
              <div className="tv-slider-fill" style={{ insetInlineStart: a * 100 + "%", width: (b - a) * 100 + "%" }} />
              {state.values.map((_, i) => <RAC.SliderThumb key={i} index={i} aria-label={thumbLabels?.[i]} className="tv-slider-thumb" />)}
            </>
          );
        }}
      </RAC.SliderTrack>
    </RAC.Slider>
  );
}

/* ---------- DatePicker ---------- */
export function DatePicker({ label, description, ...props }) {
  const m = useMessages();
  return (
    <RAC.DatePicker {...props} className="tv-field">
      <RAC.Label className="tv-label">{label}</RAC.Label>
      <RAC.Group className="tv-dategroup">
        <RAC.DateInput className="tv-dateinput">
          {(seg) => <RAC.DateSegment segment={seg} className="tv-segment" />}
        </RAC.DateInput>
        <RAC.Button className="tv-icon-btn" style={{ marginInlineEnd: 4 }}><Icon.Calendar /></RAC.Button>
      </RAC.Group>
      <Description>{description}</Description>
      <FieldError />
      <RAC.Popover className="tv-popover tv-popover--date" offset={6} placement="bottom end">
        <RAC.Dialog className="tv-focus" aria-label={m.chooseDate}>
          <RAC.Calendar className="tv-calendar">
            <header>
              <RAC.Button slot="previous" className="tv-icon-btn"><Icon.ChevronLeft className="tv-flip" /></RAC.Button>
              <RAC.Heading />
              <RAC.Button slot="next" className="tv-icon-btn"><Icon.ChevronRight className="tv-flip" /></RAC.Button>
            </header>
            <RAC.CalendarGrid>
              {(date) => <RAC.CalendarCell date={date} className="tv-cell" />}
            </RAC.CalendarGrid>
          </RAC.Calendar>
        </RAC.Dialog>
      </RAC.Popover>
    </RAC.DatePicker>
  );
}

/* ---------- Menu ---------- */
export function MenuButton({ label, icon, children, ...props }) {
  return (
    <RAC.MenuTrigger>
      {icon ? <RAC.Button aria-label={label} className="tv-icon-btn">{icon}</RAC.Button>
            : <Button variant="secondary">{label}<Icon.ChevronDown /></Button>}
      <RAC.Popover className="tv-popover" offset={6} placement="bottom end">
        <RAC.Menu {...props} className="tv-listbox">{children}</RAC.Menu>
      </RAC.Popover>
    </RAC.MenuTrigger>
  );
}
export function MenuItem({ children, icon, danger, ...props }) {
  const textValue = typeof children === "string" ? children : undefined;
  return (
    <RAC.MenuItem {...props} textValue={textValue} className={cx("tv-item", danger && "tv-item--danger")}>
      {icon}{children}
    </RAC.MenuItem>
  );
}
export const MenuSeparator = () => <RAC.Separator className="tv-separator" />;

/* ---------- Modal Dialog ---------- */
export function Modal({ trigger, title, children, isDismissable = true }) {
  return (
    <RAC.DialogTrigger>
      {trigger}
      <RAC.ModalOverlay className="tv-overlay" isDismissable={isDismissable}>
        <RAC.Modal className="tv-modal">
          <RAC.Dialog className="tv-dialog">
            {({ close }) => (
              <>
                <RAC.Heading slot="title">{title}</RAC.Heading>
                {typeof children === "function" ? children({ close }) : children}
              </>
            )}
          </RAC.Dialog>
        </RAC.Modal>
      </RAC.ModalOverlay>
    </RAC.DialogTrigger>
  );
}

/* ---------- Tooltip ---------- */
export function Tooltip({ content, children, placement, ...props }) {
  return (
    <RAC.TooltipTrigger delay={400} {...props}>
      {children}
      <RAC.Tooltip className="tv-tooltip" offset={8} placement={placement}>{content}</RAC.Tooltip>
    </RAC.TooltipTrigger>
  );
}

/* ---------- Segmented control (ToggleButtonGroup) ---------- */
export function SegmentedControl({ options, value, onChange, ...props }) {
  return (
    <RAC.ToggleButtonGroup {...props} className="tv-segmented" selectionMode="single" disallowEmptySelection
      selectedKeys={[value]} onSelectionChange={(keys) => onChange?.([...keys][0])}>
      {options.map((o) => (
        <RAC.ToggleButton key={o.id} id={o.id} lang={o.lang} className="tv-segment-btn">
          <RAC.SelectionIndicator className="tv-segment-indicator" />
          <span className="tv-segment-label">{o.label}</span>
        </RAC.ToggleButton>
      ))}
    </RAC.ToggleButtonGroup>
  );
}


/* ---------- SearchField ---------- */
export function SearchField({ label, placeholder, ...props }) {
  const m = useMessages();
  return (
    <RAC.SearchField {...props} className="tv-field tv-search">
      {label && <RAC.Label className="tv-label">{label}</RAC.Label>}
      <RAC.Group className="tv-group">
        <Icon.Search className="tv-search-icon" />
        <RAC.Input className="tv-input" placeholder={placeholder} dir="auto" />
        <RAC.Button className="tv-icon-btn tv-search-clear" aria-label={m.clear}><Icon.X /></RAC.Button>
      </RAC.Group>
    </RAC.SearchField>
  );
}

/* =====================================================================
   EXTENDING THE SYSTEM
   ===================================================================== */

/* 1) Custom behaviour on an existing component.
   ConfirmButton: a destructive Button that needs two presses. The first press
   "arms" it and changes the label; it disarms after 4 s or on blur.
   React Aria still handles press, keyboard, focus and disabled states. */
export function ConfirmButton({ children, confirmLabel, onConfirm, ...props }) {
  const m = useMessages();
  const [armed, setArmed] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const onPress = () => {
    if (armed) { clearTimeout(timer.current); setArmed(false); onConfirm?.(); return; }
    setArmed(true);
    timer.current = setTimeout(() => setArmed(false), 4000);
  };
  return (
    <Button variant="danger" {...props} onPress={onPress} onBlur={() => setArmed(false)}
      className={armed ? "is-armed" : undefined}>
      <Icon.Trash />
      <span aria-live="polite">{armed ? (confirmLabel ?? m.pressAgain) : children}</span>
    </Button>
  );
}

/* 2) A brand-new component, composed from React Aria primitives.
   Rating: React Aria has no rating component, so we build one from RadioGroup + Radio.
   We get arrow-key navigation, form submission, labelling and screen-reader
   support for free, and draw it with the orbit dots from the Truvar mark. */
export function Rating({ label, max = 5, value, defaultValue = 0, onChange, labels = [] }) {
  const m = useMessages();
  const fmt = useNumber();
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const [hover, setHover] = useState(null);
  const shown = hover ?? current;
  return (
    <RAC.RadioGroup
      className="tv-radiogroup" orientation="horizontal"
      value={current ? String(current) : null}
      onChange={(v) => { setInner(Number(v)); onChange?.(Number(v)); }}
    >
      <RAC.Label className="tv-label">{label}</RAC.Label>
      <div className="tv-rating-row" onMouseLeave={() => setHover(null)}>
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <RAC.Radio key={n} value={String(n)} aria-label={labels[n - 1] ?? m.of(fmt(n), fmt(max))}
            className={cx("tv-rating-dot", n <= shown && "is-filled")}
            onHoverStart={() => setHover(n)}>
            <span />
          </RAC.Radio>
        ))}
      </div>
      <span className="tv-desc">{shown ? (labels[shown - 1] ?? m.of(fmt(shown), fmt(max))) : m.notRated}</span>
    </RAC.RadioGroup>
  );
}

export * from "./more.jsx";
export * from "./intl.jsx";
export { Flag } from "./Flag.jsx";
export * from "./countries.js";
export * from "./format.js";
export * from "./phase2.jsx";
export * from "./bottomnav.jsx";
export * from "./systembars.js";
export * from "./shell.jsx";
export { Logo, OrbitMark, BrandAvatar, OrbitLoader, BrandProvider, useBrand, BRANDS } from "../brand/Brand.jsx";
export { EasySocialsMark } from "../brand/EasySocials.jsx";
