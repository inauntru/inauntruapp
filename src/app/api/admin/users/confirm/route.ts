import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";

async function requireAdmin() {
  const { requireAdmin: check } = await import("@/lib/admin-auth");
  return (await check()) !== null;
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId lipsă" }, { status: 400 });

  try {
    const serviceClient = createServiceClient();
    const { error } = await serviceClient.auth.admin.updateUserById(userId, { email_confirm: true });
    if (error) throw error;

    const { logAdminAction } = await import("@/lib/audit");
    await logAdminAction("Confirmare manuală email", userId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare necunoscută";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
