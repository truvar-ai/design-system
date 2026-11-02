// International components: CountryPicker, PhoneField, LanguageSelect.
import React, { useState, useRef, useMemo } from "react";
import * as RAC from "react-aria-components";
import { AsYouType, parsePhoneNumberFromString, validatePhoneNumberLength, getExampleNumber } from "libphonenumber-js/max";
import examples from "libphonenumber-js/mobile/examples";
import * as Icon from "../icons/icons.jsx";
import { Flag } from "./Flag.jsx";
import { sortedCountries, countryByCode, cleanPhoneInput, toLatinDigits } from "./countries.js";

const cx = (...c) => c.filter(Boolean).join(" ");
/* Phone numbers are always left-to-right. Wrapping them in Unicode isolates (LRI…PDI) keeps
   "+20 10 02345678" in order inside Arabic sentences. */
const ltr = (s) => (s ? "\u2066" + s + "\u2069" : s);
const useLang = () => (RAC.useLocale().locale.startsWith("ar") ? "ar" : "en");

const T = {
  en: {
    country: "Country code", search: "Search country or code", none: "No country matches.",
    required: "Enter a phone number.",
    short: (c, ex) => `This number is too short for ${c}. Example: ${ex}`,
    long: (c, ex) => `This number is too long for ${c}. Example: ${ex}`,
    invalid: (c, ex) => `This isn't a valid ${c} number. Example: ${ex}`,
    digits: "Use digits only.",
    pickCountry: "Choose a country first.",
    saved: (type, n) => `${type}, saved as ${n}`,
    types: { MOBILE: "Mobile", FIXED_LINE: "Landline", FIXED_LINE_OR_MOBILE: "Phone", TOLL_FREE: "Toll-free", VOIP: "Internet phone" },
    phone: "Phone",
  },
  ar: {
    country: "رمز الدولة", search: "ابحث عن دولة أو رمز", none: "لا توجد دولة مطابقة.",
    required: "أدخل رقم الهاتف.",
    short: (c, ex) => `هذا الرقم أقصر من المعتاد في ${c}. مثال: ${ex}`,
    long: (c, ex) => `هذا الرقم أطول من المعتاد في ${c}. مثال: ${ex}`,
    invalid: (c, ex) => `هذا ليس رقمًا صحيحًا في ${c}. مثال: ${ex}`,
    digits: "استخدم الأرقام فقط.",
    pickCountry: "اختر الدولة أولًا.",
    saved: (type, n) => `${type}، سيُحفظ بصيغة ${n}`,
    types: { MOBILE: "رقم محمول", FIXED_LINE: "رقم أرضي", FIXED_LINE_OR_MOBILE: "رقم هاتف", TOLL_FREE: "رقم مجاني", VOIP: "هاتف عبر الإنترنت" },
    phone: "الهاتف",
  },
};

/* Search over each option's text ("Egypt مصر EG +20"): names in both languages, ISO code, dialling code.
   Arabic-Indic digits and a leading "+" are normalised so "+٢٠", "+20" and "20" all match. */
function countryTextFilter(text, input) {
  const q = toLatinDigits(input).trim().toLowerCase().replace(/^\+/, "");
  if (!q) return true;
  const parts = text.toLowerCase().split(" ");
  const dial = parts[parts.length - 1].replace("+", "");
  const iso = parts[parts.length - 2];
  if (/^\d+$/.test(q)) return dial.startsWith(q);          // digits search the dialling code only
  const names = parts.slice(0, -2).join(" ");
  // Short searches match the start of a word ("un" → United …, not Brunei); 4+ letters match anywhere.
  const words = names.split(/[\s\-()'’.,]+/);
  return iso === q || names.startsWith(q) || words.some((w) => w.startsWith(q)) || (q.length >= 4 && names.includes(q));
}

/* ---------- CountryPicker: Select + searchable list (Autocomplete) ---------- */
export function CountryPicker({ value, onChange, showDial = true, showName = false, label, isDisabled }) {
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const pick = (code) => { onChange?.(code); setOpen(false); };
  const t = T[lang];
  const items = useMemo(() => sortedCountries(lang), [lang]);
  const current = countryByCode(value);
  return (
    <RAC.Select selectedKey={value} onSelectionChange={(k) => k && pick(k)} aria-label={label ?? t.country}
      isOpen={open} onOpenChange={setOpen} isDisabled={isDisabled} className="tv-cpicker">
      <RAC.Button className="tv-cpicker-btn">
        {current ? <Flag code={current.code} size={16} /> : <Icon.Building width={16} height={16} />}
        {showName && current && <span className="tv-cpicker-name">{lang === "ar" ? current.ar : current.en}</span>}
        {showDial && current && <span className="tv-cpicker-dial" dir="ltr">+{current.dial}</span>}
        <Icon.ChevronDown className="tv-cpicker-chev" />
        <RAC.SelectValue className="tv-sr" />
      </RAC.Button>
      <RAC.Popover className="tv-popover tv-cpicker-pop" offset={6} placement="bottom start">
        <RAC.Autocomplete filter={countryTextFilter}>
          <RAC.SearchField aria-label={t.search} className="tv-command-search" autoFocus
            onKeyDown={(e) => {
              // Enter on the country that's already selected: nothing changes, so close explicitly.
              if (e.key !== "Enter") return;
              const id = e.target.getAttribute("aria-activedescendant");
              const el = id && document.getElementById(id);
              if (el && el.getAttribute("data-key") === value) setOpen(false);
            }}>
            <Icon.Search className="tv-search-icon" />
            <RAC.Input className="tv-input" placeholder={t.search} dir="auto" />
          </RAC.SearchField>
          <RAC.ListBox items={items} shouldFocusWrap className="tv-listbox tv-cpicker-list"
            renderEmptyState={() => <div className="tv-empty-mini">{t.none}</div>}>
            {(c) => (
              <RAC.ListBoxItem id={c.code} textValue={`${c.en} ${c.ar} ${c.code} +${c.dial}`} className="tv-item"
                onPointerUp={c.code === value ? () => setOpen(false) : undefined}>
                <Flag code={c.code} size={16} />
                <span className="tv-cpicker-item-name">{lang === "ar" ? c.ar : c.en}</span>
                <span className="tv-cpicker-item-dial" dir="ltr">+{c.dial}</span>
                <Icon.Check className="tv-check-icon" />
              </RAC.ListBoxItem>
            )}
          </RAC.ListBox>
        </RAC.Autocomplete>
      </RAC.Popover>
    </RAC.Select>
  );
}

/* ---------- PhoneField ----------
   - Formats as you type for the chosen country.
   - Paste anything: "tel:", spaces, dashes, brackets, "(0)", 00 prefix and Arabic-Indic digits are cleaned.
   - A pasted or typed +code switches the country automatically.
   - Validates on blur with a message that says what's wrong and shows a valid example.
   - onChange receives { e164, country, isValid } so you always store one clean format. */
export function PhoneField({ label, description, defaultCountry = "EG", isRequired, onChange, name, autoFocus }) {
  const lang = useLang();
  const t = T[lang];
  const [country, setCountry] = useState(defaultCountry);
  const [text, setText] = useState("");
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);

  const cname = (code) => { const c = countryByCode(code); return c ? (lang === "ar" ? c.ar : c.en) : code; };
  const example = (code) => {
    try { const ex = getExampleNumber(code, examples); return ex ? ex.formatInternational() : ""; } catch { return ""; }
  };

  const emit = (nextText, nextCountry) => {
    const p = parsePhoneNumberFromString(nextText, nextCountry);
    onChange?.({ e164: p?.number ?? "", country: nextCountry, isValid: !!p?.isValid() });
  };

  // Turn whatever is in the field into a display string, switching country if a +code is present.
  const apply = (raw, { reformat = true } = {}) => {
    const cleaned = cleanPhoneInput(raw);
    let nextCountry = country;
    let display = cleaned;
    if (cleaned.startsWith("+")) {
      const ayt = new AsYouType();
      const intl = ayt.input(cleaned);
      const detected = ayt.getCountry();
      if (detected) {
        nextCountry = detected;
        const national = ayt.getNationalNumber();
        const full = parsePhoneNumberFromString(cleaned);
        display = !reformat ? national
          : full?.isValid() ? full.formatNational()
          : new AsYouType(detected).input("0" + national).replace(/^0/, "") ;
      } else {
        display = reformat ? intl : cleaned;
      }
    } else if (reformat) {
      const full = parsePhoneNumberFromString(cleaned, country);
      display = full?.isValid() ? full.formatNational() : new AsYouType(country).input(cleaned);
    }
    if (nextCountry !== country) setCountry(nextCountry);
    setText(display);
    emit(display, nextCountry);
  };

  const onInputChange = (v) => {
    // Reformat only while typing at the end, so editing in the middle doesn't make the caret jump.
    const el = inputRef.current;
    const atEnd = !el || el.selectionStart === v.length;
    apply(v, { reformat: atEnd });
  };
  const onPaste = (e) => {
    const pasted = e.clipboardData?.getData("text") ?? "";
    if (!pasted) return;
    e.preventDefault();
    const el = e.currentTarget;
    const start = el.selectionStart ?? text.length, end = el.selectionEnd ?? text.length;
    const replacingAll = start === 0 && end === text.length;
    apply(replacingAll ? pasted : text.slice(0, start) + pasted + text.slice(end));
  };
  const onCountry = (code) => {
    setCountry(code);
    const digits = cleanPhoneInput(text).replace(/^\+/, "");
    const display = digits ? new AsYouType(code).input(digits) : "";
    setText(display);
    emit(display, code);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // Validation (shown after the first blur)
  let error = null;
  const parsed = text ? parsePhoneNumberFromString(text, country) : undefined;
  if (!text) { if (isRequired) error = t.required; }
  else if (/[a-z]/i.test(text)) error = t.digits;
  else {
    const len = validatePhoneNumberLength(text, country);
    const ex = ltr(example(country));
    if (len === "TOO_SHORT") error = t.short(cname(country), ex);
    else if (len === "TOO_LONG") error = t.long(cname(country), ex);
    else if (len === "INVALID_COUNTRY") error = t.pickCountry;
    else if (len === "NOT_A_NUMBER") error = t.digits;
    else if (!parsed?.isValid()) error = t.invalid(cname(country), ex);
  }
  const showError = touched && error;
  const okHint = parsed?.isValid()
    ? t.saved(t.types[parsed.getType()] ?? t.phone, ltr(parsed.formatInternational()))
    : null;

  return (
    <RAC.TextField className="tv-field" isInvalid={!!showError} isRequired={isRequired} name={name}
      value={text} onChange={onInputChange} onBlur={() => { setTouched(true); if (text) apply(text); }}>
      <RAC.Label className="tv-label">{label}</RAC.Label>
      <div className={cx("tv-phone", showError && "is-invalid")} dir="ltr">
        <CountryPicker value={country} onChange={onCountry} />
        <RAC.Input ref={inputRef} className="tv-input" type="tel" inputMode="tel" autoComplete="tel" autoFocus={autoFocus}
          placeholder={example(country).replace(/^\+\d+\s?/, "")} onPaste={onPaste} />
      </div>
      {showError
        ? <span className="tv-error" role="alert"><Icon.Alert width={14} height={14} />{error}</span>
        : (okHint ? <RAC.Text slot="description" className="tv-desc tv-phone-ok"><Icon.CheckCircle width={14} height={14} /><span dir="auto">{okHint}</span></RAC.Text>
                  : description ? <RAC.Text slot="description" className="tv-desc">{description}</RAC.Text> : null)}
    </RAC.TextField>
  );
}

/* ---------- LanguageSelect: flag + native language name ---------- */
export const LANGUAGES = [
  { id: "en", native: "English", en: "English (United States)", ar: "الإنجليزية (الولايات المتحدة)", region: "US" },
  { id: "ar", native: "العربية", en: "Arabic (Egypt)", ar: "العربية (مصر)", region: "EG" },
];
export function LanguageSelect({ value, onChange, languages = LANGUAGES, compact }) {
  const lang = useLang();
  const titleId = React.useId();
  const current = languages.find((l) => l.id === value) ?? languages[0];
  return (
    <RAC.Select selectedKey={value} onSelectionChange={(k) => k && onChange?.(k)} aria-label={lang === "ar" ? "اللغة" : "Language"}
      className="tv-langselect">
      <RAC.Button className={cx("tv-langselect-btn", compact && "is-compact")}>
        <Flag code={current.region} size={14} />
        <span className="tv-langselect-name" lang={current.id}>{current.native}</span>
        <Icon.ChevronDown className="tv-cpicker-chev" />
        <RAC.SelectValue className="tv-sr" />
      </RAC.Button>
      <RAC.Popover className="tv-popover tv-langselect-pop" offset={6} placement="bottom end">
        <p className="tv-pop-title" id={titleId}>{lang === "ar" ? "اللغات" : "Languages"}</p>
        <RAC.ListBox items={languages} className="tv-listbox" aria-labelledby={titleId}>
          {(l) => (
            <RAC.ListBoxItem id={l.id} textValue={l.native} className="tv-item tv-lang-item">
              <Flag code={l.region} size={16} />
              <span className="tv-lang-text">
                <span className="tv-lang-native" lang={l.id}>{l.native}</span>
                <span className="tv-desc">{lang === "ar" ? l.ar : l.en}</span>
              </span>
              <Icon.Check className="tv-check-icon" />
            </RAC.ListBoxItem>
          )}
        </RAC.ListBox>
      </RAC.Popover>
    </RAC.Select>
  );
}
