// Truvar OS system icons: stateful, drawn with the same rounded 1.75px stroke as the rest of the library.
// Each takes a `label` for screen readers; without one it's decorative.

const Svg = ({ label, size = 20, children, className, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
    role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={"tv-sysicon" + (className ? " " + className : "")} {...p}>
    {children}
  </svg>
);

/* Wi-Fi: strength 0–3, or off */
export function WifiIcon({ strength = 3, off, ...p }) {
  const arc = (i, d) => <path key={i} d={d} opacity={!off && strength >= i ? 1 : 0.25} />;
  return (
    <Svg {...p}>
      {arc(3, "M2.5 8.8a14 14 0 0 1 19 0")}
      {arc(2, "M5.6 12.2a9.5 9.5 0 0 1 12.8 0")}
      {arc(1, "M8.7 15.5a5 5 0 0 1 6.6 0")}
      <circle cx="12" cy="19" r="1.1" fill="currentColor" stroke="none" opacity={off ? 0.25 : 1} />
      {off && <path d="m3 3 18 18" />}
    </Svg>
  );
}

/* Battery: level 0–1, charging, low under 20% */
export function BatteryIcon({ level = 0.8, charging, ...p }) {
  const w = Math.max(0, Math.min(1, level)) * 14;
  const low = level < 0.2 && !charging;
  return (
    <Svg {...p} className={"tv-sysicon" + (low ? " is-low" : "") + (charging ? " is-charging" : "")}>
      <rect x="2" y="7" width="18" height="10" rx="2.5" />
      <path d="M22 10.5v3" />
      <rect x="4" y="9" width={w} height="6" rx="1.2" fill="currentColor" stroke="none" className="tv-battery-fill" />
      {charging && <path d="M11.5 8.3 9.3 12.3h3.4l-2.2 3.4" stroke="var(--surface-raised)" strokeWidth="2.6" />}
      {charging && <path d="M11.5 8.3 9.3 12.3h3.4l-2.2 3.4" strokeWidth="1.4" />}
    </Svg>
  );
}

/* Cloud: synced | syncing | offline */
export function CloudIcon({ state = "synced", ...p }) {
  return (
    <Svg {...p} className={"tv-sysicon is-" + state}>
      <path d="M17.5 19H8a5 5 0 1 1 .9-9.9A6 6 0 0 1 20.2 11 4 4 0 0 1 17.5 19z" strokeDasharray={state === "offline" ? "3 3" : undefined} />
      {state === "synced" && <path d="m9.5 14 2 2 3.5-3.5" />}
      {state === "syncing" && <path d="M10 14.5a2.5 2.5 0 0 0 4.3 1.2M14 13.5a2.5 2.5 0 0 0-4.3-1.2" className="tv-spin-slow" />}
    </Svg>
  );
}
export const MicIcon = (p) => <Svg {...p}><rect x="9" y="2.5" width="6" height="11.5" rx="3" /><path d="M18.5 11a6.5 6.5 0 0 1-13 0M12 17.5V21" /></Svg>;
export const CameraIcon = (p) => <Svg {...p}><path d="M14.5 4h-5L7.5 6.5H4.5a2 2 0 0 0-2 2V18a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2h-3z" /><circle cx="12" cy="13" r="3.5" /></Svg>;
export const BluetoothIcon = (p) => <Svg {...p}><path d="m7 7 10 10-5 4V3l5 4L7 17" /></Svg>;
export const LockIcon = (p) => <Svg {...p}><rect x="4.5" y="11" width="15" height="10" rx="2.5" /><path d="M8 11V7.5a4 4 0 0 1 8 0V11" /></Svg>;
export const LocationIcon = (p) => <Svg {...p}><path d="M12 21s7-6.1 7-11.5a7 7 0 0 0-14 0C5 14.9 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></Svg>;
export const AirplaneIcon = (p) => <Svg {...p}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" /></Svg>;
export const MoonIcon = (p) => <Svg {...p}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></Svg>;
export const ShieldIcon = (p) => <Svg {...p}><path d="M12 21.5s7.5-3.5 7.5-9.5V5.5L12 2.5l-7.5 3V12c0 6 7.5 9.5 7.5 9.5z" /><path d="m9 12 2 2 4-4" /></Svg>;
export const DevicesIcon = (p) => <Svg {...p}><rect x="2" y="4" width="13" height="10" rx="1.8" /><path d="M5 18h7" /><rect x="16.5" y="8" width="5.5" height="12" rx="1.4" /></Svg>;
export const FaceIdIcon = (p) => <Svg {...p}><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" /><path d="M9 9.5v1M15 9.5v1M12 9.5v3.5h-1M9.5 15.5a3.5 3.5 0 0 0 5 0" /></Svg>;
export const KeyboardIcon = (p) => <Svg {...p}><rect x="2" y="5.5" width="20" height="13" rx="2" /><path d="M6 9.5h.01M10 9.5h.01M14 9.5h.01M18 9.5h.01M6 13h.01M18 13h.01M10 13h4M7 15.5h10" /></Svg>;
export const AppsIcon = (p) => <Svg {...p}><rect x="3.5" y="3.5" width="7" height="7" rx="1.8" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.8" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.8" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.8" /></Svg>;
export const LightIcon = (p) => <Svg {...p}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></Svg>;
export const ThermoIcon = (p) => <Svg {...p}><path d="M14 14.8V4.5a2 2 0 0 0-4 0v10.3a4 4 0 1 0 4 0z" /></Svg>;
export const TvIcon = (p) => <Svg {...p}><rect x="2.5" y="6.5" width="19" height="13" rx="2" /><path d="m8 2.5 4 4 4-4" /></Svg>;
export const DoorIcon = (p) => <Svg {...p}><path d="M5 21V4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5V21M3 21h18" /><circle cx="15" cy="12" r=".8" fill="currentColor" /></Svg>;
export const LaptopIcon = (p) => <Svg {...p}><rect x="4" y="4.5" width="16" height="11" rx="1.6" /><path d="M2 19.5h20" /></Svg>;
export const PhoneDeviceIcon = (p) => <Svg {...p}><rect x="6.5" y="2.5" width="11" height="19" rx="2.4" /><path d="M11 18.5h2" /></Svg>;
export const ServerCloudIcon = (p) => <Svg {...p}><path d="M17.5 18H8a5 5 0 1 1 .9-9.9A6 6 0 0 1 20.2 10 4 4 0 0 1 17.5 18z" /><path d="M9 14.5h6" /></Svg>;
export const HomeIcon = (p) => <Svg {...p}><path d="m3 10 9-7 9 7v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20z" /><path d="M9.5 21.5V14h5v7.5" /></Svg>;
export const SpreadsheetIcon = (p) => <Svg {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18" /></Svg>;
export const ChatIcon = (p) => <Svg {...p}><path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.4-5.6A8.5 8.5 0 1 1 21 12z" /></Svg>;
export const CardIcon = (p) => <Svg {...p}><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="M2.5 10h19M6.5 15h4" /></Svg>;
export const TrashIcon = (p) => <Svg {...p}><path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 12.5a2 2 0 0 0 2 1.5h7a2 2 0 0 0 2-1.5l1-12.5M9 7V4.5h6V7" /></Svg>;
export const FolderIcon = (p) => <Svg {...p}><path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h4l2 2.5h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" /></Svg>;
export const GlobeIcon = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z" /></Svg>;
export const HistoryIcon = (p) => <Svg {...p}><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6L3.5 8.5" /><path d="M3.5 3.5v5h5M12 7.5V12l3 2" /></Svg>;
