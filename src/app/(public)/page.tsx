export const dynamic = 'force-dynamic'
import { getSiteContent } from "@/lib/siteContent";
import HomePageClient from "./HomePageClient";

export default async function HomePage() {
  const content = await getSiteContent("homepage");
  return <HomePageClient siteContent={content} />;
}
