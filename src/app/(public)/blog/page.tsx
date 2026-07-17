export const dynamic = 'force-dynamic'
import type { Metadata } from "next";
import { getSiteContent } from "@/lib/siteContent";
import BlogClient from "./BlogClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://withinapp.vercel.app";

export const metadata: Metadata = {
  title: "Blog — Articole despre Meditație, Mindfulness și Wellness",
  description:
    "Articole despre meditație ghidată, tehnici de respirație, reducerea stresului și anxietății, somn și echilibru mental. Resurse gratuite de wellness pentru români.",
  keywords: [
    "articole meditație",
    "blog mindfulness România",
    "sfaturi reducere stres",
    "tehnici respirație articole",
    "wellness mental România",
    "anxietate tehnici",
  ],
  alternates: { canonical: `${BASE_URL}/blog` },
  openGraph: {
    title: "Blog — Articole despre Meditație și Wellness | WithIn",
    description: "Articole despre meditație, respirație și echilibru mental. Resurse gratuite.",
    url: `${BASE_URL}/blog`,
  },
};

export default async function BlogPage() {
  const content = await getSiteContent("inspiratie");
  return <BlogClient siteContent={content} />;
}
