export const dynamic = 'force-dynamic'
import type { Metadata } from "next";
import { getSiteContent } from "@/lib/siteContent";
import AncoreClient from "./AncoreClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://withinapp.vercel.app";

export const metadata: Metadata = {
  title: "Ancore — Tehnici Rapide de Revenire la Prezent",
  description:
    "Ancore senzoriale și exerciții de respirație pentru momente de stres, anxietate sau copleșire. Tehnici rapide de 1-3 minute pentru a te reconecta cu prezentul.",
  keywords: [
    "tehnici anxietate rapide",
    "exerciții respirație stres",
    "grounding tehnici",
    "revenire prezent meditație",
    "panic attack tehnici",
    "mindfulness 2 minute",
  ],
  alternates: { canonical: `${BASE_URL}/ancore` },
  openGraph: {
    title: "Ancore — Tehnici Rapide de Revenire la Prezent | WithIn",
    description: "Exerciții de respirație și tehnici senzoriale pentru stres și anxietate. Sub 3 minute.",
    url: `${BASE_URL}/ancore`,
  },
};

export default async function AncorePage() {
  const content = await getSiteContent("ancore");
  return <AncoreClient siteContent={content} />;
}
