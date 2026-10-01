"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initMotion } from "../lib/motion";

/**
 * Starts the scroll/reveal layer, and starts it again on every route change.
 *
 * This lives in the root layout, which stays mounted while the visitor moves
 * between pages, so a mount-only effect would only ever see the first page's
 * elements — every page reached by a link or by Back would keep its reveals
 * hidden. Keying on the pathname gives each page a fresh run.
 */
export default function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    const cleanup = initMotion();
    const restoring = performance.now() - lastPopState < 1000;

    /* A link to /#section from another page: the section only exists now that
       the new page has mounted, so land on it here. Back/forward is left to
       the browser's own scroll restoration. */
    let frame = 0;
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id && !restoring) {
      frame = window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "instant" });
      });
    }

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      cleanup();
    };
  }, [pathname]);

  return null;
}

/* When the last history traversal happened. A route change right after one
   is Back/forward; anything else is a link. */
let lastPopState = -Infinity;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    lastPopState = performance.now();
  });
}
