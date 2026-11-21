import type * as React from "react";
import type * as RAC from "react-aria-components";

/** Built-in interface strings (English and Arabic) returned by useMessages. */
export interface CoreMessages {
  /** "Choose an option" */
  choose: string;
  /** "No matches. Try another name." */
  noMatches: string;
  /** "Choose a date" */
  chooseDate: string;
  /** "Press again to confirm" */
  pressAgain: string;
  /** "Not rated yet" */
  notRated: string;
  /** Builds "3 of 5" from two already-formatted numbers. */
  of: (n: string, m: string) => string;
  /** "Remove" */
  remove: string;
  /** "Clear search" */
  clear: string;
}

/** Built-in strings for the current locale (English, or Arabic when the locale starts with "ar"); falls back to English. */
export declare function useMessages(): CoreMessages;

/* ---------- Button ---------- */

export interface ButtonProps extends Omit<RAC.ButtonProps, "className" | "children"> {
  /** Visual style. Default "primary". */
  variant?: "primary" | "secondary" | "ghost" | "danger" | "danger-solid";
  /** Default "md". */
  size?: "md" | "sm";
  className?: RAC.ButtonProps["className"];
  /** Content, or a render function that receives the button state. A spinner is added while isPending. */
  children?: RAC.ButtonProps["children"];
}

/** Button with Truvar variants; shows the orbit spinner while `isPending`. */
export declare function Button(props: ButtonProps): React.JSX.Element;

export interface IconButtonProps extends Omit<RAC.ButtonProps, "aria-label"> {
  /** Accessible name (also what a Tooltip should say). */
  label: string;
}

/** Icon-only button; `label` becomes its aria-label. */
export declare function IconButton(props: IconButtonProps): React.JSX.Element;

/* ---------- Text, checkbox, switch, radio ---------- */

export interface TextFieldProps extends Omit<RAC.TextFieldProps, "className" | "children"> {
  /** Visible label. */
  label?: React.ReactNode;
  /** Help text under the field. */
  description?: React.ReactNode;
  /** Replaces the browser's validation message when the field is invalid. */
  errorMessage?: React.ReactNode;
  placeholder?: string;
  /** Render a multi-line textarea instead of an input. */
  multiline?: boolean;
}

/** Text input (or textarea) with label, description and error message. */
export declare function TextField(props: TextFieldProps): React.JSX.Element;

export interface CheckboxProps extends Omit<RAC.CheckboxProps, "className" | "children"> {
  children?: React.ReactNode;
}

/** Checkbox with an indeterminate state. */
export declare function Checkbox(props: CheckboxProps): React.JSX.Element;

export interface SwitchProps extends Omit<RAC.SwitchProps, "className" | "children"> {
  children?: React.ReactNode;
}

/** On/off switch. */
export declare function Switch(props: SwitchProps): React.JSX.Element;

export interface RadioGroupProps extends Omit<RAC.RadioGroupProps, "className" | "children"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Radio elements (or RadioCard / RadioRow items). */
  children?: React.ReactNode;
  /** Lay the options out as cards. */
  cards?: boolean;
}

/** Group of radio buttons with label, description and validation message. */
export declare function RadioGroup(props: RadioGroupProps): React.JSX.Element;

export interface RadioProps extends Omit<RAC.RadioProps, "className" | "children"> {
  children?: React.ReactNode;
}

/** One radio button; use inside RadioGroup. */
export declare function Radio(props: RadioProps): React.JSX.Element;

/* ---------- Select, ComboBox, Item ---------- */

export interface ItemProps extends Omit<RAC.ListBoxItemProps, "className" | "children"> {
  /** The item's label. When it is not a string, also set textValue for typeahead and screen readers. */
  children?: React.ReactNode;
  /** Secondary text under the label. */
  description?: React.ReactNode;
  /** Shown before the label, in the list and in the Select button once chosen (logos, avatars, flags). */
  icon?: React.ReactNode;
}

/** An option for Select and ComboBox, with optional description and icon. */
export declare function Item(props: ItemProps): React.JSX.Element;

export interface SelectProps<T extends object, M extends "single" | "multiple" = "single">
  extends Omit<RAC.SelectProps<T, M>, "className" | "children" | "placeholder"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Default: "Choose an option" / "اختر خيارًا". */
  placeholder?: string;
  /** Data for a dynamic list; render each with a function child. */
  items?: Iterable<T>;
  /** Item elements, or a function that renders one item from `items`. */
  children?: React.ReactNode | ((item: T) => React.ReactNode);
}

/** Drop-down select. Pass `items` and an Item render function, or static Item children. */
export declare function Select<T extends object, M extends "single" | "multiple" = "single">(
  props: SelectProps<T, M>,
): React.JSX.Element;

export interface ComboBoxProps<T extends object, M extends "single" | "multiple" = "single">
  extends Omit<RAC.ComboBoxProps<T, M>, "className" | "children" | "placeholder"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  placeholder?: string;
  /** Data for a dynamic list; render each with a function child. */
  items?: Iterable<T>;
  /** Item elements, or a function that renders one item from `items`. */
  children?: React.ReactNode | ((item: T) => React.ReactNode);
}

/** Text input with a filtered suggestion list. */
export declare function ComboBox<T extends object, M extends "single" | "multiple" = "single">(
  props: ComboBoxProps<T, M>,
): React.JSX.Element;

/* ---------- Tags ---------- */

export interface TagGroupProps<T extends object = object> extends Omit<RAC.TagGroupProps, "className" | "children"> {
  label?: React.ReactNode;
  /** Data for a dynamic list; render each with a function child. */
  items?: Iterable<T>;
  /** Tag elements, or a function that renders one tag from `items`. */
  children?: React.ReactNode | ((item: T) => React.ReactNode);
}

/** Group of selectable or removable chips (set onRemove to show remove buttons). */
export declare function TagGroup<T extends object = object>(props: TagGroupProps<T>): React.JSX.Element;

export interface TagProps extends Omit<RAC.TagProps, "className" | "children" | "textValue"> {
  /** Tag text. A remove button is added when the TagGroup has onRemove. */
  children?: React.ReactNode;
}

/** One chip in a TagGroup. */
export declare function Tag(props: TagProps): React.JSX.Element;

/* ---------- Tabs ---------- */

export interface TabsProps extends Omit<RAC.TabsProps, "className"> {}

/** Tab container; holds a TabList and one TabPanel per Tab. */
export declare function Tabs(props: TabsProps): React.JSX.Element;

export interface TabListProps<T extends object = object> extends Omit<RAC.TabListProps<T>, "className"> {}

/** The row of tabs. */
export declare function TabList<T extends object = object>(props: TabListProps<T>): React.JSX.Element;

export interface TabProps extends Omit<RAC.TabProps, "className" | "children"> {
  children?: React.ReactNode;
}

/** One tab; its `id` matches the `id` of its TabPanel. */
export declare function Tab(props: TabProps): React.JSX.Element;

export interface TabPanelProps extends Omit<RAC.TabPanelProps, "className"> {}

/** Content shown while the tab with the same `id` is selected. */
export declare function TabPanel(props: TabPanelProps): React.JSX.Element;

/* ---------- Slider ---------- */

export interface SliderProps<T extends number | number[] = number | number[]>
  extends Omit<RAC.SliderProps<T>, "className" | "children"> {
  /** Visible label. Without one, set aria-label. */
  label?: React.ReactNode;
  /** Accessible names of the thumbs of a range slider, e.g. ["Minimum", "Maximum"]. */
  thumbLabels?: readonly string[];
}

/** Slider with one thumb (number value) or a range (array value). */
export declare function Slider<T extends number | number[] = number | number[]>(props: SliderProps<T>): React.JSX.Element;

/* ---------- DatePicker ---------- */

export interface DatePickerProps<T extends RAC.DateValue = RAC.DateValue>
  extends Omit<RAC.DatePickerProps<T>, "className" | "children"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

/** Date field with a calendar pop-up. Values are @internationalized/date objects. */
export declare function DatePicker<T extends RAC.DateValue = RAC.DateValue>(props: DatePickerProps<T>): React.JSX.Element;

/* ---------- Menu ---------- */

export interface MenuButtonProps<T extends object = object> extends Omit<RAC.MenuProps<T>, "className"> {
  /** Button text, or the accessible name when `icon` is set. */
  label: string;
  /** Show an icon-only button instead of a text button with a chevron. */
  icon?: React.ReactNode;
}

/** Button that opens a menu of MenuItem, MenuSeparator, MenuSection and similar children. */
export declare function MenuButton<T extends object = object>(props: MenuButtonProps<T>): React.JSX.Element;

export interface MenuItemProps extends Omit<RAC.MenuItemProps, "className" | "children" | "textValue"> {
  children?: React.ReactNode;
  /** Icon before the label. */
  icon?: React.ReactNode;
  /** Red styling for destructive actions. */
  danger?: boolean;
}

/** One menu entry. Its `id` is passed to the menu's onAction. */
export declare function MenuItem(props: MenuItemProps): React.JSX.Element;

/** Divider between groups of menu items. */
export declare function MenuSeparator(): React.JSX.Element;

/* ---------- Modal ---------- */

export interface ModalProps {
  /** The element that opens the dialog (usually a Button). */
  trigger?: React.ReactNode;
  /** Dialog heading. */
  title?: React.ReactNode;
  /** Dialog body, or a function that receives `close`. */
  children?: React.ReactNode | ((state: { close: () => void }) => React.ReactNode);
  /** Close on outside click. Default true. */
  isDismissable?: boolean;
}

/** Modal dialog opened by its trigger. */
export declare function Modal(props: ModalProps): React.JSX.Element;

/* ---------- Tooltip ---------- */

export interface TooltipProps extends Omit<RAC.TooltipTriggerComponentProps, "children"> {
  /** Tooltip text. */
  content: React.ReactNode;
  /** The element the tooltip describes; must be focusable (a Button or IconButton). */
  children?: React.ReactNode;
  placement?: RAC.TooltipProps["placement"];
}

/** Tooltip shown on hover and focus after 400 ms. */
export declare function Tooltip(props: TooltipProps): React.JSX.Element;

/* ---------- SegmentedControl ---------- */

export interface SegmentedControlOption<K extends string | number = string> {
  id: K;
  /** Button content. */
  label: React.ReactNode;
  /** Language of the label (e.g. "ar"), when it differs from the page. */
  lang?: string;
}

export interface SegmentedControlProps<K extends string | number = string>
  extends Omit<
    RAC.ToggleButtonGroupProps,
    | "className"
    | "children"
    | "selectionMode"
    | "disallowEmptySelection"
    | "selectedKeys"
    | "defaultSelectedKeys"
    | "onSelectionChange"
    | "value"
    | "defaultValue"
    | "onChange"
  > {
  options: readonly SegmentedControlOption<K>[];
  /** The id of the selected option (controlled). */
  value: K;
  /** Called with the id of the newly selected option. */
  onChange?: (id: K) => void;
}

/** Single-choice toggle group drawn as one pill with a sliding indicator. */
export declare function SegmentedControl<K extends string | number = string>(
  props: SegmentedControlProps<K>,
): React.JSX.Element;

/* ---------- SearchField ---------- */

export interface SearchFieldProps extends Omit<RAC.SearchFieldProps, "className" | "children"> {
  label?: React.ReactNode;
  placeholder?: string;
}

/** Search input with a clear button. */
export declare function SearchField(props: SearchFieldProps): React.JSX.Element;

/* ---------- ConfirmButton, Rating ---------- */

export interface ConfirmButtonProps extends Omit<ButtonProps, "onPress" | "onBlur" | "className" | "children"> {
  /** Label before the first press. */
  children?: React.ReactNode;
  /** Label while armed. Default "Press again to confirm" / "اضغط مرة أخرى للتأكيد". */
  confirmLabel?: React.ReactNode;
  /** Called on the second press. */
  onConfirm?: () => void;
}

/** Destructive button that needs two presses; the first arms it for 4 seconds. */
export declare function ConfirmButton(props: ConfirmButtonProps): React.JSX.Element;

export interface RatingProps {
  label?: React.ReactNode;
  /** Number of dots. Default 5. */
  max?: number;
  /** Controlled value (1 to max; 0 for none). */
  value?: number;
  /** Initial value when uncontrolled. Default 0. */
  defaultValue?: number;
  /** Called with the chosen rating. */
  onChange?: (value: number) => void;
  /** Names for each rating, from lowest to highest (e.g. ["Poor", "OK", "Good"]). Default "n of max". */
  labels?: readonly string[];
}

/** Rating built from a radio group, drawn with the orbit dots. */
export declare function Rating(props: RatingProps): React.JSX.Element;

/* ---------- Re-exports (mirror src/core/index.jsx) ---------- */

export * from "./core/more.js";
export * from "./core/intl.js";
export { Flag } from "./core/flag.js";
export * from "./core/countries.js";
export * from "./core/format.js";
export * from "./core/phase2.js";
export * from "./core/bottomnav.js";
export * from "./core/systembars.js";
export * from "./core/shell.js";
export { Logo, OrbitMark, BrandAvatar, OrbitLoader, BrandProvider, useBrand, BRANDS, EasySocialsMark } from "./brand.js";
export type { FlagProps } from "./core/flag.js";
export type {
  BrandName,
  LogoVariant,
  LogoTone,
  OrbitActivity,
  LogoProps,
  OrbitMarkProps,
  BrandAvatarProps,
  OrbitLoaderProps,
  BrandProviderProps,
  EasySocialsMarkProps,
} from "./brand.js";
