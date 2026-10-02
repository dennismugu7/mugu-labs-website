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
  await expect(lead.getByRole("img")).toHaveAttribute("alt", "Dennis Mburu, Lead Developer at Mugu Labs");
  await expect(lead.locator(".author__name")).toHaveText("Dennis Mburu");
  await expect(lead.locator(".author__role")).toHaveText("Lead Developer");
  await expect(lead.getByRole("link", { name: "@dennismugu7" })).toHaveAttribute("href", "https://github.com/dennismugu7");

  // The collaborator: no name, no photo, an "ML" monogram, the role.
  const collaborator = cards.nth(1);
  await expect(collaborator.locator("img")).toHaveCount(0);
  await expect(collaborator.locator(".author__monogram")).toHaveText("ML");
  await expect(collaborator.locator(".author__monogram")).toHaveAttribute("aria-hidden", "true");
  await expect(collaborator.locator(".author__name")).toHaveText("Collaborator");
  await expect(collaborator.getByRole("link")).toHaveCount(0);
});

test("the page author stays Dennis Mburu", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="author"]')).toHaveAttribute("content", "Dennis Mburu");
  await expect(page.locator('meta[name="creator"]')).toHaveAttribute("content", "Dennis Mburu");
});
