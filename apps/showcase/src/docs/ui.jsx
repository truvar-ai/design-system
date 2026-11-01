import React from "react";
import { useTr, useLang } from "./i18n.jsx";
import { VIEWS } from "./nav.js";

// `code` spans render LTR so they stay readable inside Arabic sentences
export const rich = (s) => typeof s === "string" ? s.split("`").map((p, i) => i % 2 ? <code key={i} dir="ltr">{p}</code> : p) : s;

export function Spec({ id, name, primitive, note, children, wide }) {
  const tr = useTr();
  return (
    <div className={"spec" + (wide ? " spec--wide" : "")} id={id}>
      <div className="spec-meta">
        <h3>{name}</h3>
        {primitive && <p className="caption">{tr("Built on", "مبني على")} <code dir="ltr">{primitive}</code></p>}
        {note && <p className="caption">{rich(note)}</p>}
      </div>
      <div className="spec-stage">{children}</div>
    </div>
  );
}

export function ViewHeader({ viewId, intro, children }) {
  const lang = useLang();
  const v = VIEWS.find((x) => x.id === viewId);
  const idx = lang === "ar" ? 1 : 0;
  return (
    <header className="view-head">
      <h1 className="view-title">{v.name[idx]}</h1>
      {intro && <p className="lead">{rich(intro)}</p>}
      {v.items.length > 2 && (
        <nav className="on-page" aria-label={lang === "ar" ? "في هذه الصفحة" : "On this page"}>
          {v.items.map(([id, en, ar]) => <a key={id} href={"#" + id} className="on-page-link">{lang === "ar" ? ar : en}</a>)}
        </nav>
      )}
      {children}
    </header>
  );
}
