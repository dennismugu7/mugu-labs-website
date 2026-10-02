import { expect, test } from "@playwright/test";
import fixture from "./flags-fixture.json";
import { posts, socials } from "../../lib/site";
import { clickLink, expectContentVisible, expectSectionAtTop, gotoReady } from "./helpers";

/*
 * Runs against out-flags/: the same site built with the hidden sections
 * switched on and given something to show (flags-fixture.json, via
 * scripts/build-flags-fixture.mjs). The "flags" project serves it.
 */

test("the journal comes back, with only the published posts", async ({ page }) => {
  await gotoReady(page, "/");
  const journal = page.locator("#journal");
  await expect(journal).toHaveCount(1);

  const cards = journal.locator(".post");
  await expect(cards).toHaveCount(fixture.postHrefs.length);
  await expect(cards.first()).toHaveAttribute("href", fixture.postHrefs[0]);
  await expect(cards.first()).toContainText(posts[0].title);
});

test("the nav links to it again, and lands on it", async ({ page }) => {
  await gotoReady(page, "/products/oda/");
  await clickLink(page, { region: "nav", name: "Journal", to: "/#journal" });
  await expect(page).toHaveURL("/#journal");
  await expectSectionAtTop(page, "journal");
  await expectContentVisible(page);
});

test("the phone menu links to it again", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoReady(page, "/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.locator("#nav-panel").getByRole("link", { name: "Journal" })).toHaveAttribute("href", "/#journal");
});

test("the socials come back, with only the linked profiles", async ({ page }) => {
  await gotoReady(page, "/#connect");
  const connect = page.locator("#connect");
  await expect(connect.getByRole("heading")).toHaveText("Let’s stay connected");

  const linked = Object.entries(fixture.socialHrefs);
  await expect(connect.locator(".socials li")).toHaveCount(linked.length);
  await expect(connect.locator(".social--placeholder")).toHaveCount(0);
  for (const [id, href] of linked) {
    const name = socials.find((s) => s.id === id)!.name;
    await expect(connect.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
  }
});
