import localFont from "next/font/local";
import { Inter } from "next/font/google";

export const canela = localFont({
  src: [
    { path: "../app/fonts/canela/canela-Light-TRIAL.otf", weight: "300", style: "normal" },
    { path: "../app/fonts/canela/canela-Regular-TRIAL.otf", weight: "400", style: "normal" },
    { path: "../app/fonts/canela/canela-Bold-TRIAL.otf", weight: "700", style: "normal" },
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

export const fontVariables = `${canela.variable} ${inter.variable}`;
