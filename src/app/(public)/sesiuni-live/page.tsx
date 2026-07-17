export const dynamic = 'force-dynamic'
import { getSiteContent } from "@/lib/siteContent";
import SesiuniLiveClient from "./SesiuniLiveClient";

export default async function SesiuniLivePage() {
  const content = await getSiteContent("sesiuni_live");
  return <SesiuniLiveClient siteContent={content} />;
}
