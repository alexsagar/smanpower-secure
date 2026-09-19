import React from "react";
import Link from "next/link";
import { Clock, FileCheck2, ArrowRight, ShieldCheck, Globe2, Building2 } from "lucide-react";

export function WorkforceMobilizationSection() {
  return (
    <section className="py-24 bg-brand-off-white text-brand-black border-t border-brand-charcoal/10">
      <div className="container-wide mx-auto px-6 lg:px-12 max-w-7xl">
        {/* Section Heading */}
        <div className="max-w-3xl mb-16">
          <span className="text-brand-gold-dark text-xs font-semibold tracking-[0.3em] uppercase mb-3 block font-mono">
            OPERATIONAL TIMELINES &amp; COMPLIANCE
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal text-brand-black tracking-tight mb-4">
            Workforce Mobilization Timelines &amp; Bilateral Requirements.
          </h2>
          <p className="text-brand-charcoal/80 text-base md:text-lg leading-relaxed">
            International workforce deployment from Nepal operates under strict bilateral labor frameworks governed by the Department of Foreign Employment (DoFE). Below are verified deployment benchmarks and documentation requirements for GCC and European corridors.
          </p>
        </div>

        {/* Timeline Matrix: GCC vs Europe */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* GCC Corridors */}
          <div className="bg-white border-2 border-brand-black/10 p-8 lg:p-10 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-brand-black/10 mb-6">
                <div className="flex items-center gap-3">
                  <Globe2 className="w-5 h-5 text-brand-gold-dark" />
                  <h3 className="font-serif text-2xl font-bold text-brand-black">GCC Corridors</h3>
                </div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-black bg-brand-gold/15 border border-brand-gold/40 px-3 py-1">
                  30 – 45 Days Lead Time
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-4">
                Saudi Arabia &bull; UAE &bull; Qatar &bull; Kuwait &bull; Bahrain &bull; Oman
              </p>
              <ul className="space-y-4 text-sm text-brand-charcoal/90">
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-brand-black block">Days 1–10: Demand Attestation &amp; Sourcing</strong>
                    <span>Chamber of Commerce and Nepal Embassy demand verification, DoFE pre-approval advertisement, and candidate sourcing.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-brand-black block">Days 11–18: Trade Testing &amp; Employer Selection</strong>
                    <span>Practical trade testing in Kathmandu facilities, client video or in-person interviews, and formal offer acceptance.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-brand-black block">Days 19–35: GAMCA Medicals &amp; Visa Processing</strong>
                    <span>Biometric enrollment, GAMCA-approved medical examinations, host-country work visa issuance, and electronic stamping.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-brand-black block">Days 36–45: DoFE Clearance &amp; Mobilization</strong>
                    <span>Mandatory pre-departure orientation, government welfare fund deposit, final DoFE labor sticker, and scheduled flight dispatch.</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-brand-black/10 flex items-center justify-between text-xs text-brand-muted">
              <span>Standard GCC Cycle</span>
              <span className="text-brand-gold-dark font-semibold">Fast-track available for urgent demands</span>
            </div>
          </div>

          {/* European Corridors */}
          <div className="bg-white border-2 border-brand-black/10 p-8 lg:p-10 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-brand-black/10 mb-6">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-brand-gold-dark" />
                  <h3 className="font-serif text-2xl font-bold text-brand-black">European Corridors</h3>
                </div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-black bg-brand-gold/15 border border-brand-gold/40 px-3 py-1">
                  90 – 150 Days Lead Time
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-4">
                Romania &bull; Croatia &bull; Poland &bull; Cyprus &bull; Malta
              </p>
              <ul className="space-y-4 text-sm text-brand-charcoal/90">
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-brand-black block">Days 1–20: Candidate Selection &amp; Contracting</strong>
                    <span>Rigorous trade testing, English assessment, police clearance certification, and bilingual contract execution.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-brand-black block">Days 21–90: Host-Country Work Permit Approval</strong>
                    <span>Employer submits paperwork to local immigration inspectorate / Ministry of Labour for official work permit issuance.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-brand-black block">Days 91–130: Consular Visa Appointment &amp; Stamping</strong>
                    <span>Submission to European consular mission (New Delhi / Kathmandu), biometric interview, and entry visa stamping.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-brand-black block">Days 131–150: Bilateral Clearance &amp; Departure</strong>
                    <span>DoFE European corridor labor permit approval, travel insurance, cultural onboarding, and coordinated transit mobilization.</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-brand-black/10 flex items-center justify-between text-xs text-brand-muted">
              <span>European Work Permit Cycle</span>
              <span className="text-brand-gold-dark font-semibold">Subject to host immigration processing</span>
            </div>
          </div>
        </div>

        {/* Bilateral Documentation Checklist */}
        <div className="bg-brand-black text-brand-white p-8 md:p-12 border border-brand-black">
          <div className="max-w-3xl mb-8">
            <span className="text-brand-gold text-xs font-semibold tracking-widest uppercase mb-2 block font-mono">
              REGULATORY COMPLIANCE CHECKLIST
            </span>
            <h3 className="font-serif text-2xl md:text-3xl text-brand-white font-normal mb-3">
              Mandatory Bilateral Documentation Matrix
            </h3>
            <p className="text-sm md:text-base text-brand-white/80 leading-relaxed">
              To recruit workers from Nepal, overseas employers must execute five standard bilateral documents mandated by Nepal’s Foreign Employment Act, 2007:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div className="bg-brand-charcoal/50 border border-brand-white/10 p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileCheck2 className="w-4 h-4 text-brand-gold" />
                <h4 className="font-semibold text-brand-white text-base">1. Demand Letter</h4>
              </div>
              <p className="text-xs text-brand-white/70 leading-relaxed">
                Specifies exact job titles, candidate quantities, monthly basic salary, working hours, overtime terms, food, accommodation, and medical insurance.
              </p>
            </div>

            <div className="bg-brand-charcoal/50 border border-brand-white/10 p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileCheck2 className="w-4 h-4 text-brand-gold" />
                <h4 className="font-semibold text-brand-white text-base">2. Power of Attorney</h4>
              </div>
              <p className="text-xs text-brand-white/70 leading-relaxed">
                Legally authorizes Seven Seas Intercontinental Services (DoFE Licence 888/067/068) to handle recruitment, trade testing, and embassy processing.
              </p>
            </div>

            <div className="bg-brand-charcoal/50 border border-brand-white/10 p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileCheck2 className="w-4 h-4 text-brand-gold" />
                <h4 className="font-semibold text-brand-white text-base">3. Agency Agreement</h4>
              </div>
              <p className="text-xs text-brand-white/70 leading-relaxed">
                Defines mutual responsibilities, costs covered under the Employer-Pays Principle (zero candidate fees), and post-arrival worker welfare covenants.
              </p>
            </div>

            <div className="bg-brand-charcoal/50 border border-brand-white/10 p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileCheck2 className="w-4 h-4 text-brand-gold" />
                <h4 className="font-semibold text-brand-white text-base">4. Employment Contract</h4>
              </div>
              <p className="text-xs text-brand-white/70 leading-relaxed">
                Individual contract sample matching the Demand Letter terms, detailing leave benefits, repatriation provisions, and workplace safety clauses.
              </p>
            </div>

            <div className="bg-brand-charcoal/50 border border-brand-white/10 p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileCheck2 className="w-4 h-4 text-brand-gold" />
                <h4 className="font-semibold text-brand-white text-base">5. Guarantee Letter</h4>
              </div>
              <p className="text-xs text-brand-white/70 leading-relaxed">
                Formal undertaking from the employer guaranteeing worker safety, non-reassignment to unauthorized third parties, and adherence to labor laws.
              </p>
            </div>

            <div className="bg-brand-charcoal/50 border border-brand-white/10 p-6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-brand-gold" />
                <h4 className="font-semibold text-brand-white text-base">6. Embassy Attestation</h4>
              </div>
              <p className="text-xs text-brand-white/70 leading-relaxed">
                Official verification by the local Chamber of Commerce and Nepal Diplomatic Mission in the host country before vacancy advertisement in Nepal.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="border-t border-brand-white/10 pt-8 flex flex-wrap items-center justify-between gap-6">
            <div className="text-xs text-brand-white/70">
              Need assistance preparing your bilateral documents or demand letter? Our compliance team provides bilingual templates.
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/employers/request-workforce"
                className="inline-flex items-center gap-2 bg-brand-gold text-brand-black px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-brand-white transition-colors"
              >
                <span>Submit Workforce Demand</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/trust-centre/licences"
                className="inline-flex items-center gap-2 border border-brand-white/30 text-brand-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:border-brand-gold hover:text-brand-gold transition-colors"
              >
                <span>Verify Licences</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
