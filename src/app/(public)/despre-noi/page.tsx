import { getSiteContent } from "@/lib/siteContent";
import DespreNoiClient from "./DespreNoiClient";

export default async function DespreNoiPage() {
  const content = await getSiteContent("despre_noi");
  return <DespreNoiClient siteContent={content} />;
}
