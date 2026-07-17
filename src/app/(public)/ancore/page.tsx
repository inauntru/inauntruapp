export const dynamic = 'force-dynamic'
import { getSiteContent } from "@/lib/siteContent";
import AncoreClient from "./AncoreClient";

export default async function AncorePage() {
  const content = await getSiteContent("ancore");
  return <AncoreClient siteContent={content} />;
}
