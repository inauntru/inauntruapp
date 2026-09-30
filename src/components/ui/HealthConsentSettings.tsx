"use client";

/**
 * Secțiunea din Contul meu prin care acordul pentru datele despre stare poate fi
 * dat sau retras. Politica de confidențialitate promite că retragerea e posibilă
 * oricând, deci trebuie să existe și în interfață, nu doar în text.
 *
 * La retragere întrebăm separat dacă se șterg și datele deja înregistrate:
 * retragerea oprește prelucrările viitoare, ștergerea e o cerere distinctă.
 */

import { useState } from "react";
import { ShieldCheck, Warning } from "@phosphor-icons/react";
import { useHealthConsent } from "@/components/ui/HealthConsentModal";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HealthConsentSettings() {
  const { tr } = useLanguage();
  const { loading, consented, at, grant, withdraw } = useHealthConsent();
  const [confirmDeschis, setConfirmDeschis] = useState(false);
  const [stergeSiDatele, setStergeSiDatele] = useState(false);
  const [lucreaza, setLucreaza] = useState(false);

  const dataAcordului = at
    ? new Date(at).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })
    : null;

  async function retrage() {
    setLucreaza(true);
    await withdraw(stergeSiDatele);
    setLucreaza(false);
    setConfirmDeschis(false);
    setStergeSiDatele(false);
  }

  async function dauAcordul() {
    setLucreaza(true);
    await grant();
    setLucreaza(false);
  }

  return (
    <div className="space-y-4 pb-8 border-b border-sage-border/40">
      <h3 className="font-body font-semibold text-body-md text-deep-green">
        {tr("Datele despre starea ta")}
      </h3>
      <p className="font-body text-body-sm text-secondary-text">
        {tr("Ce notezi la check-in și ce scrii în jurnal sunt date despre sănătatea ta. Le păstrăm doar cu acordul tău explicit, pe care îl poți retrage oricând.")}
      </p>

      {loading ? (
        <p className="font-body text-body-sm text-secondary-text">{tr("Se verifică…")}</p>
      ) : consented ? (
        <>
          <div className="flex items-start gap-2.5 rounded-xl bg-light-green/50 border border-sage-border p-3.5">
            <ShieldCheck size={18} weight="duotone" className="text-forest-green flex-shrink-0 mt-0.5" />
            <p className="font-body text-body-sm text-deep-green">
              {tr("Acord activ")}
              {dataAcordului ? ` — ${tr("dat pe")} ${dataAcordului}` : ""}.{" "}
              {tr("Check-in-ul și jurnalul funcționează.")}
            </p>
          </div>
          <button
            onClick={() => setConfirmDeschis(true)}
            className="flex items-center gap-2 h-9 px-5 rounded-full border border-sage-border text-secondary-text font-ui font-semibold text-label-xs uppercase tracking-wide hover:border-forest-green hover:text-forest-green transition-colors"
          >
            {tr("Retrage acordul")}
          </button>
        </>
      ) : (
        <>
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3.5">
            <Warning size={18} weight="duotone" className="text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="font-body text-body-sm text-amber-900">
              {tr("Nu ai dat acordul. Check-in-ul și jurnalul rămân oprite; restul platformei funcționează normal.")}
            </p>
          </div>
          <button
            onClick={dauAcordul}
            disabled={lucreaza}
            className="btn btn-primary btn-sm disabled:opacity-50"
          >
            {lucreaza ? tr("Se salvează…") : tr("Îmi dau acordul")}
          </button>
        </>
      )}

      {confirmDeschis && (
        <div className="rounded-xl border border-sage-border bg-white p-4 space-y-3">
          <p className="font-body text-body-sm text-on-surface">
            {tr("După retragere nu vei mai putea adăuga check-in-uri sau însemnări, până când dai din nou acordul.")}
          </p>
          <label htmlFor="sterge-date-stare" className="flex items-start gap-3 cursor-pointer select-none">
            <input
              id="sterge-date-stare"
              type="checkbox"
              checked={stergeSiDatele}
              onChange={(e) => setStergeSiDatele(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-forest-green flex-shrink-0"
            />
            <span className="font-body text-body-sm text-secondary-text">
              {tr("Șterge și tot ce am notat până acum. Această parte nu poate fi anulată.")}
            </span>
          </label>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={retrage}
              disabled={lucreaza}
              className="flex items-center gap-2 h-9 px-5 rounded-full border border-red-200 text-red-600 font-ui font-semibold text-label-xs uppercase tracking-wide hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {lucreaza ? tr("Se aplică…") : tr("Confirmă retragerea")}
            </button>
            <button
              onClick={() => { setConfirmDeschis(false); setStergeSiDatele(false); }}
              className="btn btn-ghost btn-sm"
            >
              {tr("Renunță")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
