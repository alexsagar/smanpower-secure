import { notFound } from "next/navigation";
import { trainingContent } from "@/lib/content";
import { getDynamicPageContent, buildDynamicPageMetadata } from "@/services/dynamic-page.service";
import { DynamicPageTemplate } from "@/components/ui/DynamicPageTemplate";
import type { Metadata } from "next";

export function generateStaticParams() {
  return trainingContent.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return buildDynamicPageMetadata("training-facilities", slug);
}

export default async function TrainingDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getDynamicPageContent("training-facilities", slug);

  if (!content) notFound();

  return (
    <DynamicPageTemplate
      content={content}
      breadcrumbs={[
        { name: "Home", path: "" },
        { name: "Training Facilities", path: "/training-facilities" },
        { name: content.title, path: `/training-facilities/${slug}` },
      ]}
    />
  );
}
