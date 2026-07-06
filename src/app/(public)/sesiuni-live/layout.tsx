import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sesiuni Live — WithIn",
  description: "Conectează-te în timp real cu facilitatorii noștri certificați. Cercuri de vindecare și workshop-uri interactive săptămânale.",
};

export default function SesiuniLiveLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
