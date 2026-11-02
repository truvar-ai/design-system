// App shell on phones: a push menu (the whole screen slides aside to reveal the menu behind it)
// and bars that step out of the way while you scroll down.
import { useState, useEffect, useRef } from "react";
import * as RAC from "react-aria-components";

const cx = (...c) => c.filter(Boolean).join(" ");

/* PushLayout wraps the app. While the menu is open the app slides toward the end (right in English,
   left in Arabic), shrinks into a rounded card, and stays tappable to close. Only transform moves, so it stays smooth.
   menu: the menu content, or ({ close }) => content. width: the menu's width, capped at 84% of the screen. */
export function PushLayout({ isOpen, onOpenChange, menu, label, width = 300, className, children }) {
  // "closing" keeps the rounded card until the app has slid all the way back
  const [state, setState] = useState(isOpen ? "open" : null);
  useEffect(() => {
    if (isOpen) { setState("open"); return; }
    setState((s) => (s ? "closing" : null));
    const id = setTimeout(() => setState(null), 460);
    return () => clearTimeout(id);
  }, [isOpen]);
  const w = { "--push-w": `min(${width}px, 84vw)` };
  return (
    <>
      <div className={cx("tv-push-app", className)} data-push={state ?? undefined} style={w}>{children}</div>
      <RAC.ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable className="tv-overlay tv-push-overlay" style={w}>
        <RAC.Modal className="tv-push-menu">
          <RAC.Dialog className="tv-push-dialog" aria-label={label}>
            {({ close }) => (typeof menu === "function" ? menu({ close }) : menu)}
          </RAC.Dialog>
        </RAC.Modal>
      </RAC.ModalOverlay>
    </>
  );
}

/* Hides bars after a deliberate scroll down and brings them back on any scroll up, near the top,
   or at the end of the page. Returns [hidden, setHidden] (set false to reveal, e.g. when a bar gets focus).
   target: the scrolling element, a ref, or a function returning it. media: only act while it matches.
   resetKey: change it (a route) to show the bars again. */
export function useHideOnScroll(target, { threshold = 24, topOffset = 72, media, disabled = false, resetKey } = {}) {
  const [hidden, setHidden] = useState(false);
  // Callers usually pass a new target function every render; the effect reads the latest one
  const opts = useRef({ target, threshold, topOffset });
  opts.current = { target, threshold, topOffset };
  useEffect(() => {
    setHidden(false);
    if (disabled) return;
    const { target, threshold, topOffset } = opts.current;
    const el = typeof target === "function" ? target() : target?.current ?? target;
    if (!el) return;
    const mq = media ? window.matchMedia(media) : null;
    let last = el.scrollTop, run = 0, frame = 0;
    const read = () => {
      frame = 0;
      const y = el.scrollTop, d = y - last;
      last = y;
      if ((mq && !mq.matches) || y <= topOffset) { run = 0; setHidden(false); return; }
      if (y + el.clientHeight >= el.scrollHeight - 1) return; // the bounce at the end isn't a scroll up
      run = d > 0 === run > 0 ? run + d : d;
      if (run > threshold) setHidden(true);
      else if (run < -threshold) setHidden(false);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(read); };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, [disabled, resetKey, media]);
  return [hidden, setHidden];
}
