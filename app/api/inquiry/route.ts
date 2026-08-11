import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { generateInquiryReference } from "@/lib/inquiry-reference";
import {
  ownerNotificationEmail,
  clientConfirmationEmail,
  type InquiryDetails,
} from "@/lib/emails";

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
  const from = process.env.INQUIRY_FROM_EMAIL ?? "ORBIT OS <onboarding@resend.dev>";

  const details: InquiryDetails = {
    reference,
    interest: body.interest,
    stage: body.stage,
    outcome: body.outcome,
    timeline: body.timeline,
    contact: body.contact,
  };

  // The owner notification is the one that must land: it is the actual lead.
  // The SDK resolves with { data, error } rather than throwing on API-level
  // failures, so the error field is checked explicitly. Reporting success when
  // nothing was delivered is the worst outcome, because the visitor believes
  // they have made contact and never follows up.
  const owner = ownerNotificationEmail(details);
  const { data, error } = await resend.emails.send({
    from,
    to,
    replyTo: body.contact.includes("@") ? body.contact : undefined,
    subject: owner.subject,
    html: owner.html,
    text: owner.text,
  });

  if (error || !data) {
    console.error("Resend rejected the inquiry:", error);
    return NextResponse.json(
      { error: "That did not send. Please use the email link instead." },
      { status: 502 }
    );
  }

  // The visitor's copy is a courtesy, not the lead. It is attempted separately
  // and never allowed to fail the request: on an unverified sending domain the
  // provider refuses every recipient except the account owner, and the lead has
  // already been delivered by this point regardless.
  let clientCopySent = false;
  if (body.contact.includes("@")) {
    const confirmation = clientConfirmationEmail(details);
    const copy = await resend.emails
      .send({
        from,
        to: body.contact.trim(),
        replyTo: to,
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
      })
      .catch((err) => ({ data: null, error: err }));

    if (copy.error || !copy.data) {
      console.warn(
        `Confirmation copy to ${body.contact} was not delivered:`,
        copy.error
      );
    } else {
      clientCopySent = true;
    }
  }

  return NextResponse.json({ reference, clientCopySent });
}
