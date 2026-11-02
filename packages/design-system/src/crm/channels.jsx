// Channels: every place a customer can write from, with its brand mark and name in both languages.
import * as Icon from "../icons/icons.jsx";
import { CHANNEL_DATA } from "./channel-data.js";
import { useCrm } from "./i18n.js";

const cx = (...c) => c.filter(Boolean).join(" ");
const GENERIC = { sms: Icon.MessageSquare, email: Icon.Mail, phone: Icon.Phone, webchat: Icon.MessageCircle };
// Marks whose brand colour is black or a very light yellow get theme-aware colours, so they stay visible in dark mode
const INK = new Set(["tiktok", "x", "threads"]);

export const CHANNELS = Object.keys(CHANNEL_DATA);
export const channelName = (id, lang = "en") => CHANNEL_DATA[id]?.[lang] ?? id;
export const useChannelName = () => { const { lang } = useCrm(); return (id) => channelName(id, lang); };

/* The mark alone, in the brand colour (or the text colour for black marks). Decorative unless label is given. */
export function ChannelIcon({ channel, size = 16, label, className }) {
  const c = CHANNEL_DATA[channel];
  if (!c) return null;
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  const G = GENERIC[channel];
  if (G) return <G width={size} height={size} className={cx("tv-ch-icon", className)} {...a11y} />;
  const color = INK.has(channel) ? "var(--ink)" : c.hex;
  if (!c.path) {
    // Lettermark for brands without a free mark (LinkedIn)
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className={cx("tv-ch-icon", className)} {...a11y}>
        <rect width="24" height="24" rx="4" fill={c.hex} />
        <text x="12" y="17.5" textAnchor="middle" fontSize="14" fontWeight="700" fontFamily="Arial, sans-serif" fill="#fff">in</text>
      </svg>
    );
  }
  return <svg viewBox="0 0 24 24" width={size} height={size} fill={color} className={cx("tv-ch-icon", className)} {...a11y}><path d={c.path} /></svg>;
}

/* A round badge with a white mark on the brand colour: sits on an avatar corner or in a list. */
export function ChannelBadge({ channel, size = 18, label, className }) {
  const c = CHANNEL_DATA[channel];
  if (!c) return null;
  const G = GENERIC[channel];
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  const inner = Math.round(size * 0.6);
  return (
    <span className={cx("tv-ch-badge", `is-${channel}`, className)} style={{ width: size, height: size, "--ch": c.hex }} {...a11y}>
      {G ? <G width={inner} height={inner} strokeWidth={2.2} />
        : c.path ? <svg viewBox="0 0 24 24" width={inner} height={inner} fill="currentColor"><path d={c.path} /></svg>
        : <b style={{ fontSize: inner }}>in</b>}
    </span>
  );
}

/* Mark plus name, for "via WhatsApp" lines, filters and pickers */
export function ChannelLabel({ channel, size = 14, className }) {
  const { lang } = useCrm();
  return <span className={cx("tv-ch-label", className)}><ChannelIcon channel={channel} size={size} />{channelName(channel, lang)}</span>;
}

/* An avatar with the channel the person is writing from on its corner */
export function ChannelAvatar({ avatar, channel, size = 40 }) {
  return (
    <span className="tv-ch-avatar" style={{ width: size, height: size }}>
      {avatar}
      {channel && <ChannelBadge channel={channel} size={Math.max(16, Math.round(size * 0.42))} />}
    </span>
  );
}
