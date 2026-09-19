/** Stand-in for next/navigation in the preview harness. */
export function notFound(): never {
  throw new Error("NEXT_NOT_FOUND");
}
