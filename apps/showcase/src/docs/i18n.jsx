import { createContext, useContext, useCallback } from "react";
import { STRINGS } from "../strings.js";
export const LangContext = createContext("en");
export const useLang = () => useContext(LangContext);
/* tr("English", "العربية") picks the right one for the current language */
export function useTr() {
  const lang = useLang();
  return useCallback((en, ar) => (lang === "ar" ? ar : en), [lang]);
}
export const useT = () => STRINGS[useLang()];
