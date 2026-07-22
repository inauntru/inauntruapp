"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Contorizează timpul petrecut în platformă: cât timp tab-ul e vizibil
 * și utilizatorul e logat, trimite un heartbeat de 1 minut la fiecare minut.
 * Nu redă nimic vizual.
 */
export default function UsageTracker() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes: 1 }),
        keepalive: true,
      }).catch(() => {});
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  return null;
}
