// Type declarations for `@truvar-ai/design-system/crm`:
// conversations across every channel, contact records, roles and permissions, pipeline and calendar.
import type * as React from "react";
import type * as RAC from "react-aria-components";

/* ------------------------------------------------------------------ */
/* Shared domain types                                                 */
/* ------------------------------------------------------------------ */

/** Language of the built-in strings. It follows the React Aria locale (`I18nProvider`): Arabic locales give `"ar"`, everything else `"en"`. */
export type CrmLang = "en" | "ar";

/** Every channel a customer can write from (the 19 keys of the channel table). */
export type ChannelId =
  | "whatsapp"
  | "instagram"
  | "messenger"
  | "facebook"
  | "telegram"
  | "tiktok"
  | "x"
  | "threads"
  | "linkedin"
  | "youtube"
  | "google"
  | "snapchat"
  | "viber"
  | "line"
  | "wechat"
  | "sms"
  | "email"
  | "phone"
  | "webchat";

/** Colour tones understood by badges, pipeline stages and calendar event types. */
export type CrmTone = "neutral" | "navy" | "accent" | "success" | "warning" | "danger" | "info" | "violet";

/** Tone of a role icon. Unknown or missing tones render as `"navy"`. */
export type RoleTone = "navy" | "accent" | "neutral";

/** Who is answering a conversation: the AI agent or a person. */
export type AiMode = "ai" | "human";

/** Where a conversation is in its life. The inbox shows one status at a time (open by default). */
export type ConversationStatus = "open" | "snoozed" | "closed";

/** Who sent a message. `"system"` is used for event lines such as "Demo booked". */
export type MessageFrom = "contact" | "agent" | "ai" | "system";

/** Kind of a message; selects the member of the {@link Message} union. */
export type MessageKind = "text" | "image" | "file" | "voice" | "call" | "note" | "event";

/** Delivery receipt of an outgoing message. */
export type MessageStatus = "sent" | "delivered" | "read" | "failed";

/** A person who can be assigned a conversation (the signed-in user is `me`). */
export interface TeamMember {
  id: string;
  name: string;
}

/** The person a conversation is assigned to. */
export type ConversationAssignee = TeamMember;

/** Identifier of a contact. Conversations point to contacts by this id; the inbox looks it up in its `contacts` map. */
export type ContactId = string | number;

/** How a contact can be reached on one channel. */
export interface ContactIdentity {
  channel: ChannelId;
  /** Phone number, username, address or page name, shown as-is. */
  handle: string;
}

/** Where a contact first came from. */
export interface ContactSource {
  channel: ChannelId;
  label: string;
  /** Shown as "First contact: <day>". */
  date: Date;
  campaign?: string | null;
}

/** The deal shown in the contact panel. All values are display strings. */
export interface ContactDeal {
  name: string;
  /** Stage name. */
  stage: string;
  tone?: CrmTone;
  /** Already formatted, for example `"EGP 54K"`. */
  value: string;
  owner?: string;
}

/** A previous conversation, listed in the contact panel. */
export interface ContactHistoryItem {
  id: string | number;
  channel: ChannelId;
  title: string;
  time: Date;
}

/** A contact record as read by `ContactPanel` and `ContactHeader`. Every field except `name` is optional and is left out when missing. */
export interface ContactDetails {
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  language?: string;
  /** Photo URL (used by the sidebar layout of `ContactHeader`). */
  photo?: string;
  identities?: readonly ContactIdentity[];
  source?: ContactSource;
  deal?: ContactDeal;
  /** Pipeline stage badge for `ContactHeader`. */
  stage?: { label: string; tone?: CrmTone };
  tags?: readonly string[];
  history?: readonly ContactHistoryItem[];
  /** AI summary text. */
  summary?: string;
}

/** A contact record with the id that conversations refer to. */
export interface Contact extends ContactDetails {
  id: ContactId;
}

/** Service level target of a conversation. The chip only shows once `overdue` is true. */
export interface ConversationSla {
  label: string;
  overdue?: boolean;
}

/** One conversation, as listed in the inbox. */
export interface Conversation {
  id: string;
  /** `id` is the key into the inbox's `contacts` map. */
  contact: { id: ContactId; name: string };
  /** The channel the customer writes from. */
  channel: ChannelId;
  /** Last message, shown under the name. */
  preview: string;
  /** Who wrote the last message: a person on your team (`"agent"`) shows "You:", the AI agent shows a sparkle. */
  lastFrom?: Exclude<MessageFrom, "system">;
  /** Time of the last message. */
  time: Date;
  /** Number of unread messages; a count bubble shows when above 0. */
  unread?: number;
  status: ConversationStatus;
  assignee?: ConversationAssignee | null;
  /** Who is answering right now. Defaults to `"ai"` in the inbox. */
  ai?: AiMode;
  /** `"high"` shows a priority dot. */
  priority?: "high";
  sla?: ConversationSla;
  tags?: readonly string[];
  /** WhatsApp's 24-hour reply window has closed: the composer offers approved templates instead. */
  windowClosed?: boolean;
}

/** Fields every message carries. */
export interface MessageBase {
  id: string;
  from: MessageFrom;
  /** The channel the message travelled on; shown as a small mark in the bubble footer. */
  channel?: ChannelId;
  time: Date;
  /** Name shown above messages from your team. */
  author?: string;
  /** Receipt, shown on outgoing messages only. */
  status?: MessageStatus;
}

/** A plain text message. */
export interface TextMessage extends MessageBase {
  kind: "text";
  text: string;
}

/** A photo. Without `image.src` a placeholder with the alt text is shown. */
export interface ImageMessage extends MessageBase {
  kind: "image";
  image?: { src?: string; alt?: string };
  /** Caption. */
  text?: string;
}

/** A file attachment. `size` is a display string such as `"248 KB"`. */
export interface FileMessage extends MessageBase {
  kind: "file";
  file: { name: string; size: string };
  text?: string;
}

/** A voice note. `duration` is a display string such as `"0:42"`. */
export interface VoiceMessage extends MessageBase {
  kind: "voice";
  voice: { duration: string };
  text?: string;
}

/** A phone call card. */
export interface CallMessage extends MessageBase {
  kind: "call";
  call: { title: string; duration: string; outcome: string; direction?: "in" | "out" };
  text?: string;
}

/** An internal note, visible to your team only. */
export interface NoteMessage extends MessageBase {
  kind: "note";
  text: string;
}

/** A line in the middle of the thread, such as "Demo booked" or "Omar took over". */
export interface EventMessage extends MessageBase {
  kind: "event";
  text: string;
}

/** A message in a thread, discriminated by `kind`. */
export type Message =
  | TextMessage
  | ImageMessage
  | FileMessage
  | VoiceMessage
  | CallMessage
  | NoteMessage
  | EventMessage;

/** A saved reply the agent can insert from the composer. */
export interface SavedReply {
  id: string;
  title: string;
  text: string;
}

/** An approved message template, sent when WhatsApp's 24-hour window has closed. */
export interface MessageTemplate {
  id: string;
  title: string;
  text: string;
}

/** What the composer reports when the agent sends. */
export interface ComposerSendPayload {
  text: string;
  /** `"note"` is an internal note, `"reply"` goes to the customer. */
  mode: "reply" | "note";
  channel: ChannelId;
  /** Attached files. Present for ordinary sends, absent for template sends. */
  files?: File[];
  /** Id of the template, when one was sent. */
  template?: string;
}

/* ------------------------------------------------------------------ */
/* Strings and formatting (useCrm)                                     */
/* ------------------------------------------------------------------ */

/** The built-in strings of the CRM kit for the current language. */
export interface CrmStrings {
  conversations: string; search: string; mine: string; unassigned: string; all: string;
  open: string; snoozed: string; closed: string; filter: string; channels: string; status: string; clearFilters: string;
  noConversations: string; select: string; cancel: string; selected: (n: number | string) => string;
  assign: string; assignTo: string; unassign: string; me: string; close: string; reopen: string; snooze: string;
  snoozeFor: { h1: string; tomorrow: string; week: string }; back: string; details: string;
  you: string; ai: string; aiAgent: string; note: string; today: string; yesterday: string;
  sent: string; delivered: string; read: string; failed: string; retry: string;
  reply: string; internalNote: string; replyVia: string; typeReply: (channelName: string) => string;
  typeNote: string; send: string; attach: string; emoji: string;
  savedReplies: string; suggest: string; suggestion: string; useIt: string; dismiss: string;
  windowClosed: string; template: string;
  sendTemplate: string; enterHint: string;
  aiActive: string; aiActiveSub: string;
  takeOver: string; youHandle: string; aiResumesIn: (time: string) => string;
  aiPaused: string; handBack: string; resumeAfter: string;
  never: string; min: (n: number | string) => string; hour: (n: number | string) => string; aiResumed: string;
  tookOver: (name: string) => string; handedBack: (name: string) => string;
  summary: string; about: string; identities: string; source: string; firstTouch: string; campaign: string;
  deal: string; owner: string; stage: string; value: string; tags: string; history: string; openProfile: string;
  phone: string; location: string; language: string; call: string; email: string; message: string; meeting: string;
  more: string; edit: string; save: string;
  activity: string; logNote: string; allActivity: string; empty: string;
  permissions: string; scope: string; scopes: Record<PermissionScope, string>;
  actions: Record<PermissionAction, string>; allActions: string;
  pipeline: string; dropHere: string; drag: string; moveTo: string; addDeal: string;
  calendar: string; previous: string; next: string; view: string; views: Record<CalendarView, string>;
  moreEvents: (n: number | string) => string; newEvent: string; noEvents: string; allDay: string;
  copy: string; copied: string; calling: string; onHold: string; mute: string; hold: string; hangUp: string;
  systemRole: string; members: (n: number, format?: (n: number) => string) => string;
}

/** What `useCrm` returns: strings and locale-aware formatters. */
export interface CrmContext {
  /** Strings for the current language. */
  t: CrmStrings;
  lang: CrmLang;
  /** The React Aria locale, for example `"en-US"` or `"ar-EG"`. */
  locale: string;
  /** True when the locale is right-to-left. */
  rtl: boolean;
  /** Time of day, for example "10:42". */
  time: (date: Date) => string;
  /** How chat apps label a conversation's last message: time, "Yesterday", weekday, or day and month. */
  when: (date: Date, now?: Date) => string;
  /** Day separator label: "Today", "Yesterday" or a full date. */
  day: (date: Date, now?: Date) => string;
  /** Locale-aware number. */
  num: (value: number) => string;
}

/** Strings and formatters for the CRM kit, in the language of the React Aria locale (`I18nProvider`). */
export declare function useCrm(): CrmContext;

/* ------------------------------------------------------------------ */
/* Channels                                                            */
/* ------------------------------------------------------------------ */

/** All 19 channel ids, in display order. */
export declare const CHANNELS: readonly ChannelId[];

/** The channel's name in English or Arabic (falls back to the id). */
export declare function channelName(id: ChannelId, lang?: CrmLang): string;

/** Hook returning a `channelName` function bound to the current language. */
export declare function useChannelName(): (id: ChannelId) => string;

export interface ChannelIconProps {
  channel: ChannelId;
  /** Pixel size. Default 16. */
  size?: number;
  /** Accessible name. Without it the mark is decorative. */
  label?: string;
  className?: string;
}

/** A channel's brand mark in its colour (black marks follow the theme). */
export declare function ChannelIcon(props: ChannelIconProps): React.JSX.Element | null;

export interface ChannelBadgeProps {
  channel: ChannelId;
  /** Pixel size. Default 18. */
  size?: number;
  /** Accessible name. Without it the badge is decorative. */
  label?: string;
  className?: string;
}

/** A round badge with a white mark on the channel's brand colour. */
export declare function ChannelBadge(props: ChannelBadgeProps): React.JSX.Element | null;

export interface ChannelLabelProps {
  channel: ChannelId;
  /** Icon size in pixels. Default 14. */
  size?: number;
  className?: string;
}

/** A channel's mark plus its name, for "via WhatsApp" lines, filters and pickers. */
export declare function ChannelLabel(props: ChannelLabelProps): React.JSX.Element;

export interface ChannelAvatarProps {
  /** The avatar to decorate, usually an `<Avatar>`. */
  avatar?: React.ReactNode;
  /** The channel badge sits on the avatar's corner; omitted means no badge. */
  channel?: ChannelId;
  /** Pixel size of the avatar. Default 40. */
  size?: number;
}

/** An avatar with the channel the person writes from on its corner. */
export declare function ChannelAvatar(props: ChannelAvatarProps): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* AI handoff                                                          */
/* ------------------------------------------------------------------ */

/** The handoff state of one conversation. */
export interface AiHandoffState {
  mode: AiMode;
  /** Minutes of silence before the AI agent resumes; `null` keeps it paused until handed back. */
  minutes: number | null;
  /** Epoch milliseconds when the AI agent resumes; `null` when no timer runs. */
  resumeAt: number | null;
}

/** Why the handoff mode changed. */
export type AiHandoffReason = "timeout" | "takeover" | "handback";

/** The "resume AI after" choices, in minutes (`null` = never). */
export declare const RESUME_OPTIONS: readonly (number | null)[];

/** Starts a handoff state. Defaults: `mode` `"ai"`, `minutes` 15. */
export declare function aiStart(mode?: AiMode, minutes?: number | null): AiHandoffState;
/** A person takes over; the resume timer starts. */
export declare function aiTakeOver(state: AiHandoffState): AiHandoffState;
/** Hands the conversation back to the AI agent. */
export declare function aiHandBack(state: AiHandoffState): AiHandoffState;
/** A reply from a person: (re)starts the resume timer. */
export declare function aiTouch(state: AiHandoffState): AiHandoffState;
/** Changes the resume delay (restarts the timer while a person is handling). */
export declare function aiSetMinutes(state: AiHandoffState, minutes: number | null): AiHandoffState;

export interface UseAiHandoffOptions {
  /** Who answers first. Default `"ai"`. */
  initial?: AiMode;
  /** Minutes without a reply before the AI agent resumes; `null` = stay paused. Default 15. */
  resumeAfter?: number | null;
  /** Called when the mode changes by take over, hand back or timeout. */
  onChange?: (mode: AiMode, reason: AiHandoffReason) => void;
}

export interface UseAiHandoffResult extends AiHandoffState {
  /** Milliseconds until the AI agent resumes; `null` when no timer runs. */
  remaining: number | null;
  takeOver: () => void;
  handBack: () => void;
  /** Call when a person replies, to restart the timer. */
  touch: () => void;
  /** Change the resume delay in minutes (`null` = never). */
  setMinutes: (minutes: number | null) => void;
}

/** Standalone AI handoff state for one conversation: take over, hand back, and the auto-resume timer. */
export declare function useAiHandoff(options?: UseAiHandoffOptions): UseAiHandoffResult;

export interface AiAgentBarProps {
  mode: AiMode;
  /** Resume delay in minutes; `null` means paused until handed back. */
  minutes?: number | null;
  /** Milliseconds until the AI agent resumes. */
  remaining?: number | null;
  onTakeOver?: RAC.ButtonProps["onPress"];
  onHandBack?: RAC.ButtonProps["onPress"];
  onMinutesChange?: (minutes: number | null) => void;
  /** Choices in the resume menu, in minutes. Default {@link RESUME_OPTIONS}. */
  options?: readonly (number | null)[];
}

/** The bar above the composer: who is answering, and the controls to take over, hand back or set the resume delay. */
export declare function AiAgentBar(props: AiAgentBarProps): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Conversation list, thread and composer                              */
/* ------------------------------------------------------------------ */

export interface ConversationItemContentProps {
  c: Conversation;
}

/** The inside of one conversation row: avatar with channel, name, preview, unread count and chips. */
export declare function ConversationItemContent(props: ConversationItemContentProps): React.JSX.Element;

export interface ConversationListProps {
  items: Iterable<Conversation>;
  /** The open conversation (single selection). */
  selectedId?: string | null;
  /** A conversation was opened (not called while `selecting`). */
  onSelect?: (id: string) => void;
  /** Bulk selection mode with checkboxes. */
  selecting?: boolean;
  /** Selected ids in bulk mode. */
  selectedKeys?: "all" | Iterable<RAC.Key>;
  onSelectionChange?: (keys: RAC.Selection) => void;
  /** Accessible name. Default: the localized "Conversations". */
  label?: string;
}

/** The list of conversations: avatar with channel, unread count, who handles it, SLA chip, bulk selection. */
export declare function ConversationList(props: ConversationListProps): React.JSX.Element;

export interface MessageBubbleProps {
  m: Message;
  /** Show the author line above messages from your team or the AI agent. Default true. */
  showAuthor?: boolean;
  /** Called with the failed message when "Retry" is pressed. */
  onRetry?: (message: Message) => void;
}

/** One message: text, photo, file, voice note, call, internal note or event, with receipts. */
export declare function MessageBubble(props: MessageBubbleProps): React.JSX.Element;

export interface MessageThreadProps {
  /** Oldest first. Day separators and author grouping are added for you. */
  messages: readonly Message[];
  onRetry?: (message: Message) => void;
  /** Accessible name of the log. */
  label?: string;
}

/** A scrolling thread of messages with day separators, grouped by sender. */
export declare function MessageThread(props: MessageThreadProps): React.JSX.Element;

export interface ComposerProps {
  /** Channels the agent can reply on. Default `["whatsapp"]`. */
  channels?: readonly ChannelId[];
  /** The channel to reply on (controlled). Default: the first of `channels`. */
  channel?: ChannelId;
  onChannelChange?: (channel: ChannelId) => void;
  /** Called on Enter or Send, and when a template is sent. */
  onSend?: (payload: ComposerSendPayload) => void;
  /** Asks for an AI reply; the "Suggest a reply" button shows only when this is given. */
  onSuggest?: () => string | Promise<string>;
  savedReplies?: readonly SavedReply[];
  /** Approved templates offered once the window has closed. */
  templates?: readonly MessageTemplate[];
  /** WhatsApp's 24-hour window has closed: only templates can be sent on WhatsApp. Default false. */
  windowClosed?: boolean;
  /** Not used for rendering today. */
  contactName?: string;
  disabled?: boolean;
}

/** Reply or internal note, with reply-via channel, emoji, files, saved replies, AI suggestion and approved templates. */
export declare function Composer(props: ComposerProps): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Contact panel, header, properties, timeline, call                   */
/* ------------------------------------------------------------------ */

export interface ContactPanelProps {
  contact?: ContactDetails | null;
  onCall?: (e: RAC.PressEvent) => void;
  onEmail?: (e: RAC.PressEvent) => void;
  /** Adds an "Open full profile" link. */
  profileHref?: string;
  /** Adds a close button. */
  onClose?: (e: RAC.PressEvent) => void;
}

/** Side panel with contact details, channels, source, deal, tags, history and AI summary. */
export declare function ContactPanel(props: ContactPanelProps): React.JSX.Element | null;

export interface ContactHeaderProps {
  contact: ContactDetails;
  /** Quick actions you leave out are not shown. */
  onMessage?: (e: RAC.PressEvent) => void;
  onCall?: (e: RAC.PressEvent) => void;
  onEmail?: (e: RAC.PressEvent) => void;
  onMeeting?: (e: RAC.PressEvent) => void;
  /** Sidebar layout only. */
  onNote?: (e: RAC.PressEvent) => void;
  /** Extra actions after the built-in ones. */
  extra?: React.ReactNode;
  /** `"row"` (default) or `"sidebar"` for a narrow column. */
  layout?: "row" | "sidebar";
}

/** Top of a contact record: name, stage, tags, channels and quick actions. */
export declare function ContactHeader(props: ContactHeaderProps): React.JSX.Element;

export interface PropertyItem {
  id: string;
  label: string;
  /** Current value; the editing field starts from it. */
  value?: string | null;
  /** Shown instead of `value` when not editing. */
  display?: React.ReactNode;
  /** `false` keeps it read-only while editing. Default true. */
  editable?: boolean;
  /** Input type of the editing field. */
  type?: RAC.TextFieldProps["type"];
  /** Render the value left-to-right (emails, phone numbers). */
  ltr?: boolean;
}

export interface PropertyListProps {
  title: string;
  items: readonly PropertyItem[];
  /** Called with `{ [item.id]: newValue }` for every item when Save is pressed. The Edit button shows only when this is given. */
  onSave?: (values: Record<string, string>) => void;
  /** Default true. */
  editable?: boolean;
}

/** A card of properties that switches to editable fields; Save reports the new values. */
export declare function PropertyList(props: PropertyListProps): React.JSX.Element;

/** What happened on a timeline. */
export type ActivityType = "call" | "email" | "message" | "note" | "meeting" | "stage" | "deal" | "form" | "ai";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  body?: string;
  time: Date;
  author?: string;
  channel?: ChannelId;
}

/** Filter chip ids of the timeline, whose labels `labels` can override. */
export type ActivityFilter = "all" | "note" | "call" | "message" | "meeting";

export interface ActivityTimelineProps {
  items: readonly ActivityItem[];
  /** Shows a note form; called with the trimmed note. */
  onAddNote?: (note: string) => void;
  /** Override filter labels. */
  labels?: Partial<Record<ActivityFilter, string>>;
}

/** Everything that happened with a contact, newest first, filterable by type. */
export declare function ActivityTimeline(props: ActivityTimelineProps): React.JSX.Element;

/** Who a call sheet rings. */
export interface CallContact {
  name: string;
  phone?: string;
}

export interface CallSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  contact?: CallContact | null;
  /** Called with the call length in seconds when the call ends. */
  onEnd?: (seconds: number) => void;
}

/** Call dialog: rings, connects, counts the call, with mute, hold and hang up. */
export declare function CallSheet(props: CallSheetProps): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Roles and permissions                                               */
/* ------------------------------------------------------------------ */

/** What a role can do with a resource. */
export type PermissionAction = "view" | "create" | "edit" | "delete" | "export";

/** Whose records an action applies to. */
export type PermissionScope = "own" | "team" | "all";

/** The five actions, in column order. */
export declare const PERMISSION_ACTIONS: readonly ["view", "create", "edit", "delete", "export"];

/** The three scopes, in menu order. */
export declare const PERMISSION_SCOPES: readonly ["own", "team", "all"];

/** One row of the permission matrix. */
export interface PermissionResource {
  id: string;
  label: string;
  /** Rows with the same group are listed under one heading. */
  group: string;
  /** Subset of actions that apply to this resource; others show a dash. */
  actions?: readonly PermissionAction[];
  /** `false` hides the scope menu (for workspace-wide resources). */
  scoped?: boolean;
  description?: string;
}

/** What one role may do with one resource. */
export interface ResourcePermission {
  actions: readonly PermissionAction[];
  scope: PermissionScope;
}

/** A role's permissions by resource id. */
export interface PermissionValue {
  readonly [resourceId: string]: ResourcePermission;
}

export interface PermissionMatrixProps {
  resources: readonly PermissionResource[];
  value: PermissionValue;
  /** Receives the whole new value. Granting any action also grants View; removing View removes all. */
  onChange?: (next: Record<string, ResourcePermission>) => void;
  /** Show without controls (built-in roles). */
  readOnly?: boolean;
  /** Columns to show. Default all five. */
  actions?: readonly PermissionAction[];
  /** Accessible name. Default: the localized "Permissions". */
  label?: string;
}

/** Table of what a role can view, create, edit, delete and export, and whose records. */
export declare function PermissionMatrix(props: PermissionMatrixProps): React.JSX.Element;

/** A role in the list. */
export interface Role {
  id: string;
  name: string;
  description?: string;
  /** Number of members. */
  members: number;
  /** Built-in roles show a lock and shield. */
  system?: boolean;
  tone?: RoleTone;
}

export interface RoleListProps {
  roles: Iterable<Role>;
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Accessible name. Default: the localized "Permissions". */
  label?: string;
}

/** A selectable list of roles with member counts. */
export declare function RoleList(props: RoleListProps): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Pipeline                                                            */
/* ------------------------------------------------------------------ */

/** A column of the pipeline board. */
export interface PipelineStage {
  id: string;
  label: string;
  tone?: CrmTone;
  /** Win probability in percent, shown next to the column total. */
  probability?: number | null;
}

/** A deal card. Your own deal type may have more fields; use it as the type argument of `PipelineBoard`. */
export interface PipelineDeal {
  id: string;
  /** Id of the stage it is in. */
  stage: string;
  title: string;
  company: string;
  /** Amount, summed per stage and shown through `format`. */
  value: number;
  contact?: { name: string; src?: string };
  owner?: { name: string };
  closeDate: Date;
  /** Shows the date in red. */
  overdue?: boolean;
}

/** Reported with `onChange`: which deals moved and to which stage. */
export interface PipelineMove {
  ids: string[];
  to: string;
}

export interface PipelineBoardProps<D extends PipelineDeal = PipelineDeal> {
  stages: readonly PipelineStage[];
  deals: readonly D[];
  /** Called after a move with the full new deal list (moved deals have their `stage` changed). */
  onChange?: (nextDeals: D[], move: PipelineMove) => void;
  /** Formats money. Default `String`. */
  format?: (value: number) => string;
  /** A card was opened. */
  onOpen?: (deal: D) => void;
  /** Shows an "Add deal" button per column. */
  onAdd?: (stage: PipelineStage) => void;
  /** Accessible name. Default: the localized "Pipeline". */
  label?: string;
}

/** Deals in stage columns; drag a card to another stage, or use its "Move to" menu. */
export declare function PipelineBoard<D extends PipelineDeal = PipelineDeal>(props: PipelineBoardProps<D>): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Calendar                                                            */
/* ------------------------------------------------------------------ */

/** The four calendar views. */
export type CalendarView = "month" | "week" | "day" | "agenda";

/** The four views, in toggle order. */
export declare const CALENDAR_VIEWS: readonly ["month", "week", "day", "agenda"];

/** A calendar event. Your own event type may have more fields; use it as the type argument of `EventCalendar`. */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  /** Key into the `types` map. */
  type?: string;
  location?: string;
  allDay?: boolean;
}

/** Label and colour of an event type. */
export interface CalendarEventType {
  label: string;
  tone: CrmTone;
}

export interface EventCalendarProps<E extends CalendarEvent = CalendarEvent> {
  events: readonly E[];
  /** Event types by key, for colours and labels. Events without a known type use the info tone. */
  types?: Readonly<Record<string, CalendarEventType>>;
  /** Shown date (controlled). */
  date?: Date;
  onDateChange?: (date: Date) => void;
  /** Shown view (controlled). Default: week, or agenda on narrow screens. */
  view?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  /** An empty slot was pressed: a new one-hour event. */
  onSelectSlot?: (start: Date, end: Date) => void;
  onSelectEvent?: (event: E) => void;
  /** First hour of the day grid. Default 7. */
  startHour?: number;
  /** Hour the day grid ends at. Default 21. */
  endHour?: number;
  /** Accessible name. Default: the localized "Calendar". */
  label?: string;
}

/** Month, week, day and agenda views. Press an empty slot to create, an event to open it. */
export declare function EventCalendar<E extends CalendarEvent = CalendarEvent>(props: EventCalendarProps<E>): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Inbox                                                               */
/* ------------------------------------------------------------------ */

/** Which pane is showing: `"both"` on layouts with room for list and thread, otherwise `"list"` or `"thread"`. */
export type InboxView = "list" | "thread" | "both";

/** Reported by the inbox when the agent sends a reply. */
export interface InboxSendEvent {
  conversationId: string;
  text: string;
  channel: ChannelId;
}

export interface ConversationInboxProps {
  conversations: readonly Conversation[];
  /** Messages by conversation id, oldest first. */
  messages: Readonly<Record<string, readonly Message[]>>;
  /** Contacts by id (the `contact.id` of a conversation). */
  contacts: Readonly<Record<ContactId, Contact>>;
  /** People a conversation can be assigned to. */
  team?: readonly TeamMember[];
  /** The signed-in user. */
  me?: TeamMember;
  savedReplies?: readonly SavedReply[];
  templates?: readonly MessageTemplate[];
  /** Asks your model for a reply to the open conversation. */
  onSuggest?: (conversation: Conversation, messages: readonly Message[] | undefined) => string | Promise<string>;
  /** Link to the full contact profile, shown in the contact panel. */
  profileHref?: (contact: Contact) => string;
  /** Conversation to open first. */
  initialId?: string;
  /** A conversation was opened. */
  onOpenChange?: (id: string) => void;
  /** The visible pane changed (phones show one at a time). */
  onViewChange?: (view: InboxView) => void;
  /** The agent sent a reply. */
  onSend?: (event: InboxSendEvent) => void;
  onCall?: (contact: Contact) => void;
  onEmail?: (contact: Contact) => void;
  /** Minutes of silence before the AI agent resumes after a person took over; `null` = stay paused. Default 15. */
  aiResumeAfter?: number | null;
  className?: string;
}

/** The whole inbox: list, thread, composer, AI handoff and contact panel. It fits itself to the space it gets. */
export declare function ConversationInbox(props: ConversationInboxProps): React.JSX.Element;
