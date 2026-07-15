import localFont from "next/font/local";
import { Inter } from "next/font/google";

export const sentient = localFont({
  src: [
    { path: "../app/fonts/sentient/Sentient-Light.woff2", weight: "300", style: "normal" },
    { path: "../app/fonts/sentient/Sentient-Regular.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/sentient/Sentient-Medium.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/sentient/Sentient-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-heading",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const fontVariables = `${sentient.variable} ${inter.variable}`;
