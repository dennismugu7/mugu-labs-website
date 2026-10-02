import type { CSSProperties } from "react";
import type { Product } from "../lib/site";

/** A product's colours as CSS custom properties, for `.btn--brand` and the
    product page's accents (styles/globals.css). */
export function brandStyle(product: Product): CSSProperties {
  return { "--brand": product.brandColor, "--on-brand": product.onBrandColor } as CSSProperties;
}
