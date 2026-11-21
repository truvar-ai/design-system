import type * as React from "react";
import type * as RAC from "react-aria-components";

/* =========================================================
   LOCALE HELPERS
   ========================================================= */

/** The built-in UI strings the components in this file use, in the current locale ("en" or "ar"; others fall back to "en"). */
export interface MoreMessages {
  close: string;
  dismiss: string;
  prev: string;
  next: string;
  /** "Page 3" / its Arabic form. Pass the already formatted number. */
  page: (n: string | number) => string;
  pagination: string;
  drag: string;
  expand: string;
  cancel: string;
  /** "Type NAME to confirm". */
  typeToConfirm: (word: string) => string;
  notifications: string;
  markRead: string;
  nothingNew: string;
  account: string;
  back: string;
  openFull: string;
  viewAll: string;
  from: string;
  to: string;
  hue: string;
  color: string;
}

/** Locale-aware formatters that print the same text on the server and in the browser (no hydration mismatches). */
export interface MoreFormat {
  /** Formats a number with the current locale; pass Intl options for percent, compact notation and so on. */
  number: (n: number | bigint, options?: Intl.NumberFormatOptions) => string;
  /** Formats an amount as whole Egyptian pounds (EGP). */
  money: (n: number | bigint) => string;
  /** Formats an amount as compact EGP, e.g. "EGP 1.2M". */
  moneyShort: (n: number | bigint) => string;
  /** Describes a number of days ago in words ("yesterday", "3 days ago"). */
  relative: (days: number) => string;
  /** The active locale, e.g. "en-US" or "ar-EG". */
  locale: string;
}

/** Returns the built-in UI strings for the current locale (from the nearest React Aria `I18nProvider`). */
export declare function useM(): MoreMessages;

/** Returns number, money and relative-time formatters for the current locale. */
export declare function useFormat(): MoreFormat;

/* =========================================================
   BUTTONS & ACTIONS
   ========================================================= */

export interface ToggleButtonProps extends Omit<RAC.ToggleButtonProps, "className" | "children"> {
  /** Icon shown before the label. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/** A button that toggles between pressed and not pressed. */
export declare function ToggleButton(props: ToggleButtonProps): React.JSX.Element;

export interface ToggleButtonGroupProps extends Omit<RAC.ToggleButtonGroupProps, "className" | "children"> {
  /** `SegmentButton` or `ToggleButton` children. */
  children?: React.ReactNode;
}

/** A segmented group of toggle buttons with single or multiple selection (`selectionMode`). */
export declare function ToggleButtonGroup(props: ToggleButtonGroupProps): React.JSX.Element;

export interface SegmentButtonProps extends Omit<RAC.ToggleButtonProps, "className" | "children"> {
  /** Icon shown before the label. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/** One segment of a `ToggleButtonGroup`, with a sliding selection indicator. */
export declare function SegmentButton(props: SegmentButtonProps): React.JSX.Element;

export interface LinkProps extends Omit<RAC.LinkProps, "className" | "children"> {
  /** Draws the link on its own (no surrounding text), without the inline underline. */
  standalone?: boolean;
  children?: React.ReactNode;
}

/** A styled link (React Aria `Link`, so `onPress` and client-side routing work). */
export declare function Link(props: LinkProps): React.JSX.Element;

/** Wraps a button and opens the file picker when it is pressed (React Aria `FileTrigger`). */
export declare const FileTrigger: typeof RAC.FileTrigger;

export interface ToolbarProps extends Omit<RAC.ToolbarProps, "className" | "children"> {
  children?: React.ReactNode;
}

/** A group of controls with arrow-key navigation (text formatting bars and similar). */
export declare function Toolbar(props: ToolbarProps): React.JSX.Element;

export interface SeparatorProps extends Omit<RAC.SeparatorProps, "className"> {}

/** A horizontal (default) or vertical divider line. */
export declare function Separator(props: SeparatorProps): React.JSX.Element;

/* =========================================================
   FORM FIELDS
   ========================================================= */

export interface NumberFieldProps extends Omit<RAC.NumberFieldProps, "className" | "children" | "label" | "description"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

/** A number input with decrement and increment buttons, locale-aware formatting and validation. */
export declare function NumberField(props: NumberFieldProps): React.JSX.Element;

export interface CheckboxGroupProps extends Omit<RAC.CheckboxGroupProps, "className" | "children" | "label" | "description"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** `Checkbox` children. */
  children?: React.ReactNode;
}

/** A labelled group of checkboxes sharing one `value` array. */
export declare function CheckboxGroup(props: CheckboxGroupProps): React.JSX.Element;

export interface RadioCardProps {
  /** The value this card represents within its `RadioGroup`. */
  value: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** A `Badge` or similar shown beside the title. */
  badge?: React.ReactNode;
}

/** A radio option drawn as a large card with a title and description. Use inside a `RadioGroup`. */
export declare function RadioCard(props: RadioCardProps): React.JSX.Element;

export interface FormProps extends Omit<RAC.FormProps, "className" | "children"> {
  children?: React.ReactNode;
}

/** A form that wires field validation (`validationBehavior`, `validationErrors`) to its fields. */
export declare function Form(props: FormProps): React.JSX.Element;

/* =========================================================
   DATES & TIMES
   ========================================================= */

export interface DateFieldProps<T extends RAC.DateValue = RAC.DateValue>
  extends Omit<RAC.DateFieldProps<T>, "className" | "children" | "label" | "description"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

/** A segmented date input (day, month, year) that follows the locale. */
export declare function DateField<T extends RAC.DateValue = RAC.DateValue>(props: DateFieldProps<T>): React.JSX.Element;

export interface TimeFieldProps<T extends RAC.TimeValue = RAC.TimeValue>
  extends Omit<RAC.TimeFieldProps<T>, "className" | "children" | "label" | "description"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

/** A segmented time input (hour, minute, period). */
export declare function TimeField<T extends RAC.TimeValue = RAC.TimeValue>(props: TimeFieldProps<T>): React.JSX.Element;

export interface CalendarProps<T extends RAC.DateValue = RAC.DateValue>
  extends Omit<RAC.CalendarProps<T>, "className" | "children"> {}

/** A month calendar for picking one date. */
export declare function Calendar<T extends RAC.DateValue = RAC.DateValue>(props: CalendarProps<T>): React.JSX.Element;

export interface RangeCalendarProps<T extends RAC.DateValue = RAC.DateValue>
  extends Omit<RAC.RangeCalendarProps<T>, "className" | "children"> {}

/** A month calendar for picking a start and end date. */
export declare function RangeCalendar<T extends RAC.DateValue = RAC.DateValue>(props: RangeCalendarProps<T>): React.JSX.Element;

export interface DateRangePickerProps<T extends RAC.DateValue = RAC.DateValue>
  extends Omit<RAC.DateRangePickerProps<T>, "className" | "children" | "label" | "description"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

/** Two date inputs with a popover range calendar. */
export declare function DateRangePicker<T extends RAC.DateValue = RAC.DateValue>(props: DateRangePickerProps<T>): React.JSX.Element;

/* =========================================================
   SELECTION & COLLECTIONS
   ========================================================= */

export interface ListBoxProps<T extends object = object> extends Omit<RAC.ListBoxProps<T>, "className"> {}

/** A standalone list of selectable options (single or multiple selection). Children are `ListBoxItem`s, or a render function over `items`. */
export declare function ListBox<T extends object = object>(props: ListBoxProps<T>): React.JSX.Element;

export interface ListBoxSectionProps<T extends object = object> extends Omit<RAC.ListBoxSectionProps<T>, "className" | "children"> {
  /** The section heading. */
  title?: React.ReactNode;
  children?: React.ReactNode;
}

/** A titled group of options inside a `ListBox`. */
export declare function ListBoxSection<T extends object = object>(props: ListBoxSectionProps<T>): React.JSX.Element;

export interface GridListProps<T extends object = object> extends Omit<RAC.GridListProps<T>, "className"> {}

/** An interactive list of rich rows with selection, actions and drag and drop reordering. */
export declare function GridList<T extends object = object>(props: GridListProps<T>): React.JSX.Element;

export interface GridListItemProps<T extends object = object> extends Omit<RAC.GridListItemProps<T>, "className" | "children"> {
  /** Plain-text version of the row, used for type-ahead and screen readers. Provide it, since the content is rich. */
  textValue?: string;
  /** Extra controls shown at the end of the row (menu buttons and so on). */
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

/** A row of a `GridList`. Shows a drag handle when dragging is on and a checkbox in multiple-selection mode. */
export declare function GridListItem<T extends object = object>(props: GridListItemProps<T>): React.JSX.Element;

export interface CommandMenuProps<T extends object = object> {
  /** Accessible name of the search field. */
  label: string;
  /** Placeholder of the search field. */
  placeholder?: string;
  /** Items of a dynamic collection; `children` is then a render function. */
  items?: Iterable<T>;
  /** Called with the key of the chosen command. */
  onAction?: (key: RAC.Key) => void;
  /** `MenuItem`s (or `MenuSection`s), or a render function over `items`. */
  children?: RAC.MenuProps<T>["children"];
  /** Rendered when the filter matches nothing. */
  renderEmpty?: () => React.ReactNode;
  /** Adds a Cancel button after the field (full-screen search on phones). */
  onCancel?: () => void;
  /** Text of the Cancel button. Defaults to the localized "Cancel". */
  cancelLabel?: React.ReactNode;
}

/** A command palette: a search field that filters a menu of commands while focus stays in the field. */
export declare function CommandMenu<T extends object = object>(props: CommandMenuProps<T>): React.JSX.Element;

/* =========================================================
   NAVIGATION
   ========================================================= */

/** One crumb of `Breadcrumbs`. The last one is usually the current page and has no `href`. */
export interface BreadcrumbsItem {
  label: React.ReactNode;
  href?: string;
}

export interface BreadcrumbsProps extends Omit<RAC.BreadcrumbsProps<object>, "className" | "children" | "items"> {
  items: readonly BreadcrumbsItem[];
}

/** A breadcrumb trail built from an `items` array. */
export declare function Breadcrumbs(props: BreadcrumbsProps): React.JSX.Element;

export interface DisclosureProps extends Omit<RAC.DisclosureProps, "className" | "children"> {
  /** The always-visible heading that toggles the panel. */
  title: React.ReactNode;
  /** A `Badge` or similar shown at the end of the heading. */
  badge?: React.ReactNode;
  /** The collapsible content. */
  children?: React.ReactNode;
}

/** One expandable section (heading plus collapsible panel). */
export declare function Disclosure(props: DisclosureProps): React.JSX.Element;

export interface AccordionProps extends Omit<RAC.DisclosureGroupProps, "className"> {}

/** A group of `Disclosure`s, one open at a time unless `allowsMultipleExpanded` is set. */
export declare function Accordion(props: AccordionProps): React.JSX.Element;

export interface PaginationProps {
  /** The current page, starting at 1. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  /** Called with the new page number. */
  onChange: (page: number) => void;
}

/** Previous and next buttons around numbered pages, with gaps collapsed to an ellipsis. */
export declare function Pagination(props: PaginationProps): React.JSX.Element;

/* =========================================================
   OVERLAYS
   ========================================================= */

/** Argument of render-function children of `Drawer`. */
export interface DrawerRenderProps {
  /** Closes the drawer. */
  close: () => void;
}

export interface DrawerProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** The edge the drawer is pinned to: "start" is left in English and right in Arabic. Default "end". */
  side?: "start" | "end";
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Replaces the default title and subtitle block. */
  header?: React.ReactNode;
  children?: React.ReactNode | ((props: DrawerRenderProps) => React.ReactNode);
  footer?: React.ReactNode | ((props: DrawerRenderProps) => React.ReactNode);
  /** Width in px. Default 480. */
  width?: number;
}

/** A side panel (modal pinned to the start or end edge) with a header, scrolling body and optional footer. */
export declare function Drawer(props: DrawerProps): React.JSX.Element;

export interface ConfirmDialogProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Text of the confirm button. */
  confirmLabel?: React.ReactNode;
  /** `"danger"` styles the button as destructive, uses `role="alertdialog"` and blocks dismissing by clicking outside. Default "primary". */
  tone?: "primary" | "danger";
  /** If set, the confirm button stays disabled until the user types exactly this text. */
  requireText?: string;
  /** Called when the confirm button is pressed (the dialog then closes). */
  onConfirm?: () => void;
  /** An icon shown in a tinted circle above the title. */
  icon?: React.ReactNode;
  /** `"full"` makes the dialog fill the screen (for long forms). */
  size?: "full";
}

/** A controlled confirmation dialog with Cancel and confirm buttons and an optional type-to-confirm guard. */
export declare function ConfirmDialog(props: ConfirmDialogProps): React.JSX.Element;

export interface InfoPopoverProps {
  /** The element that opens the popover, usually a `Button` or `IconButton`. */
  trigger: React.ReactNode;
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Default "bottom". */
  placement?: RAC.PopoverProps["placement"];
}

/** A small popover with an arrow, opened from a trigger, for explanatory text. */
export declare function InfoPopover(props: InfoPopoverProps): React.JSX.Element;

export interface MenuSectionProps<T extends object = object> extends Omit<RAC.MenuSectionProps<T>, "className" | "children" | "title"> {
  /** The section heading. */
  title?: React.ReactNode;
  children?: React.ReactNode;
}

/** A titled group of menu items. With `selectionMode` its items behave as radio or checkbox items. */
export declare function MenuSection<T extends object = object>(props: MenuSectionProps<T>): React.JSX.Element;

export interface SelectableMenuItemProps<T extends object = object> extends Omit<RAC.MenuItemProps<T>, "className" | "children"> {
  /** The label. A string is also used as the item's text value. */
  children?: React.ReactNode;
}

/** A menu item that shows a check mark when selected (use inside a `MenuSection` with a `selectionMode`). */
export declare function SelectableMenuItem<T extends object = object>(props: SelectableMenuItemProps<T>): React.JSX.Element;

export interface SubmenuProps {
  /** The text of the item that opens the submenu (also its text value). */
  label: string;
  icon?: React.ReactNode;
  /** The submenu's `MenuItem`s. */
  children?: React.ReactNode;
}

/** A menu item that opens a nested menu. */
export declare function Submenu(props: SubmenuProps): React.JSX.Element;

/* =========================================================
   FEEDBACK
   ========================================================= */

/** Visual tone of a toast or banner (also picks its icon). */
export type FeedbackTone = "success" | "danger" | "warning" | "info";

/** What a toast shows. */
export interface ToastContent {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Default "info". */
  tone?: FeedbackTone;
  /** A button on the toast (for example Undo). A toast with an action stays 8 s instead of 5 s. */
  action?: {
    label: React.ReactNode;
    /** Called when the button is pressed; the toast then closes. */
    onAction: () => void;
  };
}

/** The queue behind `toast()` and `ToastRegion`. Use it to close a toast: `toastQueue.close(key)`. */
export declare const toastQueue: RAC.UNSTABLE_ToastQueue<ToastContent>;

/** Shows a toast from anywhere (needs a `ToastRegion` mounted). Returns the toast's key. Options: `timeout` (ms), `onClose`. */
export declare function toast(content: ToastContent, options?: RAC.ToastOptions): string;

/** Renders the toasts. Mount it once near the app root. */
export declare function ToastRegion(): React.JSX.Element;

export interface BannerProps {
  /** Default "info". "danger" is announced as an alert; the others as polite status messages. */
  tone?: FeedbackTone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Buttons shown under the text. */
  action?: React.ReactNode;
  /** When set, shows a dismiss button that calls it. */
  onDismiss?: () => void;
}

/** An inline alert banner. */
export declare function Banner(props: BannerProps): React.JSX.Element;

export interface ProgressBarProps extends Omit<RAC.ProgressBarProps, "className" | "children" | "label"> {
  label?: React.ReactNode;
  /** Show the value text beside the label (never while indeterminate). Default true. */
  showValue?: boolean;
}

/** A progress bar with a label and value text; `isIndeterminate` for unknown progress. */
export declare function ProgressBar(props: ProgressBarProps): React.JSX.Element;

/** Range a `Meter` value falls into. */
export type MeterTone = "ok" | "warning" | "danger";

export interface MeterProps extends Omit<RAC.MeterProps, "className" | "children" | "label"> {
  label?: React.ReactNode;
  /** Percentage at which the meter turns "warning". Default 75. */
  warnAt?: number;
  /** Percentage at which the meter turns "danger". Default 90. */
  dangerAt?: number;
  /** Text appended to the value text for each range, so colour is not the only signal. */
  statusText?: Partial<Record<MeterTone, string>>;
}

/** A gauge for a known quantity within a range (storage used, seats). */
export declare function Meter(props: MeterProps): React.JSX.Element;

export interface SkeletonProps {
  /** Number of text lines. Default 3. */
  lines?: number;
  /** Adds a round avatar placeholder. */
  avatar?: boolean;
}

/** A loading placeholder that stands in for text and an optional avatar. */
export declare function Skeleton(props: SkeletonProps): React.JSX.Element;

/** A button on a notification's reading view. */
export interface NotificationAction {
  label: React.ReactNode;
  /** Called when pressed, with a function that closes the notification panel (undefined outside the panel). */
  onPress?: (close?: () => void) => void;
  /** Button style. Default "primary" for the first action and "secondary" for the rest. */
  variant?: "primary" | "secondary" | "ghost" | "danger" | "danger-solid";
}

/** The reading view of a notification. */
export interface NotificationDetailData {
  /** The sender. */
  from?: React.ReactNode;
  /** Replaces the item's icon in the reading view. */
  avatar?: React.ReactNode;
  /** Replaces the item's title in the reading view. */
  subject?: React.ReactNode;
  /** One-line preview shown in the list under the title. */
  preview?: React.ReactNode;
  /** The full message. */
  body?: React.ReactNode;
  actions?: readonly NotificationAction[];
  /** The full-page version of the notification (an inbox route); the panel offers "Open full page". */
  href?: string;
  /** Text of the full-page link. Defaults to the localized "Open full page". */
  hrefLabel?: React.ReactNode;
}

/** One notification. With `detail`, pressing it opens a reading view. */
export interface NotificationItem {
  id: RAC.Key;
  icon?: React.ReactNode;
  /** Also the item's text value for screen readers, so it must be a string. */
  title: string;
  /** When it happened, already formatted. */
  time?: React.ReactNode;
  unread?: boolean;
  detail?: NotificationDetailData;
}

export interface NotificationListProps {
  items: readonly NotificationItem[];
  /** Called with the id of the pressed notification. */
  onAction?: (id: RAC.Key) => void;
  /** Id of the notification currently open, highlighted in the list. */
  currentId?: RAC.Key;
  /** Accessible name of the list. Defaults to the localized "Notifications". */
  label?: string;
  className?: string;
}

/** A list of notifications (a `GridList`) with an empty state. */
export declare function NotificationList(props: NotificationListProps): React.JSX.Element;

export interface NotificationDetailProps {
  item: NotificationItem;
  /** When set, shows a Back button that calls it. */
  onBack?: () => void;
  /** Closes the surrounding panel; passed to action handlers and called when the full-page link is pressed. */
  close?: () => void;
  /** Show the "Open full page" link when `item.detail.href` is set. Default true. */
  showFullPage?: boolean;
  /** Heading level of the title. Default 3. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

/** The reading view of one notification: who, what, the full message and what you can do about it. */
export declare function NotificationDetail(props: NotificationDetailProps): React.JSX.Element;

export interface NotificationCenterProps {
  items: readonly NotificationItem[];
  /** Called by the "Mark all as read" button (shown while any item is unread). */
  onMarkAllRead?: () => void;
  /** Called with the id of the notification the user opens or presses. */
  onOpenItem?: (id: RAC.Key) => void;
  /** Accessible name of the bell button. Defaults to the localized "Notifications". */
  label?: string;
  /** Adds a "View all" link to a full inbox page. */
  viewAllHref?: string;
  /** Text of the "View all" link. Defaults to the localized "View all". */
  viewAllLabel?: React.ReactNode;
}

/** A bell button with an unread count that opens the notification list (a popover, or a bottom sheet on phones). */
export declare function NotificationCenter(props: NotificationCenterProps): React.JSX.Element;

/** The signed-in user shown in `UserMenu`. */
export interface UserMenuUser {
  name: string;
  email?: string;
  /** Photo URL; falls back to initials if missing or it fails to load. */
  src?: string;
  /** Shown on the photo's bottom edge like a name tag. */
  role?: React.ReactNode;
}

/** An action in `UserMenu`. */
export interface UserMenuItem {
  id: RAC.Key;
  label: string;
  icon?: React.ReactNode;
  /** Keyboard shortcut text; hidden on phones. */
  shortcut?: string;
  /** Draws the item as destructive (sign out, delete). */
  danger?: boolean;
  /** Makes the item a link. */
  href?: string;
  /** Leaves the item out of the phone sheet (keyboard shortcuts and the like). */
  desktopOnly?: boolean;
  separator?: false;
}

/** A divider between `UserMenu` items. */
export interface UserMenuSeparator {
  separator: true;
}

export interface UserMenuProps {
  user: UserMenuUser;
  items: readonly (UserMenuItem | UserMenuSeparator)[];
  /** Called with the id of the chosen item. */
  onAction?: (id: RAC.Key) => void;
  /** Show only the avatar (small screens). Default false. */
  compact?: boolean;
  /** Accessible name of the trigger. Defaults to "Account: <name>". */
  label?: string;
}

/** The account menu: avatar (and name) button opening the user's details and actions. A bottom sheet on phones. */
export declare function UserMenu(props: UserMenuProps): React.JSX.Element;

/* =========================================================
   BRAND COMPONENTS
   ========================================================= */

/** Colour of a `Badge`. */
export type BadgeTone = "neutral" | "navy" | "accent" | "success" | "warning" | "danger" | "info" | "violet" | "strong";

export interface BadgeProps {
  /** Default "neutral". */
  tone?: BadgeTone;
  children?: React.ReactNode;
  /** Shows a small status dot before the text. */
  dot?: boolean;
}

/** A small pill for status or counts. */
export declare function Badge(props: BadgeProps): React.JSX.Element;

export interface CardProps extends React.ComponentPropsWithoutRef<"div"> {}

/** A surface container (a styled `div`). */
export declare function Card(props: CardProps): React.JSX.Element;

export interface StatTileProps {
  label?: React.ReactNode;
  value?: React.ReactNode;
  /** The change, already formatted ("+12%"). The delta row is hidden without it. */
  delta?: React.ReactNode;
  /** Text after the delta ("vs last week"). */
  deltaLabel?: React.ReactNode;
  /** Arrow direction. Default "up". */
  trend?: "up" | "down";
  /** Whether the change is good news (green) or bad (red). Default true. */
  good?: boolean;
}

/** A KPI tile: label, big value and an optional trend delta. */
export declare function StatTile(props: StatTileProps): React.JSX.Element;

/** Background colour of an `Avatar` without a photo. */
export type AvatarTone = "navy" | "bronze" | "slate" | "green";

export interface AvatarProps {
  /** Full name; its initials are shown when there is no photo. Also the tooltip. */
  name: string;
  /** Diameter in px. Default 32. */
  size?: number;
  /** Colour of the initials badge. Defaults to one picked from the name, so a person keeps the same colour. */
  tone?: AvatarTone;
  /** Photo URL; falls back to initials if it fails to load. */
  src?: string;
}

/** A person's photo or initials in a circle. */
export declare function Avatar(props: AvatarProps): React.JSX.Element;

export interface EmptyStateProps {
  title?: React.ReactNode;
  /** Explanatory text under the title. */
  children?: React.ReactNode;
  /** A button or link offering the next step. */
  action?: React.ReactNode;
  /** Illustration; defaults to the Truvar orbit mark. */
  icon?: React.ReactNode;
}

/** The "nothing here yet" block for empty lists and tables. */
export declare function EmptyState(props: EmptyStateProps): React.JSX.Element;

/* =========================================================
   TABLES
   ========================================================= */

export interface TableProps extends Omit<RAC.TableProps, "className"> {
  className?: string;
}

/** A data table with selection, sorting and drag and drop. Children: `TableHeader` and `TableBody`. */
export declare function Table(props: TableProps): React.JSX.Element;

export interface TableHeaderProps<T extends object = object> extends Omit<RAC.TableHeaderProps<T>, "className"> {}

/** The header row of a `Table`; holds `Column`s. */
export declare function TableHeader<T extends object = object>(props: TableHeaderProps<T>): React.JSX.Element;

export interface ColumnProps extends Omit<RAC.ColumnProps, "className" | "children"> {
  /** Column heading. */
  children?: React.ReactNode;
  /** Show a sort arrow and make the heading sortable. */
  allowsSorting?: boolean;
  /** Adds a drag handle for resizing (inside a `ResizableTable`). */
  resizable?: boolean;
  /** Align the heading to the end edge (numeric columns). Pair with `Cell align="end"`. */
  align?: "start" | "end";
}

/** A column heading of a `Table`. */
export declare function Column(props: ColumnProps): React.JSX.Element;

/** The select-all checkbox column heading for tables with multiple selection. */
export declare function SelectionColumn(): React.JSX.Element;

/** The empty column heading above the drag handles of a draggable table. */
export declare function DragColumn(): React.JSX.Element;

export interface TableBodyProps<T extends object = object> extends Omit<RAC.TableBodyProps<T>, "className"> {}

/** The body of a `Table`: `Row`s, or a render function over `items`. */
export declare function TableBody<T extends object = object>(props: TableBodyProps<T>): React.JSX.Element;

export interface RowProps<T extends object = object> extends Omit<RAC.RowProps<T>, "className" | "children" | "columns"> {
  /** `Cell`s. Selection and drag cells are added automatically. */
  children?: React.ReactNode;
}

/** A table row. Adds the selection checkbox and drag handle cells when the table needs them. */
export declare function Row<T extends object = object>(props: RowProps<T>): React.JSX.Element;

export interface CellProps extends Omit<RAC.CellProps, "className" | "children"> {
  children?: React.ReactNode;
  /** Align to the end edge (numeric columns). */
  align?: "start" | "end";
}

/** A table cell. */
export declare function Cell(props: CellProps): React.JSX.Element;

export interface ResizableTableProps {
  /** The `Table`. */
  children?: React.ReactNode;
}

/** Wraps a `Table` so its columns can be resized (`Column resizable`). */
export declare function ResizableTable(props: ResizableTableProps): React.JSX.Element;

/* =========================================================
   TREE
   ========================================================= */

export interface TreeProps<T extends object = object> extends Omit<RAC.TreeProps<T>, "className"> {
  className?: string;
}

/** An expandable tree of rows with keyboard navigation and selection. */
export declare function Tree<T extends object = object>(props: TreeProps<T>): React.JSX.Element;

export interface TreeItemProps<T extends object = object> extends Omit<RAC.TreeItemProps<T>, "className" | "children" | "textValue" | "title"> {
  /** The row's label. */
  title: React.ReactNode;
  /** Plain-text label for type-ahead. Defaults to `title` when it is a string. */
  textValue?: string;
  /** Extra cells shown at the end of the row (sizes, dates). */
  cells?: React.ReactNode;
  icon?: React.ReactNode;
  /** Child `TreeItem`s. */
  children?: React.ReactNode;
}

/** One row of a `Tree`, with an expand chevron when it has child items. */
export declare function TreeItem<T extends object = object>(props: TreeItemProps<T>): React.JSX.Element;

/* =========================================================
   COLOUR
   ========================================================= */

export interface ColorPickerPanelProps extends Omit<RAC.ColorPickerProps, "children"> {
  /** Label of the colour text field. Defaults to the localized "Colour". */
  label?: React.ReactNode;
  /** Preset colours (CSS colour strings) offered as swatches. */
  swatches?: readonly string[];
}

/** A colour picker panel: saturation/brightness area, hue slider, colour field and optional swatches. */
export declare function ColorPickerPanel(props: ColorPickerPanelProps): React.JSX.Element;

export interface ColorWheelProps extends Omit<RAC.ColorWheelProps, "className" | "children" | "outerRadius" | "innerRadius"> {
  /** Outer radius in px. Default 96. */
  outerRadius?: number;
  /** Inner radius in px. Default 70. */
  innerRadius?: number;
}

/** A circular hue picker. */
export declare function ColorWheel(props: ColorWheelProps): React.JSX.Element;

export interface ColorSwatchProps extends Omit<RAC.ColorSwatchProps, "className"> {}

/** A square preview of a colour (`color` prop). */
export declare function ColorSwatch(props: ColorSwatchProps): React.JSX.Element;

/* =========================================================
   DRAG & DROP
   ========================================================= */

export interface DropZoneProps extends Omit<RAC.DropZoneProps, "className"> {}

/** An area files or items can be dropped onto (`onDrop`, `getDropOperation`). */
export declare function DropZone(props: DropZoneProps): React.JSX.Element;

/** React Aria's `useDragAndDrop`, for reorderable and droppable collections. */
export declare const useDragAndDrop: typeof RAC.useDragAndDrop;

/** React Aria's `useListData`: state for a list you can add to, remove from and reorder. */
export declare const useListData: typeof RAC.useListData;

/** React Aria's `useFilter`: locale-aware `contains`, `startsWith` and `endsWith` string matching. */
export declare const useFilter: typeof RAC.useFilter;

/** React Aria's `isTextDropItem`: narrows a dropped item to text. */
export declare const isTextDropItem: typeof RAC.isTextDropItem;

/** React Aria's `isFileDropItem`: narrows a dropped item to a file. */
export declare const isFileDropItem: typeof RAC.isFileDropItem;
