"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import UsageTracker from "@/components/ui/UsageTracker";
import DailyCheckInPrompt from "@/components/ui/DailyCheckInPrompt";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UsageTracker />
      <DailyCheckInPrompt />
      {children}
    </AuthProvider>
  );
}
