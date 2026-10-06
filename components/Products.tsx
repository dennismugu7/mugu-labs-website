import Link from "next/link";
import { ArrowRight } from "./icons";
import { brandStyle } from "./brand";
import { reveal } from "./reveal";
import { products, statusLabel } from "../lib/site";

export default function Products() {
  return (
    <section className="section" id="products" aria-labelledby="products-title">
      <div className="shell">
        <div className="products__head">
          <div>
            <p {...reveal(0, "eyebrow")}>
              The shelf
            </p>
            <h2 id="products-title" {...reveal(80, "section-title")}>
              Three apps, each doing one job properly
            </h2>
          </div>
        </div>

        <ul className="grid-3">
          {products.map((product, i) => (
            <li key={product.slug} {...reveal(i * 110)}>
              <article className="card card--hover product" style={brandStyle(product)}>
                <div className="product__icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.icon} alt="" width={168} height={168} loading="lazy" />
                </div>

                <span className="product__status">{statusLabel[product.status]}</span>

                <h3 className="product__name">{product.name}</h3>
                <p className="product__tagline">{product.tagline}</p>

                {/* The card's one link: its ::after covers the whole card
                    (stretched link), so a click anywhere opens the product
                    and keyboard and screen readers get a single stop. */}
                <Link
                  className="product__link"
                  href={product.href}
                  {...(product.external
                    ? { target: "_blank", rel: "noreferrer noopener" }
                    : {})}
                >
                  <span className="btn btn--brand">
                    <span>
                      Learn more
                      <span className="sr-only"> about {product.name}</span>
                    </span>
                    <ArrowRight className="btn__arrow" />
                  </span>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
