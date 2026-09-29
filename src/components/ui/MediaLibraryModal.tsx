"use client";

/**
 * Library — toate imaginile urcate în proiect, într-o singură fereastră.
 * Dai click pe una ca să o folosești, o muți într-un dosar ca să nu le ai pe
 * toate la grămadă, sau o ștergi ca să nu ocupe spațiu degeaba.
 *
 * Dosarele sunt etichete, nu căi reale: mutarea unei poze NU îi schimbă adresa,
 * deci nu se strică nicăieri pe site.
 */

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MagnifyingGlass, Trash, CircleNotch, ImageSquare, Check,
  FolderSimple, FolderPlus,
} from "@phosphor-icons/react";

interface MediaFile {
  path: string;
  name: string;
  size: number;
  createdAt: string | null;
  url: string;
  folder: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Imaginea aleasă din grilă — se pune în câmpul din care s-a deschis Library. */
  onSelect: (url: string) => void;
  /** URL-ul deja pus în câmp, ca să-l marcăm în grilă. */
  currentUrl?: string;
}

const ALL = "__toate__";
const UNSORTED = "__nesortate__";

function prettySize(bytes: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryModal({ isOpen, onClose, onSelect, currentUrl }: Props) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [active, setActive] = useState<string>(ALL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  const [newFolder, setNewFolder] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nu am putut încărca biblioteca");
      setFiles(data.files ?? []);
      setFolders(data.folders ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nu am putut încărca biblioteca");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    setConfirming(null);
    setMoving(null);
    setNewFolder(null);
    setActive(ALL);
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

  async function assign(path: string, folder: string | null) {
    setMoving(null);
    setFiles((prev) => prev.map((f) => (f.path === path ? { ...f, folder } : f)));
    try {
      const res = await fetch("/api/admin/media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, folder }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Mutarea a eșuat");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mutarea a eșuat");
      load();
    }
  }

  async function createFolder(name: string) {
    const clean = name.trim();
    if (!clean) { setNewFolder(null); return; }
    try {
      const res = await fetch("/api/admin/media/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clean }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nu am putut crea dosarul");
      setFolders(data.folders ?? []);
      setActive(clean);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nu am putut crea dosarul");
    }
    setNewFolder(null);
  }

  async function deleteFolder(name: string) {
    try {
      const res = await fetch("/api/admin/media/folders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nu am putut șterge dosarul");
      setFolders(data.folders ?? []);
      setFiles((prev) => prev.map((f) => (f.folder === name ? { ...f, folder: null } : f)));
      setActive(ALL);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nu am putut șterge dosarul");
    }
  }

  const countIn = (folder: string) =>
    folder === ALL ? files.length
    : folder === UNSORTED ? files.filter((f) => !f.folder).length
    : files.filter((f) => f.folder === folder).length;

  const visible = files
    .filter((f) => (active === ALL ? true : active === UNSORTED ? !f.folder : f.folder === active))
    .filter((f) => (query.trim() ? f.name.toLowerCase().includes(query.trim().toLowerCase()) : true));

  const chipCls = (isActive: boolean) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-label-xs font-semibold border transition-colors whitespace-nowrap ${
      isActive
        ? "bg-forest-green text-white border-forest-green"
        : "bg-white text-secondary-text border-sage-border hover:border-forest-green hover:text-forest-green"
    }`;

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

              {/* Dosare */}
              <div className="px-5 py-3 border-b border-sage-border/60 flex items-center gap-2 overflow-x-auto">
                <button onClick={() => setActive(ALL)} className={chipCls(active === ALL)}>
                  Toate <span className="opacity-60">{countIn(ALL)}</span>
                </button>
                <button onClick={() => setActive(UNSORTED)} className={chipCls(active === UNSORTED)}>
                  Nesortate <span className="opacity-60">{countIn(UNSORTED)}</span>
                </button>
                {folders.map((f) => (
                  <span key={f} className="relative group/folder inline-flex">
                    <button onClick={() => setActive(f)} className={chipCls(active === f)}>
                      <FolderSimple size={13} weight={active === f ? "fill" : "regular"} />
                      {f} <span className="opacity-60">{countIn(f)}</span>
                    </button>
                    {active === f && (
                      <button
                        onClick={() => deleteFolder(f)}
                        title="Șterge dosarul (pozele rămân, trec la Nesortate)"
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white border border-sage-border text-secondary-text hover:text-terracotta flex items-center justify-center opacity-0 group-hover/folder:opacity-100 transition-opacity"
                      >
                        <X size={9} weight="bold" />
                      </button>
                    )}
                  </span>
                ))}

                {newFolder === null ? (
                  <button onClick={() => setNewFolder("")} className={`${chipCls(false)} border-dashed`}>
                    <FolderPlus size={13} /> Dosar nou
                  </button>
                ) : (
                  <input
                    autoFocus
                    value={newFolder}
                    onChange={(e) => setNewFolder(e.target.value)}
                    onBlur={() => createFolder(newFolder)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") createFolder(newFolder);
                      if (e.key === "Escape") setNewFolder(null);
                    }}
                    placeholder="Nume dosar"
                    className="px-3 py-1.5 rounded-full border border-forest-green font-body text-label-xs w-32 focus:outline-none"
                  />
                )}
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
                        : "Nicio imagine aici."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {visible.map((f) => {
                      const isCurrent = currentUrl === f.url;
                      const isConfirming = confirming === f.path;
                      const isMoving = moving === f.path;
                      return (
                        <div key={f.path} className="group relative">
                          <button
                            type="button"
                            onClick={() => { onSelect(f.url); onClose(); }}
                            className={`block w-full aspect-square rounded-xl overflow-hidden border-2 transition-all bg-light-green ${
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

                          {/* Confirmare ștergere */}
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
                          ) : isMoving ? (
                            /* Alegerea dosarului */
                            <div className="absolute inset-0 rounded-xl bg-white border-2 border-forest-green p-2 overflow-y-auto">
                              <p className="font-body text-[10px] uppercase tracking-wider text-secondary-text mb-1.5">Mută în</p>
                              <button
                                onClick={() => assign(f.path, null)}
                                className="block w-full text-left px-2 py-1 rounded font-body text-label-xs text-deep-green hover:bg-light-green"
                              >
                                Nesortate
                              </button>
                              {folders.map((folder) => (
                                <button
                                  key={folder}
                                  onClick={() => assign(f.path, folder)}
                                  className={`block w-full text-left px-2 py-1 rounded font-body text-label-xs hover:bg-light-green ${
                                    f.folder === folder ? "text-forest-green font-semibold" : "text-deep-green"
                                  }`}
                                >
                                  {folder}
                                </button>
                              ))}
                              {folders.length === 0 && (
                                <p className="px-2 py-1 font-body text-[10px] text-secondary-text">
                                  Creează întâi un dosar sus.
                                </p>
                              )}
                              <button
                                onClick={() => setMoving(null)}
                                className="block w-full text-left px-2 py-1 mt-1 rounded font-body text-[10px] text-secondary-text hover:bg-light-green"
                              >
                                Renunță
                              </button>
                            </div>
                          ) : (
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => setMoving(f.path)}
                                aria-label={`Mută ${f.name} într-un dosar`}
                                title="Mută într-un dosar"
                                className="w-7 h-7 rounded-full bg-white/90 text-deep-green flex items-center justify-center hover:bg-white hover:text-forest-green transition-all shadow"
                              >
                                <FolderSimple size={13} weight="bold" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirming(f.path)}
                                aria-label={`Șterge ${f.name}`}
                                title="Șterge definitiv"
                                className="w-7 h-7 rounded-full bg-white/90 text-deep-green flex items-center justify-center hover:bg-white hover:text-red-600 transition-all shadow"
                              >
                                <Trash size={13} weight="bold" />
                              </button>
                            </div>
                          )}

                          <p className="font-body text-label-xs text-deep-green mt-1.5 truncate" title={f.name}>{f.name}</p>
                          <p className="font-body text-[10px] text-secondary-text flex items-center gap-1">
                            {f.folder && <><FolderSimple size={9} /> {f.folder} ·</>} {prettySize(f.size)}
                          </p>
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
