// Truvar.ai brand: Logo (wordmark / monogram art), OrbitMark, BrandAvatar, OrbitLoader.
import React from "react";
import * as RAC from "react-aria-components";
import { WORDMARK_LIGHT, WORDMARK_DARK, MONOGRAM_LIGHT, MONOGRAM_DARK } from "./logo-assets.js";
import { EasySocialsMark } from "./EasySocials.jsx";

const cx = (...c) => c.filter(Boolean).join(" ");

/* ---------- Brand ---------- */
// The brand theme: "truvar" (default) or "easysocials". Colours follow data-brand on <html>;
// BrandProvider tells the components that draw brand art (Logo) which one to draw.
export const BRANDS = { truvar: "Truvar.ai", easysocials: "EasySocials" };
const BrandContext = React.createContext("truvar");
export const useBrand = () => React.useContext(BrandContext);
export function BrandProvider({ brand = "truvar", children }) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

/* ---------- Logo ---------- */
// variant: "wordmark" | "monogram". tone: "auto" follows the theme; "onDark" forces reversed art.
// brand: defaults to the BrandProvider's.
export function Logo({ variant = "wordmark", tone = "auto", width, className, brand }) {
  const current = useBrand();
  if ((brand ?? current) === "easysocials") return <EasySocialsLogo {...{ variant, tone, width, className }} />;
  const [light, dark] = variant === "monogram" ? [MONOGRAM_LIGHT, MONOGRAM_DARK] : [WORDMARK_LIGHT, WORDMARK_DARK];
  const w = width ?? (variant === "monogram" ? 24 : 120);
  return (
    <span className={cx("tv-logo", className)} data-tone={tone} style={{ width: w }} role="img" aria-label="Truvar.ai">
      <img className="is-light" src={light} alt="" />
      <img className="is-dark" src={dark} alt="" />
    </span>
  );
}
// Mark plus the name set in the display face, until there is a drawn wordmark.
function EasySocialsLogo({ variant, tone, width, className }) {
  const w = width ?? (variant === "monogram" ? 24 : 120);
  return (
    <span className={cx("tv-logo", "tv-logo--es", className)} data-tone={tone} data-variant={variant}
      style={{ width: w }} role="img" aria-label="EasySocials">
      <EasySocialsMark size={variant === "monogram" ? w : Math.round(w * 0.22)} />
      {variant !== "monogram" && <span className="tv-logo-name" aria-hidden="true">EasySocials</span>}
    </span>
  );
}
/* Orbit mark: the dots from the logo, drawn in code.
   Rest: exactly the logo — four pairs of dots (top, right, bottom, left), alternating ink and gold clockwise.
   Active (hover, loading, speaking): each pair spreads into an even 8-dot orbit and the orbit turns.
   activity="searching" turns quickly; activity="speaking" turns slowly and the centre breathes. */
const ORBIT_DOTS = Array.from({ length: 8 }, (_, i) => {
  const pair = i >> 1, side = i % 2 ? 1 : -1;
  return { rest: pair * 90 + side * 16, active: pair * 90 + side * 22.5, gold: i % 2 === 1 };
});
export function OrbitMark({ size = 24, active = false, activity = "searching", title }) {
  return (
    <svg className="tv-orbit" viewBox="0 0 24 24" width={size} height={size}
      data-active={active || undefined} data-activity={activity}
      role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <circle cx="12" cy="12" r="4.4" className="tv-orbit-core tv-orbit-ink" />
      <g className="tv-orbit-ring">
        {ORBIT_DOTS.map((d, i) => (
          <g key={i} className="tv-orbit-dot" style={{ "--rest": `${d.rest}deg`, "--active": `${d.active}deg` }}>
            <circle cx="12" cy="3.7" r="1.95" className={d.gold ? "tv-orbit-gold" : "tv-orbit-ink"} />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* Avatar: gold ring around the mark. Hover animates it; active keeps it animating. */
export const BrandAvatar = ({ label = "Truvar.ai", size = 40, active = false, activity = "speaking" }) => (
  <span className="tv-avatar" style={{ width: size, height: size }} title={label}>
    <OrbitMark size={Math.round(size * 0.62)} title={label} active={active} activity={activity} />
  </span>
);

/* Loader: React Aria ProgressBar (indeterminate) drawn as the orbit mark.
   Screen readers announce the label; the motion is decoration. */
export function OrbitLoader({ label, size = 24, activity = "searching", showLabel = true }) {
  return (
    <RAC.ProgressBar isIndeterminate aria-label={label} className="tv-loader">
      <OrbitMark size={size} active activity={activity} />
      {showLabel && <span className="tv-loader-label">{label}</span>}
    </RAC.ProgressBar>
  );
}
