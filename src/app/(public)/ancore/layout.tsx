import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Ancore — INAUNTRU",
  description: "55 de exerciții de reglare emoțională pentru orice moment al zilei. Găsește ancora potrivită stării tale în mai puțin de 30 de secunde.",
};

export default function AncoreLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
