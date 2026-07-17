export const dynamic = 'force-dynamic'
import { getSiteContent } from "@/lib/siteContent";
import PreturiClient from "./PreturiClient";

export default async function PreturiPage() {
  const content = await getSiteContent("preturi");
  return <PreturiClient siteContent={content} />;
}
