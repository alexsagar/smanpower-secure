import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, PhoneCall, Mail, AlertOctagon, FileWarning, Home, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Worker Grievance | Seven Seas Intercontinental",
  description: "Submit a grievance or report an issue related to your recruitment or overseas employment.",
};

export default function WorkerGrievancePage() {
  return (
    <div className="bg-brand-off-white min-h-screen relative overflow-hidden font-sans">
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-gold/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[600px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      {/* Page Header */}
      <div className="relative z-10 pt-32 pb-16 border-b border-brand-charcoal/5">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-red-50 border border-red-100 shadow-sm mb-8 text-red-600">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Official Support Channel</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-light tracking-tighter leading-[1.1] text-brand-black mb-6">
            Worker <span className="font-serif italic text-brand-gold">Grievance</span>
          </h1>
          <p className="text-brand-charcoal/60 text-lg font-light leading-relaxed max-w-2xl mx-auto">
            We take the safety and well-being of our deployed workers very seriously. If you are facing any issues abroad or during the recruitment process, please reach out to us immediately.
          </p>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/60 backdrop-blur-md border border-brand-charcoal/5 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 hover:border-brand-gold/30 transition-all duration-500 group">
            <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center mb-6 group-hover:bg-brand-gold transition-colors">
              <PhoneCall className="w-6 h-6 text-brand-gold group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-light tracking-tight text-brand-black mb-2">Emergency Hotline</h3>
            <p className="text-brand-charcoal/60 mb-6 font-light">Call us directly for immediate assistance regarding safety or critical contractual violations.</p>
            <a href="tel:+977015107440" className="text-2xl font-bold text-brand-black hover:text-brand-gold transition-colors mt-auto">01-5107440</a>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-brand-charcoal/5 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 hover:border-brand-gold/30 transition-all duration-500 group">
            <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center mb-6 group-hover:bg-brand-gold transition-colors">
              <Mail className="w-6 h-6 text-brand-gold group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-light tracking-tight text-brand-black mb-2">Email Support</h3>
            <p className="text-brand-charcoal/60 mb-6 font-light">Send us a detailed report of your grievance. We guarantee confidentiality and prompt action.</p>
            <a href="mailto:info@smanpower.com" className="text-2xl font-bold text-brand-black hover:text-brand-gold transition-colors mt-auto">info@smanpower.com</a>
          </div>
        </div>

        <div className="border-t border-brand-charcoal/5 pt-16">
          <h2 className="text-3xl font-light tracking-tight text-brand-black text-center mb-4">Our Commitment to Your Rights</h2>
          <p className="text-center text-brand-charcoal/60 font-light max-w-2xl mx-auto mb-12">
            Seven Seas Intercontinental is committed to ethical recruitment and the strict protection of migrant workers' rights. We act as a mediator between you and your employer to resolve any disputes relating to:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white/40 border border-brand-charcoal/5 rounded-2xl p-6 flex gap-4 items-start">
              <AlertOctagon className="w-6 h-6 text-brand-gold shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-medium text-brand-black mb-1">Wage Disputes</h4>
                <p className="text-sm text-brand-charcoal/70 font-light leading-relaxed">Non-payment, delayed payment, or unauthorized deductions of agreed wages.</p>
              </div>
            </div>

            <div className="bg-white/40 border border-brand-charcoal/5 rounded-2xl p-6 flex gap-4 items-start">
              <FileWarning className="w-6 h-6 text-brand-gold shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-medium text-brand-black mb-1">Contract Substitution</h4>
                <p className="text-sm text-brand-charcoal/70 font-light leading-relaxed">Changes to agreed job roles, salary terms, or working hours upon arrival.</p>
              </div>
            </div>

            <div className="bg-white/40 border border-brand-charcoal/5 rounded-2xl p-6 flex gap-4 items-start">
              <Home className="w-6 h-6 text-brand-gold shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-medium text-brand-black mb-1">Living Conditions</h4>
                <p className="text-sm text-brand-charcoal/70 font-light leading-relaxed">Inadequate housing, lack of basic amenities, or unsafe working environments.</p>
              </div>
            </div>

            <div className="bg-white/40 border border-brand-charcoal/5 rounded-2xl p-6 flex gap-4 items-start">
              <Users className="w-6 h-6 text-brand-gold shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-medium text-brand-black mb-1">Harassment & Abuse</h4>
                <p className="text-sm text-brand-charcoal/70 font-light leading-relaxed">Any form of physical or verbal abuse, or retention of personal documents (e.g., passports).</p>
              </div>
            </div>
          </div>

          <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-3xl p-8 text-center max-w-3xl mx-auto">
            <p className="text-brand-charcoal/80 font-light leading-relaxed">
              If your grievance requires escalation, we will coordinate directly with the respective embassies, the <strong className="font-medium text-brand-black">Department of Foreign Employment (DoFE)</strong> in Nepal, and legal authorities to ensure your safety and rightful compensation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
