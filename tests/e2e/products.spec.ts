import { expect, test } from "@playwright/test";

/* The status badge on each card and the eyebrow on each product page. */
test.skip(({ isMobile }) => isMobile, "labels do not depend on the viewport");

const STATUS = {
  "dashboard-x": "Live",
  bookflow: "In development",
  oda: "In development",
} as const;

test("status on the shelf", async ({ page }) => {
  await page.goto("/");
  for (const [slug, status] of Object.entries(STATUS)) {
    const card = page.locator(".product", { has: page.locator(`a[href="/products/${slug}/"]`) });
    await expect(card.locator(".product__status")).toHaveText(status);
  }
  await expect(page.getByText("In build")).toHaveCount(0);
});

for (const [slug, status] of Object.entries(STATUS)) {
  test(`status on /products/${slug}/`, async ({ page }) => {
    await page.goto(`/products/${slug}/`);
    // Only an app that isn't out yet carries a badge by its title.
    const badge = page.locator(".detail__head .status-badge");
    if (status === "In development") await expect(badge).toHaveText(status);
    else await expect(badge).toHaveCount(0);
  });
}
