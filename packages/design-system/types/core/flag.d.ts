import type * as React from "react";
import type { CountryCode } from "libphonenumber-js";

export interface FlagProps {
  /** ISO 3166-1 alpha-2 country code, case-insensitive ("EG", "sa"). Unknown codes render the code as text. */
  code: CountryCode | (string & {});
  /** Height in pixels; a rectangular flag is 1.5 times wider. Default 20. */
  size?: number;
  /** "rect" is a 3:2 rectangle, "circle" a 1:1 circle. Default "rect". */
  shape?: "rect" | "circle";
  /** Accessible name. Without it the flag is decorative (hidden from screen readers). */
  title?: string;
  className?: string;
}

/** SVG country flag (3:2 rectangle or circle) from country-flag-icons. */
export declare function Flag(props: FlagProps): React.JSX.Element;
