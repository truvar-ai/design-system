"use client";
// The live examples are rendered into each page's HTML at build time, so search engines and AI crawlers read
// every example. But they show times relative to now (clocks, "2 min ago", today's date) and the page is built
// long before anyone opens it, so the browser must not try to match that HTML. On the first load the island
// keeps the built HTML on screen without hydrating it, then replaces it with the live example once mounted.
// Pages opened later in the session (client-side navigation) render the live example straight away.
import { useEffect, useState } from "react";

let appMounted = false;
export function useAppMounted() {
  useEffect(() => { appMounted = true; }, []);
}

export function Island({ className, children }) {
  const [live, setLive] = useState(appMounted || typeof window === "undefined");
  useEffect(() => setLive(true), []);
  if (live) return <div className={className}>{children}</div>;
  // Hydrating: keep the server's HTML exactly as it is
  return <div className={className} dangerouslySetInnerHTML={{ __html: "" }} suppressHydrationWarning />;
}
