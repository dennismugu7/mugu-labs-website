import { expect, test } from "@playwright/test";
import { site, team } from "../../lib/site";
import { gotoReady } from "./helpers";

test("Made by humans: the bio and one card per team member", async ({ page }) => {
  await gotoReady(page, "/#about");
  const about = page.locator("#about");

  await expect(about.getByRole("heading", { level: 2 })).toHaveText("Made by humans");
  await expect(about.locator(".about__card")).toHaveText(site.bio);

  const cards = about.getByRole("list", { name: "The team" }).getByRole("listitem");
  await expect(cards).toHaveCount(team.length);

  // Dennis: photo, name, role, GitHub handle.
  const lead = cards.nth(0);
  await expect(lead.getByRole("img")).toHaveAttribute("alt", "Dennis Mburu, web developer at Mugu Labs");
  await expect(lead.locator(".author__name")).toHaveText("Dennis Mburu");
  await expect(lead.locator(".author__role")).toHaveText("Web Developer");
  await expect(lead.getByRole("link", { name: "@dennismugu7" })).toHaveAttribute("href", "https://github.com/dennismugu7");

  // Bradil: photo, name, role; no GitHub link.
  const designer = cards.nth(1);
  const photo = designer.getByRole("img");
  await expect(photo).toHaveAttribute("alt", "Bradil Wangila, web designer at Mugu Labs");
  await expect(photo).toHaveAttribute("src", "/assets/avatar-bradil.webp");
  await expect(designer.locator(".author__name")).toHaveText("Bradil Wangila");
  await expect(designer.locator(".author__role")).toHaveText("Web Designer");
  await expect(designer.getByRole("link")).toHaveCount(0);

  // The photo is 120px square: loaded, and never drawn larger than that.
  await photo.scrollIntoViewIfNeeded();
  await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(120);
  const box = await photo.boundingBox();
  expect(box?.width).toBeLessThanOrEqual(120);
  expect(box?.height).toBeLessThanOrEqual(120);

  await expect(about.locator(".author__monogram")).toHaveCount(0);
  await expect(about).not.toContainText("Collaborator");
  await expect(about).not.toContainText("Lead Developer");
});

test("the page author stays Dennis Mburu", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="author"]')).toHaveAttribute("content", "Dennis Mburu");
  await expect(page.locator('meta[name="creator"]')).toHaveAttribute("content", "Dennis Mburu");
});
