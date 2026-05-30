import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Practici Somatice — INAUNTRU",
  description: "70+ practici somatice ghidate de experți: respirație, mișcare, corp și voce. Disponibile oricând, pentru orice nivel.",
};

export default function PracticiLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
