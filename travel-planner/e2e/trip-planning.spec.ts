import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("builds a truthful sample plan and opens the manual", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Origin").fill("Basel");
  await page.getByLabel("Destination").fill("Bernese Oberland");
  await page.getByRole("button", { name: "Build sample plan" }).click();

  await expect(page.locator(".synthetic-notice")).toHaveText(
    "Synthetic demonstration data",
  );
  await expect(page.getByLabel("Trip status").getByText("Review needed")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Stay" })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
