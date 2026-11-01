// @truvar/ui phase 2: the newer React Aria components, styled for Truvar.
import React, { useState, useMemo } from "react";
import * as RAC from "react-aria-components";
import * as Icon from "../icons/icons.jsx";
import { OrbitMark } from "./index.jsx";

const cx = (...c) => c.filter(Boolean).join(" ");
const useLang = () => (RAC.useLocale().locale.startsWith("ar") ? "ar" : "en");
const L = (en, ar) => ({ en, ar });
const pick = (lang, o) => (lang === "ar" ? o.ar : o.en);

/* =====================================================================
   SHEET: panels that slide in from any edge and can be swiped closed.
   ===================================================================== */
export function Sheet({ trigger, title, position = "bottom", snapPoints, children, footer }) {
  const lang = useLang();
  return (
    <RAC.SheetTrigger>
      {trigger}
      <RAC.SheetOverlay position={position} snapPoints={snapPoints} className="tv-sheet-overlay">
        <RAC.SheetBackdrop className="tv-sheet-backdrop" />
        <RAC.Sheet className={({ position: p }) => cx("tv-sheet", `is-${p}`)}>
          <RAC.SheetContent className="tv-sheet-content">
            {({ close }) => (
              <>
                {(position === "bottom" || position === "top") && <span className="tv-sheet-handle" aria-hidden="true" />}
                <div className="tv-sheet-head">
                  <RAC.Heading slot="title" className="tv-drawer-title">{title}</RAC.Heading>
                  <RAC.Button className="tv-icon-btn" aria-label={lang === "ar" ? "إغلاق" : "Close"} onPress={close}><Icon.X /></RAC.Button>
                </div>
                <div className="tv-sheet-body">{typeof children === "function" ? children({ close }) : children}</div>
                {footer && <div className="tv-sheet-foot">{typeof footer === "function" ? footer({ close }) : footer}</div>}
              </>
            )}
          </RAC.SheetContent>
        </RAC.Sheet>
      </RAC.SheetOverlay>
    </RAC.SheetTrigger>
  );
}

/* =====================================================================
   TOKEN FIELD: text with inline variable tokens (prompt editor).
   ===================================================================== */
export const TokenFieldValue = RAC.TokenFieldValue;
export function PromptEditor({ label, description, variables, value, onChange, placeholder }) {
  const lang = useLang();
  const insert = (id) => {
    const v = variables.find((x) => x.id === id);
    if (!v) return;
    const { start, end } = value.selectedRange;
    onChange(value.replaceRangeWithSegments(start, end, [{ type: "token", text: pick(lang, v.label), value: v.id }, { type: "text", text: " " }]));
  };
  return (
    <RAC.TokenField value={value} onChange={onChange} className="tv-field tv-tokenfield">
      <div className="tv-tokenfield-head">
        <RAC.Label className="tv-label">{label}</RAC.Label>
        <RAC.MenuTrigger>
          <RAC.Button className="tv-btn tv-btn--ghost tv-btn--sm"><Icon.Plus />{lang === "ar" ? "إدراج متغير" : "Insert variable"}</RAC.Button>
          <RAC.Popover className="tv-popover" offset={6} placement="bottom end">
            <RAC.Menu className="tv-listbox" onAction={insert} items={variables}>
              {(v) => (
                <RAC.MenuItem id={v.id} textValue={pick(lang, v.label)} className="tv-item">
                  <span className="tv-token tv-token--menu">{"{ }"}</span>{pick(lang, v.label)}
                  {v.example && <span className="tv-item-desc tv-token-example" dir="auto">{pick(lang, v.example)}</span>}
                </RAC.MenuItem>
              )}
            </RAC.Menu>
          </RAC.Popover>
        </RAC.MenuTrigger>
      </div>
      <RAC.TokenInput className="tv-tokeninput" data-placeholder={placeholder} dir="auto">
        {(segment) => <RAC.Token className="tv-token"><span className="tv-token-brace" aria-hidden="true">{"{ }"}</span>{segment.text}</RAC.Token>}
      </RAC.TokenInput>
      {description && <RAC.Text slot="description" className="tv-desc">{description}</RAC.Text>}
    </RAC.TokenField>
  );
}

/* =====================================================================
   FIELD CONTROLS: checkbox, radio and switch with a description and error
   (CheckboxField + CheckboxButton, RadioField + RadioButton, SwitchField + SwitchButton).
   ===================================================================== */
export function SwitchRow({ label, description, icon, ...props }) {
  return (
    <RAC.SwitchField {...props} className="tv-setting">
      <RAC.SwitchButton className="tv-setting-btn">
        {icon && <span className="tv-setting-icon">{icon}</span>}
        <span className="tv-setting-label">{label}</span>
        <span className="tv-switch-track tv-setting-control" />
      </RAC.SwitchButton>
      {description && <RAC.Text slot="description" className="tv-desc tv-setting-desc">{description}</RAC.Text>}
    </RAC.SwitchField>
  );
}
export function CheckboxRow({ label, description, ...props }) {
  return (
    <RAC.CheckboxField {...props} className="tv-setting tv-setting--check">
      <RAC.CheckboxButton className="tv-check">
        {({ isIndeterminate }) => (
          <><span className="tv-check-box">{isIndeterminate ? <Icon.Minus /> : <Icon.Check />}</span><span className="tv-setting-label">{label}</span></>
        )}
      </RAC.CheckboxButton>
      {description && <RAC.Text slot="description" className="tv-desc tv-setting-desc">{description}</RAC.Text>}
      <RAC.FieldError className="tv-error" />
    </RAC.CheckboxField>
  );
}
export function RadioRow({ label, description, value }) {
  return (
    <RAC.RadioField value={value} className="tv-setting tv-setting--check">
      <RAC.RadioButton className="tv-radio"><span className="tv-radio-dot" /><span className="tv-setting-label">{label}</span></RAC.RadioButton>
      {description && <RAC.Text slot="description" className="tv-desc tv-setting-desc">{description}</RAC.Text>}
    </RAC.RadioField>
  );
}

/* =====================================================================
   CALENDAR WITH MONTH AND YEAR PICKERS
   ===================================================================== */
function MiniSelect({ aria, value, onChange, items }) {
  return (
    <RAC.Select aria-label={aria} selectedKey={value} onSelectionChange={onChange} className="tv-miniselect">
      <RAC.Button className="tv-miniselect-btn"><RAC.SelectValue /><Icon.ChevronDown /></RAC.Button>
      <RAC.Popover className="tv-popover" offset={4}>
        <RAC.ListBox items={items} className="tv-listbox" style={{ maxHeight: 280 }}>
          {(i) => <RAC.ListBoxItem id={i.id} textValue={i.formatted} className="tv-item">{i.formatted}<Icon.Check className="tv-check-icon" /></RAC.ListBoxItem>}
        </RAC.ListBox>
      </RAC.Popover>
    </RAC.Select>
  );
}
export function CalendarWithPickers(props) {
  return (
    <RAC.Calendar {...props} className="tv-calendar tv-calendar--card">
      <header>
        <RAC.Button slot="previous" className="tv-icon-btn"><Icon.ChevronLeft className="tv-flip" /></RAC.Button>
        <div className="tv-cal-pickers">
          <RAC.CalendarMonthPicker>{(p) => <MiniSelect aria={p["aria-label"]} value={p.value} onChange={p.onChange} items={p.items} />}</RAC.CalendarMonthPicker>
          <RAC.CalendarYearPicker>{(p) => <MiniSelect aria={p["aria-label"]} value={p.value} onChange={p.onChange} items={p.items} />}</RAC.CalendarYearPicker>
        </div>
        <RAC.Button slot="next" className="tv-icon-btn"><Icon.ChevronRight className="tv-flip" /></RAC.Button>
      </header>
      <RAC.CalendarGrid>{(date) => <RAC.CalendarCell date={date} className="tv-cell" />}</RAC.CalendarGrid>
    </RAC.Calendar>
  );
}

/* =====================================================================
   MULTI-SELECT: Select and ComboBox with selectionMode="multiple"
   ===================================================================== */
export function MultiSelect({ label, items, placeholder, description, ...props }) {
  const lang = useLang();
  return (
    <RAC.Select {...props} selectionMode="multiple" placeholder={placeholder} className="tv-field">
      <RAC.Label className="tv-label">{label}</RAC.Label>
      <RAC.Button className="tv-select-btn">
        <RAC.SelectValue className="tv-multi-value">
          {({ selectedItems, isPlaceholder, defaultChildren }) => isPlaceholder ? defaultChildren : (
            <span className="tv-chip-row">
              {selectedItems.slice(0, 2).map((i) => i && <span key={i.id} className="tv-chip">{pick(lang, i.name)}</span>)}
              {selectedItems.length > 2 && <span className="tv-chip tv-chip--more">+{selectedItems.length - 2}</span>}
            </span>
          )}
        </RAC.SelectValue>
        <Icon.ChevronDown />
      </RAC.Button>
      {description && <RAC.Text slot="description" className="tv-desc">{description}</RAC.Text>}
      <RAC.Popover className="tv-popover" offset={6}>
        <RAC.ListBox items={items} className="tv-listbox">
          {(i) => (
            <RAC.ListBoxItem id={i.id} textValue={pick(lang, i.name)} className="tv-item tv-item--check">
              <span className="tv-check-box tv-check-box--item"><Icon.Check /></span>{pick(lang, i.name)}
            </RAC.ListBoxItem>
          )}
        </RAC.ListBox>
      </RAC.Popover>
    </RAC.Select>
  );
}
export function MultiComboBox({ label, items, placeholder, description, ...props }) {
  const lang = useLang();
  return (
    <RAC.ComboBox {...props} selectionMode="multiple" className="tv-field">
      <RAC.Label className="tv-label">{label}</RAC.Label>
      <RAC.ComboBoxValue className="tv-combo-value">
        {({ selectedItems, isPlaceholder }) => isPlaceholder ? null : (
          <span className="tv-chip-row">{selectedItems.map((i) => i && <span key={i.id} className="tv-chip">{pick(lang, i.name)}</span>)}</span>
        )}
      </RAC.ComboBoxValue>
      <RAC.Group className="tv-group">
        <RAC.Input className="tv-input" placeholder={placeholder} />
        <RAC.Button className="tv-icon-btn"><Icon.ChevronDown /></RAC.Button>
      </RAC.Group>
      {description && <RAC.Text slot="description" className="tv-desc">{description}</RAC.Text>}
      <RAC.Popover className="tv-popover" offset={6}>
        <RAC.ListBox items={items} className="tv-listbox">
          {(i) => (
            <RAC.ListBoxItem id={i.id} textValue={pick(lang, i.name)} className="tv-item tv-item--check">
              <span className="tv-check-box tv-check-box--item"><Icon.Check /></span>{pick(lang, i.name)}
            </RAC.ListBoxItem>
          )}
        </RAC.ListBox>
      </RAC.Popover>
    </RAC.ComboBox>
  );
}

/* =====================================================================
   LOAD MORE: infinite scroll for ListBox and Table
   ===================================================================== */
export function LoadMoreIndicator({ label }) {
  return <span className="tv-loadmore"><OrbitMark size={20} active />{label}</span>;
}

/* =====================================================================
   NAVIGATION TREE: app navigation with sections, nesting and the current page.
   ===================================================================== */
export function NavTree({ ariaLabel, selectedRoute, sections, defaultExpandedKeys }) {
  const lang = useLang();
  const { locale } = RAC.useLocale();
  const num = (n) => new Intl.NumberFormat(locale).format(n);
  const renderItem = (it) => (
    <RAC.NavigationTreeItem key={it.id} id={it.id} href={it.href} textValue={pick(lang, it.label)} className="tv-navtree-item">
      <RAC.NavigationTreeItemContent>
        {({ isCurrent, isCurrentAncestor, hasChildItems, level }) => (
          <div className={cx("tv-navtree-row", isCurrent && "is-current", isCurrentAncestor && "is-ancestor")} style={{ "--level": level }}>
            {hasChildItems
              ? <RAC.Button slot="chevron" className="tv-icon-btn tv-tree-chev"><Icon.ChevronRight className="tv-flip" /></RAC.Button>
              : <span className="tv-tree-spacer" />}
            {it.icon}
            <span className="tv-navtree-label">{pick(lang, it.label)}</span>
            {it.badge != null && <span className="tv-navtree-badge">{num(it.badge)}</span>}
          </div>
        )}
      </RAC.NavigationTreeItemContent>
      {it.children?.map(renderItem)}
    </RAC.NavigationTreeItem>
  );
  return (
    <RAC.NavigationTree aria-label={ariaLabel} selectedRoute={selectedRoute} defaultExpandedKeys={defaultExpandedKeys} className="tv-navtree">
      {sections.map((s) => (
        <RAC.NavigationTreeSection key={s.id} id={s.id}>
          <RAC.NavigationTreeHeader className="tv-navtree-head">{pick(lang, s.label)}</RAC.NavigationTreeHeader>
          {s.items.map(renderItem)}
        </RAC.NavigationTreeSection>
      ))}
    </RAC.NavigationTree>
  );
}

/* =====================================================================
   KEYBOARD SHORTCUT LABEL and PREVIEW (hover card)
   ===================================================================== */
export const Kbd = ({ children, ...p }) => <RAC.Keyboard {...p} className="tv-kbd" dir="ltr">{children}</RAC.Keyboard>;

export function PreviewCard({ trigger, children }) {
  return (
    <RAC.PreviewTrigger delay={400} closeDelay={200}>
      {trigger}
      <RAC.Popover className="tv-popover tv-preview" placement="bottom start" offset={8}>
        {children}
      </RAC.Popover>
    </RAC.PreviewTrigger>
  );
}

export const SelectionIndicator = (p) => <RAC.SelectionIndicator {...p} className={cx("tv-sel-indicator", p.className)} />;

/* Large collections */
export { Virtualizer, ListLayout, GridLayout, WaterfallLayout, TableLayout, Collection, RouterProvider,
  ListBoxLoadMoreItem, TableLoadMoreItem, GridListSection, GridListHeader, TableFooter } from "react-aria-components";
