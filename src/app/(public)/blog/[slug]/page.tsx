import Link from "next/link";
import { ArrowLeft, Clock, Calendar, BookOpen, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { BLOG_POSTS } from "@/lib/mockData";
import { createServiceClient } from "@/lib/supabase";
import type { BlogPost } from "@/lib/database.types";

export const dynamicParams = true;

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

type NormalizedPost = {
  id: number | string;
  slug: string;
  title: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: number;
  excerpt: string;
  image: string;
  tags: string[];
  content?: string | null;
};

async function getPost(slug: string): Promise<NormalizedPost> {
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

  const mock = BLOG_POSTS.find((p) => p.slug === slug) ?? BLOG_POSTS[0];
  return mock as NormalizedPost;
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
  const related = await getRelated(params.slug, post.category);

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Back */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-secondary-text hover:text-forest-green transition-colors font-body text-body-sm">
          <ArrowLeft size={16} weight="bold" />
          Înapoi la blog
        </Link>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <span className="tag tag-green mb-4">{post.category}</span>
          <h1 className="font-heading text-h1 text-deep-green mb-4 leading-snug">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-label-xs text-secondary-text font-body mb-6">
            <span className="font-semibold text-deep-green">{post.author}</span>
            <span>{post.authorRole}</span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(post.date).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {post.readTime} min lectură
            </span>
          </div>

          {/* Hero image */}
          <div className="aspect-video bg-gradient-to-br from-forest-green/20 to-deep-green/10 rounded-card flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-forest-green/20 flex items-center justify-center">
              <BookOpen size={36} weight="regular" className="text-forest-green/50" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-green max-w-none font-body text-body-md text-secondary-text leading-relaxed space-y-6">
          {post.content ? (
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <>
              <p className="text-body-lg text-on-surface font-medium">{post.excerpt}</p>

              <p>
                Terapia somatică pornește de la premisa că experiențele noastre emoționale și traumatice nu sunt stocate doar în minte, ci și în corp. Cercetările pionierilor ca Peter Levine (Somatic Experiencing) și Bessel van der Kolk (The Body Keeps the Score) au demonstrat că sistemul nervos autonom joacă un rol central în modul în care procesăm și integrăm experiențele dificile.
              </p>

              <h2 className="font-heading text-h2 text-deep-green">Ce înseamnă „somatic"?</h2>
              <p>
                Termenul „somatic" vine din greacă (soma = corp). În contextul terapiei, desemnează abordările care utilizează conștiința corporală, senzațiile fizice și mișcarea ca intrări principale în procesul terapeutic. Spre deosebire de terapia cognitiv-comportamentală (care lucrează cu gândurile), terapia somatică lucrează cu senzațiile din corp.
              </p>

              <p>
                Practicile somatice includ o gamă largă de tehnici: respirație conștientă, scanarea corpului, mișcarea autentică, vocalizarea, TRE (Tension &amp; Trauma Releasing Exercises) și altele. Fiecare dintre ele activează sistemul nervos parasimpatic, responsabil cu starea de odihnă și recuperare.
              </p>

              <h2 className="font-heading text-h2 text-deep-green">Cum te poate ajuta?</h2>
              <p>
                Studiile arată că practicile somatice sunt eficiente pentru anxietate, stres cronic, insomnie, burnout și simptome ale traumei. Un studiu publicat în 2023 în Journal of Traumatic Stress a arătat că 8 săptămâni de practică somatică zilnică au redus simptomele de anxietate cu 42% față de grupul de control.
              </p>

              <div className="bg-light-green border border-sage-border rounded-card p-6">
                <p className="font-heading text-h3 text-forest-green mb-2">Notă importantă</p>
                <p className="font-body text-body-sm text-secondary-text">
                  Practicile de pe platforma WithIn sunt instrumente de suport și nu înlocuiesc psihoterapia individuală. Dacă treci prin experiențe traumatice intense, te recomandăm să lucrezi cu un specialist calificat.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-sage-border">
          {post.tags.map((tag) => (
            <span key={tag} className="tag tag-outline">{tag}</span>
          ))}
        </div>

        {/* Author bio */}
        {post.author && (
          <div className="mt-8 p-6 bg-surface-container-low rounded-card border border-sage-border flex gap-4 items-center">
            <div className="w-12 h-12 rounded-full bg-forest-green/20 flex items-center justify-center flex-shrink-0">
              <span className="font-heading text-forest-green font-bold text-lg">
                {post.author.split(" ")[0]?.[0]}{post.author.split(" ").slice(-1)[0]?.[0]}
              </span>
            </div>
            <div>
              <p className="font-body font-semibold text-body-sm text-deep-green">{post.author}</p>
              <p className="font-body text-label-xs text-secondary-text">{post.authorRole || "Facilitator"} la WithIn</p>
            </div>
          </div>
        )}
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="py-12 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-h2 text-deep-green mb-6">Citește și</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="card card-lift group p-5">
                  <span className="tag tag-green mb-2">{r.category}</span>
                  <h3 className="font-heading text-h3 text-deep-green mb-2 group-hover:text-forest-green transition-colors line-clamp-2">{r.title}</h3>
                  <p className="font-body text-body-sm text-secondary-text line-clamp-2 mb-3">{r.excerpt}</p>
                  <span className="font-body text-label-xs text-forest-green flex items-center gap-1">
                    Citește <ArrowRight size={12} weight="bold" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
