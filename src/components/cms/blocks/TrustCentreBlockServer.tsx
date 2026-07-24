import "server-only";
import type { CmsContentBlock } from "@/types/content";
import { getPublicTrustDocuments } from "@/repositories/content-resolver";
import { TrustCentreBlock, type TrustDoc } from "./TrustCentreBlock";

const TYPE_LABELS: Record<string, string> = {
  licence: "Government Licence",
  certificate: "Certification",
  policy: "Corporate Policy",
};

/**
 * Server wrapper for the homepage trust_centre block: renders the real public
 * compliance documents (uploaded via Admin → Compliance) so certifications and
 * licenses appear here automatically. Falls back to the block's demo list when
 * none are published.
 */
export async function TrustCentreBlockServer({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const docs = await getPublicTrustDocuments();
  const documents: TrustDoc[] = docs
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((d, i) => ({
      id: String(i + 1).padStart(3, "0"),
      title: d.title,
      type: TYPE_LABELS[d.documentType as string] || "Document",
      date: d.issueDate ? new Date(d.issueDate).getFullYear().toString() : "",
      // Repo returns fileUrl at runtime (the interface still names it `file`).
      href: (d as unknown as { fileUrl?: string }).fileUrl || undefined,
    }));

  return <TrustCentreBlock block={block} lang={lang} documents={documents} />;
}
