import type { Metadata } from "next";
import { getSiteContent } from "@/lib/siteContent";
import DespreNoiClient from "./DespreNoiClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://withinapp.vercel.app";

export const metadata: Metadata = {
  title: "Despre Noi — Misiunea WithIn",
  description:
    "WithIn este o platformă de meditație ghidată și mindfulness din România. Misiunea noastră: să facem tehnicile de echilibru interior accesibile tuturor, în mai puțin de 2 minute.",
  alternates: { canonical: `${BASE_URL}/despre-noi` },
  openGraph: {
    title: "Despre Noi — Misiunea WithIn",
    description: "Platforma de meditație ghidată și wellness din România. Practici accesibile pentru echilibrul tău interior.",
    url: `${BASE_URL}/despre-noi`,
  },
};

export default async function DespreNoiPage() {
  const content = await getSiteContent("despre_noi");
  return <DespreNoiClient siteContent={content} />;
}
