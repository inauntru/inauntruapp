import type { Metadata } from "next";
import { OG_IMAGE } from "@/lib/seo";
import { getSiteContent } from "@/lib/siteContent";
import HomePageClient from "./HomePageClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://withinapp.ro";

export const metadata: Metadata = {
  title: "WithIn — Meditație Ghidată și Mindfulness Online România",
  description:
    "Practici de meditație ghidată, exerciții de respirație și tehnici de relaxare pentru stres și anxietate. Resetare mentală în mai puțin de 2 minute. Încearcă gratuit.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    images: [OG_IMAGE],
    title: "WithIn — Meditație Ghidată și Mindfulness Online România",
    description: "Meditație ghidată, exerciții de respirație și practici somatice. Întoarce-te la tine în 2 minute.",
    url: BASE_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "WithIn",
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: `${BASE_URL}/logo-orizontal.png` },
      sameAs: [],
      contactPoint: { "@type": "ContactPoint", email: "hello@withinapp.ro", contactType: "customer support", availableLanguage: "Romanian" },
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "WithIn",
      description: "Platformă de meditație ghidată și mindfulness online din România",
      publisher: { "@id": `${BASE_URL}/#organization` },
      inLanguage: "ro-RO",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/practici?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default async function HomePage() {
  // Preturile se editeaza intr-un singur loc (fila Preturi), dar se afiseaza si aici
  const [content, pricing] = await Promise.all([
    getSiteContent("homepage"),
    getSiteContent("preturi"),
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomePageClient siteContent={content} pricingContent={pricing} />
    </>
  );
}
