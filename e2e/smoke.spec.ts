import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light" });

test("home page shows the Polish shell by default", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Slotwise" }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "pl");
  await expect(
    page.getByText("Kalendarz wizyt i przypomnienia SMS"),
  ).toBeVisible();
});

test("home page does not scroll sideways", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("language switch changes the page language", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "EN English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByText("Appointment calendar and SMS reminders"),
  ).toBeVisible();
});

test("theme toggle switches to dark", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.getByRole("button", { name: "Przełącz motyw" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});
