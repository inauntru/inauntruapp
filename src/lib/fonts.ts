import { Tenor_Sans, DM_Sans } from "next/font/google";

export const tenorSans = Tenor_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-heading",
  display: "swap",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const fontVariables = `${tenorSans.variable} ${dmSans.variable}`;
