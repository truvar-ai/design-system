// Flag: SVG country flags from country-flag-icons (MIT). 3:2 rectangle by default, or a circle.
import * as Flags3x2 from "country-flag-icons/react/3x2";
import * as Flags1x1 from "country-flag-icons/react/1x1";

export function Flag({ code, size = 20, shape = "rect", title, className }) {
  const set = shape === "circle" ? Flags1x1 : Flags3x2;
  const F = code && set[code.toUpperCase()];
  const w = shape === "circle" ? size : Math.round(size * 1.5);
  const style = { width: w, height: size };
  return (
    <span className={"tv-flag" + (shape === "circle" ? " tv-flag--circle" : "") + (className ? " " + className : "")}
      style={style} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {F ? <F /> : <span className="tv-flag-missing">{code}</span>}
    </span>
  );
}
