import { notFound } from "next/navigation";
import { trustContent } from "@/lib/content";
import { getDynamicPageContent, buildDynamicPageMetadata } from "@/services/dynamic-page.service";
import { DynamicPageTemplate } from "@/components/ui/DynamicPageTemplate";
import type { Metadata } from "next";

export function generateStaticParams() {
  return trustContent.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return buildDynamicPageMetadata("trust-centre", slug);
}

export default async function TrustDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getDynamicPageContent("trust-centre", slug);

  if (!content) notFound();

  return (
    <DynamicPageTemplate
      content={content}
      breadcrumbs={[
        { name: "Home", path: "" },
        { name: "Trust Centre", path: "/trust-centre" },
        { name: content.title, path: `/trust-centre/${slug}` },
      ]}
    />
  );
}
