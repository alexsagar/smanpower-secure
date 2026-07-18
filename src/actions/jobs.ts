"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createJob(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;

  const countryId = formData.get("countryId") as string;
  const industryId = formData.get("industryId") as string;
  const employerName = formData.get("employerName") as string;
  const vacancies = parseInt(formData.get("vacancies") as string, 10);

  const status = formData.get("status") as any; // DRAFT, PUBLISHED
  const employmentType = formData.get("employmentType") as any;

  if (!title || !slug || !description || !countryId || !industryId) {
    return { error: "Required fields are missing." };
  }

  try {
    await prisma.job.create({
      data: {
        title,
        slug,
        description,
        countryId,
        industryId,
        employerName: employerName || null,
        vacancies: isNaN(vacancies) ? 1 : vacancies,
        status: status || "DRAFT",
        employmentType: employmentType || "FULL_TIME",
      }
    });
  } catch (error: any) {
    console.error("Failed to create job:", error);
    return { error: "Failed to create job. Make sure the slug is unique." };
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  redirect("/admin/jobs");
}

export async function deleteJobAction(id: string) {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw new Error("Job not found");

  await prisma.job.delete({ where: { id } });
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  return { success: true };
}
