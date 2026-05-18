/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";
import type { BlogPost } from "@/lib/database.types";

async function requireAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === "authenticated";
}

function slugify(title: string) {
  return title
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

  const serviceClient = createServiceClient();
  const { data, error } = await (serviceClient as any)
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: (data ?? []) as BlogPost[] });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Partial<BlogPost>;
  if (!body.title) return NextResponse.json({ error: "Titlul este obligatoriu" }, { status: 400 });

  const slug = slugify(body.title);
  const serviceClient = createServiceClient();
  const { data, error } = await (serviceClient as any)
    .from("blog_posts")
    .insert({
      title: body.title,
      slug: body.slug || slug,
      excerpt: body.excerpt ?? null,
      content: body.content ?? null,
      author: body.author ?? null,
      category: body.category ?? null,
      tags: body.tags ?? [],
      image_url: body.image_url ?? null,
      read_time: body.read_time ?? null,
      published: body.published ?? false,
      published_at: body.published ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data as BlogPost });
}
