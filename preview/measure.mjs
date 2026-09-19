import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://127.0.0.1:8099/index.html", { waitUntil: "networkidle" });
await p.evaluate(() => document.querySelector("#journal").scrollIntoView());
await p.waitForTimeout(1500);
console.log(await p.evaluate(() => [...document.querySelectorAll(".post__art")].map(span => {
  const img = span.querySelector("img");
  const r = img.getBoundingClientRect(), s = span.getBoundingClientRect();
  return { span: [Math.round(s.width), Math.round(s.height)], img: [Math.round(r.width), Math.round(r.height)], nat: [img.naturalWidth, img.naturalHeight], complete: img.complete };
})));
await b.close();
