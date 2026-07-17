import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Seven Seas Intercontinental",
  description: "Privacy Policy for Seven Seas Intercontinental.",
};

export default function PrivacyPolicyPage() {
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
            Privacy <span className="font-serif italic text-brand-gold">Policy</span>
          </h1>
          <p className="text-brand-charcoal/60 text-lg font-light leading-relaxed">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-16 prose prose-lg prose-headings:font-light prose-headings:tracking-tight prose-a:text-brand-gold">
        <p>
          At Seven Seas Intercontinental, we are committed to protecting the privacy and security of our clients, partners, and candidates. This Privacy Policy outlines how we collect, use, and protect your personal information.
        </p>

        <h3>1. Information We Collect</h3>
        <p>
          We may collect personal information such as your name, contact details, employment history, and educational background when you submit a job application, inquire about our services, or interact with our website.
        </p>

        <h3>2. How We Use Your Information</h3>
        <p>
          The information we collect is strictly used to facilitate the recruitment process, respond to inquiries, and improve our services. We do not sell or rent your personal information to third parties.
        </p>

        <h3>3. Data Security</h3>
        <p>
          We employ industry-standard security measures to ensure that your personal information is protected from unauthorized access, alteration, or disclosure.
        </p>

        <h3>4. Your Rights</h3>
        <p>
          You have the right to access, update, or request the deletion of your personal information at any time. For any privacy-related concerns, please contact us at info@smanpower.com.
        </p>
      </div>
    </div>
  );
}
