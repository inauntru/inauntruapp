"use client";

/**
 * Acordul explicit pentru datele despre stare.
 *
 * Se arată o singură dată, înainte de primul check-in și de prima însemnare din
 * jurnal. Bifa e goală la deschidere și butonul rămâne inactiv până e bifată —
 * un acord prebifat nu e acord. Vezi lib/health-consent.ts pentru partea de server.
 */

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "@phosphor-icons/react";

export interface ConsentState {
  loading: boolean;
  consented: boolean;
  at: string | null;
}

/** Citește și schimbă acordul utilizatorului curent. */
export function useHealthConsent() {
  const [state, setState] = useState<ConsentState>({ loading: true, consented: false, at: null });

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/user/health-consent");
      if (!r.ok) { setState({ loading: false, consented: false, at: null }); return; }
      const d = await r.json();
      setState({ loading: false, consented: !!d.consented, at: d.at ?? null });
    } catch {
      setState({ loading: false, consented: false, at: null });
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const grant = useCallback(async () => {
    const r = await fetch("/api/user/health-consent", { method: "POST" });
    if (!r.ok) return false;
    const d = await r.json();
    setState({ loading: false, consented: true, at: d.at ?? null });
    return true;
  }, []);

  const withdraw = useCallback(async (stergeSiDatele: boolean) => {
    const r = await fetch(`/api/user/health-consent${stergeSiDatele ? "?sterge=1" : ""}`, { method: "DELETE" });
    if (!r.ok) return false;
    setState({ loading: false, consented: false, at: null });
    return true;
  }, []);

  return { ...state, refresh, grant, withdraw };
}

interface Props {
  open: boolean;
  /** Utilizatorul a bifat și a confirmat. */
  onGranted: () => void;
  /** Utilizatorul a ales să nu dea acordul acum. */
  onDismiss: () => void;
}

export default function HealthConsentModal({ open, onGranted, onDismiss }: Props) {
  const [bifat, setBifat] = useState(false);
  const [seTrimite, setSeTrimite] = useState(false);
  const [eroare, setEroare] = useState<string | null>(null);
  const { grant } = useHealthConsent();

  // La fiecare deschidere bifa pornește goală
  useEffect(() => { if (open) { setBifat(false); setEroare(null); } }, [open]);

  async function confirma() {
    if (!bifat || seTrimite) return;
    setSeTrimite(true);
    setEroare(null);
    const ok = await grant();
    setSeTrimite(false);
    if (ok) onGranted();
    else setEroare("Nu am putut salva acordul. Încearcă din nou.");
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm"
            onClick={onDismiss}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="titlu-acord"
              initial={{ opacity: 0, y: 26, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onDismiss}
                aria-label="Închide"
                className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full text-secondary-text hover:bg-light-green hover:text-forest-green transition-colors"
              >
                <X size={16} weight="bold" />
              </button>

              <div className="overflow-y-auto px-6 sm:px-8 pt-8 pb-6">
                <div className="w-11 h-11 rounded-full bg-light-green flex items-center justify-center mb-4">
                  <ShieldCheck size={22} weight="duotone" className="text-forest-green" />
                </div>

                <h2 id="titlu-acord" className="font-heading text-h4 text-deep-green mb-1.5">
                  Înainte să notezi ceva despre tine
                </h2>

                <p className="font-body font-semibold text-body-md text-deep-green mb-3">
                  Ce împărtășești aici rămâne al tău.
                </p>

                <p className="font-body text-body-sm text-secondary-text mb-4">
                  Check-in-urile și ceea ce alegi să notezi în jurnal ne ajută să facem experiența
                  WithIn mai potrivită pentru tine. Pentru a le putea păstra și folosi în acest
                  scop, avem nevoie de acordul tău.
                </p>

                <div className="rounded-xl bg-light-green/50 border border-sage-border p-4 mb-4">
                  <ul className="font-body text-body-sm text-deep-green space-y-2.5 list-disc pl-4 marker:text-forest-green">
                    <li>Le folosim pentru a-ți arăta cum te-ai simțit în timp și pentru a-ți recomanda practici potrivite pentru tine.</li>
                    <li>Ce notezi aici rămâne privat. Nu publicăm și nu folosim aceste informații pentru reclame.</li>
                    <li><strong className="font-semibold">Tu ai controlul.</strong> Îți poți retrage acordul oricând din <strong className="font-semibold">Contul meu</strong> și poți cere ștergerea datelor tale.</li>
                    <li>Poți continua să folosești WithIn și fără acest acord. Practicile rămân disponibile pentru tine.</li>
                  </ul>
                </div>

                <label
                  htmlFor="acord-stare"
                  className="flex items-start gap-3 cursor-pointer select-none rounded-xl border border-sage-border p-3.5 hover:border-forest-green transition-colors"
                >
                  <input
                    id="acord-stare"
                    type="checkbox"
                    checked={bifat}
                    onChange={(e) => setBifat(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-forest-green flex-shrink-0"
                  />
                  <span className="font-body text-body-sm text-on-surface">
                    Sunt de acord ca WithIn să păstreze și să folosească ceea ce aleg să notez
                    despre starea mea, pentru a-mi oferi o experiență mai potrivită pentru mine.
                  </span>
                </label>

                {eroare && (
                  <p className="font-body text-body-sm text-terracotta mt-3" role="alert">{eroare}</p>
                )}
              </div>

              <div className="px-6 sm:px-8 py-4 border-t border-sage-border flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
                <button onClick={onDismiss} className="btn btn-ghost">
                  Nu acum
                </button>
                <button
                  onClick={confirma}
                  disabled={!bifat || seTrimite}
                  className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {seTrimite ? "Se salvează…" : "Sunt de acord"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
