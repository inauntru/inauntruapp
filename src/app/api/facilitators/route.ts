import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { FACILITATORS } from "@/lib/mockData";
import type { Facilitator } from "@/lib/database.types";

export async function GET() {
  const { data, error } = await supabase
    .from("facilitators")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error || !data || data.length === 0) {
    return NextResponse.json(FACILITATORS);
  }

  const normalized = (data as Facilitator[]).map((f) => ({
    id: f.id,
    slug: f.slug,
    name: f.name,
    title: f.specialty ?? "",
    tags: f.tags ?? [],
    rating: f.rating ?? 5.0,
    reviews: f.sessions_count ?? 0,
    bio: f.bio ?? "",
    photo: f.image_url ?? "",
    practiceDuration: "",
    specialties: f.tags ?? [],
    certifications: [],
  }));

  return NextResponse.json(normalized);
}
