"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  List,
  X,
  User,
  BookOpen,
  Video,
  Users,
  CurrencyCircleDollar,
  Newspaper,
  Info,
} from "@phosphor-icons/react";

const NAV_LINKS = [
  { href: "/practici", label: "Practici", icon: BookOpen },
  { href: "/sesiuni-live", label: "Sesiuni Live", icon: Video },
  { href: "/facilitatori", label: "Facilitatori", icon: Users },
  { href: "/preturi", label: "Prețuri", icon: CurrencyCircleDollar },
  { href: "/blog", label: "Inspirație", icon: Newspaper },
  { href: "/despre-noi", label: "Despre noi", icon: Info },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    if (!isHomePage) { setScrolled(true); return; }
    const onScroll = () => {
      const vh = window.innerHeight;
      // Hysteresis: switch to opaque later (80%), back to glass earlier (50%)
      // prevents flickering at the boundary when bouncing on mobile
      setScrolled((prev) => {
        if (!prev && window.scrollY > vh * 0.8) return true;
        if (prev && window.scrollY < vh * 0.5) return false;
        return prev;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomePage]);

  // true = over hero video, show glass transparent
  const glass = isHomePage && !scrolled;

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          glass
            ? "bg-white/5 backdrop-blur-md border-b border-white/10 shadow-none"
            : "bg-nav-bg border-b border-nav-border shadow-nav"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-forest-green rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-white text-xs font-heading font-bold">I</span>
              </div>
              <span className={`font-heading font-bold text-xl tracking-tight transition-colors duration-500 ${glass ? "text-white" : "text-deep-green"}`}>
                INAUNTRU
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 font-body text-body-sm font-medium rounded-full transition-all duration-200 ${
                      glass
                        ? isActive
                          ? "text-white bg-white/15"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                        : isActive
                          ? "text-forest-green bg-light-green"
                          : "text-secondary-text hover:text-deep-green hover:bg-light-green/60"
                    }`}
                  >
                    {link.label}
                    {isActive && !glass && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute inset-0 bg-light-green rounded-full -z-10"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* CTA buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/login"
                className={`btn btn-sm transition-all duration-500 ${
                  glass
                    ? "text-white/90 border border-white/30 hover:bg-white/10 bg-transparent"
                    : "btn-ghost"
                }`}
              >
                <User size={16} weight="regular" />
                Spațiul meu
              </Link>
              <Link href="/register" className="btn btn-indigo btn-sm">
                Începe călătoria
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className={`lg:hidden flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                glass ? "text-white hover:bg-white/10" : "text-deep-green hover:bg-light-green"
              }`}
              onClick={() => setMobileOpen(true)}
              aria-label="Deschide meniu"
            >
              <List size={24} weight="regular" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-white shadow-modal flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-sage-border">
                <span className="font-heading font-bold text-lg text-deep-green">INAUNTRU</span>
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-light-green transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <X size={20} weight="regular" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-6 px-4">
                {NAV_LINKS.map((link, i) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 font-body font-medium transition-all ${
                          isActive
                            ? "bg-light-green text-forest-green"
                            : "text-secondary-text hover:bg-light-green/60 hover:text-deep-green"
                        }`}
                      >
                        <Icon size={20} weight="regular" />
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-sage-border space-y-3">
                <Link href="/login" className="btn btn-ghost w-full">
                  <User size={18} weight="regular" />
                  Spațiul meu
                </Link>
                <Link href="/register" className="btn btn-indigo w-full">
                  Începe călătoria
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
