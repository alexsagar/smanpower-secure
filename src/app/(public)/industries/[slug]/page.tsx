import { notFound } from "next/navigation";
import { industriesContent } from "@/lib/content";
import { getDynamicPageContent } from "@/services/dynamic-page.service";
import { DynamicPageTemplate } from "@/components/ui/DynamicPageTemplate";

export function generateStaticParams() {
  return industriesContent.map((c) => ({ slug: c.slug }));
}

import { buildPageMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const content = await getDynamicPageContent("industries", slug);
  if (!content) return buildPageMetadata({ path: `/industries/${slug}`, noIndex: true });
  
  return buildPageMetadata({
    title: `${content.title} Recruitment from Nepal`,
    description: `Hire skilled ${content.title} professionals from Nepal. We provide trained, experienced staff for ${content.title} roles across the GCC and Europe.`,
    path: `/industries/${slug}`
  });
}
export default async function IndustriesDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getDynamicPageContent("industries", slug);

  if (!content) notFound();

  return (
    <DynamicPageTemplate
      content={content}
      breadcrumbs={[
        { name: "Home", path: "" },
        { name: "Industries", path: "/industries" },
        { name: content.title, path: `/industries/${slug}` },
      ]}
    />
  );
}
