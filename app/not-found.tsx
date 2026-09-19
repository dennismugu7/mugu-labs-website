import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "../components/icons";

/* A 404 is nobody's canonical address: drop the layout's "/". (Next adds
   the noindex robots tag to not-found pages itself.) */
export const metadata: Metadata = {
  title: "Not found",
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <div className="shell notfound">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="display" style={{ maxWidth: "12ch", margin: "0.5rem auto 1.5rem" }}>
          Nothing here yet
        </h1>
        <p className="lead" style={{ margin: "0 auto 2rem" }}>
          That page doesn&rsquo;t exist — or it hasn&rsquo;t been built yet. Both are possible
          around here.
        </p>
        <Link className="btn btn--lime" href="/">
          Back to the studio
          <ArrowRight className="btn__arrow" />
        </Link>
      </div>
    </div>
  );
}
