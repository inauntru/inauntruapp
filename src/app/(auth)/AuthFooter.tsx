"use client";

/** Footerul paginilor de autentificare — client ca să poată folosi `tr()`. */

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AuthFooter() {
  const { tr } = useLanguage();

  return (
    <footer className="py-6 text-center font-body text-label-xs text-secondary-text space-x-4">
      <Link href="#" className="hover:text-forest-green transition-colors">{tr("Ajutor")}</Link>
      <Link href="/despre-noi" className="hover:text-forest-green transition-colors">{tr("Știința din spate")}</Link>
      <Link href="#" className="hover:text-forest-green transition-colors">{tr("Contact")}</Link>
      <span className="block mt-2 text-secondary-text/60">
        {tr("© 2026 WithIn Digital Somatic Therapy. Toate drepturile rezervate.")}
      </span>
    </footer>
  );
}
