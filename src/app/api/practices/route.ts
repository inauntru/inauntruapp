import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { PRACTICES } from "@/lib/mockData";
import type { Practice } from "@/lib/database.types";

export async function GET() {
  const { data, error } = await supabase
    .from("practices")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return NextResponse.json(PRACTICES);
  }

  // Normalize DB columns to match mockData shape used in frontend
  const normalized = (data as Practice[]).map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    facilitator: p.facilitator_name ?? "",
    facilitatorSlug: p.facilitator_slug ?? "",
    duration: p.duration,
    level: p.level,
    isPremium: p.is_premium,
    mediaType: p.media_type ?? "audio",
    image: p.image_url ?? "",
    thumbnail: p.thumbnail_url ?? p.image_url ?? "",
    description: p.description ?? "",
    longDescription: p.long_description ?? "",
    tags: p.tags ?? [],
  }));

  return NextResponse.json(normalized);
}
