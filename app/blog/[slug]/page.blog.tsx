import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brandStyle } from "../../../components/brand";
import { ArrowLeft, ArrowRight } from "../../../components/icons";
import PostCover from "../../../components/PostCover";
import { reveal } from "../../../components/reveal";
import {
  findPost,
  formatDate,
  publishedPosts,
  readingMinutes,
  renderBody,
  SHARE_SIZE,
  tagSlug,
} from "../../../lib/blog";
import { baseOpenGraph, baseTwitter } from "../../../lib/metadata";
import { products, site } from "../../../lib/site";

type Params = { slug: string };
type PageProps = { params: Promise<Params> };

// Only published posts exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return publishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = findPost((await params).slug);
  if (!post) return {};
  const url = `/blog/${post.slug}/`;
  const title = `${post.title} — ${site.name}`;
  // The cover's 1200×630 JPEG when there is one (WebP isn't safe in every
  // link preview); otherwise the site's own image.
  const images = post.cover
    ? [{ url: post.cover.share, width: SHARE_SIZE.width, height: SHARE_SIZE.height, alt: post.cover.alt }]
    : baseOpenGraph.images;
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    openGraph: {
      ...baseOpenGraph,
      type: "article",
      title,
      description: post.excerpt,
      url,
      publishedTime: post.published,
      authors: [post.author],
      tags: post.tags,
      images,
    },
    twitter: { ...baseTwitter, title, description: post.excerpt, images },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = findPost((await params).slug);
  if (!post) notFound();
  const product = products.find((p) => p.slug === post.product);

  return (
    <article className="section post-page" aria-labelledby="post-title">
      <div className="shell shell--read">
        <Link className="back-link" href="/blog/">
          <ArrowLeft />
          All posts
        </Link>

        {post.cover ? <PostCover cover={post.cover} className="post-page__cover" eager /> : null}

        <header {...reveal(0, "post-page__head")}>
          <p className="post-meta">
            <time dateTime={post.published}>{formatDate(post.date)}</time>
            <span aria-hidden="true"> · </span>
            {readingMinutes(post)} min read
          </p>
          <h1 id="post-title" className="post-page__title">
            {post.title}
          </h1>
          <p className="post-page__byline">By {post.author}</p>
          <ul className="tags" aria-label="Tags">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Link className="tag tag--link" href={`/blog/tag/${tagSlug(tag)}/`}>
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        </header>

        <div className="prose" dangerouslySetInnerHTML={{ __html: renderBody(post) }} />

        {product ? (
          <aside className="post-product card" style={brandStyle(product)} aria-label={`About ${product.name}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="post-product__icon" src={product.icon} alt="" width={64} height={64} />
            <div>
              <p className="post-product__name">{product.name}</p>
              <p className="post-product__tagline">{product.tagline}</p>
            </div>
            <Link className="btn btn--brand post-product__link" href={`/products/${product.slug}/`}>
              <span>
                See {product.name}
                <span className="sr-only">, the product page</span>
              </span>
              <ArrowRight className="btn__arrow" />
            </Link>
          </aside>
        ) : null}
      </div>
    </article>
  );
}
