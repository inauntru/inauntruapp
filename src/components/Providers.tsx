"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import UsageTracker from "@/components/ui/UsageTracker";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UsageTracker />
      {children}
    </AuthProvider>
  );
}
