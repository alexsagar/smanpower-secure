"use server";

import { prisma } from "@/lib/prisma";
import { requireCurrentAdminUser } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createDocument(formData: FormData) {
  // Server actions are callable endpoints: authenticate here, not only in the layout.
  await requireCurrentAdminUser();

  const title = formData.get("title") as string;
  const documentType = formData.get("documentType") as string;
  const description = formData.get("description") as string;
  const isPublic = formData.get("isPublic") === "on";
  const isVerified = formData.get("isVerified") === "on";
  const fileUrl = (formData.get("fileUrl") as string) || null;

  if (!title || !documentType) {
    return { error: "Title and Document Type are required." };
  }

  // TEMPORARY DEMO MODE — switch DEMO_MODE to false after PostgreSQL backend is deployed
  if (!process.env.DATABASE_URL) {
    revalidatePath("/admin/compliance");
    revalidatePath("/trust-centre");
    revalidatePath("/");
    redirect("/admin/compliance");
  }

  try {
    await prisma.complianceDocument.create({
      data: {
        title,
        documentType,
        description,
        isPublic,
        isVerified,
        fileUrl,
      }
    });
  } catch (error: any) {
    console.error("Failed to create compliance doc:", error);
    return { error: "Failed to create document." };
  }

  revalidatePath("/admin/compliance");
  revalidatePath("/trust-centre");
  revalidatePath("/");
  redirect("/admin/compliance");
}
