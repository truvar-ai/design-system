// Number and date formatting that writes the same text on the server and in every browser.
// Node and each browser ship different Unicode (CLDR) data, so plain Intl output differs in small ways:
// a thin space or a plain space around a date range dash, "EGP 200.0K" or "EGP 200K", an extra right-to-left
// mark before an Arabic amount. Server-rendered pages (Next.js) then don't match in the browser and React
// throws a hydration error. Use these in place of new Intl.NumberFormat / DateTimeFormat / RelativeTimeFormat.

// Bidi marks go (the text's own direction places Arabic amounts correctly); thin and narrow spaces become
// a plain space and a no-break space
const tidy = (s) => s.replace(/[\u200e\u200f]/g, "").replace(/\u2009/g, " ").replace(/\u202f/g, "\u00a0");

export function numberFormat(locale, options) {
  // Engines disagree on trailing zeros in compact numbers unless the minimum is given
  const o = options?.notation === "compact" && options.minimumFractionDigits == null ? { ...options, minimumFractionDigits: 0 } : options;
  const f = new Intl.NumberFormat(locale, o);
  return { format: (n) => tidy(f.format(n)), resolvedOptions: () => f.resolvedOptions() };
}

export function dateFormat(locale, options) {
  const f = new Intl.DateTimeFormat(locale, options);
  return {
    format: (d) => tidy(f.format(d)),
    formatRange: (a, b) => tidy(f.formatRange(a, b)),
    resolvedOptions: () => f.resolvedOptions(),
  };
}

export function relativeTimeFormat(locale, options) {
  const f = new Intl.RelativeTimeFormat(locale, options);
  return { format: (v, unit) => tidy(f.format(v, unit)) };
}
