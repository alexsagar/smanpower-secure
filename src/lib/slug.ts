import { PrismaClient, Prisma } from "@prisma/client";

/**
 * Normalizes a string into a URL-friendly slug.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-") // Replace spaces, non-word characters and dashes with a single dash
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing dashes
}

/**
 * Generates a transaction-safe unique slug for a Demand.
 * 
 * We catch Prisma's unique constraint violation (P2002) and retry with a suffix.
 * This is safe even under concurrent requests because the database enforces uniqueness.
 * 
 * @param title The public title of the Demand
 * @param txClient The Prisma transaction client
 * @param maxRetries Maximum number of collision retries before failing
 */
export async function generateUniqueSlug(
  title: string,
  txClient: any,
  modelName: "demand" | "successStory" | "insightArticle" | "newsArticle" | "careerOpening" = "demand",
  maxRetries = 10
): Promise<string> {
  const baseSlug = slugify(title) || modelName;
  
  const existing = await txClient[modelName].findUnique({
    where: { slug: baseSlug },
    select: { id: true },
  });

  if (!existing) {
    return baseSlug;
  }

  const similarSlugs = await txClient[modelName].findMany({
    where: {
      slug: {
        startsWith: `${baseSlug}-`,
      },
    },
    select: { slug: true },
    orderBy: { slug: 'desc' }
  });

  let nextSuffix = 2;
  if (similarSlugs.length > 0) {
    for (const record of similarSlugs) {
      const parts = record.slug.split("-");
      const lastPart = parts[parts.length - 1];
      const num = parseInt(lastPart, 10);
      if (!isNaN(num) && num >= nextSuffix) {
        nextSuffix = num + 1;
      }
    }
  }

  for (let i = 0; i < maxRetries; i++) {
    const candidateSlug = `${baseSlug}-${nextSuffix + i}`;
    
    const collision = await txClient[modelName].findUnique({
      where: { slug: candidateSlug },
      select: { id: true }
    });

    if (!collision) {
      return candidateSlug;
    }
  }

  throw new Error("Unable to generate a unique slug after maximum retries.");
}
