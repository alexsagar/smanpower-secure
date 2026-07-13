"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createFacility(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const location = formData.get("location") as string;
  const description = formData.get("description") as string;
  const isActive = formData.get("isActive") === "on";

  if (!name || !slug) {
    return { error: "Name and slug are required." };
  }

  // TEMPORARY DEMO MODE — switch DEMO_MODE to false after PostgreSQL backend is deployed
  if (!process.env.DATABASE_URL) {
    revalidatePath("/admin/training");
    revalidatePath("/en/training-facilities");
    redirect("/admin/training");
  }

  try {
    await prisma.trainingFacility.create({
      data: {
        name,
        slug,
        location,
        description,
        isActive,
      }
    });
  } catch (error: any) {
    console.error("Failed to create facility:", error);
    return { error: "Failed to create facility. Make sure the slug is unique." };
  }

  revalidatePath("/admin/training");
  revalidatePath("/en/training-facilities");
  redirect("/admin/training");
}
