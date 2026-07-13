import { notFound } from "next/navigation";
import { getContentBySlug, trustContent } from "@/lib/content";
import { DynamicPageTemplate } from "@/components/ui/DynamicPageTemplate";

export function generateStaticParams() {
  return trustContent.map((c) => ({ slug: c.slug }));
}

export default async function TrustDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = getContentBySlug("trust-centre", slug);

  if (!content) notFound();

  return <DynamicPageTemplate content={content} />;
}
