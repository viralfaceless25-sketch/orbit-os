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

  const reference = generateInquiryReference();
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "ORBIT OS <onboarding@resend.dev>",
    to: process.env.INQUIRY_TO_EMAIL ?? "",
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

  return NextResponse.json({ reference });
}
