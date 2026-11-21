import type * as React from "react";
import type { CountryCode } from "libphonenumber-js";

export interface CountryPickerProps {
  /** Selected ISO country code. */
  value?: CountryCode | null;
  /** Called with the chosen country code. */
  onChange?: (code: CountryCode) => void;
  /** Show the dialling code ("+20") on the button. Default true. */
  showDial?: boolean;
  /** Show the country name on the button. Default false. */
  showName?: boolean;
  /** Accessible name of the picker. Default "Country code" / "رمز الدولة". */
  label?: string;
  isDisabled?: boolean;
}

/** Country selector: a flag button that opens a searchable list (names in English and Arabic, ISO code, dialling code). */
export declare function CountryPicker(props: CountryPickerProps): React.JSX.Element;

/** The value PhoneField reports on every change. */
export interface PhoneValue {
  /** The number in E.164 format ("+201002345678"), or "" when it cannot be parsed. */
  e164: string;
  /** The country currently selected (changes when a "+code" is typed or pasted). */
  country: CountryCode;
  /** Whether the number is valid for that country. */
  isValid: boolean;
}

export interface PhoneFieldProps {
  /** Visible label. */
  label?: React.ReactNode;
  /** Help text, replaced by the validation message or the "saved as" hint. */
  description?: React.ReactNode;
  /** Initial country. Default "EG". */
  defaultCountry?: CountryCode;
  /** Shows "Enter a phone number." when empty after the first blur. */
  isRequired?: boolean;
  /** Called on every edit with the cleaned number, the country and whether it is valid. */
  onChange?: (value: PhoneValue) => void;
  /** Form field name for the visible text input. */
  name?: string;
  autoFocus?: boolean;
}

/** International phone input: formats as you type, cleans pasted text, switches country on "+code", validates on blur. */
export declare function PhoneField(props: PhoneFieldProps): React.JSX.Element;

/** A language option for LanguageSelect. */
export interface LanguageOption {
  /** Language tag used as the value, e.g. "en", "ar". */
  id: string;
  /** The language's name in itself ("English", "العربية"). */
  native: string;
  /** English description, e.g. "Arabic (Egypt)". */
  en: string;
  /** Arabic description. */
  ar: string;
  /** Country code of the flag shown beside it. */
  region: CountryCode | (string & {});
}

/** The built-in languages: English (US) and Arabic (Egypt). */
export declare const LANGUAGES: readonly LanguageOption[];

export interface LanguageSelectProps {
  /** Selected language id. */
  value?: string;
  /** Called with the chosen language id. */
  onChange?: (id: string) => void;
  /** Languages to offer. Default LANGUAGES. */
  languages?: readonly LanguageOption[];
  /** Smaller button. */
  compact?: boolean;
}

/** Language selector showing a flag and the language's native name. */
export declare function LanguageSelect(props: LanguageSelectProps): React.JSX.Element;
