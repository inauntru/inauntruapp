import type { Metadata } from "next";
import { getSiteContent } from "@/lib/siteContent";
import PreturiClient from "./PreturiClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://withinapp.vercel.app";

export const metadata: Metadata = {
  title: "Prețuri — Abonamente Meditație Online",
  description:
    "Alege planul potrivit pentru tine: acces gratuit la practici de meditație ghidată sau planuri premium cu sesiuni LIVE și conținut exclusiv. Fără angajamente.",
  keywords: ["abonament meditație online", "meditație gratuit România", "premium wellness", "sesiuni live meditație"],
  alternates: { canonical: `${BASE_URL}/preturi` },
  openGraph: {
    title: "Prețuri — Abonamente Meditație Online | WithIn",
    description: "Acces gratuit sau premium la practici de meditație ghidată și sesiuni LIVE.",
    url: `${BASE_URL}/preturi`,
  },
};

export default async function PreturiPage() {
  const content = await getSiteContent("preturi");
  return <PreturiClient siteContent={content} />;
}
