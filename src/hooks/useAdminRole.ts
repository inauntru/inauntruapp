"use client";

import { useState, useEffect } from "react";

export type AdminRole = "super_admin" | "editor" | "moderator";

export function useAdminRole() {
  const [role, setRole] = useState<AdminRole | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => setRole(d.role ?? "moderator"))
      .catch(() => setRole("moderator"));
  }, []);

  return {
    role,
    isSuperAdmin: role === "super_admin",
    isEditor: role === "editor" || role === "super_admin",
  };
}
