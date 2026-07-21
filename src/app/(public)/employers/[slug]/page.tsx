import { notFound } from "next/navigation";
import { employersContent } from "@/lib/content";
import { getDynamicPageContent } from "@/services/dynamic-page.service";
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
  const content = await getDynamicPageContent("employers", slug);

  if (!content) notFound();

  return <DynamicPageTemplate content={content} />;
}
