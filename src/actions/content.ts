"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function savePageAction(pageId: string, slug: string, hero: any, blocks: any[]) {
  try {
    if (hero) {
      await prisma.cmsHeroSection.update({
        where: { id: hero.id },
        data: {
          eyebrow: hero.eyebrow,
          richHeading: hero.richHeading,
          richDescription: hero.richDescription,
          primaryCtaText: hero.primaryCtaText,
          primaryCtaHref: hero.primaryCtaHref,
          secondaryCtaText: hero.secondaryCtaText,
          secondaryCtaHref: hero.secondaryCtaHref,
          imageId: hero.imageId,
          videoId: hero.videoId ?? null,
          posterImageId: hero.posterImageId ?? null,
          mobileImageId: hero.mobileImageId ?? null,
          overlayEnabled: hero.overlayEnabled,
          overlayOpacity: hero.overlayOpacity,
        }
      });
    }

    // Update blocks
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (block.id && !block.id.startsWith("block_")) {
        await prisma.cmsContentBlock.update({
          where: { id: block.id },
          data: {
            content: block.content,
            richHeading: block.richHeading,
            visible: block.visible,
            order: i, // enforce new order
            imageId: block.imageId ?? null,
            videoId: block.videoId ?? null,
            posterImageId: block.posterImageId ?? null,
            mobileImageId: block.mobileImageId ?? null,
          }
        });
      } else {
        // Handle new blocks in the future
      }
    }

    revalidatePath(`/en/${slug}`);
    revalidatePath(`/ne/${slug}`);
    revalidatePath("/admin/content");
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save page", error);
    return { success: false, error: error.message };
  }
}
