import { expect, test } from "@playwright/test";
import { products } from "../../lib/site";

/*
 * The studio speaks as "we". Visible text, titles, descriptions, share cards
 * and alt text must not slip back into the first person singular, and the
 * name is written "Mugu Labs". Customer-voice lines are allowed by exact
 * phrase.
 */
test.skip(({ isMobile }) => isMobile, "copy does not depend on the viewport");

const CUSTOMER_VOICE = ["can I spend this?"];
const FIRST_PERSON = /\b(I|I'm|I've|I'd|I'll|me|my|mine|myself)\b|one-person/;

const pages = ["/", ...products.map((p) => `/products/${p.slug}/`), "/no-such-page/"];

for (const url of pages) {
  test(`${url} speaks as the studio`, async ({ page }) => {
    await page.goto(url);

    const texts = await page.evaluate(() => {
      const out: string[] = [document.title, document.body.innerText];
      document.querySelectorAll("meta[name], meta[property]").forEach((m) => out.push(m.getAttribute("content") ?? ""));
      document.querySelectorAll("img[alt], [aria-label]").forEach((el) =>
        out.push(el.getAttribute("alt") ?? el.getAttribute("aria-label") ?? "")
      );
      return out;
    });

    let all = texts.join("\n");
    for (const phrase of CUSTOMER_VOICE) all = all.split(phrase).join("");

    const firstPerson = all.split("\n").filter((line) => FIRST_PERSON.test(line));
    expect(firstPerson, "first-person singular copy").toEqual([]);

    const oldName = all.split("\n").filter((line) => /Mugu labs|mugu labs/.test(line));
    expect(oldName, 'the name is written "Mugu Labs"').toEqual([]);
  });
}
