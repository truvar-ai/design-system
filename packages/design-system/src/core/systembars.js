// The phone's own bars (status bar on top, navigation bar or home indicator at the bottom) follow the app,
// so a sheet or dialog reads as one native surface instead of a web page with browser chrome around it.
import { useEffect } from "react";

const OVERLAYS = ".tv-overlay, .tv-sheet-overlay";

// Paint a colour (any CSS format) and read back the pixel, optionally with a translucent layer on top
function solid(base, layer) {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = base; ctx.fillRect(0, 0, 1, 1);
  if (layer) { ctx.fillStyle = layer; ctx.fillRect(0, 0, 1, 1); }
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
}

/* Call once near the app root. deps: whatever changes the colours (brand, theme).
   - No overlay open: theme-color is the page surface (or --system-bar when the app sets one).
   - Overlay open: theme-color is the page as seen through the dimmed backdrop, so the status bar dims with it,
     and the page background behind the bottom bar takes the sheet colour (see :root[data-overlay] in styles.css). */
export function useSystemBars(deps = []) {
  const key = JSON.stringify(deps);
  useEffect(() => {
    const root = document.documentElement;
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) { meta = document.createElement("meta"); meta.name = "theme-color"; document.head.append(meta); }
    // The bar colour: --system-bar when the app frames its page (top bar in a frame colour), else the page surface.
    // Read through a probe so var() and color-mix() resolve to a real colour.
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;width:0;height:0;visibility:hidden;background:var(--system-bar, var(--surface))";
    document.body.append(probe);
    const sync = () => {
      const surface = getComputedStyle(probe).backgroundColor || "#fff";
      const open = [...document.body.querySelectorAll(OVERLAYS)].pop(); // the topmost one
      if (!open) {
        delete root.dataset.overlay;
        meta.content = solid(surface);
        return;
      }
      const dim = open.matches(".tv-sheet-overlay") ? open.querySelector(".tv-sheet-backdrop") : open;
      root.dataset.overlay = open.matches(".tv-overlay--drawer") ? "drawer" : "sheet";
      meta.content = solid(surface, dim ? getComputedStyle(dim).backgroundColor : "rgba(0,8,30,.55)");
    };
    sync();
    // Overlays are portalled into <body>, so watching its children is enough
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { childList: true });
    return () => { mo.disconnect(); probe.remove(); };
  }, [key]);
}
