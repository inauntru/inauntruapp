export const dynamic = 'force-dynamic'
import { getSiteContent } from "@/lib/siteContent";
import PracticiClient from "./PracticiClient";

export default async function PracticiPage() {
  const content = await getSiteContent("practici");
  return <PracticiClient siteContent={content} />;
}
