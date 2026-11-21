import type { CountryCode } from "libphonenumber-js";

/** A country with its dialling code and names in English and Arabic. */
export interface Country {
  /** ISO 3166-1 alpha-2 code (also includes libphonenumber codes such as "AC", "TA", "XK"). */
  code: CountryCode;
  /** International dialling code without the plus sign, e.g. "20". */
  dial: string;
  /** English name (CLDR). */
  en: string;
  /** Arabic name (CLDR). */
  ar: string;
}

/** Every country libphonenumber-js knows, with dialling code and English and Arabic names. */
export declare const COUNTRIES: readonly Country[];

/** A copy of COUNTRIES sorted alphabetically for the language ("ar" sorts by the Arabic names; anything else by English). */
export declare function sortedCountries(lang?: "en" | "ar"): Country[];

/** Finds a country by ISO code, or undefined when it is not in COUNTRIES. */
export declare const countryByCode: (code: string | null | undefined) => Country | undefined;

/** Converts Arabic-Indic and Persian digits in any text to 0-9. */
export declare function toLatinDigits(s: unknown): string;

/** Cleans pasted phone text ("tel:", spaces, dashes, "(0)", a 00 prefix, Arabic digits) and keeps one leading "+". */
export declare function cleanPhoneInput(raw: unknown): string;

/** Search helper: true when the English or Arabic name, ISO code or dialling code (with or without "+") matches the query. */
export declare function countryMatches(c: Pick<Country, "code" | "dial" | "en" | "ar">, query: unknown): boolean;
