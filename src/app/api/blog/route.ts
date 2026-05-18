import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { BLOG_POSTS } from "@/lib/mockData";
import type { BlogPost } from "@/lib/database.types";

export async function GET() {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return NextResponse.json(BLOG_POSTS);
  }

  const normalized = (data as BlogPost[]).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category ?? "",
    author: p.author ?? "",
    authorRole: "",
    date: (p.published_at ?? p.created_at).split("T")[0],
    readTime: p.read_time ?? 5,
    excerpt: p.excerpt ?? "",
    image: p.image_url ?? "",
    isFeatured: false,
    tags: p.tags ?? [],
  }));

  return NextResponse.json(normalized);
}
