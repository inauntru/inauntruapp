import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type ProfileRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];

import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  // Doar super_admin poate schimba roluri
  const admin = await requireAdmin();
  if (!admin || admin.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json() as { userId: string; role: ProfileRole };
    const { userId, role } = body;
    if (!userId || !role) {
      return NextResponse.json({ error: "userId și role sunt obligatorii" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (createServiceClient() as any)
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) throw error;

    const { logAdminAction } = await import("@/lib/audit");
    await logAdminAction("Schimbare rol utilizator", userId, { role });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare necunoscută";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
