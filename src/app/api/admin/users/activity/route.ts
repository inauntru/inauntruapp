/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

async function requireAdmin() {
  const { requireAdmin: check } = await import("@/lib/admin-auth");
  return (await check()) !== null;
}

/**
 * GET /api/admin/users/activity?userId=... — ce a practicat un utilizator.
 * Se înregistrează finalizările (practică parcursă 90%+), cele mai noi primele.
 */
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Lipsește userId" }, { status: 400 });

  const service = createServiceClient() as any;

  const { data: rows, error } = await service
    .from("user_practices")
    .select("practice_id, duration_watched, completed_at")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const history = (rows ?? []) as { practice_id: number; duration_watched: number | null; completed_at: string | null }[];
  const ids = Array.from(new Set(history.map((h) => h.practice_id)));

  let titles: Record<number, { title: string; category: string | null }> = {};
  if (ids.length > 0) {
    const { data: practices } = await service.from("practices").select("id, title, category").in("id", ids);
    titles = Object.fromEntries(
      ((practices ?? []) as { id: number; title: string; category: string | null }[])
        .map((p) => [p.id, { title: p.title, category: p.category }])
    );
  }

  const items = history.map((h) => ({
    practiceId: h.practice_id,
    title: titles[h.practice_id]?.title ?? `Practica #${h.practice_id}`,
    category: titles[h.practice_id]?.category ?? null,
    minutes: h.duration_watched ?? 0,
    at: h.completed_at,
  }));

  return NextResponse.json({
    items,
    totalCompleted: items.length,
    totalMinutes: items.reduce((sum, i) => sum + i.minutes, 0),
  });
}
