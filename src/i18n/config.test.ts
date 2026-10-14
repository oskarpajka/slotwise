import { describe, expect, it } from "vitest";
import { defaultLocale, isLocale, resolveLocale } from "./config";

describe("resolveLocale", () => {
  it("falls back to Polish when there is no cookie", () => {
    expect(resolveLocale(undefined)).toBe("pl");
    expect(defaultLocale).toBe("pl");
  });

  it("keeps a supported locale", () => {
    expect(resolveLocale("en")).toBe("en");
    expect(resolveLocale("pl")).toBe("pl");
  });

  it("falls back to Polish for an unsupported value", () => {
    expect(resolveLocale("de")).toBe("pl");
    expect(resolveLocale("")).toBe("pl");
  });
});

describe("isLocale", () => {
  it("accepts only supported locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(42)).toBe(false);
  });
});
