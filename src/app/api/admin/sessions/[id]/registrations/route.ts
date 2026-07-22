/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await (supabase as any).from("profiles").select("role").eq("id", user.id).single() as { data: { role: string } | null };
  if (!profile || !["admin", "super_admin"].includes(profile.role)) return null;
  return user;
}

// GET /api/admin/sessions/[id]/registrations — participanții unei sesiuni
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const service = createServiceClient() as any;

  const { data: regs, error } = await service
    .from("session_registrations")
    .select("user_id, created_at")
    .eq("session_id", Number(id))
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!regs || regs.length === 0) return NextResponse.json({ participants: [] });

  const userIds = regs.map((r: any) => r.user_id);
  const { data: profiles } = await service
    .from("profiles")
    .select("id, first_name, last_name, plan")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  const participants = await Promise.all(
    regs.map(async (r: any) => {
      const p: any = profileMap.get(r.user_id);
      let email = "";
      try {
        const { data } = await service.auth.admin.getUserById(r.user_id);
        email = data?.user?.email ?? "";
      } catch { /* ignore */ }
      return {
        name: [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "Utilizator",
        email,
        plan: p?.plan ?? "gratuit",
        registeredAt: r.created_at,
      };
    })
  );

  return NextResponse.json({ participants });
}
