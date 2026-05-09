import { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#E6F5ED" }}>
      {/* Logo centrat */}
      <header className="pt-10 pb-2 flex flex-col items-center">
        <Link href="/" className="flex flex-col items-center gap-1">
          <span className="font-heading text-2xl font-bold text-deep-green tracking-wide">INAUNTRU</span>
          <span className="font-ui text-label-xs text-secondary-text uppercase tracking-widest">Liniște care începe în corp</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        {children}
      </main>

      <footer className="py-6 text-center font-body text-label-xs text-secondary-text space-x-4">
        <Link href="#" className="hover:text-forest-green transition-colors">Ajutor</Link>
        <Link href="/despre-noi" className="hover:text-forest-green transition-colors">Știința din spate</Link>
        <Link href="#" className="hover:text-forest-green transition-colors">Contact</Link>
        <span className="block mt-2 text-secondary-text/60">© 2026 INAUNTRU Digital Somatic Therapy. Toate drepturile rezervate.</span>
      </footer>
    </div>
  );
}
