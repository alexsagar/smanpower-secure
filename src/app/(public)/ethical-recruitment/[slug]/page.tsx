import { notFound } from "next/navigation";
import { ethicalContent } from "@/lib/content";
import { getDynamicPageContent } from "@/services/dynamic-page.service";
import { EthicalPageTemplate } from "@/components/ethical/EthicalPageTemplate";

export function generateStaticParams() {
  return ethicalContent.map((c) => ({ slug: c.slug }));
}

export default async function EthicalDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getDynamicPageContent("ethical-recruitment", slug);

  if (!content) notFound();

  return <EthicalPageTemplate content={content} />;
}
