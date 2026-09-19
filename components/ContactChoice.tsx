"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, MailIcon, WhatsAppIcon } from "./icons";
import { mailtoHref, site, whatsappHref } from "../lib/site";

/**
 * "Contact me" opens a small menu with the two ways to reach Dennis.
 * Closes on Escape, on outside click, and moves focus into the menu so it
 * works from the keyboard.
 */
export default function ContactChoice({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const wrapRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    firstItemRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };

    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [open]);

  return (
    <div className="choice" ref={wrapRef}>
      <button
        type="button"
        className="btn btn--mint btn--block-sm"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="contact-choice-menu"
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
      >
        Contact me
        <ChevronRight className="btn__arrow" />
      </button>

      {open ? (
        <div className="choice__menu" id="contact-choice-menu" role="menu">
          <a
            className="choice__item choice__item--mail"
            href={mailtoHref}
            role="menuitem"
            ref={firstItemRef}
            onClick={() => setOpen(false)}
          >
            <span className="choice__icon">
              <MailIcon />
            </span>
            <span>
              <span className="choice__label">Email</span>
              <span className="choice__meta">{site.contact.email}</span>
            </span>
          </a>

          <a
            className="choice__item choice__item--whatsapp"
            href={whatsappHref}
            target="_blank"
            rel="noreferrer noopener"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <span className="choice__icon">
              <WhatsAppIcon />
            </span>
            <span>
              <span className="choice__label">WhatsApp</span>
              <span className="choice__meta">{site.contact.whatsappDisplay}</span>
            </span>
          </a>
        </div>
      ) : null}
    </div>
  );
}
