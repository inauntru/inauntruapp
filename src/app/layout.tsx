import type { Metadata } from "next";
import { OG_IMAGE, OG_IMAGE_URL } from "@/lib/seo";
import { fontVariables } from "@/lib/fonts";
import Providers from "@/components/Providers";
import { ArtDefs } from "@/components/ui/ArtIcons";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://withinapp.ro";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "WithIn — Meditație și Mindfulness Online România",
    template: "%s | WithIn",
  },
  description:
    "Practici de meditație ghidată, exerciții de respirație și tehnici de relaxare pentru reducerea stresului și anxietății. Întoarce-te la tine în mai puțin de 2 minute.",
  keywords: [
    "meditație ghidată online",
    "exerciții de respirație",
    "reducere stres",
    "mindfulness România",
    "tehnici de relaxare",
    "meditație pentru anxietate",
    "practici somatice",
    "wellness digital România",
    "meditație online gratuit",
    "echilibru interior",
  ],
  authors: [{ name: "WithIn" }],
  creator: "WithIn",
  publisher: "WithIn",
  alternates: {
    canonical: BASE_URL,
    languages: { "ro-RO": BASE_URL },
  },
  openGraph: {
    images: [OG_IMAGE],
    title: "WithIn — Meditație și Mindfulness Online România",
    description:
      "Practici de meditație ghidată, exerciții de respirație și tehnici de relaxare. Întoarce-te la tine în mai puțin de 2 minute.",
    url: BASE_URL,
    siteName: "WithIn",
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    images: [OG_IMAGE_URL],
    card: "summary_large_image",
    title: "WithIn — Meditație și Mindfulness Online România",
    description: "Practici de meditație ghidată și exerciții de respirație. Întoarce-te la tine în 2 minute.",
  },
  // PRE-LAUNCH: noindex activ — la lansare schimba in index: true, follow: true
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={`scroll-smooth ${fontVariables}`}>
      <body className="font-body antialiased bg-background text-on-background">
        {/* Gradienții/filtrele globale ale iconurilor ilustrate — vezi ui/ArtIcons.tsx */}
        <ArtDefs />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
