"use client";

/**
 * Corpul vizibil al articolului de blog — componentă client ca să poată
 * folosi `tr()` (traducere RO/EN). Datele vin normalizate din page.tsx
 * (server component: fetch Supabase + fallback mock + static params).
 */

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Calendar, BookOpen, ArrowRight } from "@phosphor-icons/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { dateLocale } from "@/lib/i18n/date";

export type NormalizedPost = {
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

interface Props {
  post: NormalizedPost;
  related: NormalizedPost[];
}

/* Textele articolului implicit (folosit când articolul nu are conținut în CMS). */
const FALLBACK_P1 =
  "Terapia somatică pornește de la premisa că experiențele noastre emoționale și traumatice nu sunt stocate doar în minte, ci și în corp. Cercetările pionierilor ca Peter Levine (Somatic Experiencing) și Bessel van der Kolk (The Body Keeps the Score) au demonstrat că sistemul nervos autonom joacă un rol central în modul în care procesăm și integrăm experiențele dificile.";
const FALLBACK_H1 = 'Ce înseamnă „somatic"?';
const FALLBACK_P2 =
  'Termenul „somatic" vine din greacă (soma = corp). În contextul terapiei, desemnează abordările care utilizează conștiința corporală, senzațiile fizice și mișcarea ca intrări principale în procesul terapeutic. Spre deosebire de terapia cognitiv-comportamentală (care lucrează cu gândurile), terapia somatică lucrează cu senzațiile din corp.';
const FALLBACK_P3 =
  "Practicile somatice includ o gamă largă de tehnici: respirație conștientă, scanarea corpului, mișcarea autentică, vocalizarea, TRE (Tension & Trauma Releasing Exercises) și altele. Fiecare dintre ele activează sistemul nervos parasimpatic, responsabil cu starea de odihnă și recuperare.";
const FALLBACK_H2 = "Cum te poate ajuta?";
const FALLBACK_P4 =
  "Studiile arată că practicile somatice sunt eficiente pentru anxietate, stres cronic, insomnie, burnout și simptome ale traumei. Un studiu publicat în 2023 în Journal of Traumatic Stress a arătat că 8 săptămâni de practică somatică zilnică au redus simptomele de anxietate cu 42% față de grupul de control.";
const FALLBACK_NOTE =
  "Practicile de pe platforma WithIn sunt instrumente de suport și nu înlocuiesc psihoterapia individuală. Dacă treci prin experiențe traumatice intense, te recomandăm să lucrezi cu un specialist calificat.";

export default function BlogPostClient({ post, related }: Props) {
  const { tr } = useLanguage();

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Back */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-secondary-text hover:text-forest-green transition-colors font-body text-body-sm">
          <ArrowLeft size={16} weight="bold" />
          {tr("Înapoi la blog")}
        </Link>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <span className="tag tag-green mb-4">{tr(post.category)}</span>
          <h1 className="font-heading text-h1 text-deep-green mb-4 leading-snug">{tr(post.title)}</h1>
          <div className="flex flex-wrap items-center gap-4 text-label-xs text-secondary-text font-body mb-6">
            <span className="font-semibold text-deep-green">{post.author}</span>
            <span>{tr(post.authorRole)}</span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(post.date).toLocaleDateString(dateLocale(), { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {post.readTime} {tr("min lectură")}
            </span>
          </div>

          {/* Hero image — poza articolului din admin; fallback decorativ dacă lipsește */}
          {post.image ? (
            <div className="aspect-video rounded-card overflow-hidden relative">
              <Image src={post.image} alt={post.title} fill className="object-cover" priority />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-forest-green/20 to-deep-green/10 rounded-card flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-forest-green/20 flex items-center justify-center">
                <BookOpen size={36} weight="regular" className="text-forest-green/50" />
              </div>
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-green max-w-none font-body text-body-md text-secondary-text leading-relaxed space-y-6">
          {post.content ? (
            /* Conținut din CMS — rămâne așa cum a fost scris. */
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <>
              <p className="text-body-lg text-on-surface font-medium">{tr(post.excerpt)}</p>

              <p>{tr(FALLBACK_P1)}</p>

              <h2 className="font-heading text-h2 text-deep-green">{tr(FALLBACK_H1)}</h2>
              <p>{tr(FALLBACK_P2)}</p>

              <p>{tr(FALLBACK_P3)}</p>

              <h2 className="font-heading text-h2 text-deep-green">{tr(FALLBACK_H2)}</h2>
              <p>{tr(FALLBACK_P4)}</p>

              <div className="bg-light-green border border-sage-border rounded-card p-6">
                <p className="font-heading text-h3 text-forest-green mb-2">{tr("Notă importantă")}</p>
                <p className="font-body text-body-sm text-secondary-text">{tr(FALLBACK_NOTE)}</p>
              </div>
            </>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-sage-border">
          {post.tags.map((tag) => (
            <span key={tag} className="tag tag-outline">{tr(tag)}</span>
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
              <p className="font-body text-label-xs text-secondary-text">{tr(post.authorRole || "Facilitator")} {tr("la WithIn")}</p>
            </div>
          </div>
        )}
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="py-12 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-h2 text-deep-green mb-6">{tr("Citește și")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="card card-lift group p-5">
                  <span className="tag tag-green mb-2">{tr(r.category)}</span>
                  <h3 className="font-heading text-h3 text-deep-green mb-2 group-hover:text-forest-green transition-colors line-clamp-2">{tr(r.title)}</h3>
                  <p className="font-body text-body-sm text-secondary-text line-clamp-2 mb-3">{tr(r.excerpt)}</p>
                  <span className="font-body text-label-xs text-forest-green flex items-center gap-1">
                    {tr("Citește")} <ArrowRight size={12} weight="bold" />
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
