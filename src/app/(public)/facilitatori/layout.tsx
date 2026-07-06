import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Facilitatori — WithIn",
  description: "Cunoaște echipa de terapeuți și practicieni somatici certificați care te ghidează spre echilibru interior.",
};

export default function FacilitatoriLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
