"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ChartPieSlice,
  FilmSlate,
  Users,
  CalendarBlank,
  CreditCard,
  ChartLine,
  GearSix,
  SignOut,
  List,
  X,
  Leaf,
  EnvelopeSimple,
  Article,
  Anchor,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { icon: ChartPieSlice, label: "Dashboard", href: "/admin", id: "dashboard" },
  { icon: FilmSlate, label: "Conținut", href: "/admin/continut", id: "continut" },
  { icon: Article, label: "Blog", href: "/admin/blog", id: "blog" },
  { icon: Anchor, label: "Ancore", href: "/admin/ancore", id: "ancore" },
  { icon: Users, label: "Utilizatori", href: "/admin/utilizatori", id: "utilizatori" },
  { icon: CalendarBlank, label: "Sesiuni LIVE", href: "/admin/sesiuni", id: "sesiuni" },
  { icon: CreditCard, label: "Abonamente", href: "/admin/abonamente", id: "abonamente" },
  { icon: EnvelopeSimple, label: "Emailuri", href: "/admin/emailuri", id: "emailuri" },
  { icon: ChartLine, label: "Statistici", href: "/admin/statistici", id: "statistici" },
  { icon: GearSix, label: "Setări", href: "/admin/setari", id: "setari" },
];

type Permissions = Record<string, Record<string, boolean>>;

function NavItem({ item, isActive }: { item: typeof NAV_ITEMS[0]; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-body text-body-sm group ${
        isActive
          ? "bg-forest-green text-white shadow-sm"
          : "text-white/50 hover:text-white hover:bg-white/10"
      }`}
    >
      <Icon size={18} weight={isActive ? "fill" : "regular"} />
      <span className="font-medium">{item.label}</span>
    </Link>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState<string>("super_admin");
  const [permissions, setPermissions] = useState<Permissions>({});

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => setRole(d.role ?? "moderator"))
      .catch(() => {});
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => { if (d.admin_permissions) setPermissions(d.admin_permissions); })
      .catch(() => {});
  }, []);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (role === "super_admin") return true;
    const perms = permissions[role] ?? {};
    return perms[item.id] === true;
  });

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pb-6 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-forest-green rounded-full flex items-center justify-center">
            <Leaf size={13} weight="fill" className="text-white" />
          </div>
          <div>
            <span className="font-heading font-bold text-base text-white block leading-tight">INAUNTRU</span>
            <span className="font-body text-[10px] text-white/40 uppercase tracking-widest">Admin</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleItems.map((item) => (
          <NavItem key={item.href} item={item} isActive={isActive(item.href)} />
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            window.location.href = "/admin/login";
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 font-body text-body-sm"
        >
          <SignOut size={18} weight="regular" />
          <span className="font-medium">Deconectare</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-deep-green border-r border-white/10 py-6 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile: top bar with hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-deep-green border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-forest-green rounded-full flex items-center justify-center">
            <Leaf size={11} weight="fill" className="text-white" />
          </div>
          <span className="font-heading font-bold text-base text-white">INAUNTRU Admin</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <List size={20} weight="regular" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-deep-green py-6"
            >
              <div className="flex items-center justify-between px-5 mb-6">
                <span className="font-heading font-bold text-base text-white">Admin Panel</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
