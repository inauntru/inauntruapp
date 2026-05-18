import { resend, FROM_EMAIL } from "./resend";
import { EMAIL_DEFAULTS } from "./email-defaults";

function replaceVars(text: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (str, [key, val]) => str.replaceAll(`{{${key}}}`, val),
    text
  );
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

  const subject = replaceVars(overrideSubject ?? defaults.subject, vars);
  const html = replaceVars(overrideHtml ?? defaults.body, vars);

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });

  if (error) throw new Error(error.message);
}
