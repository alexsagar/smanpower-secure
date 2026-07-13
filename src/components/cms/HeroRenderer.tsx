import React from "react";
import { HeroInternal } from "@/components/ui/HeroInternal";
import type { CmsHeroSection } from "@/types/content";

interface HeroRendererProps {
  hero?: CmsHeroSection | null;
  fallbackTitle: string;
  fallbackSubtitle: string;
  fallbackImage: string;
}

function extractTextFromRichHeading(richHeading: any): string {
  if (!richHeading || typeof richHeading !== 'object') return "";
  let text = "";
  if (richHeading.type === 'text' && richHeading.text) {
    return richHeading.text;
  }
  if (Array.isArray(richHeading.content)) {
    for (const node of richHeading.content) {
      text += extractTextFromRichHeading(node);
    }
  }
  return text;
}

export function HeroRenderer({ hero, fallbackTitle, fallbackSubtitle, fallbackImage }: HeroRendererProps) {
  let title = fallbackTitle;
  let subtitle = fallbackSubtitle;
  let imageSrc = fallbackImage;

  if (hero) {
    if (hero.richHeading) {
      const extracted = extractTextFromRichHeading(hero.richHeading);
      if (extracted) title = extracted;
    }
    if (hero.eyebrow) {
      subtitle = hero.eyebrow;
    }
    if (hero.image?.secureUrl || hero.image?.localPath) {
      imageSrc = (hero.image.secureUrl || hero.image.localPath) as string;
    }
  }

  return (
    <HeroInternal 
      title={title}
      subtitle={subtitle}
      imageSrc={imageSrc}
    />
  );
}
