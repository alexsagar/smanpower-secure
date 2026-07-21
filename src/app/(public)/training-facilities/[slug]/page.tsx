import { notFound } from "next/navigation";
import { trainingContent } from "@/lib/content";
import { getDynamicPageContent } from "@/services/dynamic-page.service";
import { DynamicPageTemplate } from "@/components/ui/DynamicPageTemplate";

export function generateStaticParams() {
  return trainingContent.map((c) => ({ slug: c.slug }));
}

export default async function TrainingDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getDynamicPageContent("training-facilities", slug);

  if (!content) notFound();

  return <DynamicPageTemplate content={content} />;
}
