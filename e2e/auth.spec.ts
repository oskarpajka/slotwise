import { expect, type Page, test } from "@playwright/test";
import { E2E_OWNER } from "./owner";

async function signIn(page: Page, password: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(E2E_OWNER.email);
  await page.getByLabel("Hasło").fill(password);
  await page.getByRole("button", { name: "Zaloguj się" }).click();
}

test.describe("signed out", () => {
  for (const path of ["/", "/calendar", "/clients/123"]) {
    test(`${path} redirects to login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL("/login");
    });
  }

  test("a forged session cookie still lands on login", async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([
      {
        name: "better-auth.session_token",
        value: "forged.token",
        url: baseURL,
      },
    ]);
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });
});

test("the owner signs in and signs out", async ({ page }) => {
  await signIn(page, E2E_OWNER.password);
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Slotwise" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Wyloguj się" }).click();
  await expect(page).toHaveURL("/login");
  await page.goto("/");
  await expect(page).toHaveURL("/login");
});

test("a wrong password shows a friendly error", async ({ page }) => {
  await signIn(page, "not the right password");
  await expect(
    page.getByText("Nieprawidłowy e-mail lub hasło. Spróbuj ponownie."),
  ).toBeVisible();
  await expect(page).toHaveURL("/login");
  await expect(page.getByLabel("E-mail")).toHaveValue(E2E_OWNER.email);
});

test.describe("auth HTTP surface", () => {
  for (const path of [
    "/api/auth/sign-up/email",
    "/api/auth/admin/create-user",
  ]) {
    test(`POST ${path} answers 404`, async ({ request }) => {
      const response = await request.post(path, {
        data: {
          email: "intruder@example.test",
          password: "intruder password",
          name: "Intruder",
        },
      });
      expect(response.status()).toBe(404);
    });
  }

  test("GET /api/auth/admin/list-users answers 404", async ({ request }) => {
    const response = await request.get("/api/auth/admin/list-users");
    expect(response.status()).toBe(404);
  });
});
