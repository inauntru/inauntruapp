/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { rateLimit, clientIp } from "@/lib/admin-auth";

// POST /api/newsletter { email } — abonare la newsletter (public)
export async function POST(req: NextRequest) {
  if (!rateLimit(`newsletter:${clientIp(req)}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Prea multe încercări" }, { status: 429 });
  }

  const { email } = await req.json();
  const normalized = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized)) {
    return NextResponse.json({ error: "Adresă de email invalidă" }, { status: 400 });
  }

  const service = createServiceClient() as any;
  const { error } = await service
    .from("newsletter_subscribers")
    .insert({ email: normalized, source: "footer" });

  // 23505 = deja abonat — tratăm ca succes (nu divulgăm cine e în listă)
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "A apărut o eroare. Încearcă din nou." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
