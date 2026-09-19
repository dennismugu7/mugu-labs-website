import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "../../../components/icons";
import ContactChoice from "../../../components/ContactChoice";
import { reveal } from "../../../components/reveal";
import { products } from "../../../lib/site";

type Params = { slug: string };

/** Next 15 hands `params` over as a promise. */
type PageProps = { params: Promise<Params> };

export function generateStaticParams(): Params[] {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.tagline,
    openGraph: { title: product.name, description: product.tagline },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <article className="section detail">
      <div className="shell">
        <Link className="back-link" href="/#products">
          <ArrowLeft />
          All products
        </Link>

        <header {...reveal(0, "detail__head")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="detail__icon" src={product.icon} alt="" width={132} height={132} />
          <div>
            <p className="eyebrow">{product.status}</p>
            <h1 className="detail__title">{product.name}</h1>
            <p className="detail__tagline">{product.tagline}</p>
          </div>
        </header>

        <p {...reveal(80, "detail__summary")}>
          {product.summary}
        </p>

        <ul className="grid-2">
          {product.features.map((feature, i) => (
            <li key={feature.title} {...reveal(i * 90)}>
              <div className="card card--hover feature">
                <h2 className="feature__title">{feature.title}</h2>
                <p className="feature__body">{feature.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div {...reveal(0, "detail__cta")}>
          <ContactChoice />
          <Link className="btn btn--ghost" href="/#products">
            See the other apps
            <ArrowRight className="btn__arrow" />
          </Link>
        </div>
      </div>
    </article>
  );
}
