import { getSiteContent } from "@/lib/siteContent";
import BlogClient from "./BlogClient";

export default async function BlogPage() {
  const content = await getSiteContent("inspiratie");
  return <BlogClient siteContent={content} />;
}
