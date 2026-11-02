"use client";
// Language, links and theme for every page. The showcase demos read the language from the showcase's
// LangContext, so the docs provide it too.
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { I18nProvider } from "react-aria-components";
import { RouterProvider, ToastRegion, useSystemBars } from "@truvar-ai/design-system";
import { LangContext } from "showcase/src/docs/i18n.jsx";
import { LOCALES } from "./config.js";
import { useAppMounted } from "../docs/Island.jsx";

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);
export const useSite = () => {
  const lang = useContext(LangContext);
  return { lang, ar: lang === "ar", tr: (en, ar) => (lang === "ar" ? ar : en) };
};

// "system" follows the device; "light" and "dark" are saved
function useThemeState() {
  const [theme, setThemeState] = useState("system");
  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    if (t === "dark" || t === "light") setThemeState(t);
  }, []);
  const setTheme = useCallback((t) => {
    setThemeState(t);
    const root = document.documentElement;
    try {
      if (t === "system") { delete root.dataset.theme; localStorage.removeItem("truvar-theme"); }
      else { root.dataset.theme = t; localStorage.setItem("truvar-theme", t); }
    } catch {}
  }, []);
  return [theme, setTheme];
}

export function Providers({ lang, children }) {
  const router = useRouter();
  const [theme, setTheme] = useThemeState();
  // The phone's status bar follows the page (the docs' frame colour, the landing page's surface),
  // and dims with it when a sheet or menu opens
  const path = usePathname();
  useSystemBars([theme, path]);
  useAppMounted();
  // Analytics: one "page_view" in Google Tag Manager's dataLayer for every page, including ones opened without a reload
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "page_view", page_path: location.pathname + location.search, page_title: document.title, language: lang });
  }, [path, lang]);
  return (
    <LangContext.Provider value={lang}>
      <I18nProvider locale={LOCALES[lang]}>
        <RouterProvider navigate={router.push}>
          <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
            <ToastRegion />
          </ThemeContext.Provider>
        </RouterProvider>
      </I18nProvider>
    </LangContext.Provider>
  );
}
