#!/usr/bin/env node
/*
  Send a status update to someone who submitted a request.

    node scripts/send-update.mjs <their-email> <REFERENCE> "<status>" "<message>"

  Example:
    node scripts/send-update.mjs jane@acme.com PRJ-2026-099 "In progress" \
      "Started on the storefront today. First preview by Friday."

  Reads RESEND_API_KEY and INQUIRY_FROM_EMAIL from .env.local.
*/
import { readFileSync } from "node:fs";
import { Resend } from "resend";
import { clientUpdateEmail } from "../lib/emails.ts";

function loadEnv() {
  try {
    for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      if (!process.env[key]) process.env[key] = trimmed.slice(eq + 1);
    }
  } catch {
    // Fall through to whatever is already in the environment.
  }
}

const [to, reference, status, message] = process.argv.slice(2);

if (!to || !reference || !status || !message) {
  console.error(
    'Usage: node scripts/send-update.mjs <email> <REFERENCE> "<status>" "<message>"'
  );
  process.exit(1);
}

loadEnv();

if (!process.env.RESEND_API_KEY) {
  console.error("RESEND_API_KEY is not set (expected in .env.local).");
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);
const mail = clientUpdateEmail({ reference, status, message });

const { data, error } = await resend.emails.send({
  from: process.env.INQUIRY_FROM_EMAIL ?? "ORBIT OS <onboarding@resend.dev>",
  to,
  replyTo: process.env.INQUIRY_TO_EMAIL,
  subject: mail.subject,
  html: mail.html,
  text: mail.text,
});

if (error || !data) {
  console.error("Update not sent:", error?.message ?? error);
  // The most common cause is worth naming rather than leaving as a raw error.
  console.error(
    "\nIf this says you can only send to your own address, the sending domain\n" +
      "is not verified yet. Add one at resend.com/domains, then set\n" +
      "INQUIRY_FROM_EMAIL to an address on that domain."
  );
  process.exit(1);
}

console.log(`Update sent to ${to} for ${reference} (id ${data.id})`);
