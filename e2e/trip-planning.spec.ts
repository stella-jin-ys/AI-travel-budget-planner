import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("requires sign in before opening the live trip brief", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start planning" }).click();
  await expect(page.getByRole("dialog", { name: "Sign in to Spendwise Trip" })).toBeVisible();
  await page.getByLabel("Email").fill("traveller@example.com");
  await page.getByLabel("Password").fill("secret123");
  await page.getByRole("dialog").getByRole("button", { name: "Sign in" }).click();

  await page.getByLabel("Origin").fill("Basel");
  await page.getByLabel("Destination").fill("Bernese Oberland");
  await page.getByRole("button", { name: "Next: travelers & budget" }).click();
  await page.getByRole("button", { name: "Next: priorities" }).click();
  await page.getByRole("button", { name: "Review trip" }).click();
  await expect(page.getByRole("button", { name: "Generate travel plan" })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
