"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileStickyBar() {
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    if (!isHomePage) {
      setVisible(true);
      return;
    }
    const onScroll = () => {
      setVisible(window.scrollY < window.innerHeight * 0.85);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomePage]);

  if (!visible) return null;

  return (
    <div className="md:hidden mobile-sticky-bar">
      <Link
        href="/register"
        className="btn btn-primary w-full text-center flex items-center justify-center"
      >
        Începe gratuit
      </Link>
    </div>
  );
}
