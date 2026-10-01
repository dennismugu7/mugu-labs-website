import type { MetadataRoute } from "next";
import { products, site } from "../lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  /* Dates are kept by hand in lib/site.ts, so a deploy that changes nothing
     doesn't tell search engines that everything changed. */
  return [
    { url: `${site.url}/`, lastModified: site.updated, changeFrequency: "monthly", priority: 1 },
    ...products.map((product) => ({
      url: `${site.url}/products/${product.slug}/`,
      lastModified: product.updated,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
