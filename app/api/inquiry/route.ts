import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { generateInquiryReference } from "@/lib/inquiry-reference";

interface InquiryPayload {
  interest?: string;
  stage?: string;
  outcome?: string;
  timeline?: string;
  contact?: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as InquiryPayload;

  if (!body.interest || !body.stage || !body.outcome || !body.timeline || !body.contact) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const to = process.env.INQUIRY_TO_EMAIL;
  if (!process.env.RESEND_API_KEY || !to) {
    console.error("Inquiry not sent: RESEND_API_KEY or INQUIRY_TO_EMAIL is unset.");
    return NextResponse.json(
      { error: "Inquiries are not connected yet. Please use the email link instead." },
      { status: 503 }
    );
  }

  const reference = generateInquiryReference();
  const resend = new Resend(process.env.RESEND_API_KEY);

  // The SDK resolves with { data, error } rather than throwing on API-level
  // failures, so the error field must be checked explicitly. Reporting success
  // here when nothing was delivered is the worst outcome: the visitor believes
  // they have contacted us and never follows up.
  const { data, error } = await resend.emails.send({
    from: process.env.INQUIRY_FROM_EMAIL ?? "ORBIT OS <onboarding@resend.dev>",
    to,
    replyTo: body.contact.includes("@") ? body.contact : undefined,
    subject: `New project inquiry ${reference}`,
    text: [
      `Reference: ${reference}`,
      `Interested in: ${body.interest}`,
      `Stage: ${body.stage}`,
      `Desired outcome: ${body.outcome}`,
      `Timeline: ${body.timeline}`,
      `Contact: ${body.contact}`,
    ].join("\n"),
  });

  if (error || !data) {
    console.error("Resend rejected the inquiry:", error);
    return NextResponse.json(
      { error: "That did not send. Please use the email link instead." },
      { status: 502 }
    );
  }

  return NextResponse.json({ reference });
}
