"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import ContactChoice from "./ContactChoice";
import { site } from "../lib/site";

const links = [
  { label: "Products", href: "/#products" },
  { label: "Journal", href: "/#journal" },
  { label: "About", href: "/#about" },
  { label: "How we work", href: "/#work" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`nav${open ? " is-open" : ""}`} data-nav>
      <div className="shell">
        <div className="nav__inner">
          <Link className="brand" href="/" onClick={() => setOpen(false)}>
            <Logo className="brand__mark" id="nav" title={`${site.name} home`} />
            <span>{site.name}</span>
          </Link>

          <nav className="nav__links" aria-label="Primary">
            {links.map((link) => (
              <Link key={link.href} className="nav__link" href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>

          <ContactChoice
            className="choice--end nav__cta--desktop"
            label="Work with us"
            buttonClassName="btn btn--ghost nav__cta"
            icon="arrow"
          />

          <button
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="nav-panel"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="nav__bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>

        <div className="nav__panel" id="nav-panel" hidden={!open}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          {/* Remounted each time the menu opens, so it never reopens with
              the contact choice still expanded. */}
          <ContactChoice
            key={String(open)}
            className="choice--inline"
            label="Work with us"
            buttonClassName="nav__panel-item"
            onChoose={() => setOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}
