import { notFound } from "next/navigation";
import { getContentBySlug, ethicalContent } from "@/lib/content";
import { DynamicPageTemplate } from "@/components/ui/DynamicPageTemplate";

export function generateStaticParams() {
  return ethicalContent.map((c) => ({ slug: c.slug }));
}

export default async function EthicalDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = getContentBySlug("ethical-recruitment", slug);

  if (!content) notFound();

  return <DynamicPageTemplate content={content} />;
}
