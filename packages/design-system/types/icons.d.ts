import type * as React from "react";

/**
 * Props of the outline icons (`Search`, `Plus`, `ChevronDown`...). They render a 24x24 viewBox `<svg>` in `currentColor`
 * with a 1.75 stroke, hidden from assistive technology by default. Every SVG attribute is passed through, so size them
 * with `width`/`height` (or CSS) and override `strokeWidth`, `className`, `style`; set `aria-hidden={false}` plus
 * `aria-label` and `role="img"` to make one meaningful. `children` is ignored (the icon draws its own paths).
 */
export interface IconProps extends Omit<React.ComponentPropsWithoutRef<"svg">, "children"> {}

/**
 * Props of the Truvar OS system icons (`MicIcon`, `WifiIcon`...). They are 20px by default and decorative unless a
 * `label` is given. `className` is added to the `tv-sysicon` class. `children` is ignored.
 */
export interface SystemIconProps extends Omit<React.ComponentPropsWithoutRef<"svg">, "children"> {
  /** Accessible name. With it the icon is announced as an image; without it the icon is decorative. */
  label?: string;
  /** Width and height. Default 20 (px). */
  size?: number | string;
}

/** Signal strength shown by `WifiIcon`: the number of lit arcs. */
export type WifiStrength = 0 | 1 | 2 | 3;

/** Sync state shown by `CloudIcon`. */
export type CloudState = "synced" | "syncing" | "offline";

export interface WifiIconProps extends SystemIconProps {
  /** Lit arcs, 0 to 3. Default 3. */
  strength?: WifiStrength;
  /** Wi-Fi turned off: dims every arc and draws a strike-through. */
  off?: boolean;
}

export interface BatteryIconProps extends SystemIconProps {
  /** Charge from 0 to 1 (clamped when drawn). Default 0.8. Under 0.2 the icon turns "low" unless charging. */
  level?: number;
  /** Shows a charging bolt and suppresses the low state. */
  charging?: boolean;
}

export interface CloudIconProps extends SystemIconProps {
  /** Default "synced". */
  state?: CloudState;
}

/** Any icon component from this entry that takes plain `IconProps`. Handy for props like `icon: IconComponent`. */
export type IconComponent = (props: IconProps) => React.JSX.Element;

/** Chevron down icon. */
export declare function ChevronDown(props: IconProps): React.JSX.Element;
/** Chevron left icon. */
export declare function ChevronLeft(props: IconProps): React.JSX.Element;
/** Chevron right icon. */
export declare function ChevronRight(props: IconProps): React.JSX.Element;
/** Check icon. */
export declare function Check(props: IconProps): React.JSX.Element;
/** Minus icon. */
export declare function Minus(props: IconProps): React.JSX.Element;
/** Close (X) icon. */
export declare function X(props: IconProps): React.JSX.Element;
/** Calendar icon. */
export declare function Calendar(props: IconProps): React.JSX.Element;
/** Alert (exclamation in a circle) icon. */
export declare function Alert(props: IconProps): React.JSX.Element;
/** More (three dots) icon. */
export declare function More(props: IconProps): React.JSX.Element;
/** Pencil icon. */
export declare function Pencil(props: IconProps): React.JSX.Element;
/** Copy icon. */
export declare function Copy(props: IconProps): React.JSX.Element;
/** Trash icon. */
export declare function Trash(props: IconProps): React.JSX.Element;
/** Download icon. */
export declare function Download(props: IconProps): React.JSX.Element;
/** Info icon. */
export declare function Info(props: IconProps): React.JSX.Element;
/** Sun icon. */
export declare function Sun(props: IconProps): React.JSX.Element;
/** Moon icon. */
export declare function Moon(props: IconProps): React.JSX.Element;
/** Search icon. */
export declare function Search(props: IconProps): React.JSX.Element;
/** Send icon. */
export declare function Send(props: IconProps): React.JSX.Element;
/** Plus icon. */
export declare function Plus(props: IconProps): React.JSX.Element;
/** Filter icon. */
export declare function Filter(props: IconProps): React.JSX.Element;
/** Bell icon. */
export declare function Bell(props: IconProps): React.JSX.Element;
/** Mail icon. */
export declare function Mail(props: IconProps): React.JSX.Element;
/** Phone icon. */
export declare function Phone(props: IconProps): React.JSX.Element;
/** File text icon. */
export declare function FileText(props: IconProps): React.JSX.Element;
/** Building icon. */
export declare function Building(props: IconProps): React.JSX.Element;
/** User icon. */
export declare function User(props: IconProps): React.JSX.Element;
/** Users icon. */
export declare function Users(props: IconProps): React.JSX.Element;
/** Drag grip (six dots) icon. */
export declare function Grip(props: IconProps): React.JSX.Element;
/** Upload icon. */
export declare function Upload(props: IconProps): React.JSX.Element;
/** Arrow up icon. */
export declare function ArrowUp(props: IconProps): React.JSX.Element;
/** Arrow down icon. */
export declare function ArrowDown(props: IconProps): React.JSX.Element;
/** Menu (hamburger) icon. */
export declare function MenuIcon(props: IconProps): React.JSX.Element;
/** Panel left close icon. */
export declare function PanelLeftClose(props: IconProps): React.JSX.Element;
/** Panel left open icon. */
export declare function PanelLeftOpen(props: IconProps): React.JSX.Element;
/** Check circle icon. */
export declare function CheckCircle(props: IconProps): React.JSX.Element;
/** Alert triangle icon. */
export declare function AlertTriangle(props: IconProps): React.JSX.Element;
/** Xcircle icon. */
export declare function XCircle(props: IconProps): React.JSX.Element;
/** Bold icon. */
export declare function Bold(props: IconProps): React.JSX.Element;
/** Italic icon. */
export declare function Italic(props: IconProps): React.JSX.Element;
/** Underline icon. */
export declare function Underline(props: IconProps): React.JSX.Element;
/** Link icon. */
export declare function LinkIcon(props: IconProps): React.JSX.Element;
/** Folder icon. */
export declare function Folder(props: IconProps): React.JSX.Element;
/** Clock icon. */
export declare function Clock(props: IconProps): React.JSX.Element;
/** List icon. */
export declare function List(props: IconProps): React.JSX.Element;
/** Kanban icon. */
export declare function Kanban(props: IconProps): React.JSX.Element;
/** Palette icon. */
export declare function Palette(props: IconProps): React.JSX.Element;
/** Layers icon. */
export declare function Layers(props: IconProps): React.JSX.Element;
/** Table icon. */
export declare function Table2(props: IconProps): React.JSX.Element;
/** Cursor (pointer) icon. */
export declare function Cursor(props: IconProps): React.JSX.Element;
/** Type icon. */
export declare function Type(props: IconProps): React.JSX.Element;
/** Home icon. */
export declare function Home(props: IconProps): React.JSX.Element;
/** Trend up icon. */
export declare function TrendUp(props: IconProps): React.JSX.Element;
/** Trend down icon. */
export declare function TrendDown(props: IconProps): React.JSX.Element;
/** Globe icon. */
export declare function Globe(props: IconProps): React.JSX.Element;
/** Play icon. */
export declare function Play(props: IconProps): React.JSX.Element;
/** Pause icon. */
export declare function Pause(props: IconProps): React.JSX.Element;
/** Skip back 10 seconds icon. */
export declare function Back10(props: IconProps): React.JSX.Element;
/** Skip forward 10 seconds icon. */
export declare function Fwd10(props: IconProps): React.JSX.Element;
/** Volume (speaker with waves) icon. */
export declare function Volume(props: IconProps): React.JSX.Element;
/** Muted speaker icon. */
export declare function VolumeX(props: IconProps): React.JSX.Element;
/** Headphones icon. */
export declare function Headphones(props: IconProps): React.JSX.Element;
/** Maximize icon. */
export declare function Maximize(props: IconProps): React.JSX.Element;
/** Thumb up icon. */
export declare function ThumbUp(props: IconProps): React.JSX.Element;
/** Thumb down icon. */
export declare function ThumbDown(props: IconProps): React.JSX.Element;
/** Mic icon. */
export declare function Mic(props: IconProps): React.JSX.Element;
/** Mic off icon. */
export declare function MicOff(props: IconProps): React.JSX.Element;
/** Phone off icon. */
export declare function PhoneOff(props: IconProps): React.JSX.Element;
/** Zap icon. */
export declare function Zap(props: IconProps): React.JSX.Element;
/** Code icon. */
export declare function Code(props: IconProps): React.JSX.Element;
/** Braces icon. */
export declare function Braces(props: IconProps): React.JSX.Element;
/** Git branch icon. */
export declare function GitBranch(props: IconProps): React.JSX.Element;
/** Rocket icon. */
export declare function Rocket(props: IconProps): React.JSX.Element;
/** Audio waveform icon. */
export declare function Waves(props: IconProps): React.JSX.Element;
/** Shuffle icon. */
export declare function Shuffle(props: IconProps): React.JSX.Element;
/** Message circle icon. */
export declare function MessageCircle(props: IconProps): React.JSX.Element;
/** Message square icon. */
export declare function MessageSquare(props: IconProps): React.JSX.Element;
/** Paperclip icon. */
export declare function Paperclip(props: IconProps): React.JSX.Element;
/** Smile icon. */
export declare function Smile(props: IconProps): React.JSX.Element;
/** Sparkles icon. */
export declare function Sparkles(props: IconProps): React.JSX.Element;
/** Bot icon. */
export declare function Bot(props: IconProps): React.JSX.Element;
/** User check icon. */
export declare function UserCheck(props: IconProps): React.JSX.Element;
/** User plus icon. */
export declare function UserPlus(props: IconProps): React.JSX.Element;
/** Sticky note icon. */
export declare function StickyNote(props: IconProps): React.JSX.Element;
/** Tag icon. */
export declare function Tag(props: IconProps): React.JSX.Element;
/** Shield icon. */
export declare function Shield(props: IconProps): React.JSX.Element;
/** Lock icon. */
export declare function Lock(props: IconProps): React.JSX.Element;
/** Image icon. */
export declare function ImageIcon(props: IconProps): React.JSX.Element;
/** Inbox icon. */
export declare function Inbox(props: IconProps): React.JSX.Element;
/** Reply icon. */
export declare function Reply(props: IconProps): React.JSX.Element;
/** Sliders icon. */
export declare function Sliders(props: IconProps): React.JSX.Element;
/** Star icon. */
export declare function Star(props: IconProps): React.JSX.Element;
/** Check check icon. */
export declare function CheckCheck(props: IconProps): React.JSX.Element;
/** Briefcase icon. */
export declare function Briefcase(props: IconProps): React.JSX.Element;
/** Map pin icon. */
export declare function MapPin(props: IconProps): React.JSX.Element;
/** External link icon. */
export declare function ExternalLink(props: IconProps): React.JSX.Element;
/** Video icon. */
export declare function Video(props: IconProps): React.JSX.Element;
/** Archive icon. */
export declare function Archive(props: IconProps): React.JSX.Element;
/** Globe icon (alternate). */
export declare function Globe2(props: IconProps): React.JSX.Element;
/** Log out icon. */
export declare function LogOut(props: IconProps): React.JSX.Element;
/** Help circle icon. */
export declare function HelpCircle(props: IconProps): React.JSX.Element;
/** Keyboard icon. */
export declare function Keyboard(props: IconProps): React.JSX.Element;

/** Wi-Fi icon: `strength` 0 to 3 lights the arcs; `off` dims it and strikes it through. */
export declare function WifiIcon(props: WifiIconProps): React.JSX.Element;
/** Battery icon: `level` 0 to 1 fills it; turns low under 20% unless `charging`. */
export declare function BatteryIcon(props: BatteryIconProps): React.JSX.Element;
/** Cloud icon showing sync state: synced (check), syncing (spinner) or offline (dashed). */
export declare function CloudIcon(props: CloudIconProps): React.JSX.Element;
/** Mic icon, system style. */
export declare function MicIcon(props: SystemIconProps): React.JSX.Element;
/** Camera icon, system style. */
export declare function CameraIcon(props: SystemIconProps): React.JSX.Element;
/** Bluetooth icon, system style. */
export declare function BluetoothIcon(props: SystemIconProps): React.JSX.Element;
/** Lock icon, system style. */
export declare function LockIcon(props: SystemIconProps): React.JSX.Element;
/** Location icon, system style. */
export declare function LocationIcon(props: SystemIconProps): React.JSX.Element;
/** Airplane icon, system style. */
export declare function AirplaneIcon(props: SystemIconProps): React.JSX.Element;
/** Moon icon, system style. */
export declare function MoonIcon(props: SystemIconProps): React.JSX.Element;
/** Shield icon, system style. */
export declare function ShieldIcon(props: SystemIconProps): React.JSX.Element;
/** Devices icon, system style. */
export declare function DevicesIcon(props: SystemIconProps): React.JSX.Element;
/** Face ID icon. */
export declare function FaceIdIcon(props: SystemIconProps): React.JSX.Element;
/** Keyboard icon, system style. */
export declare function KeyboardIcon(props: SystemIconProps): React.JSX.Element;
/** Apps icon, system style. */
export declare function AppsIcon(props: SystemIconProps): React.JSX.Element;
/** Light icon, system style. */
export declare function LightIcon(props: SystemIconProps): React.JSX.Element;
/** Thermo icon, system style. */
export declare function ThermoIcon(props: SystemIconProps): React.JSX.Element;
/** TV icon. */
export declare function TvIcon(props: SystemIconProps): React.JSX.Element;
/** Door icon, system style. */
export declare function DoorIcon(props: SystemIconProps): React.JSX.Element;
/** Laptop icon, system style. */
export declare function LaptopIcon(props: SystemIconProps): React.JSX.Element;
/** Phone (device) icon. */
export declare function PhoneDeviceIcon(props: SystemIconProps): React.JSX.Element;
/** Server cloud icon, system style. */
export declare function ServerCloudIcon(props: SystemIconProps): React.JSX.Element;
/** Home icon, system style. */
export declare function HomeIcon(props: SystemIconProps): React.JSX.Element;
/** Spreadsheet icon, system style. */
export declare function SpreadsheetIcon(props: SystemIconProps): React.JSX.Element;
/** Chat icon, system style. */
export declare function ChatIcon(props: SystemIconProps): React.JSX.Element;
/** Card icon, system style. */
export declare function CardIcon(props: SystemIconProps): React.JSX.Element;
/** Trash icon, system style. */
export declare function TrashIcon(props: SystemIconProps): React.JSX.Element;
/** Folder icon, system style. */
export declare function FolderIcon(props: SystemIconProps): React.JSX.Element;
/** Globe icon, system style. */
export declare function GlobeIcon(props: SystemIconProps): React.JSX.Element;
/** History icon, system style. */
export declare function HistoryIcon(props: SystemIconProps): React.JSX.Element;
