"use client";
import NextLink from "next/link";
import { Logo } from "@truvar-ai/design-system";
import { useSite } from "./Providers.jsx";
import { useOtherLanguage } from "./Header.jsx";
import { BrandIcon } from "./ui.jsx";
import { GITHUB, NPM, COMPANY, CONTACT, SOCIAL, VERSION, localePath } from "./config.js";

export function Footer() {
  const { lang, ar, tr } = useSite();
  const other = useOtherLanguage();
  const L = (p) => localePath(lang, p);
  const columns = [
    { title: tr("Design system", "نظام التصميم"), links: [
      { href: L("/docs/"), label: tr("Introduction", "مقدمة") },
      { href: L("/docs/installation/"), label: tr("Installation", "التثبيت") },
      { href: L("/docs/buttons/"), label: tr("Components", "المكونات") },
      { href: L("/docs/overview/"), label: tr("Examples", "أمثلة") },
    ]},
    { title: tr("Guides", "أدلة"), links: [
      { href: L("/docs/nextjs/"), label: "Next.js" },
      { href: L("/docs/theming/"), label: tr("Themes and tokens", "السمات والرموز") },
      { href: L("/docs/rtl/"), label: tr("Arabic and RTL", "العربية والاتجاه") },
      { href: L("/docs/mobile/"), label: tr("Phones and touch", "الهواتف واللمس") },
    ]},
    { title: tr("Resources", "مصادر"), links: [
      { href: GITHUB, label: "GitHub", external: true },
      { href: NPM, label: "npm", external: true },
      { href: `${GITHUB}/releases`, label: tr("Releases", "الإصدارات"), external: true },
      { href: `${GITHUB}/issues`, label: tr("Report an issue", "أبلغ عن مشكلة"), external: true },
    ]},
    { title: "Truvar.ai", links: [
      { href: COMPANY, label: "truvar.ai", external: true },
      { href: CONTACT, label: tr("Contact us", "تواصل معنا"), external: true },
    ]},
  ];
  const social = [{ id: "github", label: "GitHub", href: GITHUB }, ...SOCIAL.filter((s) => s?.href)];
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <NextLink href={L("/")} aria-label={tr("Home", "الرئيسية")} className="site-footer-logo"><Logo width={128} /></NextLink>
          <p>{tr("The design system behind every Truvar.ai product. Accessible, Arabic-first and ready for phones.",
            "نظام التصميم وراء كل منتجات Truvar.ai. سهل الاستخدام للجميع، عربي أولًا وجاهز للهواتف.")}</p>
          <ul className="site-social" aria-label={tr("Follow Truvar.ai", "تابع Truvar.ai")}>
            {social.map((s) => (
              <li key={s.id}><a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="tv-icon-btn"><BrandIcon id={s.id} /></a></li>
            ))}
          </ul>
        </div>
        {columns.map((c) => (
          <nav key={c.title} className="site-footer-col" aria-label={c.title}>
            <p className="site-footer-title">{c.title}</p>
            <ul>
              {c.links.map((l) => (
                <li key={l.href}>
                  {l.external
                    ? <a href={l.href} target={l.href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">{l.label}</a>
                    : <NextLink href={l.href}>{l.label}</NextLink>}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="site-footer-bottom">
        <p>© {new Date().getFullYear()} Truvar.ai · {tr("MIT license", "رخصة MIT")} · <span dir="ltr">v{VERSION}</span></p>
        <a href={other} hrefLang={ar ? "en" : "ar"} lang={ar ? "en" : "ar"} className="site-footer-lang">{ar ? "English" : "العربية"}</a>
      </div>
    </footer>
  );
}
