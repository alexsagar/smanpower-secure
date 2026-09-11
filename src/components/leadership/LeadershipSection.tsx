"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, ExternalLink, Mail, Phone } from "lucide-react";
import type { CmsTeamMember } from "@/types/content";
import { resolveMediaUrl } from "@/lib/media-resolver";

interface LeadershipSectionProps {
  leaders: CmsTeamMember[];
  eyebrow?: string;
  heading?: string;
  description?: string;
  emptyState?: string;
}

/**
 * Derives a clean, concise 2–4 line summary from the full bio
 * without altering the underlying authoritative biography.
 */
function getLeaderSummary(leader: CmsTeamMember): string {
  const bio = leader.bio?.trim();
  if (!bio) return "";

  // If the bio has explicit paragraph breaks, evaluate the first paragraph
  const firstParagraph = bio.split(/\n\n+/)[0].trim();
  if (firstParagraph.length <= 220) {
    return firstParagraph;
  }

  // Extract the first complete sentence ending in . ! or ?
  const match = firstParagraph.match(/^([^.!?]+[.!?])/);
  if (match && match[1] && match[1].length >= 50 && match[1].length <= 220) {
    return match[1].trim();
  }

  // Fallback to substring at a clean word boundary (~180 chars)
  if (firstParagraph.length > 180) {
    return firstParagraph.slice(0, 180).replace(/\s+\S*$/, "") + "…";
  }

  return firstParagraph;
}

export function LeadershipSection({
  leaders,
  eyebrow = "OUR LEADERSHIP",
  heading = "Experienced leadership.\nResponsible recruitment.",
  description = "Our leadership team brings decades of experience in international recruitment, workforce mobilisation and responsible employment practices.",
  emptyState = "Leadership profiles are being updated.",
}: LeadershipSectionProps) {
  const [selectedLeader, setSelectedLeader] = useState<CmsTeamMember | null>(null);
  const triggerRefMap = useRef<Map<string, HTMLButtonElement>>(new Map());
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleOpenProfile = useCallback((leader: CmsTeamMember) => {
    setSelectedLeader(leader);
  }, []);

  const handleCloseProfile = useCallback(() => {
    if (selectedLeader) {
      const triggerBtn = triggerRefMap.current.get(selectedLeader.id);
      setSelectedLeader(null);
      // Return focus to the trigger button for keyboard accessibility
      setTimeout(() => triggerBtn?.focus(), 50);
    }
  }, [selectedLeader]);

  // Lock body scroll and trap ESC key when modal is open
  useEffect(() => {
    if (!selectedLeader) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseProfile();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    // Focus the close button when opened
    setTimeout(() => closeButtonRef.current?.focus(), 100);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedLeader, handleCloseProfile]);

  const selectedIndex = selectedLeader
    ? leaders.findIndex((l) => l.id === selectedLeader.id)
    : -1;

  return (
    <section className="py-24 sm:py-28 lg:py-32 bg-[#FAF9F6] border-b border-[#E6E2DA] transition-colors">
      <div className="container-wide mx-auto px-6 lg:px-12">
        {/* Section Introduction: Balanced Two-Column Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <span className="text-xs font-mono font-semibold tracking-[0.25em] uppercase text-brand-gold-dark mb-4 block">
              {eyebrow}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-normal leading-[1.12] text-brand-black tracking-tight whitespace-pre-line">
              {heading}
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pt-7">
            <p className="text-base sm:text-lg text-brand-charcoal/80 leading-relaxed font-sans font-light">
              {description}
            </p>
          </div>
        </div>

        {/* Subtle Horizontal Divider */}
        <div className="w-full h-px bg-[#E6E2DA] mt-12 sm:mt-14 lg:mt-16 mb-12 sm:mb-14 lg:mb-16" />

        {/* Profile Grid: 3 columns desktop, 2 tablet, 1 mobile */}
        {leaders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            {leaders.map((leader, i) => {
              const summary = getLeaderSummary(leader);
              const formattedNumber = String(i + 1).padStart(2, "0");
              // Migrated R2 assets keep a legacy Cloudinary secureUrl; the resolver is the
              // only thing that knows provider/storageKey.
              const photoUrl = leader.photo ? resolveMediaUrl(leader.photo) : undefined;
              const photoAlt = leader.photoAltText || leader.photo?.altText || leader.name;

              return (
                <article
                  key={leader.id}
                  className="group flex flex-col justify-between text-left"
                >
                  <div>
                    {/* Subtle structural editorial number */}
                    <span
                      className="text-xs font-mono font-medium text-brand-gold-dark tracking-widest mb-3 block select-none"
                      aria-hidden="true"
                    >
                      {formattedNumber}
                    </span>

                    {/* Portrait in consistent 4:5 aspect ratio */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-stone/30 border border-[#E6E2DA]">
                      {photoUrl ? (
                        <Image
                          src={photoUrl}
                          alt={photoAlt}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 380px"
                          className="object-cover grayscale contrast-[1.04] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-muted text-xs font-mono uppercase">
                          No Portrait
                        </div>
                      )}
                    </div>

                    {/* Left-Aligned Profile Details */}
                    <div className="mt-6 text-left">
                      <h3 className="font-serif text-2xl lg:text-[28px] font-normal text-brand-black leading-snug tracking-tight transition-colors duration-300 group-hover:text-brand-gold-dark">
                        {leader.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase text-brand-gold-dark mt-1.5">
                        {leader.designation}
                      </p>
                      {summary ? (
                        <p className="text-[15px] leading-relaxed text-brand-charcoal/80 font-sans mt-4 line-clamp-4">
                          {summary}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Left-Aligned View Profile Text Link */}
                  <div className="mt-5 pt-1 text-left">
                    <button
                      ref={(el) => {
                        if (el) triggerRefMap.current.set(leader.id, el);
                        else triggerRefMap.current.delete(leader.id);
                      }}
                      type="button"
                      onClick={() => handleOpenProfile(leader)}
                      aria-haspopup="dialog"
                      aria-expanded={selectedLeader?.id === leader.id}
                      className="group/btn inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-brand-black hover:text-brand-gold-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold py-1 cursor-pointer"
                    >
                      <span>View profile</span>
                      <ArrowRight
                        className="w-3.5 h-3.5 text-brand-gold-dark transition-transform duration-300 group-hover/btn:translate-x-1"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="text-left text-brand-muted font-sans py-8">{emptyState}</p>
        )}
      </div>

      {/* Accessible Full Profile Slide-Over Drawer Modal */}
      <AnimatePresence>
        {selectedLeader && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-end"
            role="presentation"
          >
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-brand-black/50 backdrop-blur-[2px]"
              onClick={handleCloseProfile}
              aria-hidden="true"
            />

            {/* Slide-over Drawer Panel */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="drawer-leader-name"
              aria-describedby="drawer-leader-bio"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative z-10 h-full w-full max-w-xl bg-[#FAF9F6] border-l border-[#E6E2DA] shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              {/* Drawer Content */}
              <div className="p-8 sm:p-12">
                {/* Header with index and close button */}
                <div className="flex items-center justify-between pb-6 border-b border-[#E6E2DA]">
                  <span className="text-xs font-mono font-medium tracking-widest text-brand-gold-dark uppercase">
                    Leader {String(selectedIndex + 1).padStart(2, "0")} / {String(leaders.length).padStart(2, "0")}
                  </span>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={handleCloseProfile}
                    className="p-2 -mr-2 text-brand-charcoal/70 hover:text-brand-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold transition-colors"
                    aria-label="Close profile details"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Profile Portrait in Drawer */}
                <div className="mt-8 flex flex-col sm:flex-row gap-6 items-start">
                  <div className="relative w-36 sm:w-44 aspect-[4/5] shrink-0 bg-brand-stone/30 border border-[#E6E2DA] overflow-hidden">
                    {selectedLeader.photo ? (
                      <Image
                        src={resolveMediaUrl(selectedLeader.photo)}
                        alt={selectedLeader.photoAltText || selectedLeader.name}
                        fill
                        sizes="180px"
                        className="object-cover grayscale contrast-[1.04]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-muted text-xs font-mono uppercase">
                        No Photo
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-left">
                    <h3
                      id="drawer-leader-name"
                      className="font-serif text-2xl sm:text-3xl font-normal text-brand-black leading-tight tracking-tight"
                    >
                      {selectedLeader.name}
                    </h3>
                    <p className="text-xs font-mono font-bold tracking-widest uppercase text-brand-gold-dark mt-2">
                      {selectedLeader.designation}
                    </p>
                    {selectedLeader.department ? (
                      <p className="text-xs font-mono text-brand-muted tracking-wider mt-1">
                        {selectedLeader.department}
                      </p>
                    ) : null}

                    {/* Social / Contact Links if present */}
                    <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-[#E6E2DA]">
                      {selectedLeader.linkedIn ? (
                        <a
                          href={selectedLeader.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-brand-black hover:text-brand-gold-dark transition-colors"
                        >
                          <span>LinkedIn</span>
                          <ExternalLink className="w-3 h-3 text-brand-gold-dark" />
                        </a>
                      ) : null}
                      {selectedLeader.email ? (
                        <a
                          href={`mailto:${selectedLeader.email}`}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-brand-black hover:text-brand-gold-dark transition-colors"
                        >
                          <Mail className="w-3 h-3 text-brand-gold-dark" />
                          <span>Email</span>
                        </a>
                      ) : null}
                      {selectedLeader.phone ? (
                        <a
                          href={`tel:${selectedLeader.phone}`}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-brand-black hover:text-brand-gold-dark transition-colors"
                        >
                          <Phone className="w-3 h-3 text-brand-gold-dark" />
                          <span>{selectedLeader.phone}</span>
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Subtle Accent Divider */}
                <div className="w-12 h-px bg-brand-gold-dark/40 my-8" />

                {/* Full Authoritative Biography */}
                <div id="drawer-leader-bio" className="text-left">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold-dark mb-4">
                    Biography
                  </h4>
                  {selectedLeader.bio ? (
                    <div className="text-brand-charcoal/90 text-[15px] sm:text-base leading-relaxed space-y-4 font-sans font-light">
                      {selectedLeader.bio.split(/\n\n+/).map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-brand-muted text-sm italic">
                      Full biography details are currently being updated.
                    </p>
                  )}
                </div>
              </div>

              {/* Drawer Footer with close action */}
              <div className="p-8 sm:p-12 pt-6 border-t border-[#E6E2DA] bg-[#FAF9F6] flex justify-end">
                <button
                  type="button"
                  onClick={handleCloseProfile}
                  className="px-6 py-2.5 text-xs font-mono font-semibold tracking-wider uppercase border border-brand-charcoal/20 hover:border-brand-black hover:bg-brand-black hover:text-white transition-all duration-200"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
