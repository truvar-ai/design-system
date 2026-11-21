import type * as React from "react";
import type * as RAC from "react-aria-components";

export interface BottomNavProps extends Omit<React.ComponentPropsWithoutRef<"nav">, "className" | "children"> {
  /** BottomNavItem elements (3 to 5). */
  children?: React.ReactNode;
  /** Hide the bar from 961px up (phone-only navigation). Default false. */
  mobileOnly?: boolean;
  /** Place the bar at the bottom of its positioned container instead of the screen (previews, phone frames). Default false. */
  inline?: boolean;
  /** Slide the bar below the screen, e.g. from useHideOnScroll. Default false. */
  isHidden?: boolean;
  className?: string;
}

/** Phone tab bar with 3 to 5 destinations; sets --bottomnav-space on the page while mounted (unless inline). */
export declare function BottomNav(props: BottomNavProps): React.JSX.Element;

type SharedLinkButtonProps = Pick<RAC.ButtonProps, keyof RAC.ButtonProps & keyof RAC.LinkProps>;

export interface BottomNavItemProps
  extends Omit<SharedLinkButtonProps, "className" | "style" | "children" | "onPress" | "aria-current" | "render" | "slot">,
    Pick<RAC.LinkProps, "target" | "rel" | "download" | "ping" | "referrerPolicy" | "hrefLang" | "routerOptions"> {
  /** Makes the item a link. Without it the item is a button (for tabs that open a sheet). */
  href?: string;
  /** Press handler for button items. */
  onPress?: (e: RAC.PressEvent) => void;
  /** Called when the current tab is pressed again. By default the page scrolls to the top. */
  onReselect?: () => void;
  /** The tab's icon element. */
  icon?: React.ReactNode;
  /** A number (capped at 99+), short text, or true for a dot. false, null and undefined show nothing. */
  badge?: number | string | boolean | null;
  /** What screen readers hear for the badge. */
  badgeLabel?: string;
  /** Marks the active tab: aria-current="page" on links, "true" on buttons. Default false. */
  isCurrent?: boolean;
  /** The tab's short label. */
  children?: React.ReactNode;
}

/** One tab in a BottomNav: an icon, a label and an optional badge. */
export declare function BottomNavItem(props: BottomNavItemProps): React.JSX.Element;
