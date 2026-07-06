import { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-main">
      {/* Logo centrat */}
      <header className="pt-10 pb-2 flex flex-col items-center">
        <Link href="/" className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="text-forest-green">
              <path d="M28,16 A12,12 0 1,1 22,5.6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            <span className="font-heading text-2xl text-deep-green tracking-wide">With<span className="font-bold text-forest-green">In</span></span>
          </div>
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
        <span className="block mt-2 text-secondary-text/60">© 2026 WithIn Digital Somatic Therapy. Toate drepturile rezervate.</span>
      </footer>
    </div>
  );
}
