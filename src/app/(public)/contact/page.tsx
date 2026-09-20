import Link from "next/link";
import { ContactForm } from "@/components/forms/ContactForm";
import { Mail, Phone, MapPin, Clock, Building2, Globe2, Inbox, Printer, ShieldCheck, Sparkles, Send, Map, Headphones } from "lucide-react";
import type { Metadata } from "next";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { getPageCopy } from "@/services/page-copy.service";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPageSeo, getSiteSettings } from "@/repositories/content-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/contact");
  return buildPageMetadata({
    title: seo?.metaTitle || "Contact Our Head Office in Kathmandu, Nepal | Seven Seas Intercontinental",
    description: seo?.metaDescription || "Contact Seven Seas Intercontinental Head Office in Kathmandu, Nepal. Connect with our ethical recruitment team for manpower supply and overseas job placement.",
    path: "/contact",
    canonicalOverride: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    noIndex: seo?.noIndex,
  });
}

export const revalidate = 86400;


// Nepal Operations Footprint Facilities (Exclusively Nepal)
const nepalOperations = [
  {
    facility: "Corporate Headquarters",
    location: "Kathmandu, Nepal",
    desc: "Executive sourcing, client agreements, candidate documentation, and international deployment administration.",
    badge: "Head Office",
    license: "Executive Hub",
  },
  {
    facility: "Trade Assessment & Skill Testing Center",
    location: "Kathmandu, Nepal",
    desc: "Practical technical trade testing, heavy equipment evaluation, weld/fabrication assessment, and skill certification.",
    badge: "Assessment Hub",
    license: "State-of-the-Art Workshop",
  },
  {
    facility: "Pre-Departure Orientation & Welfare Facility",
    location: "Kathmandu, Nepal",
    desc: "Pre-departure cultural orientation, worker rights education, language training, and medical screening coordination.",
    badge: "Welfare Center",
    license: "Worker Support Hub",
  },
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
        title={copy.hero.title || "Contact Our Office"} 
        subtitle={copy.hero.subtitle || "Head Office in Kathmandu, Nepal"}
        imageSrc={copy.hero.imageSrc}
      />

      {/* Main Luxury Contact Section */}
      <section className="py-24 md:py-32 bg-brand-off-white text-brand-black relative overflow-hidden">
        {/* Soft Ambient Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-gold/10 blur-[180px] rounded-full pointer-events-none -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-black/5 blur-[180px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3" />

        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
          {/* Section Introduction Header */}
          <div className="max-w-3xl mb-16">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 bg-brand-black text-brand-gold text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 mb-6 border border-brand-gold/30">
                <Headphones className="w-3.5 h-3.5" />
                <span>{copy.details.eyebrow || "Direct Inquiry & Advisory Desk"}</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.08] text-brand-black mb-6">
                {copy.details.heading || "Get in Touch with Our Kathmandu Head Office"}
              </h2>
              <p className="text-lg text-brand-charcoal/80 leading-relaxed font-sans">
                {copy.details.body || "Whether you are an international employer seeking verified Nepalese talent or a candidate inquiring about deployment, our team in Kathmandu is ready to assist you."}
              </p>
              <p className="mt-4 text-base text-brand-charcoal/80 leading-relaxed font-sans">
                More about{" "}
                <Link href="/manpower-agency-in-kathmandu" className="text-brand-gold-dark font-semibold hover:underline">
                  our manpower agency in Kathmandu
                </Link>
                , including the facilities and licence records behind every requirement we process.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Modern Contact Information Panel */}
            <div className="lg:col-span-5 space-y-8">
              <ScrollReveal>
                <div className="bg-brand-white border border-brand-black/15 p-8 md:p-10 shadow-xl relative overflow-hidden">
                  <div className="border-b border-brand-black/15 pb-6 mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-normal text-brand-black">Headquarters</h3>
                      <p className="text-xs uppercase font-mono tracking-widest text-brand-gold mt-1">Kathmandu, Nepal</p>
                    </div>
                    <div className="w-10 h-10 bg-brand-black text-brand-gold flex items-center justify-center border border-brand-gold/40">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Contact Info Cards */}
                  <div className="space-y-6">
                    {copy.details.items.map((entry, i) => {
                      const item = { ...entry, href: CONTACT_HREFS[i]?.(entry.value) };
                      return (
                        <div key={item.label} className="flex items-start gap-4 p-4 border border-brand-black/10 bg-brand-off-white/60 hover:bg-brand-white hover:border-brand-gold transition-all duration-300 group">
                          <div className="w-10 h-10 bg-brand-black text-brand-gold flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            {CONTACT_ICONS[i] ?? CONTACT_ICONS[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-brand-muted block mb-1">
                              {item.label}
                            </span>
                            {item.href ? (
                              <a
                                href={item.href}
                                target={item.href.startsWith("http") ? "_blank" : undefined}
                                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                className="text-sm font-semibold text-brand-black hover:text-brand-gold transition-colors break-words block"
                              >
                                {item.value}
                              </a>
                            ) : (
                              <p className="text-sm font-semibold text-brand-black break-words">{item.value}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Office Hours & Verification Badge */}
                  <div className="mt-8 pt-6 border-t border-brand-black/15 flex items-center justify-between text-xs font-sans text-brand-muted">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-gold" />
                      <span>Sun – Fri: 9:00 AM – 6:00 PM (NST)</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Govt. Licensed</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Modern Inquiry Form */}
            <div className="lg:col-span-7">
              <ScrollReveal delay={0.15}>
                <div className="bg-brand-white border border-brand-black/20 p-8 md:p-12 shadow-2xl relative overflow-hidden">
                  <div className="border-b border-brand-black/15 pb-6 mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl md:text-3xl font-normal text-brand-black">
                        {copy.form.heading || "Send Us a Message"}
                      </h3>
                      <p className="text-xs text-brand-muted mt-1 font-sans">
                        {copy.form.body || "Fill in the form below and our recruitment desk will respond promptly."}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand-gold bg-brand-black px-3 py-1.5 border border-brand-gold/30">
                      <Send className="w-3.5 h-3.5" />
                      <span>Fast Response</span>
                    </div>
                  </div>

                  <ContactForm 
                    dict={{
                      common: { 
                        fullName: "Full Name", 
                        email: "Work Email", 
                        phone: "Phone Number", 
                        submit: "Send Official Inquiry", 
                        required: "Required" 
                      }, 
                      contact: { 
                        subject: "Subject / Topic", 
                        message: "Detailed Message", 
                        success: "Message Received", 
                        error: "Failed to send" 
                      }
                    }} 
                  />
                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>

      {/* Nepal Operations Footprint (Exclusively Nepal) */}
      {!copy.hiddenSections.operations && (
      <section className="py-24 md:py-32 bg-brand-white text-brand-black relative overflow-hidden border-t-2 border-brand-black">
        <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-3xl mb-16">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 bg-brand-black text-brand-gold text-[10px] font-bold uppercase tracking-widest px-3 py-1 mb-6 border border-brand-gold/30">
                <Map className="w-3.5 h-3.5" />
                <span>Nepal Infrastructure & Facilities</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.08] text-brand-black mb-6">
                Our Nepal Operations Footprint
              </h2>
              <p className="text-lg text-brand-charcoal/80 leading-relaxed font-sans">
                Our operational facilities in Kathmandu house our specialized recruitment departments, practical trade assessment workshops, and candidate orientation facilities.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {nepalOperations.map((facility, i) => (
              <ScrollReveal key={facility.facility} delay={i * 0.15}>
                <div className="bg-brand-off-white border border-brand-black/15 p-8 md:p-10 hover:shadow-2xl hover:border-brand-gold transition-all duration-300 flex flex-col justify-between h-full group">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold bg-brand-black px-2.5 py-1">
                        {facility.badge}
                      </span>
                      <span className="text-[11px] font-sans text-brand-muted">
                        {facility.license}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-normal text-brand-black group-hover:text-brand-gold transition-colors mb-3">
                      {facility.facility}
                    </h3>
                    <p className="text-xs font-semibold text-brand-charcoal/70 uppercase tracking-widest mb-4 font-mono">
                      {facility.location}
                    </p>
                    <p className="text-sm text-brand-muted leading-relaxed font-sans">
                      {facility.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-8 border-t border-brand-black/10 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-brand-black group-hover:text-brand-gold transition-colors">
                    <span>Facility Details</span>
                    <Sparkles className="w-4 h-4 text-brand-gold" />
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
      )}
    </>
  );
}

