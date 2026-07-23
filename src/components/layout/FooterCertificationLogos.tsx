import Image from "next/image";
import type { CmsFooterCertificationLogo } from "@/types/content";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-delivery";

function isSafeImageSource(src: string) {
  return src.startsWith("/") || /^https:\/\//.test(src);
}

function isSafeLink(href?: string) {
  return Boolean(href && /^https:\/\//.test(href));
}

export function FooterCertificationLogos({ logos }: { logos?: CmsFooterCertificationLogo[] }) {
  const visibleLogos = (logos ?? [])
    .filter((logo) => logo.enabled && logo.accessibleName.trim() && isSafeImageSource(logo.imageUrl))
    .sort((a, b) => a.order - b.order || a.accessibleName.localeCompare(b.accessibleName));

  if (visibleLogos.length === 0) return null;

  return (
    <section aria-label="Certifications and compliance">
      <div className="flex justify-center lg:justify-end" data-testid="footer-certification-logos">
        {visibleLogos.map((logo, index) => {
          const image = (
            <span
              className="flex size-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-full sm:size-20"
              style={{ zIndex: visibleLogos.length - index }}
            >
              <Image
                src={getCloudinaryImageUrl(logo.imageUrl, { width: 192, height: 192 })}
                alt={logo.accessibleName}
                width={80}
                height={80}
                sizes="(min-width: 640px) 80px, 72px"
                className="h-full w-full object-contain"
              />
            </span>
          );

          return isSafeLink(logo.href) ? (
            <a
              key={`${logo.accessibleName}-${logo.order}`}
              href={logo.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={logo.accessibleName}
              className="-ml-5 first:ml-0 transition-opacity hover:opacity-85 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-brand-charcoal"
            >
              {image}
            </a>
          ) : (
            <span key={`${logo.accessibleName}-${logo.order}`} className="-ml-5 first:ml-0">{image}</span>
          );
        })}
      </div>
    </section>
  );
}
