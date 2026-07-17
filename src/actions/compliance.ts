"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createDocument(formData: FormData) {
  const title = formData.get("title") as string;
  const documentType = formData.get("documentType") as string;
  const description = formData.get("description") as string;
  const isPublic = formData.get("isPublic") === "on";
  const isVerified = formData.get("isVerified") === "on";

  if (!title || !documentType) {
    return { error: "Title and Document Type are required." };
  }

  // TEMPORARY DEMO MODE — switch DEMO_MODE to false after PostgreSQL backend is deployed
  if (!process.env.DATABASE_URL) {
    revalidatePath("/admin/compliance");
    revalidatePath("/trust-centre");
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
      }
    });
  } catch (error: any) {
    console.error("Failed to create compliance doc:", error);
    return { error: "Failed to create document." };
  }

  revalidatePath("/admin/compliance");
  revalidatePath("/trust-centre");
  redirect("/admin/compliance");
}
