/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

async function requireAdmin() {
  const { requireAdmin: check } = await import("@/lib/admin-auth");
  return (await check()) !== null;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const patch: Record<string, unknown> = {
    ...(body.name !== undefined && { name: body.name }),
    ...(body.slug !== undefined && { slug: body.slug }),
    ...(body.specialty !== undefined && { specialty: body.specialty || null }),
    ...(body.bio !== undefined && { bio: body.bio || null }),
    ...(body.image_url !== undefined && { image_url: body.image_url || null }),
    ...(body.tags !== undefined && { tags: body.tags }),
    ...(body.sessions_count !== undefined && { sessions_count: body.sessions_count }),
    ...(body.is_active !== undefined && { is_active: body.is_active }),
  };

  const service = createServiceClient();
  const { error } = await (service as any).from("facilitators").update(patch).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { logAdminAction } = await import("@/lib/audit");
  await logAdminAction("Editare facilitator", body.name ?? params.id);

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const { error } = await (service as any).from("facilitators").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { logAdminAction } = await import("@/lib/audit");
  await logAdminAction("Ștergere facilitator", params.id);

  return NextResponse.json({ ok: true });
}
