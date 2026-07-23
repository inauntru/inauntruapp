/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";
import type { BlogPost } from "@/lib/database.types";

async function requireAdmin() {
  const { requireAdmin: check } = await import("@/lib/admin-auth");
  return (await check()) !== null;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Partial<BlogPost>;
  const serviceClient = createServiceClient();

  const patch: Partial<BlogPost> & { updated_at: string } = {
    ...(body.title !== undefined && { title: body.title }),
    ...(body.slug !== undefined && { slug: body.slug }),
    ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
    ...(body.content !== undefined && { content: body.content }),
    ...(body.author !== undefined && { author: body.author }),
    ...(body.category !== undefined && { category: body.category }),
    ...(body.tags !== undefined && { tags: body.tags }),
    ...(body.image_url !== undefined && { image_url: body.image_url }),
    ...(body.read_time !== undefined && { read_time: body.read_time }),
    ...(body.published !== undefined && { published: body.published }),
    ...(body.published !== undefined && body.published && { published_at: new Date().toISOString() }),
    updated_at: new Date().toISOString(),
  };

  const { error } = await (serviceClient as any).from("blog_posts").update(patch).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceClient = createServiceClient();
  const { error } = await (serviceClient as any).from("blog_posts").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { logAdminAction } = await import("@/lib/audit");
  await logAdminAction("Ștergere articol blog", params.id);

  return NextResponse.json({ ok: true });
}
