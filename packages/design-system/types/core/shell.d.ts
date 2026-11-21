import type * as React from "react";

export interface PushLayoutProps {
  /** Whether the menu is open. */
  isOpen: boolean;
  /** Called when the user closes the menu (tap outside, Escape). */
  onOpenChange?: (isOpen: boolean) => void;
  /** The menu content, or a function that receives `close`. */
  menu: React.ReactNode | ((state: { close: () => void }) => React.ReactNode);
  /** Accessible name of the menu dialog. */
  label?: string;
  /** Menu width in pixels, capped at 84% of the screen. Default 300. */
  width?: number;
  /** Class name for the app wrapper. */
  className?: string;
  /** The app. */
  children?: React.ReactNode;
}

/** App wrapper with a push menu: the whole screen slides aside and shrinks into a card to reveal the menu behind it. */
export declare function PushLayout(props: PushLayoutProps): React.JSX.Element;

/** The scrolling element: the element, a ref to it, or a function returning it (called inside the effect). */
export type HideOnScrollTarget =
  | HTMLElement
  | React.RefObject<HTMLElement | null>
  | (() => HTMLElement | null | undefined)
  | null
  | undefined;

export interface HideOnScrollOptions {
  /** Pixels of continuous scroll in one direction before the bars hide or show. Default 24. */
  threshold?: number;
  /** Bars always show within this many pixels of the top. Default 72. */
  topOffset?: number;
  /** A media query; the hook only acts while it matches, e.g. "(max-width: 960px)". */
  media?: string;
  /** Turns the behaviour off and shows the bars. Default false. */
  disabled?: boolean;
  /** Change it (for example the route) to show the bars again. */
  resetKey?: unknown;
}

/**
 * Hides bars after a deliberate scroll down and shows them again on scroll up, near the top, or at the end of the page.
 * Returns `[hidden, setHidden]`; call `setHidden(false)` to reveal the bars, e.g. when one gets focus.
 */
export declare function useHideOnScroll(
  target: HideOnScrollTarget,
  options?: HideOnScrollOptions,
): [hidden: boolean, setHidden: React.Dispatch<React.SetStateAction<boolean>>];
