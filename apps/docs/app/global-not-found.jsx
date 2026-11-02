// The 404 page for every address that doesn't exist, in both languages. Next.js marks it noindex.
import "@truvar-ai/design-system/fonts.css";
import "@truvar-ai/design-system/styles.css";
import "../src/site/site.css";

export const metadata = {
  title: "Page not found · Truvar.ai Design System",
  description: "This page doesn't exist. Go to the Truvar.ai Design System home page or the docs.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr">
      <body>
        <main className="site-404">
          <img src="/icon-192.png" alt="Truvar.ai" width="72" height="72" />
          <p className="lx-eyebrow">404</p>
          <h1 className="lx-h2">Page not found</h1>
          <p className="lx-sub">This page doesn’t exist or has moved.</p>
          <p className="lx-sub" lang="ar" dir="rtl">هذه الصفحة غير موجودة أو تم نقلها.</p>
          <nav className="site-404-links" aria-label="Where to go">
            <a href="/" className="tv-btn tv-btn--primary site-btnlink">Home</a>
            <a href="/docs/" className="tv-btn tv-btn--secondary site-btnlink">Docs</a>
            <a href="/ar/" className="tv-btn tv-btn--secondary site-btnlink" lang="ar">الرئيسية</a>
          </nav>
        </main>
      </body>
    </html>
  );
}
