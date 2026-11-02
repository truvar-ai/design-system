// BottomNav: the phone tab bar. 3 to 5 destinations, each an icon and a short label.
// Items with href are links (RouterProvider makes them client-side in Next.js); items with onPress are buttons,
// for tabs that open a sheet. Pressing the current tab again scrolls to the top, as native tab bars do.
import { useEffect } from "react";
import * as RAC from "react-aria-components";
import { numberFormat } from "./format.js";

const cx = (...c) => c.filter(Boolean).join(" ");

/* While mounted, <html data-bottomnav> sets --bottomnav-space: the room the bar takes, safe area included.
   Pad scrolling content with it; toasts already sit above it. mobileOnly hides the bar from 961px up.
   inline places it at the bottom of its positioned container instead of the screen (previews, phone frames).
   isHidden slides it below the screen (pair with useHideOnScroll). */
export function BottomNav({ children, mobileOnly = false, inline = false, isHidden = false, className, ...props }) {
  useEffect(() => {
    if (inline) return;
    const el = document.documentElement;
    el.dataset.bottomnav = mobileOnly ? "mobile" : "always";
    return () => { delete el.dataset.bottomnav; };
  }, [mobileOnly, inline]);
  return (
    <nav {...props} className={cx("tv-bottomnav", className)} data-mobile-only={mobileOnly || undefined} data-inline={inline || undefined} data-hidden={isHidden || undefined}>
      <ul className="tv-bottomnav-list">{children}</ul>
    </nav>
  );
}

/* icon: an icon element. badge: a number or short text (a dot when true); badgeLabel is what screen readers hear.
   isCurrent marks the active tab: aria-current="page" on links, "true" on buttons (a tab that opens a sheet). */
export function BottomNavItem({ href, onPress, onReselect, icon, badge, badgeLabel, isCurrent = false, children, ...props }) {
  const { locale } = RAC.useLocale();
  // Numbers in the reader's digits, capped at 99+
  const shown = typeof badge === "number" ? (badge > 99 ? numberFormat(locale).format(99) + "+" : numberFormat(locale).format(badge)) : badge;
  const reselect = () => {
    if (!isCurrent) return;
    if (onReselect) return onReselect();
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Apps whose content scrolls inside a panel mark it with data-scroll-root
    (document.querySelector("[data-scroll-root]") ?? window).scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
  };
  const content = (
    <>
      <span className="tv-bottomnav-icon" aria-hidden="true">
        {icon}
        {badge != null && badge !== false && (
          <span className={cx("tv-bottomnav-badge", badge === true && "is-dot")}>{badge === true ? null : shown}</span>
        )}
      </span>
      <span className="tv-bottomnav-label">{children}</span>
      {badge != null && badge !== false && <span className="tv-sr">{badgeLabel ?? (badge === true ? "" : `, ${shown}`)}</span>}
    </>
  );
  return (
    <li className="tv-bottomnav-cell">
      {href != null ? (
        <RAC.Link {...props} href={href} className="tv-bottomnav-item" aria-current={isCurrent ? "page" : undefined}
          onPress={reselect}>
          {content}
        </RAC.Link>
      ) : (
        <RAC.Button {...props} className="tv-bottomnav-item" aria-current={isCurrent ? "true" : undefined}
          onPress={(e) => { if (isCurrent && onReselect) return onReselect(); onPress?.(e); }}>
          {content}
        </RAC.Button>
      )}
    </li>
  );
}
