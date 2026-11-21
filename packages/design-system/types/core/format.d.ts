/** Anything `Intl` accepts as a locale: a BCP 47 tag ("ar-EG") or a list of tags. */
export type FormatLocale = string | readonly string[] | undefined;

/** Result of numberFormat. */
export interface NumberFormatter {
  /** Formats a number; the same text on the server and in every browser. */
  format(value: number | bigint): string;
  resolvedOptions(): Intl.ResolvedNumberFormatOptions;
}

/** Result of dateFormat. */
export interface DateFormatter {
  /** Formats a date or a timestamp in milliseconds. */
  format(date?: Date | number): string;
  /** Formats a range such as "Nov 3 - 9, 2026". */
  formatRange(startDate: Date | number, endDate: Date | number): string;
  resolvedOptions(): Intl.ResolvedDateTimeFormatOptions;
}

/** Result of relativeTimeFormat. */
export interface RelativeTimeFormatter {
  /** Formats a relative time such as "in 3 days" or "منذ يومين". */
  format(value: number, unit: Intl.RelativeTimeFormatUnit): string;
}

/** Drop-in for `new Intl.NumberFormat` that writes identical text on server and client (no hydration mismatches). */
export declare function numberFormat(locale?: FormatLocale, options?: Intl.NumberFormatOptions): NumberFormatter;

/** Drop-in for `new Intl.DateTimeFormat` that writes identical text on server and client. */
export declare function dateFormat(locale?: FormatLocale, options?: Intl.DateTimeFormatOptions): DateFormatter;

/** Drop-in for `new Intl.RelativeTimeFormat` that writes identical text on server and client. */
export declare function relativeTimeFormat(locale?: FormatLocale, options?: Intl.RelativeTimeFormatOptions): RelativeTimeFormatter;
