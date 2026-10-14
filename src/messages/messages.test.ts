import { describe, expect, it } from "vitest";
import en from "./en.json";
import pl from "./pl.json";

function keyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function leafValues(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value !== "object" || value === null) return [];
  return Object.values(value).flatMap(leafValues);
}

describe("message files", () => {
  it("have the same keys in pl and en", () => {
    expect(keyPaths(pl).sort()).toEqual(keyPaths(en).sort());
  });

  it("have no empty strings", () => {
    for (const messages of [pl, en]) {
      expect(leafValues(messages).filter((text) => text.trim() === "")).toEqual(
        [],
      );
    }
  });
});
