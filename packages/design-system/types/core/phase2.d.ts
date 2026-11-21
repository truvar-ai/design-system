import type * as React from "react";
import type * as RAC from "react-aria-components";

/** Text in both supported languages; the component shows the one that matches the current locale. */
export interface BilingualText {
  en: string;
  ar: string;
}

/* ---------- Sheet ---------- */

export interface SheetProps {
  /** The element that opens the sheet (uncontrolled). Leave out when controlling with isOpen. */
  trigger?: React.ReactNode;
  /** Heading shown at the top of the sheet. */
  title?: React.ReactNode;
  /** Where the sheet slides in from. "start" and "end" mirror in right-to-left locales. Default "bottom". */
  position?: RAC.SheetOverlayProps["position"];
  /** Heights (numbers are pixels, strings like "50%") the sheet can rest at; it opens at the first. */
  snapPoints?: Array<number | string>;
  /** The sheet body, or a function that receives `close`. */
  children?: React.ReactNode | ((state: { close: () => void }) => React.ReactNode);
  /** Pinned footer (usually buttons), or a function that receives `close`. */
  footer?: React.ReactNode | ((state: { close: () => void }) => React.ReactNode);
  /** Controlled open state. */
  isOpen?: boolean;
  /** Called when the open state should change. */
  onOpenChange?: (isOpen: boolean) => void;
}

/** Panel that slides in from any edge and can be swiped closed; uncontrolled with a trigger or controlled with isOpen. */
export declare function Sheet(props: SheetProps): React.JSX.Element;

/* ---------- Prompt editor ---------- */

export { TokenFieldValue } from "react-aria-components";

/** A variable the user can insert into a PromptEditor. */
export interface PromptVariable {
  /** Stable id stored in the token's value. */
  id: string;
  /** Name shown in the menu and inside the token. */
  label: BilingualText;
  /** Sample value shown beside the name in the menu. */
  example?: BilingualText;
}

export interface PromptEditorProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Variables offered by the "Insert variable" menu. */
  variables: readonly PromptVariable[];
  /** Current content: text segments plus variable tokens. */
  value: RAC.TokenFieldValue;
  /** Called with the next content. */
  onChange: (value: RAC.TokenFieldValue) => void;
  /** Text shown while the field is empty. */
  placeholder?: string;
}

/** Text field with inline variable tokens, for agent greetings and prompts. */
export declare function PromptEditor(props: PromptEditorProps): React.JSX.Element;

/* ---------- Setting rows ---------- */

export interface SwitchRowProps extends Omit<RAC.SwitchFieldProps, "className" | "children"> {
  /** Row title. */
  label: React.ReactNode;
  /** Explanation under the title, announced with the switch. */
  description?: React.ReactNode;
  /** Icon before the title. */
  icon?: React.ReactNode;
}

/** Setting row: a switch with a title, an optional icon and a description; the whole row is pressable. */
export declare function SwitchRow(props: SwitchRowProps): React.JSX.Element;

export interface CheckboxRowProps extends Omit<RAC.CheckboxFieldProps, "className" | "children"> {
  label: React.ReactNode;
  description?: React.ReactNode;
}

/** Setting row: a checkbox with a title, a description and a validation message. */
export declare function CheckboxRow(props: CheckboxRowProps): React.JSX.Element;

export interface RadioRowProps {
  /** The value this row selects in the surrounding RadioGroup. */
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
}

/** Setting row: a radio button with a title and a description; use inside a RadioGroup. */
export declare function RadioRow(props: RadioRowProps): React.JSX.Element;

/* ---------- Calendar with month and year pickers ---------- */

export interface CalendarWithPickersProps<T extends RAC.DateValue = RAC.DateValue>
  extends Omit<RAC.CalendarProps<T>, "className" | "children"> {}

/** Calendar card with month and year drop-downs in the header. */
export declare function CalendarWithPickers<T extends RAC.DateValue = RAC.DateValue>(
  props: CalendarWithPickersProps<T>,
): React.JSX.Element;

/* ---------- Multi-select ---------- */

/** An option in MultiSelect or MultiComboBox. */
export interface MultiOption {
  id: string | number;
  /** Name in both languages. */
  name: BilingualText;
}

export interface MultiSelectProps
  extends Omit<RAC.SelectProps<MultiOption, "multiple">, "className" | "children" | "placeholder" | "selectionMode"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  placeholder?: string;
  /** The choices. */
  items?: Iterable<MultiOption>;
}

/** Select that allows several choices; the list stays open and chosen items show as chips. */
export declare function MultiSelect(props: MultiSelectProps): React.JSX.Element;

export interface MultiComboBoxProps
  extends Omit<RAC.ComboBoxProps<MultiOption, "multiple">, "className" | "children" | "selectionMode"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  placeholder?: string;
  /** The choices. */
  items?: Iterable<MultiOption>;
}

/** Searchable combo box that allows several choices, shown as chips. */
export declare function MultiComboBox(props: MultiComboBoxProps): React.JSX.Element;

/* ---------- Load more ---------- */

export interface LoadMoreIndicatorProps {
  /** Text shown beside the spinner. */
  label?: React.ReactNode;
}

/** Spinner row for the end of an infinite-scroll list or table (put it inside ListBoxLoadMoreItem or TableLoadMoreItem). */
export declare function LoadMoreIndicator(props: LoadMoreIndicatorProps): React.JSX.Element;

/* ---------- Navigation tree ---------- */

/** A link in NavTree; items with `children` become expandable. */
export interface NavTreeItem {
  id: string;
  /** Link target, matched against `selectedRoute`. */
  href?: string;
  label: BilingualText;
  /** Icon element before the label. */
  icon?: React.ReactNode;
  /** Count shown at the end of the row. */
  badge?: number;
  children?: readonly NavTreeItem[];
}

/** A titled group of items in NavTree. */
export interface NavTreeSection {
  id: string;
  label: BilingualText;
  items: readonly NavTreeItem[];
}

export interface NavTreeProps {
  /** Accessible name of the navigation. */
  ariaLabel: string;
  /** The current route; the item whose href matches is marked current and its parents stay highlighted. */
  selectedRoute?: string | null;
  sections: readonly NavTreeSection[];
  /** Ids of items expanded at the start. */
  defaultExpandedKeys?: Iterable<string | number>;
}

/** App navigation with sections, nesting and a current-page marker; links go through RouterProvider. */
export declare function NavTree(props: NavTreeProps): React.JSX.Element;

/* ---------- Keyboard shortcut, preview card, selection indicator ---------- */

export interface KbdProps extends Omit<React.ComponentPropsWithoutRef<typeof RAC.Keyboard>, "className" | "children"> {
  children?: React.ReactNode;
}

/** Keyboard shortcut label, e.g. <Kbd>⌘K</Kbd>. */
export declare function Kbd(props: KbdProps): React.JSX.Element;

export interface PreviewCardProps {
  /** The element that shows the card on hover or focus (usually a link). */
  trigger: React.ReactNode;
  /** Card content. */
  children?: React.ReactNode;
}

/** Hover card: shows a preview after a short delay when the trigger is hovered or focused. */
export declare function PreviewCard(props: PreviewCardProps): React.JSX.Element;

export interface SelectionIndicatorProps extends Omit<RAC.SelectionIndicatorProps, "className"> {
  className?: string;
}

/** Animated marker that slides to the selected item inside tabs, toggle groups and similar collections. */
export declare function SelectionIndicator(props: SelectionIndicatorProps): React.JSX.Element;

/* ---------- Large collections (re-exported from react-aria-components) ---------- */

export {
  Virtualizer,
  ListLayout,
  GridLayout,
  WaterfallLayout,
  TableLayout,
  Collection,
  RouterProvider,
  ListBoxLoadMoreItem,
  TableLoadMoreItem,
  GridListSection,
  GridListHeader,
  TableFooter,
} from "react-aria-components";
