"use client";

import { useState, useEffect } from "react";
import { CaretDown } from "@phosphor-icons/react";

export const PHONE_PREFIXES = [
  { code: "+40",  label: "🇷🇴 România",       short: "+40" },
  { code: "+373", label: "🇲🇩 Moldova",       short: "+373" },
  { code: "+44",  label: "🇬🇧 Marea Britanie", short: "+44" },
  { code: "+49",  label: "🇩🇪 Germania",      short: "+49" },
  { code: "+33",  label: "🇫🇷 Franța",        short: "+33" },
  { code: "+39",  label: "🇮🇹 Italia",        short: "+39" },
  { code: "+34",  label: "🇪🇸 Spania",        short: "+34" },
  { code: "+43",  label: "🇦🇹 Austria",       short: "+43" },
  { code: "+32",  label: "🇧🇪 Belgia",        short: "+32" },
  { code: "+31",  label: "🇳🇱 Olanda",        short: "+31" },
  { code: "+41",  label: "🇨🇭 Elveția",       short: "+41" },
  { code: "+1",   label: "🇺🇸 SUA / Canada",  short: "+1" },
];

/** Desparte un număr complet (+40712345678) în prefix + număr local afișabil (0712345678). */
export function splitPhone(full: string): { prefix: string; number: string } {
  if (!full) return { prefix: "+40", number: "" };
  const match = PHONE_PREFIXES
    .map(p => p.code)
    .sort((a, b) => b.length - a.length)
    .find(c => full.startsWith(c));
  if (!match) return { prefix: "+40", number: full.replace(/^\+/, "") };
  let rest = full.slice(match.length);
  // Pentru România afișăm forma obișnuită cu 0 în față (07...)
  if (match === "+40" && rest.startsWith("7")) rest = "0" + rest;
  return { prefix: match, number: rest };
}

/** Combină prefix + număr local în format internațional: 07XX... + +40 → +407XX... */
export function combinePhone(prefix: string, number: string): string {
  const digits = number.replace(/\D/g, "").replace(/^0/, "");
  return digits ? `${prefix}${digits}` : "";
}

export function isValidPhone(prefix: string, number: string): boolean {
  const digits = number.replace(/\D/g, "").replace(/^0/, "");
  if (!digits) return false;
  if (prefix === "+40") return /^7\d{8}$/.test(digits); // mobil românesc
  return /^\d{6,12}$/.test(digits);
}

interface Props {
  value: string;                    // numărul complet, normalizat (+40712345678)
  onChange: (full: string) => void;
  inputClassName?: string;
}

export default function PhoneInput({ value, onChange, inputClassName = "input" }: Props) {
  const initial = splitPhone(value);
  const [prefix, setPrefix] = useState(initial.prefix);
  const [number, setNumber] = useState(initial.number);

  // Sincronizează când valoarea vine din exterior (ex. profilul se încarcă târziu)
  useEffect(() => {
    if (combinePhone(prefix, number) === value) return;
    const next = splitPhone(value);
    setPrefix(next.prefix);
    setNumber(next.number);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function update(nextPrefix: string, nextNumber: string) {
    setPrefix(nextPrefix);
    setNumber(nextNumber);
    onChange(combinePhone(nextPrefix, nextNumber));
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-shrink-0">
        <select
          value={prefix}
          onChange={e => update(e.target.value, number)}
          className={`${inputClassName} w-[5.5rem] pr-7 cursor-pointer appearance-none`}
          aria-label="Prefix țară"
        >
          {PHONE_PREFIXES.map(p => (
            <option key={p.code} value={p.code}>{p.short}</option>
          ))}
        </select>
        <CaretDown size={11} weight="bold" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none" />
      </div>
      <input
        type="tel"
        value={number}
        onChange={e => update(prefix, e.target.value)}
        placeholder={prefix === "+40" ? "07XX XXX XXX" : "Număr de telefon"}
        autoComplete="tel-national"
        className={`${inputClassName} flex-1`}
      />
    </div>
  );
}
