import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-main">
      {/* Logo centrat */}
      <header className="pt-10 pb-2 flex flex-col items-center">
        <Link href="/" className="flex flex-col items-center">
          <Image src="/logo-vertical.png" alt="WithIn" width={120} height={103} className="object-contain" priority />
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
