"use client";

/**
 * Library — toate imaginile urcate în proiect, într-o singură fereastră.
 * Dai click pe una ca să o folosești, sau o ștergi ca să nu ocupe spațiu degeaba.
 */

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MagnifyingGlass, Trash, CircleNotch, ImageSquare, Check } from "@phosphor-icons/react";

interface MediaFile {
  path: string;
  name: string;
  size: number;
  createdAt: string | null;
  url: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Imaginea aleasă din grilă — se pune în câmpul din care s-a deschis Library. */
  onSelect: (url: string) => void;
  /** URL-ul deja pus în câmp, ca să-l marcăm în grilă. */
  currentUrl?: string;
}

function prettySize(bytes: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryModal({ isOpen, onClose, onSelect, currentUrl }: Props) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nu am putut încărca biblioteca");
      setFiles(data.files ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nu am putut încărca biblioteca");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    setConfirming(null);
    load();
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [isOpen, load, onClose]);

  async function remove(path: string) {
    setDeleting(path);
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ștergerea a eșuat");
      setFiles((prev) => prev.filter((f) => f.path !== path));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ștergerea a eșuat");
    }
    setDeleting(null);
    setConfirming(null);
  }

  const visible = query.trim()
    ? files.filter((f) => f.name.toLowerCase().includes(query.trim().toLowerCase()))
    : files;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: "spring", damping: 28, stiffness: 340 }}
              className="pointer-events-auto bg-white rounded-2xl shadow-modal w-full max-w-3xl max-h-[86vh] flex flex-col overflow-hidden"
            >
              {/* Antet */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-sage-border">
                <div>
                  <h2 className="font-heading text-h4 text-deep-green leading-none">Library</h2>
                  <p className="font-body text-label-xs text-secondary-text mt-1">
                    {loading ? "Se încarcă..." : `${files.length} ${files.length === 1 ? "imagine" : "imagini"} în proiect`}
                  </p>
                </div>
                <div className="relative ml-auto w-48">
                  <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Caută după nume"
                    className="input w-full !pl-8 !py-2 text-body-sm"
                  />
                </div>
                <button
                  onClick={onClose}
                  aria-label="Închide"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-light-green hover:bg-sage-border transition-colors flex-shrink-0"
                >
                  <X size={16} weight="bold" className="text-secondary-text" />
                </button>
              </div>

              {/* Grilă */}
              <div className="flex-1 overflow-y-auto p-5">
                {error && <p className="font-body text-body-sm text-red-600 mb-4">{error}</p>}

                {loading ? (
                  <div className="flex items-center justify-center py-16 text-secondary-text">
                    <CircleNotch size={22} className="animate-spin" />
                  </div>
                ) : visible.length === 0 ? (
                  <div className="text-center py-16">
                    <ImageSquare size={36} className="mx-auto text-sage-border mb-3" />
                    <p className="font-body text-body-sm text-secondary-text">
                      {files.length === 0
                        ? "Nicio imagine urcată încă. Urcă una cu butonul de lângă și va apărea aici."
                        : "Nicio imagine cu numele ăsta."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {visible.map((f) => {
                      const isCurrent = currentUrl === f.url;
                      const isConfirming = confirming === f.path;
                      return (
                        <div key={f.path} className="group relative">
                          <button
                            type="button"
                            onClick={() => { onSelect(f.url); onClose(); }}
                            className={`block w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                              isCurrent ? "border-forest-green" : "border-sage-border hover:border-forest-green"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={f.url} alt={f.name} className="w-full h-full object-cover" loading="lazy" />
                          </button>

                          {isCurrent && (
                            <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-forest-green flex items-center justify-center shadow">
                              <Check size={13} weight="bold" className="text-white" />
                            </span>
                          )}

                          {/* Ștergere, cu confirmare peste imagine */}
                          {isConfirming ? (
                            <div className="absolute inset-0 rounded-xl bg-deep-green/90 flex flex-col items-center justify-center gap-2 p-3 text-center">
                              <p className="font-body text-label-xs text-white leading-snug">
                                Ștergi definitiv? Dispare de oriunde e folosită.
                              </p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => remove(f.path)}
                                  disabled={deleting === f.path}
                                  className="px-3 py-1 rounded-full bg-white text-deep-green font-body text-label-xs font-semibold"
                                >
                                  {deleting === f.path ? "..." : "Șterge"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirming(null)}
                                  className="px-3 py-1 rounded-full border border-white/50 text-white font-body text-label-xs"
                                >
                                  Nu
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirming(f.path)}
                              aria-label={`Șterge ${f.name}`}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-deep-green flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-white hover:text-red-600 transition-all shadow"
                            >
                              <Trash size={13} weight="bold" />
                            </button>
                          )}

                          <p className="font-body text-label-xs text-deep-green mt-1.5 truncate" title={f.name}>{f.name}</p>
                          <p className="font-body text-[10px] text-secondary-text">{prettySize(f.size)}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
