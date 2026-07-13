import { notFound } from "next/navigation";
import { getContentBySlug, trainingContent } from "@/lib/content";
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
  const content = getContentBySlug("training-facilities", slug);

  if (!content) notFound();

  return <DynamicPageTemplate content={content} />;
}
