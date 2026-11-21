// Type declarations for `@truvar-ai/design-system/widget`:
// the AI agent businesses embed on their own website.
import type * as React from "react";
import type * as RAC from "react-aria-components";

/* ------------------------------------------------------------------ */
/* Language and strings (useWidget)                                    */
/* ------------------------------------------------------------------ */

/** Language of the built-in strings. It follows the React Aria locale (`I18nProvider`). */
export type WidgetLang = "en" | "ar";

/** The built-in strings of the widget for the current language. */
export interface WidgetStrings {
  widget: string; open: string; close: string; minimize: string; back: string; menu: string;
  online: string; away: string; offline: string; repliesInstantly: string; aiAgent: string; teammate: string;
  hi: string; howHelp: string; askAnything: string; askSub: string;
  continueChat: string; talkNow: (name: string) => string; talkSub: string;
  message: string; send: string; attach: string; record: string; stopSend: string;
  cancelRecording: string; recording: string; suggestions: string;
  play: string; pause: string; transcript: string; showTranscript: string; hideTranscript: string;
  working: string; stepsDone: (n: number, format?: (n: number) => string) => string; showSteps: string; hideSteps: string;
  pickTime: string; chosen: string; noSlots: string;
  submit: string; required: string; sentDetails: string;
  confirm: string; change: string; confirmed: string; cancelled: string; needsApproval: string;
  choose: string; typing: (name: string) => string;
  rateTitle: string; rateThanks: string; rateLabel: string;
  /** Names of the five ratings, worst to best. */
  rating: readonly [string, string, string, string, string];
  call: string; startCall: string; connecting: string; live: string; ended: string; endCall: string;
  mute: string; unmute: string; speaker: string; listening: string; speaking: (name: string) => string; youSpeaking: string; you: string;
  callSummary: string; returnToChat: string;
  poweredBy: (name: string) => string; privacy: string;
  newMessage: (n: number) => string; newChat: string; emailChat: string; human: string;
  dismiss: string;
}

/** What `useWidget` returns: strings and locale-aware formatters. */
export interface WidgetContext {
  t: WidgetStrings;
  lang: WidgetLang;
  /** The React Aria locale, for example `"en-US"` or `"ar-EG"`. */
  locale: string;
  dir: "ltr" | "rtl";
  rtl: boolean;
  /** Time of day, for example "10:42". */
  time: (date: Date) => string;
  /** Locale-aware number. */
  num: (value: number) => string;
  /** Seconds as `m:ss` with localised digits. */
  clock: (seconds: number) => string;
}

/** Strings and formatters for the widget, in the language of the React Aria locale (`I18nProvider`). The widget can speak Arabic on an English site and the other way round. */
export declare function useWidget(): WidgetContext;

/* ------------------------------------------------------------------ */
/* Shared types                                                        */
/* ------------------------------------------------------------------ */

/** Whether anyone is there. `"offline"` shows no dot colour. */
export type WidgetPresence = "online" | "away" | "offline";

/** The business's agent: shown in the header, on messages and in calls. */
export interface WidgetAgent {
  name: string;
  /** Photo or logo URL. Without it the orbit mark is shown. */
  avatar?: string;
  /** Presence dot. Default `"online"` in the chat header. */
  status?: WidgetPresence;
  /** Line under the name in the chat header. Default "Replies instantly". */
  subtitle?: string;
}

/** The business that owns the widget. */
export interface WidgetBusiness {
  name?: string;
  /** Logo URL, shown on the home screen instead of the name. */
  logo?: string;
}

/** A teammate shown as an avatar on the home screen. */
export interface WidgetTeamMember {
  name: string;
  avatar?: string;
}

/** A person from the business who joined the chat (`from: "human"`). */
export interface WidgetAuthor {
  name: string;
  avatar?: string;
  /** Default "Team". */
  role?: string;
}

/** Who a thread item is from. `"human"` needs `author`. Default `"agent"`. */
export type WidgetFrom = "visitor" | "agent" | "human";

/** Fields every thread item can carry. */
export interface WidgetItemCommon {
  /** Unique id of the item. Required in a thread. */
  id?: string;
  from?: WidgetFrom;
  /** Required when `from` is `"human"`. */
  author?: WidgetAuthor;
  /** Shown under bubbles. */
  time?: Date;
  /** `"read"` shows a double tick on the visitor's messages. */
  status?: "sent" | "delivered" | "read";
}

/* ------------------------------------------------------------------ */
/* Scope, avatar, launcher, teaser                                     */
/* ------------------------------------------------------------------ */

/** Text colour that reads best on `hex` (white or near-black, by WCAG contrast). Returns white for invalid input. */
export declare function onAccent(hex: string | null | undefined): string;

export interface WidgetScopeProps extends Omit<React.ComponentPropsWithoutRef<"div">, "dir"> {
  /** The business's accent colour as a hex string. Default `"#0f6e5c"`. */
  accent?: string;
}

/** Wrapper that shows widget parts on their own (outside `WebWidget`) with the business's accent and direction. */
export declare function WidgetScope(props: WidgetScopeProps): React.JSX.Element;

export interface AgentAvatarProps {
  agent: WidgetAgent;
  /** Pixel size. Default 36. */
  size?: number;
  /** Shows a presence dot. */
  status?: WidgetPresence;
  /** Animates the orbit mark. Default false. */
  active?: boolean;
}

/** The business's photo or logo, or the orbit mark, with an optional presence dot. */
export declare function AgentAvatar(props: AgentAvatarProps): React.JSX.Element;

export interface WidgetLauncherProps {
  isOpen: boolean;
  onPress?: (e: RAC.PressEvent) => void;
  /** Unread count shown as a badge while closed. Default 0. */
  unread?: number;
  /** `"label"` adds text next to the icon while closed. Default `"icon"`. */
  variant?: "icon" | "label";
  /** Text of the `"label"` variant. Default "Chat with us". */
  text?: string;
  /** Accessible name. Default "Open chat" / "Close chat". */
  label?: string;
  buttonRef?: React.Ref<HTMLButtonElement>;
}

/** The round chat button that opens and closes the widget. */
export declare function WidgetLauncher(props: WidgetLauncherProps): React.JSX.Element;

export interface WidgetTeaserProps {
  agent: WidgetAgent;
  /** The proactive message. */
  text?: React.ReactNode;
  onOpen?: (e: RAC.PressEvent) => void;
  onDismiss?: (e: RAC.PressEvent) => void;
}

/** A small proactive message next to the launcher. */
export declare function WidgetTeaser(props: WidgetTeaserProps): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Thread items                                                        */
/* ------------------------------------------------------------------ */

/** A plain text bubble. Also used for any item whose `type` is not recognised. */
export interface WidgetTextItem extends WidgetItemCommon {
  type?: "text";
  text: string;
}

/** A voice note. `duration` is in seconds. */
export interface WidgetVoiceItem extends WidgetItemCommon {
  type: "voice";
  duration: number;
  transcript?: string;
}

/** A file bubble. `size` is a display string such as `"820 KB"`. */
export interface WidgetFileItem extends WidgetItemCommon {
  type: "file";
  name: string;
  size?: string;
}

/** One step of what the agent is doing. */
export interface WidgetStep {
  label: React.ReactNode;
  state: "pending" | "running" | "done" | "failed";
  detail?: React.ReactNode;
}

/** What the agent is doing, as it does it. Collapses to one line when every step is done. */
export interface AgentStepsItem extends WidgetItemCommon {
  type?: "steps";
  steps: readonly WidgetStep[];
}

/** One bookable time. */
export interface WidgetSlot {
  id: string;
  label: string;
}

/** A day with its open times. `weekday` and `date` are display strings. */
export interface WidgetSlotDay {
  id: string;
  weekday: string;
  date: string;
  slots: readonly WidgetSlot[];
}

/** What the visitor picked in a slot picker. */
export interface WidgetSlotSelection {
  /** Id of the day. */
  day: string;
  /** Id of the time. */
  slot: string;
  /** For example "Wed 25, 7:30 PM". */
  label: string;
}

/** Days, then times. Picking one is the visitor's reply. Locks once `selected` is set. */
export interface SlotPickerItem extends WidgetItemCommon {
  type?: "slots";
  days: readonly WidgetSlotDay[];
  /** The chosen time (the picker locks). Only `day` and `slot` are read. */
  selected?: { day: string; slot: string; label?: string } | null;
  /** Default "Pick a time". */
  title?: string;
}

/** A field of an inline form. */
export interface WidgetFormField {
  /** Key of the value in the submitted object. */
  name: string;
  label: string;
  /** `"phone"` shows the international phone field; other values are HTML input types. Default `"text"`. */
  type?: "phone" | RAC.TextFieldProps["type"];
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  /** Initial country of a phone field (ISO code). Default `"EG"`. */
  country?: string;
}

/** A short form inside the chat. Once `submitted` is set it shows what was shared. */
export interface InlineFormItem extends WidgetItemCommon {
  type?: "form";
  title?: string;
  fields: readonly WidgetFormField[];
  /** Default "Continue". */
  submitLabel?: string;
  /** The submitted values, by field name. */
  submitted?: Readonly<Record<string, React.ReactNode>> | null;
}

/** Before anything that commits the visitor, the agent asks. */
export interface WidgetApprovalItem extends WidgetItemCommon {
  type?: "confirm";
  title?: string;
  /** Label and value pairs. */
  rows: readonly (readonly [label: string, value: React.ReactNode])[];
  /** Default `"pending"`. */
  state?: "pending" | "confirmed" | "cancelled";
  note?: React.ReactNode;
  /** Default "Confirm". */
  confirmLabel?: string;
  /** Default "Change". */
  changeLabel?: string;
}

/** A service or product card. */
export interface WidgetChoiceCard {
  id: string;
  title: string;
  subtitle?: string;
  price?: string;
  /** Image URL. Without it the icon is shown. */
  image?: string;
  icon?: React.ReactNode;
  /** Default "Choose". */
  actionLabel?: string;
}

/** Services or products the visitor can pick from. Scrolls sideways. `selected` is the chosen card's id. */
export interface ChoiceCardsItem extends WidgetItemCommon {
  type?: "cards";
  title?: string;
  cards: readonly WidgetChoiceCard[];
  selected?: string | null;
}

/** A follow-up action on a result card. */
export interface WidgetResultAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

/** What got done: the booking, the order, the ticket. */
export interface ResultCardItem extends WidgetItemCommon {
  type?: "result";
  title: string;
  subtitle?: React.ReactNode;
  /** Success (default) or `"danger"`. */
  tone?: "success" | "danger";
  rows?: readonly (readonly [label: string, value: React.ReactNode])[];
  actions?: readonly WidgetResultAction[];
}

/** A satisfaction rating card. `value` (1 to 5) is set once the visitor has rated. */
export interface WidgetRatingItem extends WidgetItemCommon {
  type: "rating";
  title?: string;
  value?: number | null;
}

/** Summary of a finished voice call. `duration` is in seconds. */
export interface WidgetCallItem extends WidgetItemCommon {
  type: "call";
  duration: number;
  summary?: string;
}

/** A line in the middle of the thread, such as "Mona joined". */
export interface WidgetEventItem extends WidgetItemCommon {
  type: "event";
  text: React.ReactNode;
  icon?: React.ReactNode;
}

/** An item of the conversation, discriminated by `type` (text when missing). `id` is required in a thread. */
export type WidgetThreadItem =
  | (WidgetTextItem & { id: string })
  | (WidgetVoiceItem & { id: string })
  | (WidgetFileItem & { id: string })
  | (AgentStepsItem & { id: string })
  | (SlotPickerItem & { id: string })
  | (InlineFormItem & { id: string })
  | (WidgetApprovalItem & { id: string })
  | (ChoiceCardsItem & { id: string })
  | (ResultCardItem & { id: string })
  | (WidgetRatingItem & { id: string })
  | (WidgetCallItem & { id: string })
  | (WidgetEventItem & { id: string });

/** The arguments of `onAction` / `onItemAction`: the item, what the visitor did, and the data that goes with it. */
export type WidgetActionArgs =
  | [item: SlotPickerItem, action: "pick", payload: WidgetSlotSelection]
  | [item: InlineFormItem, action: "submit", payload: Record<string, string>]
  | [item: WidgetApprovalItem, action: "confirm" | "change"]
  | [item: ChoiceCardsItem, action: "choose", payload: WidgetChoiceCard]
  | [item: ResultCardItem, action: string]
  | [item: WidgetRatingItem, action: "rate", payload: number];

/** Handler of visitor actions inside thread items. */
export type WidgetActionHandler = (...args: WidgetActionArgs) => void;

export interface AgentStepsProps {
  item: AgentStepsItem;
}

/** What the agent is doing, as it does it. Collapses to one line when finished. */
export declare function AgentSteps(props: AgentStepsProps): React.JSX.Element;

export interface SlotPickerProps {
  item: SlotPickerItem;
  /** Called with `"pick"` and the chosen day, time and label. */
  onAction?: (item: SlotPickerItem, action: "pick", payload: WidgetSlotSelection) => void;
}

/** Days, then times. Picking one is the visitor's reply. */
export declare function SlotPicker(props: SlotPickerProps): React.JSX.Element;

export interface InlineFormProps {
  item: InlineFormItem;
  /** Called with `"submit"` and the values by field name (phone fields give E.164). */
  onAction?: (item: InlineFormItem, action: "submit", payload: Record<string, string>) => void;
}

/** A short form inside the chat. Once sent, it shows what was shared. */
export declare function InlineForm(props: InlineFormProps): React.JSX.Element;

export interface WidgetApprovalProps {
  item: WidgetApprovalItem;
  /** Called with `"confirm"` or `"change"`. */
  onAction?: (item: WidgetApprovalItem, action: "confirm" | "change") => void;
}

/** Before anything that commits the visitor (a booking, an order), the agent asks. */
export declare function WidgetApproval(props: WidgetApprovalProps): React.JSX.Element;

export interface ChoiceCardsProps {
  item: ChoiceCardsItem;
  /** Called with `"choose"` and the card. */
  onAction?: (item: ChoiceCardsItem, action: "choose", payload: WidgetChoiceCard) => void;
}

/** Services or products the visitor can pick from. Scrolls sideways. */
export declare function ChoiceCards(props: ChoiceCardsProps): React.JSX.Element;

export interface ResultCardProps {
  item: ResultCardItem;
  /** Called with the id of the pressed action. */
  onAction?: (item: ResultCardItem, action: string) => void;
}

/** What got done: the booking, the order, the ticket, with follow-up actions. */
export declare function ResultCard(props: ResultCardProps): React.JSX.Element;

export interface WidgetItemProps {
  item: WidgetThreadItem;
  onAction?: WidgetActionHandler;
}

/** Renders one thread item according to its `type`. */
export declare function WidgetItem(props: WidgetItemProps): React.JSX.Element;

export interface WidgetThreadProps {
  items: readonly WidgetThreadItem[];
  agent: WidgetAgent;
  /** The agent is typing. A string names who (for example a teammate). */
  typing?: boolean | string;
  onAction?: WidgetActionHandler;
}

/** The conversation. Who is speaking is shown once at the start of each run of messages. */
export declare function WidgetThread(props: WidgetThreadProps): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Composer, call, home                                                */
/* ------------------------------------------------------------------ */

/** What a recorded voice note reports. */
export interface WidgetVoiceNote {
  /** Length in seconds. */
  duration: number;
}

export interface WidgetComposerProps {
  /** Called with the trimmed text on Enter or Send. */
  onSend?: (text: string) => void;
  onVoiceNote?: (note: WidgetVoiceNote) => void;
  onAttach?: (files: File[]) => void;
  /** Shows the microphone when the box is empty. Default true. */
  voiceNotes?: boolean;
  /** Shows the attach button. Default true. */
  attachments?: boolean;
  /** Quick replies above the box. */
  suggestions?: readonly string[];
  onSuggestion?: (suggestion: string) => void;
  /** Placeholder and accessible name. Default "Message…". */
  placeholder?: string;
  /** On phones Enter adds a line instead of sending. */
  isPhone?: boolean;
  /** Ref to the text box. */
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

/** Text, attachments and voice notes. Mic when empty, send when there is text. */
export declare function WidgetComposer(props: WidgetComposerProps): React.JSX.Element;

/** A line of the live call captions. */
export interface WidgetCaption {
  from: "agent" | "visitor";
  text: string;
}

/** State of the live voice call. The host owns it. */
export interface WidgetCallState {
  state: "connecting" | "live" | "ended";
  /** Seconds since the call connected. */
  elapsed?: number;
  muted?: boolean;
  /** Speakerphone on. */
  loud?: boolean;
  /** Who is speaking right now. */
  speaker?: "agent" | "visitor" | null;
  /** Live captions; the last two are shown. */
  captions?: readonly WidgetCaption[];
}

export interface WidgetCallProps {
  agent: WidgetAgent;
  call: WidgetCallState;
  onMuteChange?: (muted: boolean) => void;
  onSpeakerChange?: (loud: boolean) => void;
  onEnd?: (e: RAC.PressEvent) => void;
  /** Back to the chat after the call has ended. */
  onBack?: (e: RAC.PressEvent) => void;
}

/** A live voice call inside the widget, with captions so it works with the sound off. */
export declare function WidgetCall(props: WidgetCallProps): React.JSX.Element;

/** A way to start on the home screen. */
export interface WidgetHomeAction {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface WidgetHomeProps {
  agent: WidgetAgent;
  business?: WidgetBusiness;
  /** Default "Hi there". */
  greeting?: string;
  /** Default "How can we help today?". */
  subtitle?: string;
  actions?: readonly WidgetHomeAction[];
  /** Called with the id of the pressed action. */
  onAction?: (id: string) => void;
  /** "Ask anything" was pressed. */
  onAsk?: (e: RAC.PressEvent) => void;
  /** Shows a "Call" tile when given. */
  onCall?: (e: RAC.PressEvent) => void;
  /** Preview of the last conversation; shows a "Continue your conversation" tile. */
  recent?: React.ReactNode;
  onRecent?: (e: RAC.PressEvent) => void;
  team?: readonly WidgetTeamMember[];
}

/** The first screen: greeting, ways to start, and a call if it is on. */
export declare function WidgetHome(props: WidgetHomeProps): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* The widget                                                          */
/* ------------------------------------------------------------------ */

/** The screen the widget shows. */
export type WidgetView = "home" | "chat" | "call";

/** A custom entry of the chat menu. */
export interface WidgetMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

/** Features you can switch off. All default to true. */
export interface WidgetFeatures {
  voiceNotes?: boolean;
  attachments?: boolean;
  call?: boolean;
}

export interface WebWidgetProps {
  /** Open state (controlled). */
  isOpen?: boolean;
  /** Initial open state when uncontrolled. Default false. */
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Screen shown (controlled). Default: starts at `"home"`. */
  view?: WidgetView;
  onViewChange?: (view: WidgetView) => void;
  agent: WidgetAgent;
  business?: WidgetBusiness;
  /** Teammates shown on the home screen. */
  team?: readonly WidgetTeamMember[];
  /** Brand colour as a hex string. Default `"#0f6e5c"`. */
  accent?: string;
  /** Which side the widget sits on: `"end"` is right in English and left in Arabic. Default `"end"`. */
  position?: "start" | "end";
  /** `"label"` adds text next to the launcher icon. Default `"icon"`. */
  launcher?: "icon" | "label";
  launcherText?: string;
  /** A proactive message next to the launcher while closed. */
  teaser?: React.ReactNode;
  onTeaserDismiss?: (e: RAC.PressEvent) => void;
  /** Unread count on the launcher. Default 0. */
  unread?: number;
  greeting?: string;
  subtitle?: string;
  homeActions?: readonly WidgetHomeAction[];
  /** Called with the id of a pressed home action (the widget also moves to the chat). */
  onHomeAction?: (id: string) => void;
  /** Preview of the last conversation on the home screen. */
  recent?: React.ReactNode;
  /** The conversation. The host owns it. */
  items?: readonly WidgetThreadItem[];
  /** The agent is typing; a string names who. */
  typing?: boolean | string;
  /** Quick replies above the message box. */
  suggestions?: readonly string[];
  onSend?: (text: string) => void;
  /** Called when a quick reply is pressed. Default: `onSend`. */
  onSuggestion?: (suggestion: string) => void;
  onVoiceNote?: (note: WidgetVoiceNote) => void;
  onAttach?: (files: File[]) => void;
  /** Visitor actions inside items: pick a slot, confirm, submit a form, rate. */
  onItemAction?: WidgetActionHandler;
  features?: WidgetFeatures;
  /** State of the live call (the host owns it). */
  call?: WidgetCallState | null;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onCallMute?: (muted: boolean) => void;
  onCallSpeaker?: (loud: boolean) => void;
  /** Entries of the chat menu. Default: "Start a new chat" and "Email me this chat". */
  menuItems?: readonly WidgetMenuItem[];
  onMenuAction?: (id: string) => void;
  /** Name in "Powered by …". Default `"Truvar"`; pass `null` or `""` to hide. */
  poweredBy?: string | null;
  /** Show the privacy note on the home screen. Default true. */
  privacyNote?: boolean;
  /** Position inside the nearest positioned parent instead of the viewport (previews, docs). Default false. */
  contained?: boolean;
  /** `"auto"` follows the screen size, `"phone"` forces the full-screen phone layout. Default `"auto"`. */
  layout?: "auto" | "phone";
  /** Accessible name of the dialog. Default: agent and business name. */
  label?: string;
}

/** The embeddable website assistant: launcher, teaser and panel. Floats over the host page; on phones the panel is full screen. */
export declare function WebWidget(props: WebWidgetProps): React.JSX.Element;
