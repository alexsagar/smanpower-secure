import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { PARTNER_PERMISSIONS } from "@/lib/permissions.constants";
import { PartnerForm } from "@/components/admin/partners/PartnerForm";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Admin - Global Partners",
};

export default async function AdminPartnersPage() {
  await requirePermission(PARTNER_PERMISSIONS.MANAGE);

  const partners = await prisma.clientPartner.findMany({
    orderBy: { order: "asc" },
  });

  async function savePartner(formData: FormData) {
    "use server";
    await requirePermission(PARTNER_PERMISSIONS.MANAGE);

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const category = formData.get("category") as any;
    const logoUrl = formData.get("logoUrl") as string;
    const website = formData.get("website") as string;
    const industry = formData.get("industry") as string;
    const order = parseInt(formData.get("order") as string || "0", 10);
    const isPublic = formData.get("isPublic") === "true";

    const data = {
      name,
      category,
      logoUrl: logoUrl || null,
      website: website || null,
      industry: industry || null,
      order,
      isPublic,
      isVerified: true
    };

    if (id) {
      await prisma.clientPartner.update({ where: { id }, data });
    } else {
      await prisma.clientPartner.create({ data });
    }

    revalidatePath("/admin/partners");
    revalidatePath("/[lang]", "page");
  }

  async function deletePartner(id: string) {
    "use server";
    await requirePermission(PARTNER_PERMISSIONS.MANAGE);
    await prisma.clientPartner.delete({ where: { id } });
    revalidatePath("/admin/partners");
    revalidatePath("/[lang]", "page");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Partners</h1>
        <p className="text-muted-foreground">Manage companies and partner entities displayed on the homepage.</p>
      </div>

      <PartnerForm 
        partners={partners} 
        onSave={savePartner} 
        onDelete={deletePartner} 
      />
    </div>
  );
}
