"use client";

import { ReactNode } from "react";
import { UsersProvider } from "@/contexts/UsersContext";
import { AuthProvider } from "@/contexts/AuthContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UsersProvider>{children}</UsersProvider>
    </AuthProvider>
  );
}
