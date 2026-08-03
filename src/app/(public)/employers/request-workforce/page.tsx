import { notFound } from "next/navigation";
import { RequestWorkforceForm } from "@/components/forms/RequestWorkforceForm";
import type { Metadata } from "next";
import { getPageCopy } from "@/services/page-copy.service";
import { HeroInternal } from "@/components/ui/HeroInternal";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ShieldCheck, Users, Zap, CheckCircle2 } from "lucide-react";
import { RESPONSE_TIME_COMMITMENT } from "@/config/approved-content";

export const metadata: Metadata = {
  title: "Request Workforce | Seven Seas Intercontinental",
  description: `Submit your workforce requirements and Seven Seas Intercontinental will respond ${RESPONSE_TIME_COMMITMENT} with a recruitment proposal.`,
};

const hardcodedDict = {
  employer: {
    formTitle: "Request Workforce",
    formDescription: `Submit your requirements below. Our corporate relations team will review your needs and contact you ${RESPONSE_TIME_COMMITMENT}.`,
    companyName: "Company Name",
    contactPerson: "Contact Person",
    designation: "Designation",
    businessEmail: "Business Email",
    phoneNumber: "Phone Number",
    country: "Country of Operation",
    industry: "Industry Sector",
    workforceCategory: "Workforce Category (e.g. Skilled, Semi-Skilled)",
    numberOfWorkers: "Number of Workers Required",
    expectedMobilisation: "Expected Mobilisation Date",
    requiredSkills: "Specific Skills or Certifications Required",
    consent: "I consent to Seven Seas Intercontinental processing my data to respond to this enquiry."
  },
  common: {
    message: "Additional Message or Project Details",
    submit: "Submit Request"
  }
};

const ADVANTAGE_ICONS = [
  <ShieldCheck className="w-6 h-6" key="shield" />,
  <Users className="w-6 h-6" key="users" />,
  <Zap className="w-6 h-6" key="zap" />,
];


export default async function RequestWorkforcePage() {
  const copy = await getPageCopy("employers/request-workforce");
  return (
    <>
      <HeroInternal 
        title={copy.hero.title} 
        subtitle={copy.hero.subtitle}
        imageSrc={copy.hero.imageSrc}
      />

      <section className="py-24 md:py-32 bg-brand-off-white relative">
        <div className="container-wide mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            
            {/* Left Column: The Seven Seas Advantage (Takes up 4 columns) */}
            {!copy.hiddenSections.intro && (
            <div className="lg:col-span-4 space-y-12">
              <ScrollReveal>
                <span className="text-brand-gold text-[10px] font-semibold tracking-[0.2em] uppercase mb-4 block">
                  {copy.intro.eyebrow}
                </span>
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.1] text-brand-black mb-6">
                  {copy.intro.heading}
                </h2>
                <p className="text-lg leading-relaxed text-brand-muted font-light mb-12">
                  {copy.intro.body}
                </p>

                <div className="space-y-8">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-brand-charcoal border-b border-brand-charcoal/10 pb-4">
                    {copy.approachHeading}
                  </h3>
                  {copy.advantages.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                      <div className="text-brand-gold mt-1 group-hover:scale-110 transition-transform duration-300">
                        {ADVANTAGE_ICONS[i] ?? ADVANTAGE_ICONS[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-brand-black mb-1">{item.title}</h4>
                        <p className="text-sm text-brand-muted leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
            )}

            {/* Right Column: Massive Form. Widens to the full grid when the
                advantage column is hidden, so no empty gutter is left. */}
            <div className={copy.hiddenSections.intro ? "lg:col-span-12" : "lg:col-span-8"}>
              <ScrollReveal delay={0.2} className="h-full">
                <div className="bg-white p-8 md:p-12 border border-brand-charcoal/10 shadow-2xl h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-[80px] rounded-full pointer-events-none" />
                  
                  <div className="flex items-center gap-3 mb-8 pb-8 border-b border-brand-charcoal/10">
                    <CheckCircle2 className="w-8 h-8 text-brand-gold" />
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-brand-black">
                        {hardcodedDict.employer.formTitle}
                      </h3>
                      <p className="text-brand-muted text-sm">
                        {hardcodedDict.employer.formDescription}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <RequestWorkforceForm dict={hardcodedDict} />
                  </div>
                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
