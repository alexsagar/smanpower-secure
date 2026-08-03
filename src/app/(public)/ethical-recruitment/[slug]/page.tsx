import { notFound } from "next/navigation";
import { ethicalContent } from "@/lib/content";
import { getDynamicPageContent, buildDynamicPageMetadata } from "@/services/dynamic-page.service";
import { EthicalPageTemplate } from "@/components/ethical/EthicalPageTemplate";
import type { Metadata } from "next";

export function generateStaticParams() {
  return ethicalContent.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return buildDynamicPageMetadata("ethical-recruitment", slug);
}

export default async function EthicalDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getDynamicPageContent("ethical-recruitment", slug);

  if (!content) notFound();

  return (
    <EthicalPageTemplate
      content={content}
      breadcrumbs={[
        { name: "Home", path: "" },
        { name: "Ethical Recruitment", path: "/ethical-recruitment" },
        { name: content.title, path: `/ethical-recruitment/${slug}` },
      ]}
    />
  );
}
