import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const sendMock = vi.fn().mockResolvedValue({ data: { id: "email_123" }, error: null });

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function (this: { emails: { send: typeof sendMock } }) {
    this.emails = { send: sendMock };
  }),
}));

function validRequest() {
  return new NextRequest("http://localhost/api/inquiry", {
    method: "POST",
    body: JSON.stringify({
      interest: "Website",
      stage: "Just an idea",
      outcome: "A working site",
      timeline: "Within one month",
      contact: "me@example.com",
    }),
  });
}

describe("POST /api/inquiry", () => {
  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "email_123" }, error: null });
    process.env.RESEND_API_KEY = "test-key";
    process.env.INQUIRY_TO_EMAIL = "owner@example.com";
  });

  it("returns 400 when required fields are missing", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost/api/inquiry", {
      method: "POST",
      body: JSON.stringify({ interest: "Website" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("sends the email and returns a reference on valid input", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost/api/inquiry", {
      method: "POST",
      body: JSON.stringify({
        interest: "Website",
        stage: "Just an idea",
        outcome: "A working site",
        timeline: "Within one month",
        contact: "me@example.com",
      }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.reference).toMatch(/^PRJ-\d{4}-\d{3}$/);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0].to).toBe("owner@example.com");
  });
});

describe("POST /api/inquiry delivery failures", () => {
  beforeEach(() => {
    sendMock.mockReset();
    process.env.RESEND_API_KEY = "test-key";
    process.env.INQUIRY_TO_EMAIL = "owner@example.com";
  });

  it("reports failure when the email provider rejects the send", async () => {
    // Regression: the SDK resolves with { data, error } instead of throwing, so
    // an unchecked call reported success while nothing was ever delivered.
    sendMock.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "domain not verified" },
    });

    const { POST } = await import("./route");
    const res = await POST(validRequest());
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body.reference).toBeUndefined();
    expect(body.error).toBeTruthy();
  });

  it("reports failure when the provider is not configured", async () => {
    delete process.env.RESEND_API_KEY;

    const { POST } = await import("./route");
    const res = await POST(validRequest());

    expect(res.status).toBe(503);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
