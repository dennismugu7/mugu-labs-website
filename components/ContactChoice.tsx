"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ChevronRight, MailIcon, WhatsAppIcon } from "./icons";
import { mailtoHref, site, whatsappHref } from "../lib/site";

type Props = {
  defaultOpen?: boolean;
  /** The button's text. */
  label?: string;
  /** The button's classes; the default is the mint "Contact us" pill. */
  buttonClassName?: string;
  icon?: "chevron" | "arrow";
  /** Extra classes on the wrapper: `choice--end` opens the menu right-aligned
      (the nav), `choice--inline` opens it in the flow (the phone menu). */
  className?: string;
  /** Called after Email or WhatsApp is picked, e.g. to close the phone menu. */
  onChoose?: () => void;
};

/**
 * A button that opens a small menu with the two ways to reach the studio:
 * "Contact us" in the contact card and on product pages, "Work with us" in
 * the nav, the phone menu and the hero. Closes on Escape and on an outside
 * click, and moves focus into the menu so it works from the keyboard.
 */
export default function ContactChoice({
  defaultOpen = false,
  label = "Contact us",
  buttonClassName = "btn btn--mint btn--block-sm",
  icon = "chevron",
  className,
  onChoose,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const menuId = useId();
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

  const choose = () => {
    setOpen(false);
    onChoose?.();
  };

  const Icon = icon === "arrow" ? ArrowRight : ChevronRight;

  return (
    <div className={className ? `choice ${className}` : "choice"} ref={wrapRef}>
      <button
        type="button"
        className={buttonClassName}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <Icon className="btn__arrow" />
      </button>

      {open ? (
        <div className="choice__menu" id={menuId} role="menu" aria-label={label}>
          <a
            className="choice__item choice__item--mail"
            href={mailtoHref}
            role="menuitem"
            ref={firstItemRef}
            onClick={choose}
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
            onClick={choose}
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
