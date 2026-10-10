import { describe, it, expect } from "vitest";

const buildShortUrl = (base, code) => `${base}/r/${code}`;

describe("short-url helpers", () => {
  it("builds a redirect URL", () => {
    expect(buildShortUrl("http://localhost:5000", "abc123")).toBe("http://localhost:5000/r/abc123");
  });

  it("rejects dangerous protocols", () => {
    const isValid = (url) => {
      try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    };
    expect(isValid("https://example.com")).toBe(true);
    expect(isValid("javascript:alert(1)")).toBe(false);
  });
});
