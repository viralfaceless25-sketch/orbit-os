/*
  Email templates, in the same instrument language as the site: near-black
  ground, hairline rules, monospace labels, one accent.

  Written as tables with inline styles on purpose. Mail clients strip <style>
  blocks, ignore flexbox and grid, and Outlook renders through Word, so the
  modern CSS the site uses would collapse here. Every value is inline and every
  layout is a table cell.
*/

const INK = "#f2f0ed";
const DIM = "#b4b7bf";
const FAINT = "#9598a1";
const BG = "#0c0c0e";
const PANEL = "#141821";
const LINE = "#2b2e36";
const ACCENT = "#7c5cff";

const MONO =
  "'SFMono-Regular', ui-monospace, Menlo, Consolas, 'Liberation Mono', monospace";
const SANS = "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

export interface InquiryDetails {
  reference: string;
  interest: string;
  stage: string;
  outcome: string;
  timeline: string;
  contact: string;
}

/** Mail is HTML: anything a stranger typed must be escaped before it lands in a tag. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function label(text: string): string {
  return `<span style="font-family:${MONO};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${FAINT};">${escapeHtml(
    text
  )}</span>`;
}

function row(name: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${LINE};vertical-align:top;width:150px;">${label(
        name
      )}</td>
      <td style="padding:10px 0;border-bottom:1px solid ${LINE};vertical-align:top;font-family:${SANS};font-size:14px;line-height:22px;color:${INK};">${escapeHtml(
        value
      )}</td>
    </tr>`;
}

function shell(options: {
  eyebrow: string;
  heading: string;
  intro: string;
  bodyHtml: string;
  footerHtml: string;
  previewText: string;
}): string {
  const { eyebrow, heading, intro, bodyHtml, footerHtml, previewText } = options;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${BG};">
  <!-- Preview line shown in the inbox list before the mail is opened. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(
    previewText
  )}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${PANEL};border:1px solid ${LINE};">

          <tr>
            <td style="padding:22px 28px;border-bottom:1px solid ${LINE};">
              <span style="font-family:${MONO};font-size:13px;letter-spacing:0.18em;color:${INK};">ORBIT&nbsp;OS</span>
              <span style="float:right;">${label(eyebrow)}</span>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 28px 0;">
              <h1 style="margin:0;font-family:${SANS};font-size:21px;line-height:29px;font-weight:600;color:${INK};">${escapeHtml(
                heading
              )}</h1>
              <p style="margin:12px 0 0;font-family:${SANS};font-size:14px;line-height:23px;color:${DIM};">${escapeHtml(
                intro
              )}</p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 28px 30px;">${bodyHtml}</td>
          </tr>

          <tr>
            <td style="padding:18px 28px;border-top:1px solid ${LINE};font-family:${MONO};font-size:11px;line-height:19px;letter-spacing:0.06em;color:${FAINT};">
              ${footerHtml}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Sent to Keyush when someone submits the form. */
export function ownerNotificationEmail(details: InquiryDetails) {
  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row("Interested in", details.interest)}
      ${row("Stage", details.stage)}
      ${row("Desired outcome", details.outcome)}
      ${row("Timeline", details.timeline)}
      ${row("Contact", details.contact)}
    </table>
    <p style="margin:22px 0 0;font-family:${SANS};font-size:13px;line-height:21px;color:${DIM};">
      Reply to this message to answer them directly.
    </p>`;

  return {
    subject: `New project request ${details.reference} · ${details.interest}`,
    html: shell({
      eyebrow: details.reference,
      heading: "New project request",
      intro: "Someone submitted the Start a Project form.",
      bodyHtml,
      footerHtml: `Sent by ORBIT OS &middot; ${escapeHtml(details.reference)}`,
      previewText: `${details.interest} — ${details.outcome}`,
    }),
    text: [
      `NEW PROJECT REQUEST ${details.reference}`,
      "",
      `Interested in:   ${details.interest}`,
      `Stage:           ${details.stage}`,
      `Desired outcome: ${details.outcome}`,
      `Timeline:        ${details.timeline}`,
      `Contact:         ${details.contact}`,
      "",
      "Reply to this message to answer them directly.",
    ].join("\n"),
  };
}

/** Sent to the visitor so they have a record of what they asked for. */
export function clientConfirmationEmail(details: InquiryDetails) {
  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row("Reference", details.reference)}
      ${row("Interested in", details.interest)}
      ${row("Stage", details.stage)}
      ${row("Your goal", details.outcome)}
      ${row("Timeline", details.timeline)}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
      <tr>
        <td style="border-left:2px solid ${ACCENT};padding:2px 0 2px 14px;">
          <p style="margin:0;font-family:${SANS};font-size:14px;line-height:23px;color:${DIM};">
            Keyush reads every request himself and usually replies within a day.
            If anything above is wrong, just reply to this email.
          </p>
        </td>
      </tr>
    </table>`;

  return {
    subject: `Request received ${details.reference}`,
    html: shell({
      eyebrow: details.reference,
      heading: "Your request is in",
      intro: "Here is a copy for your records.",
      bodyHtml,
      footerHtml: `You are receiving this because you contacted Keyush Patel through ORBIT OS.<br>Reference ${escapeHtml(
        details.reference
      )}`,
      previewText: `Reference ${details.reference} — Keyush usually replies within a day.`,
    }),
    text: [
      `YOUR REQUEST IS IN — ${details.reference}`,
      "",
      "Here is a copy for your records.",
      "",
      `Reference:     ${details.reference}`,
      `Interested in: ${details.interest}`,
      `Stage:         ${details.stage}`,
      `Your goal:     ${details.outcome}`,
      `Timeline:      ${details.timeline}`,
      "",
      "Keyush reads every request himself and usually replies within a day.",
      "If anything above is wrong, just reply to this email.",
    ].join("\n"),
  };
}

/** Sent when Keyush posts an update against an existing reference. */
export function clientUpdateEmail(options: {
  reference: string;
  status: string;
  message: string;
}) {
  const { reference, status, message } = options;

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row("Reference", reference)}
      ${row("Status", status)}
    </table>
    <p style="margin:22px 0 0;font-family:${SANS};font-size:14px;line-height:24px;color:${INK};white-space:pre-wrap;">${escapeHtml(
      message
    )}</p>`;

  return {
    subject: `Update on ${reference} · ${status}`,
    html: shell({
      eyebrow: reference,
      heading: "Project update",
      intro: `Status is now ${status}.`,
      bodyHtml,
      footerHtml: `Update on request ${escapeHtml(reference)} &middot; reply to reach Keyush directly.`,
      previewText: `${status} — ${message.slice(0, 90)}`,
    }),
    text: [
      `PROJECT UPDATE — ${reference}`,
      "",
      `Status: ${status}`,
      "",
      message,
      "",
      "Reply to reach Keyush directly.",
    ].join("\n"),
  };
}
