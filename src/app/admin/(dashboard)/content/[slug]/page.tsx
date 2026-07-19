import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Code, LayoutTemplate, Settings2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { VisualPageEditor } from "@/components/admin/content/VisualPageEditor";
import { getClientPartners, getStatistics } from "@/repositories/content-resolver";
import { getIndustries } from "@/services/industries.service";
import { getTrainingFacilities } from "@/services/facilities.service";
import { getComplianceDocuments } from "@/services/compliance.service";
import type { AdminPreviewData } from "@/types/admin-preview";
import type { CmsComplianceDocument, CmsContentBlock, CmsIndustry, CmsTrainingFacility } from "@/types/content";

function normalizeIndustries(items: Awaited<ReturnType<typeof getIndustries>> | undefined): CmsIndustry[] | undefined {
  return items?.map((item) => ({
    id: item.id,
    name: item.name,
    nameNe: "nameNe" in item ? item.nameNe ?? undefined : undefined,
    slug: item.slug,
    description: item.description ?? undefined,
    icon: "icon" in item ? item.icon ?? undefined : undefined,
    order: item.order,
    isActive: item.isActive,
  }));
}

function normalizeTrainingFacilities(items: Awaited<ReturnType<typeof getTrainingFacilities>> | undefined): CmsTrainingFacility[] | undefined {
  return items?.map((item) => ({
    id: item.id,
    name: item.name,
    nameNe: "nameNe" in item ? item.nameNe ?? undefined : undefined,
    slug: item.slug,
    description: item.description ?? undefined,
    location: item.location ?? undefined,
    capacity: item.capacity ?? undefined,
    isActive: item.isActive,
  }));
}

function isComplianceDocumentType(value: string): value is CmsComplianceDocument["documentType"] {
  return value === "licence" || value === "certificate" || value === "policy";
}

function normalizeTrustDocuments(items: Awaited<ReturnType<typeof getComplianceDocuments>> | undefined): CmsComplianceDocument[] | undefined {
  return items?.flatMap((item) => {
    const documentType = item.documentType;
    if (!isComplianceDocumentType(documentType)) return [];

    return [{
      id: item.id,
      title: item.title,
      titleNe: "titleNe" in item ? item.titleNe ?? undefined : undefined,
      description: "description" in item ? item.description ?? undefined : undefined,
      documentType,
      issueDate: "issueDate" in item ? item.issueDate instanceof Date ? item.issueDate.toISOString() : item.issueDate ?? undefined : undefined,
      expiryDate: "expiryDate" in item ? item.expiryDate instanceof Date ? item.expiryDate.toISOString() : item.expiryDate ?? undefined : undefined,
      isPublic: item.isPublic,
      isVerified: item.isVerified,
      order: item.order,
    }];
  });
}

async function getAdminPreviewData(blocks: Pick<CmsContentBlock, "blockType" | "visible">[]): Promise<AdminPreviewData> {
  const blockTypes = new Set(blocks.filter((block) => block.visible !== false).map((block) => block.blockType));
  const [statistics, clientPartners, industries, trainingFacilities, trustDocuments] = await Promise.all([
    blockTypes.has("statistics") ? getStatistics() : undefined,
    blockTypes.has("client_marquee") ? getClientPartners() : undefined,
    blockTypes.has("dynamic_industry_grid") ? getIndustries() : undefined,
    blockTypes.has("dynamic_facilities_grid") ? getTrainingFacilities() : undefined,
    blockTypes.has("dynamic_vault_grid") ? getComplianceDocuments() : undefined,
  ]);

  return {
    statistics,
    clientPartners,
    industries: normalizeIndustries(industries),
    trainingFacilities: normalizeTrainingFacilities(trainingFacilities),
    trustDocuments: normalizeTrustDocuments(trustDocuments),
  };
}

export default async function PageEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const page = await prisma.cmsPage.findUnique({
    where: { slug },
    include: {
      hero: true,
      blocks: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!page) notFound();
  const previewData = await getAdminPreviewData(page.blocks as Pick<CmsContentBlock, "blockType" | "visible">[]);

  async function updatePageAction(formData: FormData) {
    "use server";
    
    const blocksJson = formData.get("blocksJson") as string;
    try {
      const parsedBlocks = JSON.parse(blocksJson);
      
      for (const block of parsedBlocks) {
        if (block.id) {
          await prisma.cmsContentBlock.update({
            where: { id: block.id },
            data: {
              content: block.content,
              richHeading: block.richHeading,
              visible: block.visible,
              order: block.order
            }
          });
        }
      }
    } catch (e) {
      console.error("Invalid JSON blocks", e);
    }

    revalidatePath(slug === "home" ? "/" : `/${slug}`);
    revalidatePath("/admin/content");
    redirect("/admin/content");
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link 
              href="/admin/content" 
              className="w-12 h-12 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-black transition-all group shadow-sm hover:shadow"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-brand-gold/80 mb-2">
                <span className="w-6 h-[1px] bg-brand-gold/50" />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase">
                  Content Editor
                </span>
              </div>
              <h1 className="text-3xl font-semibold text-brand-black tracking-tight flex items-center gap-3">
                {page.title || slug}
                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-mono tracking-normal border border-gray-200 shadow-sm">
                  /{slug}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={slug === "home" ? "/" : `/${slug}`}
              target="_blank"
              className="h-11 px-5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-brand-black font-medium transition-all shadow-sm flex items-center gap-2"
            >
              <LayoutTemplate className="w-4 h-4" />
              Preview Live
            </Link>
          </div>
        </div>
      </div>

      <VisualPageEditor initialPage={page} previewData={previewData} />
    </div>
  );
}
