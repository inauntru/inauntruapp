import type { Metadata } from "next";
import AccesClient from "./AccesClient";

export const metadata: Metadata = {
  title: "Acces",
  robots: { index: false, follow: false },
};

export default function AccesPage() {
  return <AccesClient />;
}
