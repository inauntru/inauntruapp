import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/mockData";
import { createServiceClient } from "@/lib/supabase";
import type { BlogPost } from "@/lib/database.types";
import BlogPostClient, { type NormalizedPost } from "./BlogPostClient";

export const dynamicParams = true;

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

async function getPost(slug: string): Promise<NormalizedPost | null> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (data) {
      const p = data as BlogPost;
      return {
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
        tags: p.tags ?? [],
        content: p.content,
      };
    }
  } catch {}

  const mock = BLOG_POSTS.find((p) => p.slug === slug);
  return (mock as NormalizedPost) ?? null;
}

async function getRelated(slug: string, category: string): Promise<NormalizedPost[]> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .eq("category", category)
      .neq("slug", slug)
      .limit(3);

    if (data && data.length > 0) {
      return (data as BlogPost[]).map((p) => ({
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
        tags: p.tags ?? [],
      }));
    }
  } catch {}

  return BLOG_POSTS.filter(
    (p) => p.slug !== slug && p.category === category
  ).slice(0, 3) as NormalizedPost[];
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();
  const related = await getRelated(params.slug, post.category);

  // Randarea vizibilă e în componenta client, ca textele să poată fi traduse RO/EN.
  return <BlogPostClient post={post} related={related} />;
}
