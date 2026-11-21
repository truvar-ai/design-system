import type * as React from "react";

/** The brand themes the package ships: "truvar" (default) and "easysocials". */
export type BrandName = "truvar" | "easysocials";

/** Which art `Logo` draws: the full wordmark or the square monogram. */
export type LogoVariant = "wordmark" | "monogram";

/** `"auto"` follows the light/dark theme; `"onDark"` always draws the reversed art, for dark brand fields. */
export type LogoTone = "auto" | "onDark";

/** Motion of the orbit mark: `"searching"` turns quickly, `"speaking"` turns slowly while the centre breathes. */
export type OrbitActivity = "searching" | "speaking";

export interface LogoProps {
  /** Wordmark (default) or monogram art. */
  variant?: LogoVariant;
  /** `"auto"` (default) follows the theme; `"onDark"` forces the reversed art. */
  tone?: LogoTone;
  /** Width in px. Defaults to 120 for the wordmark and 24 for the monogram. */
  width?: number;
  className?: string;
  /** Which brand to draw. Defaults to the nearest `BrandProvider`'s brand. */
  brand?: BrandName;
}

export interface OrbitMarkProps {
  /** Width and height in px. Default 24. */
  size?: number;
  /** Spreads the dots into an even orbit and turns it. Default false (the resting logo). */
  active?: boolean;
  /** Motion style while `active`. Default "searching". */
  activity?: OrbitActivity;
  /** Accessible name. Without it the mark is decorative (`aria-hidden`). */
  title?: string;
}

export interface BrandAvatarProps {
  /** Tooltip and accessible name. Default "Truvar.ai". */
  label?: string;
  /** Diameter in px. Default 40. */
  size?: number;
  /** Keeps the orbit animating. Default false (animates on hover only). */
  active?: boolean;
  /** Motion style. Default "speaking". */
  activity?: OrbitActivity;
}

export interface OrbitLoaderProps {
  /** Announced to screen readers; also shown beside the mark unless `showLabel` is false. */
  label: string;
  /** Mark size in px. Default 24. */
  size?: number;
  /** Motion style. Default "searching". */
  activity?: OrbitActivity;
  /** Show the label text next to the mark. Default true. */
  showLabel?: boolean;
}

export interface BrandProviderProps {
  /** The active brand. Default "truvar". */
  brand?: BrandName;
  children?: React.ReactNode;
}

export interface EasySocialsMarkProps {
  /** Width and height in px. Default 24. */
  size?: number;
  /** Accessible name. Without it the mark is decorative (`aria-hidden`). */
  title?: string;
}

/** Display names of the supported brands, keyed by brand name. */
export declare const BRANDS: {
  readonly truvar: "Truvar.ai";
  readonly easysocials: "EasySocials";
};

/** Tells brand art (`Logo`) which brand to draw. Colours follow `data-brand` on `<html>` separately. */
export declare function BrandProvider(props: BrandProviderProps): React.JSX.Element;

/** The brand set by the nearest `BrandProvider` ("truvar" when there is none). */
export declare function useBrand(): BrandName;

/** The brand logo: wordmark or monogram, switching art for light/dark and for the active brand. */
export declare function Logo(props: LogoProps): React.JSX.Element;

/** The Truvar orbit mark (the logo's dots), drawn in SVG and animated when `active`. */
export declare function OrbitMark(props: OrbitMarkProps): React.JSX.Element;

/** Gold-ringed avatar around the orbit mark, for AI agents; animates on hover or while `active`. */
export declare function BrandAvatar(props: BrandAvatarProps): React.JSX.Element;

/** Indeterminate progress indicator drawn as the spinning orbit mark. */
export declare function OrbitLoader(props: OrbitLoaderProps): React.JSX.Element;

/** The EasySocials mark (green figure with a yellow quarter circle), drawn in SVG. */
export declare function EasySocialsMark(props: EasySocialsMarkProps): React.JSX.Element;
