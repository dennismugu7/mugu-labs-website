import type { Cover } from "../lib/blog";

type Props = {
  cover: Cover;
  className: string;
  /** Above the fold: load at once and early. Everywhere else, lazily. */
  eager?: boolean;
  /** On a card the title already says what the post is, so the cover is
      decoration there; on the post itself it carries its description. */
  decorative?: boolean;
};

/** A post's cover, 16:9 with rounded corners (styles: .post-cover). */
export default function PostCover({ cover, className, eager = false, decorative = false }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`post-cover ${className}`}
      src={cover.src}
      alt={decorative ? "" : cover.alt}
      width={cover.width}
      height={cover.height}
      loading={eager ? "eager" : "lazy"}
      decoding={eager ? "sync" : "async"}
      {...(eager ? { fetchPriority: "high" as const } : {})}
    />
  );
}
