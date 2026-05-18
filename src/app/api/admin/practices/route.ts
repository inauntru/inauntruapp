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
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any).from("profiles").select("role").eq("id", user.id).single() as { data: { role: string } | null };
  if (!profile || !["admin", "super_admin"].includes(profile.role)) return null;
  return user;
}

// GET /api/admin/practices
export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await createServiceClient()
    .from("practices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/admin/practices
export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, category, level, duration, facilitator_name, facilitator_slug,
    is_premium, media_type, image_url, thumbnail_url, description, long_description, tags, status } = body;

  if (!title || !category) {
    return NextResponse.json({ error: "title și category sunt obligatorii" }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (serviceClient as any).from("practices").insert({
    title,
    category,
    level: level ?? "Începător",
    duration: duration ?? 10,
    facilitator_name: facilitator_name ?? null,
    facilitator_slug: facilitator_slug ?? null,
    is_premium: is_premium ?? false,
    media_type: media_type ?? "audio",
    image_url: image_url ?? null,
    thumbnail_url: thumbnail_url ?? null,
    description: description ?? null,
    long_description: long_description ?? null,
    tags: tags ?? [],
    status: status ?? "draft",
    views_count: 0,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
