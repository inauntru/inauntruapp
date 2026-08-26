/* eslint-disable @typescript-eslint/no-explicit-any */
import { resend, FROM_EMAIL } from "./resend";
import { EMAIL_DEFAULTS } from "./email-defaults";
import { createServiceClient } from "./supabase";

const PLACEHOLDER = /\{\{\s*[a-zA-Z0-9_]+\s*\}\}/g;

function replaceVars(text: string, vars: Record<string, string>, templateId?: string): string {
  const out = Object.entries(vars).reduce(
    (str, [key, val]) => str.replaceAll(`{{${key}}}`, val),
    text
  );
  // Plasă de siguranță: un client nu trebuie să vadă niciodată „{{nr_zile}}".
  // Dacă o variabilă nu a fost furnizată, o scoatem și semnalăm în loguri.
  const leftover = out.match(PLACEHOLDER);
  if (leftover) {
    console.warn(`[email] Variabile lipsă în șablonul "${templateId ?? "?"}": ${Array.from(new Set(leftover)).join(", ")}`);
    return out.replace(PLACEHOLDER, "").replace(/[ \t]{2,}/g, " ");
  }
  return out;
}

async function getDbTemplate(templateId: string): Promise<{ subject: string; body: string } | null> {
  try {
    const supabase = createServiceClient();
    const { data } = await (supabase as any)
      .from("settings")
      .select("value")
      .eq("key", "email_templates")
      .maybeSingle();
    const saved = data?.value?.[templateId];
    if (saved?.body && saved?.subject) return { subject: saved.subject, body: saved.body };
  } catch {}
  return null;
}

export async function sendEmail({
  templateId,
  to,
  vars = {},
  overrideSubject,
  overrideHtml,
}: {
  templateId: string;
  to: string;
  vars?: Record<string, string>;
  overrideSubject?: string;
  overrideHtml?: string;
}): Promise<void> {
  const defaults = EMAIL_DEFAULTS[templateId];
  if (!defaults) throw new Error(`Unknown email template: ${templateId}`);

  const dbTemplate = await getDbTemplate(templateId);

  const subject = replaceVars(overrideSubject ?? dbTemplate?.subject ?? defaults.subject, vars, templateId);
  const html = replaceVars(overrideHtml ?? dbTemplate?.body ?? defaults.body, vars, templateId);

  // Headere de deliverabilitate: List-Unsubscribe e cerut de Gmail/Yahoo
  // pentru expeditorii în masă și ajută reputația domeniului
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
    replyTo: "hello@withinapp.ro",
    headers: {
      "List-Unsubscribe": "<https://withinapp.ro/dashboard/cont>",
    },
  });

  if (error) throw new Error(error.message);
}
