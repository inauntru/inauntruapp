import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Maps our template IDs → Supabase Management API field names
const TEMPLATE_MAP: Record<string, { subject: string; body: string }> = {
  verify_email:    { subject: "mailer_subjects_confirmation",  body: "mailer_templates_confirmation_content"  },
  reset_password:  { subject: "mailer_subjects_recovery",      body: "mailer_templates_recovery_content"      },
  change_email:    { subject: "mailer_subjects_email_change",  body: "mailer_templates_email_change_content"  },
  invite_user:     { subject: "mailer_subjects_invite",        body: "mailer_templates_invite_content"        },
};

// Variabilele noastre ({{link}}) ↔ variabilele Go ale Supabase ({{ .ConfirmationURL }})
const VAR_TO_SUPABASE: Array<[string, string]> = [
  ["{{link}}",    "{{ .ConfirmationURL }}"],
  ["{{email}}",   "{{ .Email }}"],
  ["{{prenume}}", "{{ .Data.first_name }}"],
];
function toSupabase(text: string, id: string): string {
  let out = text;
  for (const [ours, theirs] of VAR_TO_SUPABASE) {
    // la schimbarea emailului, {{email}} înseamnă noua adresă
    const target = ours === "{{email}}" && id === "change_email" ? "{{ .NewEmail }}" : theirs;
    out = out.replaceAll(ours, target);
  }
  return out;
}
function fromSupabase(text: string): string {
  return text
    .replace(/\{\{\s*\.ConfirmationURL\s*\}\}/g, "{{link}}")
    .replace(/\{\{\s*\.(?:New)?Email\s*\}\}/g, "{{email}}")
    .replace(/\{\{\s*\.Data\.first_name\s*\}\}/g, "{{prenume}}");
}

function getProjectRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return new URL(url).hostname.split(".")[0];
}

async function requireAdmin() {
  const { requireAdmin: check } = await import("@/lib/admin-auth");
  return (await check()) !== null;
}

function mgmtHeaders() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error("SUPABASE_ACCESS_TOKEN lipsește din variabilele de mediu");
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// GET /api/admin/auth-templates — fetch current templates from Supabase
export async function GET() {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const ref = getProjectRef();
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
      headers: mgmtHeaders(),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Supabase API error: ${err}` }, { status: res.status });
    }

    const config = await res.json();

    // Return only the email template fields we care about
    const templates: Record<string, { subject: string; body: string }> = {};
    for (const [id, keys] of Object.entries(TEMPLATE_MAP)) {
      templates[id] = {
        subject: config[keys.subject] ?? "",
        body: fromSupabase(config[keys.body] ?? ""),
      };
    }

    return NextResponse.json(templates);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Eroare necunoscută";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/admin/auth-templates — update one or more templates in Supabase
export async function PUT(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json() as Record<string, { subject?: string; body?: string }>;
    const ref = getProjectRef();

    // Build the Supabase Management API patch payload
    const patch: Record<string, string> = {};
    for (const [id, tpl] of Object.entries(body)) {
      const keys = TEMPLATE_MAP[id];
      if (!keys) continue;
      if (tpl.subject !== undefined) patch[keys.subject] = toSupabase(tpl.subject, id);
      if (tpl.body !== undefined) patch[keys.body] = toSupabase(tpl.body, id);
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nicio modificare validă" }, { status: 400 });
    }

    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
      method: "PATCH",
      headers: mgmtHeaders(),
      body: JSON.stringify(patch),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Supabase API error: ${err}` }, { status: res.status });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Eroare necunoscută";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
