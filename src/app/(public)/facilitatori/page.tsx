import { getSiteContent } from "@/lib/siteContent";
import FacilitatoriClient from "./FacilitatoriClient";

export default async function FacilitatoriPage() {
  const content = await getSiteContent("facilitatori");
  return <FacilitatoriClient siteContent={content} />;
}
