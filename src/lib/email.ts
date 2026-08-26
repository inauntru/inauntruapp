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

interface DbTemplate { subject: string; body: string; status?: "activ" | "draft" }

async function getDbTemplate(templateId: string): Promise<DbTemplate | null> {
  try {
    const supabase = createServiceClient();
    const { data } = await (supabase as any)
      .from("settings")
      .select("value")
      .eq("key", "email_templates")
      .maybeSingle();
    const saved = data?.value?.[templateId];
    if (saved?.body && saved?.subject) return { subject: saved.subject, body: saved.body, status: saved.status };
  } catch {}
  return null;
}

export interface SendEmailResult {
  sent: boolean;
  /** de ce nu s-a trimis: "draft" (oprit din admin), "duplicate" (deja trimis), "error" */
  reason?: "draft" | "duplicate" | "error";
  error?: string;
}

/**
 * Trimite un email pe baza unui șablon.
 *
 * `userId` + `ref` = cheia de unicitate: același utilizator, același șablon,
 * același `ref` → se trimite O SINGURĂ DATĂ (garantat de tabelul email_log).
 * Ex.: ref = "streak-7" pentru emailul de 7 zile consecutive, ref = "s12"
 * pentru reminderul sesiunii 12, ref = data pentru emailuri zilnice/săptămânale.
 */
export async function sendEmail({
  templateId,
  to,
  vars = {},
  overrideSubject,
  overrideHtml,
  userId,
  ref,
}: {
  templateId: string;
  to: string;
  vars?: Record<string, string>;
  overrideSubject?: string;
  overrideHtml?: string;
  userId?: string;
  ref?: string;
}): Promise<SendEmailResult> {
  const defaults = EMAIL_DEFAULTS[templateId];
  if (!defaults) throw new Error(`Unknown email template: ${templateId}`);

  const isTest = overrideHtml !== undefined || overrideSubject !== undefined;
  const dbTemplate = await getDbTemplate(templateId);

  // Șablon oprit din Admin → Emailuri (comutatorul Activ/Draft). Testele trec mereu.
  if (!isTest && dbTemplate?.status === "draft") {
    return { sent: false, reason: "draft" };
  }

  const service = createServiceClient() as any;
  const dedupe = !isTest && !!userId && ref !== undefined;

  if (dedupe) {
    const { data: already } = await service
      .from("email_log")
      .select("id")
      .eq("user_id", userId)
      .eq("template_id", templateId)
      .eq("ref", ref)
      .maybeSingle();
    if (already) return { sent: false, reason: "duplicate" };
  }

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

  if (dedupe) {
    // Conflictul de unicitate (două procese în același moment) nu e o eroare
    await service.from("email_log").insert({ user_id: userId, template_id: templateId, ref });
  }

  return { sent: true };
}
