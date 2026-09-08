"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import UsageTracker from "@/components/ui/UsageTracker";
import DailyCheckInPrompt from "@/components/ui/DailyCheckInPrompt";
import BreathingPrompt from "@/components/ui/BreathingPrompt";
import RecoveryRedirect from "@/components/ui/RecoveryRedirect";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <UsageTracker />
        <DailyCheckInPrompt />
        <BreathingPrompt />
        <RecoveryRedirect />
        {children}
      </LanguageProvider>
    </AuthProvider>
  );
}
