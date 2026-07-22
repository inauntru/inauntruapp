/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";

async function getSessionUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// GET /api/ancore/complete — istoricul ancorelor finalizate de userul curent
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const service = createServiceClient() as any;
  const { data, error } = await service
    .from("ancore_completions")
    .select("ancora_id, name, categorie, nivel, completed_at")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ completions: data ?? [] });
}

// POST /api/ancore/complete — înregistrează o ancoră finalizată
// Body: { id, name, categorie, nivel } sau { entries: [...] } pentru migrare din localStorage
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const body = await req.json();
  const entries = Array.isArray(body.entries) ? body.entries : [body];

  const rows = entries
    .filter((e: any) => e && (typeof e.id === "string" || typeof e.id === "number") && typeof e.name === "string")
    .slice(0, 200)
    .map((e: any) => ({
      user_id: user.id,
      ancora_id: String(e.id).slice(0, 100),
      name: String(e.name).slice(0, 200),
      categorie: e.categorie ? String(e.categorie).slice(0, 100) : null,
      nivel: e.nivel ? String(e.nivel).slice(0, 100) : null,
      completed_at: e.completedAt && !isNaN(Date.parse(e.completedAt)) ? e.completedAt : new Date().toISOString(),
    }));

  if (rows.length === 0) return NextResponse.json({ error: "Date invalide" }, { status: 400 });

  const service = createServiceClient() as any;
  const { error } = await service.from("ancore_completions").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, saved: rows.length });
}
