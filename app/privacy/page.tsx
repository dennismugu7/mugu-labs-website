import type { Metadata } from "next";
import { reveal } from "../../components/reveal";
import { formatDate } from "../../lib/blog";
import { baseOpenGraph, baseTwitter } from "../../lib/metadata";
import { site } from "../../lib/site";

/* The website's own privacy page. Each app has its own policy (linked). */

const description = "How the mugu-labs.com website handles your information, and where to find each app's policy.";

export const metadata: Metadata = {
  title: "Privacy",
  description,
  alternates: { canonical: "/privacy/" },
  openGraph: { ...baseOpenGraph, title: `Privacy — ${site.name}`, description, url: "/privacy/" },
  twitter: { ...baseTwitter, title: `Privacy — ${site.name}`, description },
};

export default function PrivacyPage() {
  return (
    <article className="section post-page" aria-labelledby="privacy-title">
      <div className="shell shell--read">
        <h1 id="privacy-title" {...reveal(0, "post-page__title privacy__title")}>
          Privacy at Mugu Labs
        </h1>

        <div {...reveal(80, "prose")}>
          <p>
            This page covers the mugu-labs.com website. Each of our apps has its own privacy policy, linked below.
          </p>

          <h2>What this website collects</h2>
          <p>
            Nothing directly. The site has no sign-up, no forms, no advertising and no tracking cookies. Our hosting
            provider may keep standard server logs (such as IP address and browser type) for security and reliability.
          </p>

          <h2>When you contact us</h2>
          <p>
            If you tap &ldquo;Work with us&rdquo;, &ldquo;Contact us&rdquo; or &ldquo;Become an early tester&rdquo;,
            your own email or WhatsApp app opens with a message ready to send. Nothing is sent unless you send it. If
            you do, we use your message and contact details only to reply to you, and we don&rsquo;t share them.
          </p>

          <h2>Our apps</h2>
          <ul>
            <li>
              Dashboard X: <a href={site.privacyUrl}>Privacy policy</a> &middot;{" "}
              <a href={site.termsUrl}>Terms of service</a>
            </li>
            <li>Bookflow and ODA are still in development. They&rsquo;ll have their own policies before launch.</li>
          </ul>

          <h2>Questions</h2>
          <p>
            Email <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
          </p>

          <p className="privacy__updated">
            Last updated: <time dateTime={site.privacyUpdated}>{formatDate(site.privacyUpdated)}</time>
          </p>
        </div>
      </div>
    </article>
  );
}
