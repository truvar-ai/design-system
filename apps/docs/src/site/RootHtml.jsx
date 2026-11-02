// The <html> document for both languages. Each language has its own root layout (app/(en), app/(ar)),
// so the page arrives with the right lang and dir before any script runs.
// Core styles for every page. The module stylesheets (charts, voice, OS, CRM, widget) and the demo styles load
// only on the component pages that use them: see scripts/routes.mjs.
import "@truvar-ai/design-system/fonts.css";
import "@truvar-ai/design-system/styles.css";
import "./site.css";
import Script from "next/script";
import { Providers } from "./Providers.jsx";
import { GTM_ID } from "./config.js";

// Google Tag Manager's official snippet. The docs change pages without reloading, so Providers also pushes
// a "page_view" event on every page change: use it as a Custom Event trigger in GTM.
const GTM_SCRIPT = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`;

// Runs before the first paint, so a saved theme or a collapsed sidebar never flashes the other state
const THEME_SCRIPT = `try{var r=document.documentElement,t=localStorage.getItem("truvar-theme");if(t==="dark"||t==="light")r.dataset.theme=t;if(localStorage.getItem("truvar-docs-collapsed")==="1")r.dataset.navCollapsed=""}catch(e){}`;

export function RootHtml({ lang, children }) {
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        {/* The phone's status bar: one tag, kept in step with the top bar by useSystemBars (in Providers) */}
        <meta name="theme-color" content="#f7f5f0" />
      </head>
      {/* Browser extensions (Grammarly, password managers) add attributes to <body> before React starts */}
      <body suppressHydrationWarning>
        <Script id="theme" strategy="beforeInteractive">{THEME_SCRIPT}</Script>
        <Script id="gtm" strategy="afterInteractive">{GTM_SCRIPT}</Script>
        <noscript>
          <iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} title="Google Tag Manager" />
        </noscript>
        <Providers lang={lang}>{children}</Providers>
      </body>
    </html>
  );
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
