/* eslint-disable @typescript-eslint/no-explicit-any */
import { resend, FROM_EMAIL } from "./resend";
import { EMAIL_DEFAULTS } from "./email-defaults";
import { createServiceClient } from "./supabase";

function replaceVars(text: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (str, [key, val]) => str.replaceAll(`{{${key}}}`, val),
    text
  );
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

  const subject = replaceVars(overrideSubject ?? dbTemplate?.subject ?? defaults.subject, vars);
  const html = replaceVars(overrideHtml ?? dbTemplate?.body ?? defaults.body, vars);

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });

  if (error) throw new Error(error.message);
}
