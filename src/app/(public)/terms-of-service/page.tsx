import React from "react";
import { Metadata } from "next";
import { FileText, ShieldCheck, Scale, AlertTriangle, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Seven Seas Intercontinental",
  description: "Terms of Service for Seven Seas Intercontinental.",
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-brand-off-white min-h-screen relative overflow-hidden font-sans">
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-gold/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[600px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      {/* Page Header */}
      <div className="relative z-10 pt-32 pb-16 border-b border-brand-charcoal/5">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <h1 className="text-5xl md:text-6xl font-light tracking-tighter leading-[1.1] text-brand-black mb-6">
            Terms of <span className="font-serif italic text-brand-gold">Service</span>
          </h1>
          <p className="text-brand-charcoal/60 text-lg font-light leading-relaxed">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-16">
        <p className="text-xl text-brand-charcoal/70 mb-12 font-light text-center">
          By accessing and using the Seven Seas Intercontinental website and services, you agree to comply with and be bound by the following terms and conditions.
        </p>

        <div className="space-y-8">
          <div className="bg-white/60 backdrop-blur-md border border-brand-charcoal/5 rounded-3xl p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-brand-gold/30 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                <FileText className="w-6 h-6 text-brand-gold group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-light tracking-tight text-brand-black">1. Acceptance of Terms</h3>
            </div>
            <p className="text-brand-charcoal/70 leading-relaxed pl-16">
              These Terms of Service govern your use of our website and services. If you do not agree with any part of these terms, please refrain from using our services.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-brand-charcoal/5 rounded-3xl p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-brand-gold/30 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                <Scale className="w-6 h-6 text-brand-gold group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-light tracking-tight text-brand-black">2. Use of Services</h3>
            </div>
            <p className="text-brand-charcoal/70 leading-relaxed pl-16">
              Our platform connects candidates with foreign job opportunities. While we strive to ensure the accuracy of all job postings, we cannot guarantee employment, visa approvals, or specific conditions set by foreign employers.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-brand-charcoal/5 rounded-3xl p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-brand-gold/30 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                <AlertTriangle className="w-6 h-6 text-red-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-light tracking-tight text-brand-black">3. Zero-Tolerance Policy</h3>
            </div>
            <p className="text-brand-charcoal/70 leading-relaxed pl-16">
              We operate strictly under the ethical recruitment guidelines of the Government of Nepal. Any fraudulent activities, forged documents, or illegal payments will result in immediate disqualification and reporting to the authorities.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-brand-charcoal/5 rounded-3xl p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-brand-gold/30 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                <ShieldCheck className="w-6 h-6 text-brand-gold group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-light tracking-tight text-brand-black">4. Limitation of Liability</h3>
            </div>
            <p className="text-brand-charcoal/70 leading-relaxed pl-16">
              Seven Seas Intercontinental shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or website content.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-brand-charcoal/5 rounded-3xl p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-brand-gold/30 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                <HelpCircle className="w-6 h-6 text-brand-gold group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-light tracking-tight text-brand-black">5. Contact Us</h3>
            </div>
            <p className="text-brand-charcoal/70 leading-relaxed pl-16">
              If you have any questions regarding these terms, please contact our administrative team at <a href="mailto:info@smanpower.com" className="text-brand-gold font-bold hover:underline">info@smanpower.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
