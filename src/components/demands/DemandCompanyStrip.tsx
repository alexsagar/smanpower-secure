import React from "react";
import Image from "next/image";
import { Building2, MapPin, Briefcase, Calendar, CheckCircle2 } from "lucide-react";
import { CmsDemand } from "@/types/content";
import { resolveMediaUrl } from "@/lib/media-resolver";
import { NoTranslate } from "@/components/i18n/NoTranslate";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-delivery";

interface DemandCompanyStripProps {
  demand: CmsDemand;
}

export function DemandCompanyStrip({ demand }: DemandCompanyStripProps) {
  return (
    <div className="bg-white border border-brand-charcoal/10 p-6 lg:p-8 rounded-sm mb-12 shadow-sm relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-brand-gold" />
      
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
        {/* Logo or Fallback */}
        <div className="w-24 h-24 shrink-0 bg-brand-charcoal/5 rounded-sm border border-brand-charcoal/10 flex items-center justify-center p-2">
          {demand.companyLogo ? (
            <div className="relative w-full h-full">
              <Image
                src={getCloudinaryImageUrl(resolveMediaUrl(demand.companyLogo), { width: 192, height: 192 })}
                alt={demand.companyName}
                fill
                sizes="96px"
                className="object-contain"
              />
            </div>
          ) : (
            <Building2 className="w-10 h-10 text-brand-charcoal/30" />
          )}
        </div>

        {/* Company Details Grid */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-semibold text-brand-charcoal/50 uppercase tracking-wider mb-1">Company</p>
            <NoTranslate as="p" className="font-bold text-brand-black flex items-center gap-2">
              {demand.companyName}
            </NoTranslate>
          </div>

          <div>
            <p className="text-xs font-semibold text-brand-charcoal/50 uppercase tracking-wider mb-1">Location</p>
            <p className="font-medium text-brand-charcoal flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-gold" />
              {demand.city ? `${demand.city}, ` : ""}{demand.country}
            </p>
          </div>

          {demand.industry && (
            <div>
              <p className="text-xs font-semibold text-brand-charcoal/50 uppercase tracking-wider mb-1">Industry</p>
              <p className="font-medium text-brand-charcoal flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-gold" />
                {demand.industry}
              </p>
            </div>
          )}

          {demand.demandReferenceNumber && (
            <div>
              <p className="text-xs font-semibold text-brand-charcoal/50 uppercase tracking-wider mb-1">Demand Ref.</p>
              <NoTranslate as="p" className="font-mono text-sm text-brand-charcoal flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                {demand.demandReferenceNumber}
              </NoTranslate>
            </div>
          )}

          {demand.approvalDate && (
            <div>
              <p className="text-xs font-semibold text-brand-charcoal/50 uppercase tracking-wider mb-1">Approval Date</p>
              <p className="font-medium text-brand-charcoal flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-gold" />
                {new Date(demand.approvalDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          )}

          {demand.contractType && (
            <div>
              <p className="text-xs font-semibold text-brand-charcoal/50 uppercase tracking-wider mb-1">Contract</p>
              <p className="font-medium text-brand-charcoal">
                {demand.contractType}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
