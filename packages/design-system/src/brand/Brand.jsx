// Truvar.ai brand: Logo (wordmark / monogram art), OrbitMark, BrandAvatar, OrbitLoader.
import React from "react";
import * as RAC from "react-aria-components";
import { WORDMARK_LIGHT, WORDMARK_DARK, MONOGRAM_LIGHT, MONOGRAM_DARK } from "./logo-assets.js";

const cx = (...c) => c.filter(Boolean).join(" ");

/* ---------- Logo ---------- */
// variant: "wordmark" | "monogram". tone: "auto" follows the theme; "onDark" forces reversed art.
export function Logo({ variant = "wordmark", tone = "auto", width, className }) {
  const [light, dark] = variant === "monogram" ? [MONOGRAM_LIGHT, MONOGRAM_DARK] : [WORDMARK_LIGHT, WORDMARK_DARK];
  const w = width ?? (variant === "monogram" ? 24 : 120);
  return (
    <span className={cx("tv-logo", className)} data-tone={tone} style={{ width: w }} role="img" aria-label="Truvar.ai">
      <img className="is-light" src={light} alt="" />
      <img className="is-dark" src={dark} alt="" />
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
