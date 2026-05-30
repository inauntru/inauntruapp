import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Prețuri — INAUNTRU",
  description: "Planuri flexibile pentru echilibru zilnic. Începe gratuit, fără card. Acces la toate practicile somatice de la 59 RON/lună.",
};

export default function PreturiLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
