// Countries: ISO codes and dialling codes from libphonenumber-js, names from the browser's Intl API
// (CLDR data, so every country has a proper English and Arabic name with no extra dataset).
import { getCountries, getCountryCallingCode } from "libphonenumber-js/max";

const nameIn = (locale) => {
  let dn;
  try { dn = new Intl.DisplayNames([locale], { type: "region" }); } catch { dn = null; }
  return (code) => { try { return dn?.of(code) ?? code; } catch { return code; } };
};
const en = nameIn("en"), ar = nameIn("ar");

export const COUNTRIES = getCountries().map((code) => ({
  code,
  dial: getCountryCallingCode(code),
  en: en(code),
  ar: ar(code),
}));

export function sortedCountries(lang = "en") {
  const key = lang === "ar" ? "ar" : "en";
  return [...COUNTRIES].sort((a, b) => a[key].localeCompare(b[key], lang));
}
export const countryByCode = (code) => COUNTRIES.find((c) => c.code === code);

/* Digits: Arabic-Indic (٠-٩) and Persian (۰-۹) become 0-9, so pasted or typed Arabic numbers work. */
export function toLatinDigits(s) {
  return String(s ?? "")
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0));
}

/* Cleans anything people paste: "tel:", spaces, dashes, dots, brackets, a "(0)" trunk prefix,
   a leading 00 international prefix, and stray letters. Keeps one leading "+". */
export function cleanPhoneInput(raw) {
  let s = toLatinDigits(raw).trim();
  s = s.replace(/^tel:/i, "");
  s = s.replace(/\(0\)/g, "");                 // +20 (0)100 ... → +20 100 ...
  const plus = /^\s*\+/.test(s);
  let digits = s.replace(/\D/g, "");
  if (!plus && digits.startsWith("00")) return "+" + digits.slice(2);
  return (plus ? "+" : "") + digits;
}

/* Search helper: matches English or Arabic name, ISO code or dialling code (with or without +). */
export function countryMatches(c, query) {
  const q = toLatinDigits(query).trim().toLowerCase().replace(/^\+/, "");
  if (!q) return true;
  if (/^\d+$/.test(q)) return c.dial.startsWith(q);
  const names = (c.en + " " + c.ar).toLowerCase();
  const words = names.split(/[\s\-()'’.,]+/);
  return c.code.toLowerCase() === q || words.some((w) => w.startsWith(q)) || (q.length >= 4 && names.includes(q));
}
