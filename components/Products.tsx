import Link from "next/link";
import { ArrowRight } from "./icons";
import { reveal } from "./reveal";
import { products } from "../lib/site";

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
              <article className="card card--hover product">
                <span className="product__status">{product.status}</span>

                <div className="product__icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.icon} alt="" width={168} height={168} loading="lazy" />
                </div>

                <h3 className="product__name">{product.name}</h3>
                <p className="product__tagline">{product.tagline}</p>

                <Link
                  className={`btn ${product.accent === "lime" ? "btn--lime" : "btn--navy"}`}
                  href={product.href}
                  {...(product.external
                    ? { target: "_blank", rel: "noreferrer noopener" }
                    : {})}
                >
                  <span>
                    Learn more
                    <span className="sr-only"> about {product.name}</span>
                  </span>
                  <ArrowRight className="btn__arrow" />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
