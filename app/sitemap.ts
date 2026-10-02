import type { MetadataRoute } from "next";
import { allTags, blogVisible, publishedPosts } from "../lib/blog";
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
    { url: `${site.url}/privacy/`, lastModified: site.privacyUpdated, changeFrequency: "yearly", priority: 0.3 },
    // The blog only while it is visible: published posts, their tags.
    ...(blogVisible() ? blogEntries() : []),
  ];
}

function blogEntries(): MetadataRoute.Sitemap {
  const posts = publishedPosts();
  return [
    { url: `${site.url}/blog/`, lastModified: posts[0].date, changeFrequency: "weekly", priority: 0.7 },
    ...posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}/`,
      lastModified: post.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...allTags().map((tag) => ({
      url: `${site.url}/blog/tag/${tag.slug}/`,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}
