"use client";

/**
 * Gardian de sesiune pentru admin: dacă tokenul a expirat (sesiunea durează
 * 24h), utilizatorul e dus la login cu un mesaj clar — în loc să primească
 * „Unauthorized" criptic la salvare, cu riscul de a-și pierde modificările.
 *
 * Verifică la deschidere, la fiecare 2 minute și de câte ori revii pe tab.
 */

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminSessionGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin/login") return;
    let active = true;

    async function check() {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store" });
        if (active && res.status === 401) {
          router.replace("/admin/login?expired=1");
        }
      } catch { /* offline — nu deranjăm */ }
    }

    check();
    const interval = setInterval(check, 2 * 60 * 1000);
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);
    return () => { active = false; clearInterval(interval); window.removeEventListener("focus", onFocus); };
  }, [pathname, router]);

  return null;
}
