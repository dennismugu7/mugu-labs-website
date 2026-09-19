import Link from "next/link";
import Logo from "./Logo";
import { reveal } from "./reveal";
import { site, products } from "../lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer {...reveal(0, "shell footer")}>
      <Logo className="footer__mark" id="footer" />

      <nav className="footer__links" aria-label="Footer">
        {products.map((product) => (
          <Link key={product.slug} href={product.href}>
            {product.name}
          </Link>
        ))}
        <Link href="/#about">About</Link>
        <Link href="/#contact">Contact</Link>
      </nav>

      <p className="footer__legal">
        @{year} {site.domain} All rights reserved
      </p>
    </footer>
  );
}
