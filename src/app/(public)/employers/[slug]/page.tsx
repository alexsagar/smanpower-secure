import { notFound } from "next/navigation";
import { employersContent } from "@/lib/content";
import { getDynamicPageContent, buildDynamicPageMetadata } from "@/services/dynamic-page.service";
import { DynamicPageTemplate } from "@/components/ui/DynamicPageTemplate";
import type { Metadata } from "next";

export function generateStaticParams() {
  return employersContent.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return buildDynamicPageMetadata("employers", slug);
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
