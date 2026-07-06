import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "WithIn — Return to Yourself",
  description:
    "Întoarce-te la tine. Resetare rapidă în mai puțin de 2 minute. Metode simple pentru momentele când te simți blocat și ai nevoie de un nou început.",
  keywords: "meditatie, anxietate, somn, wellness, respiratie, mindfulness, Romania",
  openGraph: {
    title: "WithIn — Return to Yourself",
    description:
      "Întoarce-te la tine. Resetare rapidă în mai puțin de 2 minute. Metode simple pentru momentele când te simți blocat.",
    siteName: "WithIn",
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WithIn — Return to Yourself",
    description: "Întoarce-te la tine. Resetare rapidă în mai puțin de 2 minute.",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
