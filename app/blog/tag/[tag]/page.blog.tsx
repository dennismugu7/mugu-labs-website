import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostCard from "../../../../components/PostCard";
import { ArrowLeft } from "../../../../components/icons";
import { reveal } from "../../../../components/reveal";
import { allTags, postsTagged } from "../../../../lib/blog";
import { baseOpenGraph, baseTwitter } from "../../../../lib/metadata";
import { site } from "../../../../lib/site";

type Params = { tag: string };
type PageProps = { params: Promise<Params> };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return allTags().map((t) => ({ tag: t.slug }));
}

const tagName = (slug: string) => allTags().find((t) => t.slug === slug)?.name;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = (await params).tag;
  const name = tagName(slug);
  if (!name) return {};
  const title = `Posts tagged “${name}”`;
  const description = `Posts from the ${site.name} blog tagged “${name}”.`;
  const url = `/blog/tag/${slug}/`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { ...baseOpenGraph, title: `${title} — ${site.name}`, description, url },
    twitter: { ...baseTwitter, title: `${title} — ${site.name}`, description },
  };
}

export default async function TagPage({ params }: PageProps) {
  const slug = (await params).tag;
  const name = tagName(slug);
  if (!name) notFound();
  const posts = postsTagged(slug);

  return (
    <section className="section blog-page" aria-labelledby="tag-title">
      <div className="shell shell--read">
        <Link className="back-link" href="/blog/">
          <ArrowLeft />
          All posts
        </Link>
        <p className="eyebrow">Tag</p>
        <h1 id="tag-title" {...reveal(0, "blog-page__title")}>
          {name}
        </h1>
        <ul className="post-list">
          {posts.map((post, i) => (
            <li key={post.slug} {...reveal(Math.min(i, 3) * 80)}>
              <PostCard post={post} eager={i === 0} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
