import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Inspirație & Educație Somatică — INAUNTRU",
  description: "Articole, ghiduri și resurse despre terapie somatică, respirație, somn și echilibru interior. Scrise de facilitatorii noștri.",
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
