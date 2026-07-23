import React from "react";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { CmsContentBlock } from "@/types/content";
import { resolveImageMediaUrl, resolveMediaUrl } from "@/lib/media-resolver";
import { RichTextRenderer } from "../RichTextRenderer";
import { CheckCircle, FileText } from "lucide-react";
import { ManagedVideo } from "../ManagedVideo";

export function ImageTextBlock({ block, lang }: { block: CmsContentBlock; lang: string }) {
  const content = block.content as any;
  const mediaUrl = resolveImageMediaUrl(block.image, { width: 1440 });
  const videoUrl = resolveMediaUrl(block.video);
  const posterUrl = resolveImageMediaUrl(block.videoPoster || block.image, { width: 1440 });
  const mobileFallbackUrl = resolveImageMediaUrl(block.mobileImage || block.videoPoster || block.image, { width: 960 });

  return (
    <section className="py-16 lg:py-24 relative bg-brand-white">
      <div className="container-wide mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          <div className="lg:col-span-6">
            <ScrollReveal>
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {videoUrl ? (
                  <ManagedVideo
                    src={videoUrl}
                    posterSrc={posterUrl}
                    mobileFallbackSrc={mobileFallbackUrl}
                    alt={block.video?.altText || block.image?.altText || "Section video"}
                    controls
                    muted
                    preload="metadata"
                    containerClassName="absolute inset-0"
                    videoClassName="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={mediaUrl}
                    alt={block.image?.altText || "Section image"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                )}
              </div>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-6">
            <ScrollReveal delay={0.2}>
              <div className="text-brand-black text-4xl lg:text-5xl font-bold tracking-tighter mb-8 [&_h2]:m-0 [&_h2]:font-inherit [&_h2]:text-inherit [&_h2]:tracking-inherit [&_h2]:leading-inherit">
                <RichTextRenderer content={block.richHeading} />
              </div>

              <div className="space-y-6 text-brand-charcoal/80 text-lg">
                {content.paragraphs?.map((p: string, i: number) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {content.features && content.features.length > 0 && (
                <div className="mt-12 space-y-6">
                  {content.features.map((feature: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <CheckCircle className="w-6 h-6 text-brand-gold shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-brand-charcoal text-lg">{feature.title}</h3>
                        <p className="text-brand-charcoal/70 mt-1">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {content.documents && content.documents.length > 0 && (
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {content.documents.map((doc: any, idx: number) => (
                    <div key={idx} className="border border-brand-charcoal/10 p-4 flex items-center gap-4 hover:border-brand-gold transition-colors">
                      <FileText className="w-8 h-8 text-brand-gold shrink-0" />
                      <span className="font-medium text-brand-charcoal text-sm">{doc.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
}
