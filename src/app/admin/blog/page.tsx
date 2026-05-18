"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Trash, PencilSimple, CircleNotch, Check, Warning,
  Article, MagnifyingGlass, Eye, EyeSlash as EyeSlashIcon,
} from "@phosphor-icons/react";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor"), { ssr: false });

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  author: string | null;
  category: string | null;
  tags: string[];
  image_url: string | null;
  read_time: number | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

const CATEGORIES = ["Sănătate somatică", "Respirație", "Mindfulness", "Mișcare", "Stres & Anxietate", "Somn", "Relații", "Altele"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" });
}

function slugify(title: string) {
  return title.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

const EMPTY_FORM = { title: "", slug: "", excerpt: "", content: "", author: "", category: "", tags: "", image_url: "", read_time: "", published: false };

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Toate");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  async function fetchPosts() {
    setLoading(true);
    const res = await fetch("/api/admin/blog");
    const data = await res.json();
    setPosts(data.posts ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchPosts(); }, []);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowModal(true);
  }

  function openEdit(post: BlogPost) {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      author: post.author ?? "",
      category: post.category ?? "",
      tags: post.tags?.join(", ") ?? "",
      image_url: post.image_url ?? "",
      read_time: post.read_time?.toString() ?? "",
      published: post.published,
    });
    setError(null);
    setShowModal(true);
  }

  function upd(field: string, value: string | boolean) {
    setForm((f) => {
      const updated = { ...f, [field]: value };
      if (field === "title" && !editing) updated.slug = slugify(value as string);
      return updated;
    });
  }

  async function handleSave() {
    if (!form.title.trim()) { setError("Titlul este obligatoriu"); return; }
    setSaving(true); setError(null);
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt || null,
      content: form.content || null,
      author: form.author || null,
      category: form.category || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      image_url: form.image_url || null,
      read_time: form.read_time ? parseInt(form.read_time) : null,
      published: form.published,
    };

    const url = editing ? `/api/admin/blog/${editing.id}` : "/api/admin/blog";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Eroare"); setSaving(false); return; }
    await fetchPosts();
    setSaving(false);
    setShowModal(false);
  }

  async function handleDelete(post: BlogPost) {
    await fetch(`/api/admin/blog/${post.id}`, { method: "DELETE" });
    setPosts((p) => p.filter((b) => b.id !== post.id));
    setDeleteTarget(null);
  }

  const filtered = posts.filter((p) => {
    if (filter === "Publicate" && !p.published) return false;
    if (filter === "Draft" && p.published) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const labelCls = "font-body text-label-xs text-secondary-text uppercase tracking-widest block mb-1.5";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-h2 text-deep-green">Blog</h1>
          <p className="font-body text-body-sm text-secondary-text">{posts.length} articole total</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary btn-sm gap-1.5">
          <Plus size={14} weight="bold" /> Articol nou
        </button>
      </div>

      {/* Filters */}
      <div className="card bg-white p-4 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
          <input type="search" placeholder="Caută articol..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full border border-sage-border text-body-sm font-body focus:outline-none focus:border-forest-green" />
        </div>
        <div className="flex gap-2">
          {["Toate", "Publicate", "Draft"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`filter-pill ${filter === f ? "active" : ""}`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Posts grid */}
      {loading ? (
        <div className="flex justify-center py-16"><CircleNotch size={24} className="animate-spin text-forest-green" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Article size={48} className="text-sage-border mb-4" />
          <p className="font-body font-semibold text-body-md text-deep-green mb-1">
            {posts.length === 0 ? "Niciun articol publicat" : "Niciun rezultat"}
          </p>
          <p className="font-body text-label-xs text-secondary-text mb-4">
            {posts.length === 0 ? "Creează primul articol pentru blog." : "Schimbă filtrele."}
          </p>
          {posts.length === 0 && <button onClick={openAdd} className="btn btn-primary btn-sm"><Plus size={14} weight="bold" /> Articol nou</button>}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((post) => (
            <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card bg-white p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`tag text-[10px] ${post.published ? "bg-forest-green/10 text-forest-green border-forest-green/20 border" : "tag-outline"}`}>
                      {post.published ? "Publicat" : "Draft"}
                    </span>
                    {post.category && <span className="tag tag-outline text-[10px]">{post.category}</span>}
                  </div>
                  <h3 className="font-body font-semibold text-body-sm text-deep-green line-clamp-2">{post.title}</h3>
                </div>
              </div>
              {post.excerpt && <p className="font-body text-label-xs text-secondary-text line-clamp-2">{post.excerpt}</p>}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-sage-border/40">
                <p className="font-body text-[10px] text-secondary-text">{formatDate(post.created_at)}{post.author ? ` · ${post.author}` : ""}</p>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(post)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-light-green text-secondary-text hover:text-forest-green transition-colors">
                    <PencilSimple size={13} />
                  </button>
                  <button onClick={() => setDeleteTarget(post)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-secondary-text hover:text-terracotta transition-colors">
                    <Trash size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center lg:pl-64 p-4">
            <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} />
            <motion.div
              className="relative bg-white rounded-2xl shadow-modal w-full max-w-3xl max-h-[92vh] flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-sage-border">
                <h3 className="font-heading text-h3 text-deep-green">{editing ? "Editează articol" : "Articol nou"}</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green"><X size={16} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl font-body text-label-xs text-red-600 flex gap-2"><Warning size={14} className="flex-shrink-0 mt-0.5" />{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Titlu *</label>
                    <input className="input w-full" value={form.title} onChange={(e) => upd("title", e.target.value)} placeholder="Titlul articolului" />
                  </div>
                  <div>
                    <label className={labelCls}>Slug URL</label>
                    <input className="input w-full" value={form.slug} onChange={(e) => upd("slug", e.target.value)} placeholder="titlul-articolului" />
                  </div>
                  <div>
                    <label className={labelCls}>Autor</label>
                    <input className="input w-full" value={form.author} onChange={(e) => upd("author", e.target.value)} placeholder="Nume autor" />
                  </div>
                  <div>
                    <label className={labelCls}>Categorie</label>
                    <select className="input w-full" value={form.category} onChange={(e) => upd("category", e.target.value)}>
                      <option value="">— Alege —</option>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Timp citire (min)</label>
                    <input type="number" className="input w-full" value={form.read_time} onChange={(e) => upd("read_time", e.target.value)} placeholder="5" min={1} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>URL imagine copertă</label>
                    <input className="input w-full" value={form.image_url} onChange={(e) => upd("image_url", e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Rezumat scurt</label>
                    <textarea className="input w-full min-h-[70px]" value={form.excerpt} onChange={(e) => upd("excerpt", e.target.value)} placeholder="Scurtă descriere a articolului..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Tag-uri (separate prin virgulă)</label>
                    <input className="input w-full" value={form.tags} onChange={(e) => upd("tags", e.target.value)} placeholder="mindfulness, respirație, stres" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Conținut articol</label>
                    <RichTextEditor
                      content={form.content}
                      onChange={(html) => upd("content", html)}
                      placeholder="Scrie conținutul articolului..."
                      minHeight="260px"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-light-green/50 transition-colors border border-sage-border">
                  <input type="checkbox" checked={form.published} onChange={(e) => upd("published", e.target.checked)} className="w-4 h-4 accent-forest-green" />
                  <div className="flex items-center gap-2">
                    {form.published ? <Eye size={15} className="text-forest-green" /> : <EyeSlashIcon size={15} className="text-secondary-text" />}
                    <span className="font-body text-body-sm text-on-surface">{form.published ? "Publicat — vizibil pe site" : "Draft — nu este vizibil"}</span>
                  </div>
                </label>
              </div>

              <div className="p-5 border-t border-sage-border flex gap-3">
                <button onClick={() => setShowModal(false)} disabled={saving} className="btn btn-ghost flex-1">Anulează</button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1 gap-2">
                  {saving ? <CircleNotch size={13} className="animate-spin" /> : <Check size={13} weight="bold" />}
                  {saving ? "Se salvează..." : (editing ? "Salvează modificările" : "Publică articolul")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center lg:pl-64 p-4">
            <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteTarget(null)} />
            <motion.div className="relative bg-white rounded-2xl shadow-modal w-full max-w-sm p-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><Warning size={18} className="text-red-600" weight="fill" /></div>
                <div><h3 className="font-heading text-h3 text-deep-green">Șterge articolul</h3><p className="font-body text-label-xs text-secondary-text">Acțiune ireversibilă</p></div>
              </div>
              <p className="font-body text-body-sm text-on-surface mb-5">Ești sigur că vrei să ștergi <strong>{deleteTarget.title}</strong>?</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost btn-sm flex-1">Anulează</button>
                <button onClick={() => handleDelete(deleteTarget)} className="flex-1 h-9 rounded-full bg-red-600 text-white font-ui font-semibold text-label-xs uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-red-700">
                  <Trash size={13} /> Șterge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
