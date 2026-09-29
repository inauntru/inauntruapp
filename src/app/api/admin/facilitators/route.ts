/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

async function requireAdmin() {
  const { requireAdmin: check } = await import("@/lib/admin-auth");
  return (await check()) !== null;
}

/** Adresa din URL a facilitatorului, derivată din nume. */
function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const { data, error } = await (service as any)
    .from("facilitators")
    .select("*")
    .order("id", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ facilitators: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Numele este obligatoriu" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data, error } = await (service as any)
    .from("facilitators")
    .insert({
      name: body.name.trim(),
      slug: (body.slug?.trim() || slugify(body.name)),
      specialty: body.specialty?.trim() || null,
      bio: body.bio?.trim() || null,
      image_url: body.image_url?.trim() || null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      rating: body.rating ?? 5.0,
      sessions_count: body.sessions_count ?? 0,
      is_active: body.is_active ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { logAdminAction } = await import("@/lib/audit");
  await logAdminAction("Creare facilitator", body.name);

  return NextResponse.json({ facilitator: data });
}
