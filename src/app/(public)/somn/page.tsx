import type { Metadata } from "next";
import { getSiteContent } from "@/lib/siteContent";
import SomnClient from "./SomnClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://withinapp.ro";

export const metadata: Metadata = {
  title: "Somn — Sunete și Practici pentru Seri Liniștite",
  description:
    "Sunete, muzică și practici blânde pentru serile în care corpul s-a oprit, dar mintea încă nu. Ritualuri de adormire, NSDR și sunete pentru toată noaptea.",
  keywords: [
    "sunete pentru somn",
    "practici adormire",
    "NSDR somn",
    "ritual de seară",
    "muzică pentru somn",
    "insomnie tehnici",
  ],
  alternates: { canonical: `${BASE_URL}/somn` },
  openGraph: {
    title: "Somn — Lasă ziua să se încheie | WithIn",
    description: "Sunete, muzică și practici blânde pentru serile în care corpul s-a oprit, dar mintea încă nu.",
    url: `${BASE_URL}/somn`,
  },
};

export default async function SomnPage() {
  const siteContent = await getSiteContent("somn");
  return <SomnClient siteContent={siteContent} />;
}
