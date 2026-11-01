import React, { createContext, useContext } from "react";
import { STRINGS } from "../strings.js";
export const LangContext = createContext("en");
export const useLang = () => useContext(LangContext);
/* tr("English", "العربية") picks the right one for the current language */
export function useTr() {
  const lang = useLang();
  return (en, ar) => (lang === "ar" ? ar : en);
}
export const useT = () => STRINGS[useLang()];
