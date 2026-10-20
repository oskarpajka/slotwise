import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light" });

test("login page shows the Polish shell by default", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { level: 1, name: "Zaloguj się" }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "pl");
  await expect(page.getByText("Slotwise")).toBeVisible();
});

test("login page does not scroll sideways", async ({ page }) => {
  await page.goto("/login");
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("language switch changes the page language", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "EN English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("heading", { level: 1, name: "Sign in" }),
  ).toBeVisible();
});

test("theme toggle switches to dark", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.getByRole("button", { name: "Przełącz motyw" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});
