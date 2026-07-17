import { MetadataRoute } from "next";

// PRE-LAUNCH: toate crawlerele blocate
// La lansare: schimba cu allow: "/" si decomenteza disallow-urile specifice
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
