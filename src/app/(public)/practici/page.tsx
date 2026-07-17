export const dynamic = 'force-dynamic'
import type { Metadata } from "next";
import { getSiteContent } from "@/lib/siteContent";
import PracticiClient from "./PracticiClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://withinapp.vercel.app";

export const metadata: Metadata = {
  title: "Practici de Meditație Ghidată și Respirație",
  description:
    "Biblioteca de practici somatice ghidate: meditație, exerciții de respirație, tehnici de relaxare și mindfulness pentru stres, anxietate și somn. Audio și video, pentru orice nivel.",
  keywords: [
    "meditație ghidată",
    "exerciții de respirație",
    "tehnici de relaxare",
    "practici somatice",
    "meditație pentru stres",
    "meditație pentru somn",
    "mindfulness exerciții",
  ],
  alternates: { canonical: `${BASE_URL}/practici` },
  openGraph: {
    title: "Practici de Meditație Ghidată și Respirație | WithIn",
    description: "Meditație ghidată, exerciții de respirație și practici somatice pentru stres și anxietate.",
    url: `${BASE_URL}/practici`,
  },
};

export default async function PracticiPage() {
  const content = await getSiteContent("practici");
  return <PracticiClient siteContent={content} />;
}
