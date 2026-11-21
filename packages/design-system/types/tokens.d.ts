/**
 * Every Truvar design token, by name (without the leading `--`). Each name is also the CSS custom property
 * defined in `@truvar-ai/design-system/tokens.css`, so `light["primary"]` is the value of `var(--primary)`.
 * Values are CSS strings (colors, lengths, shadows, font stacks).
 */
export interface TokenSet {
  /** Light `#001250` (same in dark) */
  readonly "navy-900": string;
  /** Light `#e0b96a` (same in dark) */
  readonly "gold-300": string;
  /** Light `#c39a4c` (same in dark) */
  readonly "gold-500": string;
  /** Light `#916625` (same in dark) */
  readonly "bronze-700": string;
  /** Light `#001250` (same in dark) */
  readonly "brand-field": string;
  /** Light `#ffffff`, dark `#131416` */
  readonly "surface": string;
  /** Light `#f7f5f0`, dark `#1c1d20` */
  readonly "surface-alt": string;
  /** Light `#001250`, dark `#ebe9e4` */
  readonly "ink": string;
  /** Light `#4a5578`, dark `#a5a39d` */
  readonly "ink-muted": string;
  /** Light `#916625`, dark `#e0b96a` */
  readonly "accent": string;
  /** Light `#001250`, dark `#e0b96a` */
  readonly "primary": string;
  /** Light `#ffffff`, dark `#131416` */
  readonly "on-primary": string;
  /** Light `#d9dce6`, dark `#2d2e32` */
  readonly "border": string;
  /** Light `#6b7494`, dark `#76777d` */
  readonly "border-strong": string;
  /** Light `#916625`, dark `#e0b96a` */
  readonly "focus-ring": string;
  /** Light `#1f6f4a`, dark `#6fd3a0` */
  readonly "success": string;
  /** Light `#b3261e`, dark `#ff8a80` */
  readonly "danger": string;
  /** Light `#ffffff`, dark `#232428` */
  readonly "surface-raised": string;
  /** Light `#001250`, dark `#8ea2e8` */
  readonly "chart-1": string;
  /** Light `#c39a4c`, dark `#e0b96a` */
  readonly "chart-2": string;
  /** Light `#6b7494`, dark `#a5a39d` */
  readonly "chart-3": string;
  /** Light `#1f6f4a`, dark `#6fd3a0` */
  readonly "chart-4": string;
  /** Light `#9aa7d6`, dark `#4a5a99` */
  readonly "chart-5": string;
  /** Light `#b3261e`, dark `#ff8a80` */
  readonly "chart-6": string;
  /** Light `#ffffff`, dark `#131416` */
  readonly "chart-ink-1": string;
  /** Light `#001250`, dark `#131416` */
  readonly "chart-ink-2": string;
  /** Light `#ffffff`, dark `#131416` */
  readonly "chart-ink-3": string;
  /** Light `#ffffff`, dark `#131416` */
  readonly "chart-ink-4": string;
  /** Light `#001250`, dark `#ffffff` */
  readonly "chart-ink-5": string;
  /** Light `#ffffff`, dark `#131416` */
  readonly "chart-ink-6": string;
  /** Light `#ffffff`, dark `#1c1d20` */
  readonly "map-base": string;
  /** Light `#eceae4`, dark `#26272b` */
  readonly "map-empty": string;
  /** Light `#ffffff`, dark `#131416` */
  readonly "map-stroke": string;
  /** Light `6px` (same in dark) */
  readonly "radius-sm": string;
  /** Light `12px` (same in dark) */
  readonly "radius-md": string;
  /** Light `24px` (same in dark) */
  readonly "radius-lg": string;
  /** Light `999px` (same in dark) */
  readonly "radius-pill": string;
  /** Light `0 1px 2px rgba(0,18,80,.06),0 4px 16px rgba(0,18,80,.08)`, dark `0 1px 2px rgba(0,0,0,.5),0 8px 24px rgba(0,0,0,.45)` */
  readonly "shadow-card": string;
  /** Light `4px` (same in dark) */
  readonly "space-1": string;
  /** Light `8px` (same in dark) */
  readonly "space-2": string;
  /** Light `12px` (same in dark) */
  readonly "space-3": string;
  /** Light `16px` (same in dark) */
  readonly "space-4": string;
  /** Light `24px` (same in dark) */
  readonly "space-6": string;
  /** Light `40px` (same in dark) */
  readonly "space-10": string;
  /** Light `64px` (same in dark) */
  readonly "space-16": string;
  /** Light `"Poppins","Alexandria","Helvetica Neue","Arial",sans-serif` (same in dark) */
  readonly "font-display": string;
  /** Light `"DM Sans","IBM Plex Sans Arabic","Helvetica Neue","Arial",sans-serif` (same in dark) */
  readonly "font-body": string;
}

/** The tokens EasySocials adds on top of the base set. */
export interface EasySocialsExtraTokens {
  /** Light `#22c55e` (same in dark) */
  readonly "green-500": string;
  /** Light `#15803d` (same in dark) */
  readonly "green-700": string;
  /** Light `#20e261` (same in dark) */
  readonly "green-400": string;
  /** Light `#0abb45` (same in dark) */
  readonly "green-600": string;
}

/** Every token of the EasySocials brand, fully resolved: the base set with the brand's overrides, plus its extras. */
export interface EasySocialsTokenSet extends TokenSet, EasySocialsExtraTokens {}

/** A token name: `"primary"`, `"surface"`, `"space-4"`, and so on. */
export type TokenName = keyof TokenSet;

/** A token name that only the EasySocials brand defines. */
export type EasySocialsExtraTokenName = keyof EasySocialsExtraTokens;

/** One theme (light or dark) of a brand. */
export interface BrandTokens<T extends TokenSet = TokenSet> {
  readonly light: Readonly<T>;
  readonly dark: Readonly<T>;
}

/** Resolved tokens for every brand except the default Truvar one, keyed by the brand name used in `data-brand`. */
export interface BrandTokenSets {
  readonly easysocials: BrandTokens<EasySocialsTokenSet>;
}

/** The base (Truvar) tokens for the light theme. */
export declare const light: Readonly<TokenSet>;

/** The base (Truvar) tokens for the dark theme. Dark overrides are merged over the light values, so every name is present. */
export declare const dark: Readonly<TokenSet>;

/** Fully resolved tokens of each additional brand: `brands.easysocials.dark["primary"]`. */
export declare const brands: BrandTokenSets;

declare const tokens: {
  readonly light: Readonly<TokenSet>;
  readonly dark: Readonly<TokenSet>;
  readonly brands: BrandTokenSets;
};
export default tokens;
