import type { Metadata } from "next";
import { getSiteContent } from "@/lib/siteContent";
import SesiuniLiveClient from "./SesiuniLiveClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://withinapp.vercel.app";

export const metadata: Metadata = {
  title: "Sesiuni LIVE de Meditație și Mindfulness",
  description:
    "Sesiuni de meditație ghidată în timp real cu facilitatori certificați. Grupuri mici, interacțiune directă. Rezervă-ți locul la sesiunile de meditație și respirație online.",
  keywords: ["sesiuni meditație online", "meditație ghidată live", "grup meditație online România", "yoga online"],
  alternates: { canonical: `${BASE_URL}/sesiuni-live` },
  openGraph: {
    title: "Sesiuni LIVE de Meditație și Mindfulness | WithIn",
    description: "Meditație ghidată în timp real cu facilitatori certificați. Rezervă-ți locul acum.",
    url: `${BASE_URL}/sesiuni-live`,
  },
};

export default async function SesiuniLivePage() {
  const content = await getSiteContent("sesiuni_live");
  return <SesiuniLiveClient siteContent={content} />;
}
