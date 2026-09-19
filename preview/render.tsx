/**
 * Dev-only harness.
 *
 * `next` can't be installed in every environment, so this renders the real
 * components with react-dom/server into plain HTML files under preview/out/.
 * It's how the design was checked against the source screens. It is not part
 * of the site build — `npm run build` doesn't touch it.
 *
 *   npx tsx preview/render.tsx
 */
import { renderToStaticMarkup } from "react-dom/server";
import * as fs from "node:fs";
import * as path from "node:path";
import type { ReactNode } from "react";

import Backdrop from "../components/Backdrop";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Products from "../components/Products";
import Statement from "../components/Statement";
import Journal from "../components/Journal";
import About from "../components/About";
import Principles from "../components/Principles";
import Connect from "../components/Connect";
import Contact from "../components/Contact";
import ContactChoice from "../components/ContactChoice";
import { ArrowLeft, ArrowRight } from "../components/icons";
import { reveal } from "../components/reveal";
import { products, site } from "../lib/site";

const OUT = path.join(__dirname, "out");

function shell(title: string, body: string) {
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/globals.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${body}
<script type="module">
  import { initMotion } from "/motion.js";
  initMotion();
</script>
</body>
</html>`;
}

function page(children: ReactNode) {
  return renderToStaticMarkup(
    <>
      <Backdrop />
      <Nav />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}

const home = page(
  <>
    <Hero />
    <Products />
    <Statement>Digital overload is real&hellip;</Statement>
    <Statement wide>Take a breather. I build simple apps that do the heavy lifting.</Statement>
    <Journal />
    <About />
    <Principles />
    <Connect />
    <Contact />
  </>
);

/** Same markup as app/contact with the choice menu forced open, for review. */
const homeOpen = page(
  <>
    <section className="section" id="contact" style={{ paddingTop: "12rem" }}>
      <div className="shell">
        <div className="card contact__card">
          <img className="contact__art" src="/assets/art-envelope.png" alt="" />
          <div className="contact__body">
            <h2 className="contact__title">
              Didn&rsquo;t find what you were looking for?
              <br />
              Let&rsquo;s figure it out together!
            </h2>
            <ContactChoice defaultOpen />
          </div>
        </div>
      </div>
    </section>
  </>
);

const product = products[1];
const detail = page(
  <article className="section detail">
    <div className="shell">
      <a className="back-link" href="/#products">
        <ArrowLeft />
        All products
      </a>
      <header {...reveal(0, "detail__head")}>
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
        <a className="btn btn--ghost" href="/#products">
          See the other apps
          <ArrowRight className="btn__arrow" />
        </a>
      </div>
    </div>
  </article>
);

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "index.html"), shell(`${site.name} — ${site.tagline}`, home));
fs.writeFileSync(path.join(OUT, "contact-open.html"), shell("Contact menu", homeOpen));
fs.writeFileSync(path.join(OUT, "product.html"), shell(`${product.name} — ${site.name}`, detail));

console.log("rendered:", fs.readdirSync(OUT).join(", "));
