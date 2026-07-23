import React from "react";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { RichTextRenderer } from "@/components/cms/RichTextRenderer";
import type { CmsHeroSection } from "@/types/content";

interface HeroRendererProps {
  hero?: CmsHeroSection | null;
  fallbackTitle: string;
  fallbackSubtitle: string;
  fallbackImage: string;
}

export function HeroRenderer({ hero, fallbackTitle, fallbackSubtitle, fallbackImage }: HeroRendererProps) {
  const title = fallbackTitle;
  let richTitle: React.ReactNode;
  let subtitle = fallbackSubtitle;
  let imageSrc = fallbackImage;
  let videoSrc: string | undefined;
  let posterSrc: string | undefined;
  let mobileFallbackSrc: string | undefined;

  if (hero) {
    if (hero.richHeading?.content?.length) richTitle = <RichTextRenderer content={hero.richHeading} />;
    if (hero.eyebrow) {
      subtitle = hero.eyebrow;
    }
    if (hero.image?.secureUrl || hero.image?.localPath) {
      imageSrc = (hero.image.secureUrl || hero.image.localPath) as string;
    }
    if (hero.video?.secureUrl || hero.video?.localPath) {
      videoSrc = (hero.video.secureUrl || hero.video.localPath) as string;
      posterSrc =
        (hero.videoPoster?.secureUrl || hero.videoPoster?.localPath || hero.image?.secureUrl || hero.image?.localPath) as string | undefined;
      mobileFallbackSrc =
        (hero.mobileImage?.secureUrl || hero.mobileImage?.localPath || hero.videoPoster?.secureUrl || hero.videoPoster?.localPath || hero.image?.secureUrl || hero.image?.localPath) as string | undefined;
    }
  }

  return (
    <HeroInternal
      title={title}
      richTitle={richTitle}
      subtitle={subtitle}
      imageSrc={imageSrc}
      videoSrc={videoSrc}
      posterSrc={posterSrc}
      mobileFallbackSrc={mobileFallbackSrc}
      overlayEnabled={hero?.overlayEnabled ?? true}
      overlayOpacity={hero?.overlayOpacity}
    />
  );
}
