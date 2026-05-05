import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "INAUNTRU — Terapie Somatică Digitală",
  description:
    "Prima platformă de terapie somatică digitală din România. Practici ghidate, sesiuni live și suport personalizat pentru echilibrul tău interior.",
  keywords: "terapie somatica, meditatie, anxietate, somn, wellness, Romania",
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
