import { getAdminSEOPageMeta } from "@/services/admin.service";
import SeoClient from "./SeoClient";

export default async function AdminSeoPage() {
  const seoPages = await getAdminSEOPageMeta();

  return <SeoClient initialPages={seoPages} />;
}
