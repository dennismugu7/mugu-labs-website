import type { CSSProperties } from "react";

/**
 * Spread onto any element to have it fade and rise into view once.
 * The class is switched on by lib/motion.ts; CSS does the rest.
 *
 *   <li {...reveal(120)}>…</li>
 *   <h2 {...reveal(0, "section-title")}>…</h2>
 *
 * It returns `className` and `style`, so pass any other classes as the second
 * argument rather than writing a separate className/style on the same element —
 * the spread would overwrite them.
 */
export function reveal(delay = 0, extraClass?: string) {
  return {
    className: extraClass ? `reveal ${extraClass}` : "reveal",
    "data-reveal": "",
    style: delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined,
  };
}
