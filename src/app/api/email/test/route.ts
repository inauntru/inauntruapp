import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { templateId, subject, body, to } = await req.json();

    if (!templateId || !to) {
      return NextResponse.json({ error: "templateId and to required" }, { status: 400 });
    }

    // Prepend [TEST] and inject a banner into the body
    const testSubject = `[TEST] ${subject ?? ""}`.trim();
    const testBanner = `<div style="background:#fef3c7;border:2px dashed #f59e0b;border-radius:10px;padding:10px 16px;margin-bottom:20px;font-family:sans-serif;font-size:13px;color:#92400e;">
      ⚠️ <strong>Email de test</strong> — trimis din admin WithIn. Nu este un email real.
    </div>`;
    const testBody = body ? body.replace(/<body[^>]*>/, (m: string) => m).replace(/(<div[^>]*max-width[^>]*>)/, `$1${testBanner}`) : body;

    await sendEmail({
      templateId,
      to,
      overrideSubject: testSubject,
      overrideHtml: testBody ?? body,
      vars: {
        prenume: "Sabina",
        email: to,
        plan: "Premium",
        link: "https://inauntru.ro/dashboard",
        rol: "Super Admin",
        sesiune_titlu: "Respirație pentru reglare nervoasă",
        sesiune_data: "Vineri, 23 mai · 18:00",
        sesiune_durata: "45",
        facilitator_nume: "Ana Ionescu",
        nr_practici: "5",
        nr_minute: "87",
        streak: "3",
        nr_zile: "7",
        suma: "59",
        data_reinnoire: "23 iunie 2026",
        data_expirare: "20 mai 2026",
        mesaj_personalizat: "Ai avut o săptămână activă — continuă tot așa!",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
