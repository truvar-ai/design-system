"use client";
// Small site pieces built from the design system: links that look like buttons, code with a copy button,
// scroll reveals and brand icons.
import { useEffect, useRef, useState } from "react";
import { Link as RACLink } from "react-aria-components";
import { IconButton, Tooltip } from "@truvar-ai/design-system";
import * as Icon from "@truvar-ai/design-system/icons";
import { siGithub, siNpm, siX, siYoutube, siFacebook, siInstagram, siTiktok } from "simple-icons";
import { useSite } from "./Providers.jsx";

const cx = (...c) => c.filter(Boolean).join(" ");

// A link with the Button look. Internal hrefs navigate client-side through RouterProvider.
export function ButtonLink({ href, variant = "primary", size, className, children, external, ...props }) {
  return (
    <RACLink href={href} {...(external && { target: "_blank", rel: "noopener noreferrer" })} {...props}
      className={cx("tv-btn", `tv-btn--${variant}`, size === "sm" && "tv-btn--sm", "site-btnlink", className)}>
      {children}
    </RACLink>
  );
}

export function CopyButton({ text, label }) {
  const { tr } = useSite();
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1600); } catch {}
  };
  const name = done ? tr("Copied", "تم النسخ") : label ?? tr("Copy", "نسخ");
  return (
    <Tooltip content={name}>
      <IconButton label={name} onPress={copy}>{done ? <Icon.Check /> : <Icon.Copy />}</IconButton>
    </Tooltip>
  );
}

// Code stays left to right inside Arabic pages
export function Code({ children, lang: language, title }) {
  const text = String(children).replace(/^\n|\n\s*$/g, "");
  return (
    <figure className="site-code" dir="ltr">
      <div className="site-code-bar">
        <span className="site-code-title">{title ?? language}</span>
        <CopyButton text={text} />
      </div>
      <pre><code>{text}</code></pre>
    </figure>
  );
}

// One-line command with a copy button: pnpm add …
export function Command({ children }) {
  return (
    <div className="site-command" dir="ltr">
      <span className="site-command-prompt" aria-hidden="true">$</span>
      <code>{children}</code>
      <CopyButton text={children} />
    </div>
  );
}

/* Fades and lifts sections in as they scroll into view. Content is visible without JavaScript
   and with reduced motion; the hidden start state only applies once the observer is running. */
export function Reveal({ as: Tag = "div", className, delay = 0, children, ...props }) {
  const ref = useRef(null);
  const [state, setState] = useState(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.92) return; // already on screen: no animation
    setState("out");
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setState("in"); io.disconnect(); } }, { rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={cx("site-reveal", className)} data-reveal={state ?? undefined} style={{ "--delay": `${delay}ms` }} {...props}>{children}</Tag>;
}

const SI = { github: siGithub, npm: siNpm, x: siX, youtube: siYoutube, facebook: siFacebook, instagram: siInstagram, tiktok: siTiktok };
export function BrandIcon({ id, size = 18 }) {
  if (id === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1v5.46h-4v-4.84c0-1.15-.02-2.64-1.6-2.64-1.62 0-1.86 1.26-1.86 2.56v4.92h-4v-11Z" />
      </svg>
    );
  }
  const s = SI[id];
  if (!s) return null;
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor"><path d={s.path} /></svg>;
}
