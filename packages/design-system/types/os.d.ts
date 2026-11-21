// Type declarations for `@truvar-ai/design-system/os`:
// the Truvar OS kit, system UI and agent surfaces for an agentic operating system.
import type * as React from "react";
import type * as RAC from "react-aria-components";

/* ------------------------------------------------------------------ */
/* Shared types                                                        */
/* ------------------------------------------------------------------ */

/** Heading level used by cards and windows that render a title. */
export type OSHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Wi-Fi signal strength: 0 (none) to 3 (full). */
export type WifiStrength = 0 | 1 | 2 | 3;

/** Cloud sync state of the system bar. */
export type CloudState = "synced" | "syncing" | "offline";

/** Battery reading: `level` from 0 to 1. */
export interface BatteryState {
  level: number;
  charging?: boolean;
}

/** State of the voice dock. */
export type VoiceDockState = "idle" | "listening" | "thinking";

/** Status of one step in an agent task. The last step is `"approval"` when a person's OK is needed. */
export type AgentStepStatus = "done" | "active" | "pending" | "approval";

/** One step of an agent task. */
export interface AgentStep {
  label: React.ReactNode;
  status: AgentStepStatus;
}

/* ------------------------------------------------------------------ */
/* Clock                                                               */
/* ------------------------------------------------------------------ */

/** The current time as a `Date`, refreshed every `intervalMs` (default 15000). */
export declare function useNow(intervalMs?: number): Date;

/** Time of day, for example "10:42 AM", in the given locale (for example `"en-US"`). */
export declare function formatTime(date: Date, locale: string): string;

/** Weekday, day and month, for example "Saturday, 21 November", in the given locale. */
export declare function formatDay(date: Date, locale: string): string;

/* ------------------------------------------------------------------ */
/* System bar                                                          */
/* ------------------------------------------------------------------ */

/** Text for the system bar. Provide your own translations. */
export interface SystemBarLabels {
  /** Name of the assistant (button and tooltip). */
  assistant: string;
  /** Name of the status group. */
  status: string;
  /** Shown while the microphone is in use. */
  micOn: string;
  /** Shown while the camera is in use. */
  cameraOn: string;
  /** "Connected devices". */
  devices: string;
  /** Names of the cloud states. */
  cloud: Record<CloudState, string>;
  wifi: string;
  battery: string;
  /** Appended to the battery label while charging. */
  charging: string;
}

export interface SystemBarProps {
  /** Signed-in user's name; shows an avatar and name at the end. */
  user?: string;
  time: Date;
  /** Default `{ level: 0.86 }`. */
  battery?: BatteryState;
  /** Default 3. */
  wifi?: WifiStrength;
  /** Number of connected devices; hidden when omitted. */
  devices?: number | null;
  /** Microphone is in use (shows the privacy indicator). */
  mic?: boolean;
  /** Camera is in use (shows the privacy indicator). */
  camera?: boolean;
  /** Default `"synced"`. */
  cloud?: CloudState;
  /** The assistant orb was pressed. */
  onAssistant?: (e: RAC.PressEvent) => void;
  labels: SystemBarLabels;
}

/** The top bar of the OS: assistant orb, privacy indicators, devices, cloud, Wi-Fi, battery, clock and user. */
export declare function SystemBar(props: SystemBarProps): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Voice dock and listening                                            */
/* ------------------------------------------------------------------ */

export interface VoiceDockLabels {
  /** Name of the dock navigation. */
  dock: string;
  apps: string;
  keyboard: string;
}

export interface VoiceDockProps {
  /** Default `"idle"`. */
  state?: VoiceDockState;
  /** Text on the talk button and its accessible name. */
  label: string;
  onTalk?: (e: RAC.PressEvent) => void;
  onKeyboard?: (e: RAC.PressEvent) => void;
  onApps?: (e: RAC.PressEvent) => void;
  labels: VoiceDockLabels;
}

/** The dock with one big talk button, and apps and keyboard on either side. */
export declare function VoiceDock(props: VoiceDockProps): React.JSX.Element;

export interface ListeningViewLabels {
  listening: string;
  hint: string;
  run: string;
  cancel: string;
  privacy: string;
}

export interface ListeningViewProps {
  /** What has been heard so far. */
  heard: string;
  /** Words still being recognised, shown after `heard` with an ellipsis. */
  partial?: string;
  onRun?: (e: RAC.PressEvent) => void;
  onCancel?: (e: RAC.PressEvent) => void;
  labels: ListeningViewLabels;
}

/** Full-screen listening state: live transcript with Run and Cancel. */
export declare function ListeningView(props: ListeningViewProps): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Agent task, approval, done                                          */
/* ------------------------------------------------------------------ */

export interface AgentTaskCardLabels {
  /** Names of the step statuses, read by screen readers. */
  status: Record<AgentStepStatus, string>;
  /** Label of the "Watch" button (needed when `onWatch` is given). */
  watch?: string;
  /** Label of the "Stop" button (needed when `onStop` is given). */
  stop?: string;
}

export interface AgentTaskCardProps {
  title: string;
  subtitle?: React.ReactNode;
  steps: readonly AgentStep[];
  onWatch?: (e: RAC.PressEvent) => void;
  onStop?: (e: RAC.PressEvent) => void;
  footnote?: React.ReactNode;
  labels: AgentTaskCardLabels;
}

/** Progress of an agent task: every step visible, with Watch and Stop. */
export declare function AgentTaskCard(props: AgentTaskCardProps): React.JSX.Element;

/** Who an approval is about. */
export interface ApprovalRecipient {
  name: string;
  org?: string;
}

/** A file attached to the message being approved. */
export interface ApprovalAttachment {
  /** File type badge, for example `"PDF"`. */
  type: string;
  name: string;
}

export interface ApprovalCardLabels {
  approve: string;
  approveHint: string;
  deny: string;
  denyHint: string;
  /** "Assistant is listening". */
  listening: string;
  /** Label of the edit link (needed when `onEdit` is given). */
  edit?: string;
}

export interface ApprovalCardProps {
  title: string;
  subtitle?: React.ReactNode;
  recipient: ApprovalRecipient;
  attachment?: ApprovalAttachment;
  /** The message that will be sent. */
  message: React.ReactNode;
  onApprove?: (e: RAC.PressEvent) => void;
  onDeny?: (e: RAC.PressEvent) => void;
  /** Shows an "edit" link. */
  onEdit?: (e: RAC.PressEvent) => void;
  labels: ApprovalCardLabels;
}

/** Asks for a person's OK before the agent sends or pays: shows exactly what, to whom and where. */
export declare function ApprovalCard(props: ApprovalCardProps): React.JSX.Element;

/** The suggested next step shown on a done card. */
export interface DoneFollowUp {
  question: React.ReactNode;
  yes: React.ReactNode;
  later: React.ReactNode;
  voiceHint: React.ReactNode;
  onYes?: (e: RAC.PressEvent) => void;
  onLater?: (e: RAC.PressEvent) => void;
}

/** One figure in the day's tally. Numbers are formatted for the locale. */
export interface DoneStat {
  label: React.ReactNode;
  value: number | string;
  /** Marks the number that matters. */
  highlight?: boolean;
}

export interface DoneCardProps {
  title: string;
  subtitle?: React.ReactNode;
  followUp?: DoneFollowUp;
  stats?: readonly DoneStat[];
  /** Not used for rendering; accepted for symmetry with the other cards. */
  labels?: object;
}

/** The result first, then the obvious next step, then the day's tally. */
export declare function DoneCard(props: DoneCardProps): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export interface NotificationCardProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  body?: React.ReactNode;
  /** Small line at the end, for example the sender and time. */
  meta?: React.ReactNode;
  /** `"gold"` highlights the icon. Default `"default"`. */
  tone?: "default" | "gold";
  /** Makes the card pressable. */
  onOpen?: (e: RAC.PressEvent) => void;
}

/** A notification: icon, title, body and meta. Pressable when `onOpen` is given. */
export declare function NotificationCard(props: NotificationCardProps): React.JSX.Element;

/** A small icon with a count, in the folded part of a notification stack. */
export interface NotificationStackIcon {
  icon: React.ReactNode;
  count?: React.ReactNode;
}

export interface NotificationStackProps {
  /** The most useful notification, shown in full. */
  lead: React.ReactNode;
  /** How many more there are; the summary row shows only when above 0. */
  rest?: number;
  /** Text of the summary row, for example "and 7 more things". */
  restLabel?: React.ReactNode;
  /** Counts per app in the summary row. */
  icons?: readonly NotificationStackIcon[];
}

/** One lead notification followed by a summary of the rest. */
export declare function NotificationStack(props: NotificationStackProps): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* My work, windows, devices                                           */
/* ------------------------------------------------------------------ */

export interface OSTaskCardProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  /** Status line, for example "Running · 2 steps left". */
  status: React.ReactNode;
  /** `"done"` shows a check, `"running"` a spinner. Default `"neutral"`. */
  tone?: "neutral" | "running" | "done";
  /** Label of the action button; the button shows only when given. */
  action?: React.ReactNode;
  onAction?: (e: RAC.PressEvent) => void;
  /** Gold icon and a primary action button. */
  highlight?: boolean;
  /** Heading level of the title. Default 3. */
  headingLevel?: OSHeadingLevel;
}

/** A job in "My work": icon, title, status and an action. */
export declare function OSTaskCard(props: OSTaskCardProps): React.JSX.Element;

export interface AppWindowProps {
  icon?: React.ReactNode;
  title: string;
  /** A live badge in the title bar, for example "Typing". */
  badge?: React.ReactNode;
  /** Highlights the window the agent is working in. */
  active?: boolean;
  children?: React.ReactNode;
  /** Heading level of the title. Default 3. */
  headingLevel?: OSHeadingLevel;
}

/** A mock app window that the agent can work in. */
export declare function AppWindow(props: AppWindowProps): React.JSX.Element;

export interface AgentCursorProps {
  /** CSS `left`: a number of pixels or a CSS length such as `"38%"`. */
  x: number | string;
  /** CSS `top`. */
  y: number | string;
  /** Name shown next to the cursor. */
  label?: React.ReactNode;
}

/** The agent's cursor, absolutely positioned inside a window. */
export declare function AgentCursor(props: AgentCursorProps): React.JSX.Element;

export interface DeviceCardProps {
  icon?: React.ReactNode;
  name: React.ReactNode;
  /** Line under the name, for example "Windows · connected". */
  meta?: React.ReactNode;
  /** Shows the online dot lit. Default true. */
  online?: boolean;
  /** An example voice command, shown in quotes. */
  command?: React.ReactNode;
  /** Label of the action button; the button shows only when given. */
  action?: React.ReactNode;
  onAction?: (e: RAC.PressEvent) => void;
  tone?: "navy" | "gold";
  children?: React.ReactNode;
  /** Heading level of the name. Default 3. */
  headingLevel?: OSHeadingLevel;
}

/** A connected device: icon, name, status, a sample command and an action. */
export declare function DeviceCard(props: DeviceCardProps): React.JSX.Element;

export interface SmartTileProps {
  icon?: React.ReactNode;
  label: React.ReactNode;
  /** State text while on. */
  onLabel: React.ReactNode;
  /** State text while off. */
  offLabel: React.ReactNode;
  isSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
}

/** A smart-home toggle tile: icon, name and its on/off state. */
export declare function SmartTile(props: SmartTileProps): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Permissions                                                         */
/* ------------------------------------------------------------------ */

/** One choice of a permission row. */
export interface PermissionOption<T extends string = string> {
  id: T;
  label: React.ReactNode;
}

export interface PermissionRowProps<T extends string = string> {
  icon?: React.ReactNode;
  /** Name of the capability; also the accessible name of the choices. */
  label: string;
  description?: React.ReactNode;
  /** The chosen option's id. */
  value: T;
  onChange: (value: T) => void;
  /** The choices, for example `auto`, `ask` and `never`. */
  options: readonly PermissionOption<T>[];
  /** Marks a sensitive capability. */
  sensitive?: boolean;
}

/** One capability with a segmented choice of how much the assistant may do on its own. */
export declare function PermissionRow<T extends string = string>(props: PermissionRowProps<T>): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Lock screen                                                         */
/* ------------------------------------------------------------------ */

export interface LockScreenLabels {
  /** Name of the lock screen region. */
  locked: string;
  faceUnlock: string;
  password: string;
  passwordLabel: string;
  unlock: string;
  wifi: string;
  battery: string;
}

export interface LockScreenProps {
  user: string;
  time: Date;
  /** Usually a `NotificationStack`. */
  notifications?: React.ReactNode;
  /** Called on face unlock and when the password form is submitted. */
  onUnlock?: (e?: RAC.PressEvent) => void;
  battery: BatteryState;
  wifi?: WifiStrength;
  labels: LockScreenLabels;
  /** Default `"Truvar OS"`. */
  osName?: string;
  /** Device name, shown as "on <device>". */
  device?: string;
}

/** The lock screen: clock, user, face or password unlock, notifications and system status. */
export declare function LockScreen(props: LockScreenProps): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* System icons                                                        */
/* ------------------------------------------------------------------ */

/** Props shared by every system icon. Extra props go to the `<svg>`. */
export interface SystemIconProps extends Omit<React.ComponentPropsWithoutRef<"svg">, "children"> {
  /** Accessible name. Without it the icon is decorative (hidden from screen readers). */
  label?: string;
  /** Pixel size. Default 20. */
  size?: number;
}

export interface WifiIconProps extends SystemIconProps {
  /** Signal strength 0 to 3. Default 3. */
  strength?: WifiStrength;
  /** Draws the icon crossed out. */
  off?: boolean;
}

export interface BatteryIconProps extends SystemIconProps {
  /** Charge from 0 to 1. Default 0.8. Under 0.2 (and not charging) it turns to the low style. */
  level?: number;
  charging?: boolean;
}

export interface CloudIconProps extends SystemIconProps {
  /** Default `"synced"`. */
  state?: CloudState;
}

/** Wi-Fi icon with signal strength. */
export declare function WifiIcon(props: WifiIconProps): React.JSX.Element;
/** Battery icon with level and charging state. */
export declare function BatteryIcon(props: BatteryIconProps): React.JSX.Element;
/** Cloud icon: synced, syncing or offline. */
export declare function CloudIcon(props: CloudIconProps): React.JSX.Element;
/** Microphone icon. */
export declare function MicIcon(props: SystemIconProps): React.JSX.Element;
/** Camera icon. */
export declare function CameraIcon(props: SystemIconProps): React.JSX.Element;
/** Bluetooth icon. */
export declare function BluetoothIcon(props: SystemIconProps): React.JSX.Element;
/** Padlock icon. */
export declare function LockIcon(props: SystemIconProps): React.JSX.Element;
/** Location pin icon. */
export declare function LocationIcon(props: SystemIconProps): React.JSX.Element;
/** Airplane icon. */
export declare function AirplaneIcon(props: SystemIconProps): React.JSX.Element;
/** Moon icon. */
export declare function MoonIcon(props: SystemIconProps): React.JSX.Element;
/** Shield with check icon. */
export declare function ShieldIcon(props: SystemIconProps): React.JSX.Element;
/** Laptop and phone icon for connected devices. */
export declare function DevicesIcon(props: SystemIconProps): React.JSX.Element;
/** Face unlock icon. */
export declare function FaceIdIcon(props: SystemIconProps): React.JSX.Element;
/** Keyboard icon. */
export declare function KeyboardIcon(props: SystemIconProps): React.JSX.Element;
/** Four-squares apps icon. */
export declare function AppsIcon(props: SystemIconProps): React.JSX.Element;
/** Light bulb icon. */
export declare function LightIcon(props: SystemIconProps): React.JSX.Element;
/** Thermometer icon. */
export declare function ThermoIcon(props: SystemIconProps): React.JSX.Element;
/** Television icon. */
export declare function TvIcon(props: SystemIconProps): React.JSX.Element;
/** Door icon. */
export declare function DoorIcon(props: SystemIconProps): React.JSX.Element;
/** Laptop icon. */
export declare function LaptopIcon(props: SystemIconProps): React.JSX.Element;
/** Phone device icon. */
export declare function PhoneDeviceIcon(props: SystemIconProps): React.JSX.Element;
/** Server cloud icon. */
export declare function ServerCloudIcon(props: SystemIconProps): React.JSX.Element;
/** House icon. */
export declare function HomeIcon(props: SystemIconProps): React.JSX.Element;
/** Spreadsheet icon. */
export declare function SpreadsheetIcon(props: SystemIconProps): React.JSX.Element;
/** Chat bubble icon. */
export declare function ChatIcon(props: SystemIconProps): React.JSX.Element;
/** Payment card icon. */
export declare function CardIcon(props: SystemIconProps): React.JSX.Element;
/** Trash can icon. */
export declare function TrashIcon(props: SystemIconProps): React.JSX.Element;
/** Folder icon. */
export declare function FolderIcon(props: SystemIconProps): React.JSX.Element;
/** Globe icon. */
export declare function GlobeIcon(props: SystemIconProps): React.JSX.Element;
/** History (clock with arrow) icon. */
export declare function HistoryIcon(props: SystemIconProps): React.JSX.Element;
