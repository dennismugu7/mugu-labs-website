import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "../../../components/icons";
import ContactChoice from "../../../components/ContactChoice";
import { brandStyle } from "../../../components/brand";
import { reveal } from "../../../components/reveal";
import { baseOpenGraph, baseTwitter } from "../../../lib/metadata";
import { earlyTesterRequest, products, site, statusLabel, type Product, type Screen } from "../../../lib/site";

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

  const url = `/products/${product.slug}/`;
  const title = `${product.name} — ${site.name}`;
  return {
    title: product.name,
    description: product.tagline,
    alternates: { canonical: url },
    // Spread the defaults back in: these objects replace the layout's whole.
    openGraph: { ...baseOpenGraph, title, description: product.tagline, url },
    twitter: { ...baseTwitter, title, description: product.tagline },
  };
}

/** Screens in their groups, in the order each group first appears; one
    unlabelled group when no screen names one. */
function screenGroups(screens: Screen[]) {
  const groups: { label?: string; screens: Screen[] }[] = [];
  for (const screen of screens) {
    const group = groups.find((g) => g.label === screen.group);
    if (group) group.screens.push(screen);
    else groups.push({ label: screen.group, screens: [screen] });
  }
  return groups;
}

/** schema.org SoftwareApplication, for an app with a Play listing. */
function structuredData(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.tagline,
    operatingSystem: "Android",
    applicationCategory: product.appCategory,
    url: product.playStoreUrl,
    image: `${site.url}${product.icon}`,
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  /* The primary action follows the status: download a live app, ask to test
     one that is still being built. Shown under the intro and again at the
     end of the page. */
  const primaryAction =
    product.status === "live" && product.playStoreUrl ? (
      <a className="play-badge" href={product.playStoreUrl} target="_blank" rel="noopener">
        {/* Google's badge artwork, unmodified, with its clear space. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/google-play-badge.png" alt="Get it on Google Play" width={646} height={250} />
      </a>
    ) : (
      <ContactChoice
        label="Become an early tester"
        buttonClassName="btn btn--brand btn--block-sm"
        icon="arrow"
        {...earlyTesterRequest(product.name)}
      />
    );

  return (
    <article className="section detail" style={brandStyle(product)}>
      {product.playStoreUrl && product.appCategory ? (
        <script
          type="application/ld+json"
          // "<" escaped so the JSON can never close the script element.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(product)).replace(/</g, "\\u003c") }}
        />
      ) : null}
      <div className="shell">
        <Link className="back-link" href="/#products">
          <ArrowLeft />
          All products
        </Link>

        <header {...reveal(0, "detail__head")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="detail__icon" src={product.icon} alt="" width={132} height={132} />
          <div>
            {product.status === "in-development" ? (
              <p className="status-badge">{statusLabel[product.status]}</p>
            ) : null}
            <h1 className="detail__title">{product.name}</h1>
            <p className="detail__tagline">{product.tagline}</p>
          </div>
        </header>

        <p {...reveal(80, "detail__summary")}>
          {product.summary}
        </p>

        <div {...reveal(120, "detail__cta detail__cta--top")}>{primaryAction}</div>

        {product.screens.length ? (
          <section
            className="screens"
            aria-labelledby="screens-title"
            // One column per screen of the largest group, so every screen on
            // the page is the same size.
            style={
              {
                "--screen-cols": Math.max(...screenGroups(product.screens).map((g) => g.screens.length)),
              } as CSSProperties
            }
          >
            <h2 id="screens-title" className="eyebrow screens__title">
              Screenshots
            </h2>
            {product.screensNote ? <p className="detail__smallprint screens__note">{product.screensNote}</p> : null}
            {screenGroups(product.screens).map((group, gi) => {
              const labelId = group.label ? `screens-group-${gi}` : "screens-title";
              return (
                <div className="screens__group" key={group.label ?? "all"}>
                  {group.label ? (
                    <h3 id={labelId} className="screens__group-title">
                      {group.label}
                    </h3>
                  ) : null}
                  {/* On a phone this row scrolls sideways; tabIndex lets a
                      keyboard reach and scroll it too. It is revealed as one
                      row: in the sideways scroller the later screens are off
                      to the side, where the observer can't see them. */}
                  {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
                  <ul {...reveal(0, "screens__list")} tabIndex={0} aria-labelledby={labelId}>
                    {group.screens.map((screen) => (
                      <li key={screen.src}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={screen.src}
                          alt={screen.alt}
                          width={screen.width}
                          height={screen.height}
                          loading="lazy"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        ) : null}

        {product.featuresHeading ? (
          <h2 {...reveal(0, "detail__features-title")}>{product.featuresHeading}</h2>
        ) : null}

        <ul className="grid-2">
          {product.features.map((feature, i) => {
            // Under a features heading the titles step down a level.
            const Title = product.featuresHeading ? "h3" : "h2";
            return (
              <li key={feature.title} {...reveal(i * 90)}>
                <div className="card card--hover feature">
                  <Title className="feature__title">{feature.title}</Title>
                  <p className="feature__body">{feature.body}</p>
                </div>
              </li>
            );
          })}
        </ul>

        {product.smallPrint ? <p className="detail__smallprint">{product.smallPrint}</p> : null}

        <div {...reveal(0, "detail__cta")}>
          {primaryAction}
          <Link className="btn btn--ghost" href="/#products">
            See the other apps
            <ArrowRight className="btn__arrow" />
          </Link>
        </div>

        {product.status === "live" && product.playStoreUrl ? (
          <p className="play-legal">Google Play and the Google Play logo are trademarks of Google LLC.</p>
        ) : null}
      </div>
    </article>
  );
}
