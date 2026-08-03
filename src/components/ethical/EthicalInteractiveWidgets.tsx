"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, PhoneCall, Mail, MessageSquare, Download, Check, FileText } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function GrievanceActionWidget() {
  return (
    <section className="py-20 bg-brand-off-white text-brand-black border-t border-brand-charcoal/10 relative overflow-hidden">
      <div className="container-wide mx-auto px-6 lg:px-12 relative z-10">
        <div className="bg-white border border-brand-charcoal/15 p-8 lg:p-12 relative shadow-md">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-brand-gold text-brand-black font-semibold text-[10px] uppercase tracking-widest">
            24/7 Redressal Active
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 text-brand-gold-dark mb-4">
                <ShieldAlert className="w-6 h-6" />
                <span className="text-xs font-semibold uppercase tracking-widest">Confidential & Retaliation-Free</span>
              </div>
              <h3 className="text-3xl font-semibold text-brand-black tracking-tight mb-4">
                Deployed Worker or Family Member Need Help?
              </h3>
              <p className="text-brand-muted font-light leading-relaxed text-base max-w-2xl mb-6">
                Our welfare hotline operates in Nepali, English, Arabic, and Hindi. Grievance reports can be submitted 24/7 and are acknowledged within 24 hours. Reports can be made anonymously.
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-brand-muted">
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-brand-gold-dark" /> Anonymous options</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-brand-gold-dark" /> Acknowledged within 24 hours</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-brand-gold-dark" /> Dedicated welfare officer</span>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-4">
              <Link
                href="/worker-grievance"
                className="w-full bg-brand-black text-brand-white font-semibold px-6 py-4 text-xs uppercase tracking-widest text-center hover:bg-brand-gold hover:text-brand-black transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Submit Anonymous Grievance
              </Link>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <a
                  href="tel:+977015107440"
                  className="p-3 border border-brand-charcoal/15 bg-brand-off-white hover:border-brand-gold text-brand-black flex items-center gap-2 transition-colors font-medium"
                >
                  <PhoneCall className="w-4 h-4 text-brand-gold-dark shrink-0" />
                  <span>+977 (1) 510-7440</span>
                </a>
                <a
                  href="mailto:info@smanpower.com"
                  className="p-3 border border-brand-charcoal/15 bg-brand-off-white hover:border-brand-gold text-brand-black flex items-center gap-2 transition-colors font-medium"
                >
                  <Mail className="w-4 h-4 text-brand-gold-dark shrink-0" />
                  <span>info@smanpower.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeeMatrixWidget() {
  const MATRIX = [
    { item: "Agency Recruitment & Processing Fee", worker: "ZERO ($0)", employer: "Covered in full by Employer" },
    { item: "Work Visa & Government Permit Fees", worker: "ZERO ($0)", employer: "Paid directly by Employer" },
    { item: "Pre-Departure Medical Examination", worker: "ZERO ($0)", employer: "Reimbursed / Paid by Employer" },
    { item: "International Flight Ticket (Both Ways)", worker: "ZERO ($0)", employer: "Provided by Employer" },
    { item: "Pre-Departure Orientation & Trade Test", worker: "ZERO ($0)", employer: "Provided free to Candidate" },
  ];

  return (
    <section className="py-20 bg-brand-off-white text-brand-black border-t border-brand-charcoal/10">
      <div className="container-wide mx-auto px-6 lg:px-12">
        <ScrollReveal>
          <div className="mb-12">
            <span className="text-brand-gold-dark text-xs font-semibold tracking-widest uppercase mb-2 block">
              Employer-Pays Principle Allocation
            </span>
            <h3 className="text-3xl font-semibold tracking-tight text-brand-black">
              Fee Allocation Matrix: Worker vs Employer
            </h3>
          </div>
        </ScrollReveal>

        <div className="overflow-x-auto border border-brand-charcoal/15 bg-white shadow-sm">
          <table className="w-full text-left text-sm font-light">
            <thead className="bg-brand-stone/60 text-brand-black text-xs uppercase tracking-widest font-semibold border-b border-brand-charcoal/15">
              <tr>
                <th className="p-5">Recruitment Cost Component</th>
                <th className="p-5 text-center">Candidate / Worker Fee</th>
                <th className="p-5">Employer / Agency Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/10">
              {MATRIX.map((row, i) => (
                <tr key={i} className="hover:bg-brand-off-white transition-colors">
                  <td className="p-5 font-medium text-brand-black">{row.item}</td>
                  <td className="p-5 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-300">
                      <Check className="w-3.5 h-3.5" />
                      {row.worker}
                    </span>
                  </td>
                  <td className="p-5 text-brand-muted">{row.employer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function PolicyDownloadWidget() {
  const DOCUMENTS = [
    { title: "Ethical Recruitment & No-Fee Policy", code: "POL-ETH-2026-V4", size: "1.2 MB", href: "/trust-centre/policies" },
    { title: "RBA Code of Conduct Alignment Statement", code: "RBA-ALIGN-2026", size: "840 KB", href: "/trust-centre/certifications" },
    { title: "Worker Welfare & Grievance Protocol", code: "POL-WEL-2026-V2", size: "1.8 MB", href: "/trust-centre/policies" },
    { title: "DOFE Nepal Official Operating Licence", code: "DOFE-LIC-542/061", size: "2.1 MB", href: "/trust-centre/licences" },
  ];

  return (
    <section className="py-20 bg-brand-off-white text-brand-black border-t border-brand-charcoal/10">
      <div className="container-wide mx-auto px-6 lg:px-12">
        <ScrollReveal>
          <div className="mb-12">
            <span className="text-brand-gold-dark text-xs font-semibold tracking-widest uppercase mb-2 block">
              Governance Repository
            </span>
            <h3 className="text-3xl font-semibold tracking-tight text-brand-black">
              Official Ethical Policy Downloads
            </h3>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DOCUMENTS.map((doc, idx) => (
            <div
              key={idx}
              className="p-6 border border-brand-charcoal/15 bg-white hover:border-brand-gold shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-off-white border border-brand-charcoal/10 flex items-center justify-center text-brand-gold-dark shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-brand-black group-hover:text-brand-gold-dark transition-colors text-base">
                    {doc.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-brand-muted font-mono mt-1">
                    <span>{doc.code}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
              </div>
              <Link
                href={doc.href}
                className="h-10 px-4 bg-brand-black text-brand-white hover:bg-brand-gold hover:text-brand-black text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shrink-0 transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>View</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
