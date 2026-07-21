import type { Metadata } from "next";
import { getSiteContent } from "@/lib/siteContent";
import FacilitatoriClient from "./FacilitatoriClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://withinapp.vercel.app";

export const metadata: Metadata = {
  title: "Facilitatori — Experți în Meditație și Mindfulness",
  description:
    "Cunoaște facilitatorii WithIn: specialiști în meditație ghidată, respirație somatică și mindfulness din România. Sesiuni ghidate cu experți certificați în wellness.",
  keywords: ["facilitator meditație", "instructor mindfulness România", "terapeut wellness online", "expert respirație"],
  alternates: { canonical: `${BASE_URL}/facilitatori` },
  openGraph: {
    title: "Facilitatori — Experți în Meditație și Mindfulness | WithIn",
    description: "Specialiști în meditație ghidată și wellness din România.",
    url: `${BASE_URL}/facilitatori`,
  },
};

export default async function FacilitatoriPage() {
  const content = await getSiteContent("facilitatori");
  return <FacilitatoriClient siteContent={content} />;
}
