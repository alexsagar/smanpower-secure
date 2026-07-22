import type { CmsContentBlock } from "@/types/content";
import { EmployerTestimonialsCarousel, type EmployerTestimonial } from "./EmployerTestimonialsCarousel";

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function getPublishedEmployerTestimonials(content: Record<string, unknown>): EmployerTestimonial[] {
  const testimonials = Array.isArray(content.testimonials) ? content.testimonials : [];

  return testimonials.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const quote = asString(record.quote);
    const personName = asString(record.personName);
    const companyName = asString(record.companyName);

    if (record.isPublished !== true || !quote || !personName || !companyName) return [];

    return [{
      id: asString(record.id) || `${personName}-${companyName}-${index}`,
      quote,
      personName,
      companyName,
      designation: asString(record.designation),
      country: asString(record.country),
      companyLogo: asString(record.companyLogo),
    }];
  });
}

export function EmployerTestimonialsBlock({ block }: { block: CmsContentBlock }) {
  const content = block.content as Record<string, unknown>;
  const testimonials = getPublishedEmployerTestimonials(content);

  if (testimonials.length === 0) return null;

  return (
    <EmployerTestimonialsCarousel
      eyebrow={asString(content.eyebrow)}
      heading={asString(content.heading)}
      introduction={asString(content.introduction)}
      testimonials={testimonials}
    />
  );
}
