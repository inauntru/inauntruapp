import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Despre Noi — WithIn",
  description: "Povestea WithIn — platforma de terapie somatică digitală creată din convingerea că fiecare persoană merită echilibru interior.",
};

export default function DespreNoiLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
