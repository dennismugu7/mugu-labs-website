import Link from "next/link";
import Logo from "./Logo";
import { reveal } from "./reveal";
import { blogVisible } from "../lib/blog";
import { products, site } from "../lib/site";

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
        {blogVisible() ? <Link href="/blog/">Blog</Link> : null}
        <Link href="/#about">About</Link>
        <Link href="/#contact">Contact</Link>
        <Link href="/privacy/">Privacy</Link>
      </nav>

      <p className="footer__legal">&copy; {year} {site.name}. All rights reserved.</p>
    </footer>
  );
}
