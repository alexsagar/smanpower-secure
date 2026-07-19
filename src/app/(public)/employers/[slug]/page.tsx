import { notFound } from "next/navigation";
import { getContentBySlug, employersContent } from "@/lib/content";
import { DynamicPageTemplate } from "@/components/ui/DynamicPageTemplate";

export function generateStaticParams() {
  return employersContent.map((c) => ({ slug: c.slug }));
}

export default async function EmployersDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = getContentBySlug("employers", slug);

  if (!content) notFound();

  return <DynamicPageTemplate content={content} />;
}
