"use client";

import { useEffect } from "react";
import { initMotion } from "../lib/motion";

/** Starts the scroll/reveal layer once the page is interactive. */
export default function Motion() {
  useEffect(() => initMotion(), []);
  return null;
}
