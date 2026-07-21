import { notFound } from "next/navigation";
import { ContactForm } from "@/components/forms/ContactForm";
import { Mail, Phone, MapPin, MessageCircle, Clock, AlertTriangle, Building2, Globe2, Inbox, Printer } from "lucide-react";
import type { Metadata } from "next";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { getPageCopy } from "@/services/page-copy.service";
import { EditorialSection } from "@/components/ui/EditorialSection";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPageSeo, getSiteSettings } from "@/repositories/content-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/contact");
  return buildPageMetadata({
    title: seo?.metaTitle || "Contact Our Manpower Agency in Nepal | Seven Seas Intercontinental",
    description: seo?.metaDescription || "Contact our Kathmandu head office. Seven Seas is a manpower agency in Nepal connecting global employers with skilled workers for Gulf and European jobs.",
    path: "/contact",
    canonicalOverride: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    noIndex: seo?.noIndex,
  });
}

const globalOffices = [
  { region: "Headquarters", city: "Kathmandu, Nepal", desc: "Main sourcing, screening, and administrative hub." },
  { region: "Middle East Hub", city: "Dubai, UAE", desc: "Client relations and worker welfare coordination." },
  { region: "Operations Desk", city: "Doha, Qatar", desc: "Deployment support and regulatory compliance." }
];

const CONTACT_ICONS = [
  <MapPin className="w-5 h-5" key="pin" />,
  <Inbox className="w-5 h-5" key="inbox" />,
  <Phone className="w-5 h-5" key="phone" />,
  <Printer className="w-5 h-5" key="printer" />,
  <Mail className="w-5 h-5" key="mail" />,
];
const CONTACT_HREFS: Array<((value: string) => string) | undefined> = [
  undefined,
  undefined,
  (value) => `tel:${value}`,
  (value) => `tel:${value}`,
  (value) => `mailto:${value}`,
];

export default async function ContactPage() {
  const copy = await getPageCopy("contact");
  const siteSettings = await getSiteSettings();
  
  return (
    <>
      <HeroInternal 
        title={copy.hero.title} 
        subtitle={copy.hero.subtitle}
        imageSrc={copy.hero.imageSrc}
      />

      {/* Main Contact Section */}
      <section className="py-24 md:py-32 bg-brand-off-white text-brand-black relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-gold/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-200/50 blur-[150px] rounded-full pointer-events-none translate-y-1/4 -translate-x-1/4" />

        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            
            {/* Left Column: Contact Info (Takes up 5 columns) */}
            <div className="lg:col-span-5 space-y-12">
              <ScrollReveal>
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-12 h-[1px] bg-brand-gold" />
                  <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase">
                    {copy.details.eyebrow}
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-light tracking-tighter leading-[1.1] text-brand-black mb-8">
                  {copy.details.heading}
                </h2>
                <p className="text-lg leading-relaxed text-brand-muted font-light">
                  {copy.details.body}
                </p>
              </ScrollReveal>

              <div className="grid gap-6">
                {copy.details.items.map((entry, i) => {
                  const item = { ...entry, href: CONTACT_HREFS[i]?.(entry.value) };
                  return (
                  <ScrollReveal key={item.label} delay={i * 0.1} className="flex items-start gap-6 p-6 border border-brand-charcoal/10 bg-white/60 backdrop-blur-md hover:border-brand-gold hover:bg-white transition-all duration-500 group rounded-sm shadow-sm hover:shadow-xl">
                    <div className="w-12 h-12 bg-brand-charcoal/5 border border-brand-charcoal/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:border-brand-gold group-hover:bg-brand-gold/10 transition-all duration-500">
                      <div className="text-brand-charcoal group-hover:text-brand-gold transition-colors duration-500">{CONTACT_ICONS[i] ?? CONTACT_ICONS[0]}</div>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-semibold uppercase tracking-widest text-brand-charcoal/60 mb-2">
                        {item.label}
                      </h3>
                      {item.href ? (
                        <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined} className="text-sm font-medium text-brand-muted hover:text-brand-gold transition-colors block mt-1">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-brand-muted mt-1">{item.value}</p>
                      )}
                    </div>
                  </ScrollReveal>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Form (Takes up 7 columns) */}
            <div className="lg:col-span-7">
              <ScrollReveal delay={0.2} className="h-full">
                <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 lg:p-16 border border-brand-charcoal/10 shadow-2xl h-full relative overflow-hidden flex flex-col justify-center rounded-sm">
                  {/* Subtle inner glow for the glass form */}
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-white to-transparent pointer-events-none" />
                  
                  <h3 className="text-3xl md:text-4xl font-light tracking-tighter text-brand-black mb-4 relative z-10">
                    {copy.form.heading}
                  </h3>
                  <p className="text-brand-muted mb-12 text-sm relative z-10 font-light">
                    {copy.form.body}
                  </p>
                  
                  <div className="relative z-10">
                    <ContactForm dict={{ common: { fullName: "Full Name", email: "Email", phone: "Phone", submit: "Send Message", required: "Required" }, contact: { subject: "Subject", message: "Message", success: "Sent", error: "Error" } }} />
                  </div>
                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>

      {/* Global Presence - Interactive Grid Map Concept */}
      <section className="py-24 md:py-32 bg-white text-brand-black relative overflow-hidden border-t border-brand-charcoal/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-brand-gold/10 blur-[200px] rounded-[100%] pointer-events-none" />
        
        {/* Abstract World Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
          <div className="mb-24 text-center">
            <ScrollReveal>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-charcoal/5 border border-brand-charcoal/10 mb-8">
                <Globe2 className="w-8 h-8 text-brand-gold" />
              </div>
              <h2 className="text-4xl md:text-6xl font-light tracking-tighter leading-[1.1] text-brand-black">
                {copy.footprintHeading}
              </h2>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {globalOffices.map((office, i) => (
              <ScrollReveal key={office.city} delay={i * 0.15}>
                <div className="group relative block h-full bg-brand-off-white/50 border border-brand-charcoal/5 p-12 hover:border-brand-gold/40 hover:bg-white transition-all duration-700 overflow-hidden rounded-sm backdrop-blur-sm cursor-crosshair hover:shadow-xl shadow-sm">
                  {/* Hover pulse effect */}
                  <div className="absolute top-12 right-12 w-3 h-3 bg-brand-gold rounded-full opacity-50 group-hover:animate-ping" />
                  <div className="absolute top-12 right-12 w-3 h-3 bg-brand-gold rounded-full opacity-80" />

                  <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative z-10">
                    <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-brand-gold mb-6 block">
                      {office.region}
                    </span>
                    <h3 className="text-3xl font-light text-brand-black mb-6 group-hover:-translate-y-1 transition-transform duration-500">{office.city}</h3>
                    <p className="text-brand-muted leading-relaxed text-sm font-light transition-colors duration-500">{office.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
