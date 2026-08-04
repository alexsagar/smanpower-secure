"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { OptimizedImage } from "@/components/media/OptimizedImage";

export type EmployerTestimonial = {
  id: string;
  quote: string;
  personName: string;
  designation: string;
  companyName: string;
  country: string;
  companyLogo: string;
};

export function EmployerTestimonialsCarousel({ eyebrow, heading, introduction, testimonials }: { eyebrow: string; heading: string; introduction: string; testimonials: EmployerTestimonial[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(testimonials.length <= 1);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const updateControls = () => {
    const track = trackRef.current;
    if (!track) return;
    setAtStart(track.scrollLeft <= 1);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 1);
  };
  const move = (direction: -1 | 1) => trackRef.current?.scrollBy({ left: direction * trackRef.current.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });

  useEffect(() => {
    if (reduceMotion || isPaused || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      
      const isCurrentlyAtEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
      
      if (isCurrentlyAtEnd) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: track.clientWidth, behavior: "smooth" });
      }
    }, 5000); // 5 seconds per slide

    return () => clearInterval(interval);
  }, [reduceMotion, isPaused, testimonials.length]);

  return (
    <section 
      className="section-padding bg-brand-charcoal text-brand-off-white overflow-hidden relative" 
      aria-labelledby="employer-testimonials-heading"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {/* Decorative background element */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, var(--color-brand-gold) 0%, transparent 70%)' }}></div>
      
      <div className="container-wide relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-16">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, ease: "easeOut" }} className="max-w-3xl">
            {eyebrow ? <p className="font-brand text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold mb-4">{eyebrow}</p> : null}
            <h2 id="employer-testimonials-heading" className="font-brand text-4xl font-light text-brand-white md:text-5xl lg:text-6xl">{heading || "Foreign Employer Testimonials"}</h2>
            {introduction ? <p className="mt-6 max-w-2xl text-lg text-brand-off-white/70 font-light leading-relaxed">{introduction}</p> : null}
          </motion.div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={() => move(-1)} disabled={atStart} aria-label="Previous testimonials" className="grid size-12 place-items-center border border-brand-off-white/20 text-brand-off-white transition-all duration-300 hover:border-brand-gold hover:text-brand-gold hover:bg-brand-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold disabled:cursor-not-allowed disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:border-brand-off-white/20 disabled:hover:text-brand-off-white"><ArrowLeft className="size-5" aria-hidden="true" /></button>
            <button type="button" onClick={() => move(1)} disabled={atEnd} aria-label="Next testimonials" className="grid size-12 place-items-center border border-brand-off-white/20 text-brand-off-white transition-all duration-300 hover:border-brand-gold hover:text-brand-gold hover:bg-brand-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold disabled:cursor-not-allowed disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:border-brand-off-white/20 disabled:hover:text-brand-off-white"><ArrowRight className="size-5" aria-hidden="true" /></button>
          </div>
        </div>

        <div ref={trackRef} role="region" aria-label="Foreign employer testimonials" tabIndex={0} onScroll={updateControls} onKeyDown={(event) => { if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); } if (event.key === "ArrowRight") { event.preventDefault(); move(1); } }} className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-8 pt-4 outline-none motion-reduce:scroll-auto focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-4 focus-visible:ring-offset-brand-charcoal scrollbar-hide">
          {testimonials.map((testimonial, index) => (
            <motion.article 
              key={testimonial.id} 
              initial={reduceMotion ? false : { opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true, amount: 0.15 }} 
              transition={{ duration: 0.6, delay: reduceMotion ? 0 : Math.min(index * 0.1, 0.3), ease: [0.21, 0.47, 0.32, 0.98] }} 
              className="group relative grid min-h-[28rem] w-[min(100%,48rem)] shrink-0 snap-start grid-rows-[1fr_auto] bg-brand-charcoal border border-brand-off-white/10 p-8 md:p-12 overflow-hidden transition-colors duration-500 hover:border-brand-gold/40"
            >
              {/* Decorative top border highlight */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Background Quote Icon */}
              <Quote className="absolute top-8 right-8 size-32 text-brand-off-white/[0.02] rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110" aria-hidden="true" />
              
              <div className="relative z-10 flex flex-col">
                <Quote className="size-8 text-brand-gold mb-6 opacity-80" aria-hidden="true" />
                <blockquote className="font-brand text-lg md:text-xl leading-snug font-light text-brand-off-white">
                  {testimonial.quote}
                </blockquote>
              </div>
              
              <footer className="mt-12 flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-t border-brand-off-white/10 pt-8 relative z-10">
                <div className="min-w-0 break-words font-sans">
                  <p className="font-semibold text-lg text-brand-white mb-1">{testimonial.personName}</p>
                  {testimonial.designation ? <p className="text-brand-off-white/60 text-sm mb-1">{testimonial.designation}</p> : null}
                  <p className="font-medium text-brand-gold/90 text-sm tracking-wide uppercase">{testimonial.companyName}</p>
                  {testimonial.country ? <p className="text-brand-off-white/40 text-xs mt-2 uppercase tracking-widest">{testimonial.country}</p> : null}
                </div>
                
                <div className="flex h-16 w-32 shrink-0 items-center justify-start sm:justify-end opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  {testimonial.companyLogo ? (
                    <OptimizedImage src={testimonial.companyLogo} preset="clientLogo" alt={`${testimonial.companyName} logo`} sizes="128px" className="max-h-16 w-auto filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <span className="text-right text-xs font-semibold uppercase tracking-[0.14em] text-brand-off-white/30 border border-brand-off-white/10 px-4 py-2 group-hover:border-brand-gold/30 group-hover:text-brand-gold/70 transition-colors duration-300">{testimonial.companyName}</span>
                  )}
                </div>
              </footer>
            </motion.article>
          ))}
        </div>
      </div>
      
      {/* Hide scrollbar styles via arbitrary values if we don't have a plugin */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
    </section>
  );
}
