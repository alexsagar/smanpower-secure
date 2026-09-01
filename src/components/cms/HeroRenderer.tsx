import React from "react";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { RichTextRenderer } from "@/components/cms/RichTextRenderer";
import type { CmsHeroSection, CmsMediaAsset } from "@/types/content";
import { resolveMediaUrl, MEDIA_PLACEHOLDER } from "@/lib/media-resolver";

// Provider-aware URL: R2 assets deliver from media.smanpower.com, Cloudinary
// from secureUrl, LOCAL from its path. Returns undefined when there is no asset
// so callers keep their fallback image.
function assetUrl(asset?: CmsMediaAsset): string | undefined {
  if (!asset) return undefined;
  const url = resolveMediaUrl(asset);
  return url === MEDIA_PLACEHOLDER ? undefined : url;
}

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
    const imageUrl = assetUrl(hero.image);
    if (imageUrl) imageSrc = imageUrl;

    const videoUrl = assetUrl(hero.video);
    if (videoUrl) {
      videoSrc = videoUrl;
      posterSrc = assetUrl(hero.videoPoster) ?? imageUrl;
      mobileFallbackSrc = assetUrl(hero.mobileImage) ?? assetUrl(hero.videoPoster) ?? imageUrl;
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
