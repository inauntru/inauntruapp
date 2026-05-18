"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ArrowRight } from "@phosphor-icons/react";
import AnimateIn, { StaggerChildren } from "@/components/ui/AnimateIn";
import { BLOG_POSTS } from "@/lib/mockData";

const BLOG_IMAGES = [
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80",
  "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&q=80",
  "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&q=80",
];

const CATEGORIES = ["Toate", "Educație", "Practici", "Știință", "Resurse", "Somn"];

export default function BlogPage() {
  const [posts, setPosts] = useState(BLOG_POSTS);
  const [category, setCategory] = useState("Toate");

  useEffect(() => {
    fetch("/api/blog")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPosts(data); })
      .catch(() => {});
  }, []);

  const featured = posts.find((p) => p.isFeatured) ?? posts[0];
  const filtered = posts.filter((p) => p !== featured && (category === "Toate" || p.category === category));

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Hero */}
      <section className="bg-light-green py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <div className="max-w-2xl">
              <p className="section-label">Resurse & Educație</p>
              <h1 className="font-heading text-h1 text-deep-green mb-4">Centrul de Educație Somatică</h1>
              <p className="font-body text-body-lg text-secondary-text">
                Știință somatică, practici ghidate și perspective de la facilitatorii noștri.
              </p>
            </div>
          </AnimateIn>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Featured article */}
        <AnimateIn from="bottom">
          <Link href={`/blog/${featured.slug}`} className="group block card card-lift overflow-hidden mb-10">
            <div className="grid lg:grid-cols-2">
              <div className="aspect-video lg:aspect-auto lg:min-h-[320px] overflow-hidden relative">
                <Image
                  src={`https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80`}
                  alt={featured.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="tag tag-green">Articol principal</span>
                  <span className="tag tag-outline">{featured.category}</span>
                </div>
                <h2 className="font-heading text-h2 text-deep-green mb-3 group-hover:text-forest-green transition-colors leading-snug">
                  {featured.title}
                </h2>
                <p className="font-body text-body-md text-secondary-text mb-6 leading-relaxed">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-4 text-label-xs text-secondary-text font-body">
                  <span className="font-semibold text-deep-green">{featured.author}</span>
                  <span>{new Date(featured.date).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {featured.readTime} min
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </AnimateIn>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`filter-pill flex-shrink-0 ${category === c ? "active" : ""}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Articles grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Link href={`/blog/${post.slug}`} className="group card card-lift block overflow-hidden h-full">
                  <div className="aspect-video overflow-hidden relative">
                    <Image
                      src={BLOG_IMAGES[i % 3]}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <span className="tag tag-green mb-3">{post.category}</span>
                    <h3 className="font-heading text-h3 text-deep-green mb-2 group-hover:text-forest-green transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="font-body text-body-sm text-secondary-text mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-label-xs text-secondary-text font-body">
                      <span>{post.author}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {post.readTime} min
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
