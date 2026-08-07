import { describe, it, expect } from "vitest";
import { generateInquiryReference } from "./inquiry-reference";

describe("generateInquiryReference", () => {
  it("matches the PRJ-YYYY-### format", () => {
    const ref = generateInquiryReference(new Date("2026-08-07T12:00:00Z"));
    expect(ref).toMatch(/^PRJ-2026-\d{3}$/);
  });

  it("produces different references for different timestamps", () => {
    const a = generateInquiryReference(new Date("2026-08-07T12:00:00.000Z"));
    const b = generateInquiryReference(new Date("2026-08-07T12:00:00.501Z"));
    expect(a).not.toBe(b);
  });
});
