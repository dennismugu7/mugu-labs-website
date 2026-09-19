/**
 * A full-height line of copy that pins while you scroll past it, easing in
 * from a blur and easing back out. lib/motion.ts writes --enter/--exit/--vis
 * onto the section; all the animation itself is CSS.
 */

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Slightly wider measure for the longer of the two statements. */
  wide?: boolean;
  id?: string;
};

export default function Statement({ children, wide, id }: Props) {
  return (
    <section
      className={`statement${wide ? " statement--wide" : ""}`}
      data-statement
      id={id}
      aria-label="Studio statement"
    >
      <div className="statement__pin">
        <p className="statement__text">{children}</p>
      </div>
    </section>
  );
}
