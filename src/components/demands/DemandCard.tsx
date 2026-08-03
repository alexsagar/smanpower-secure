import React from "react";
import Link from "next/link";
import { Building2, MapPin, Users, Calendar, Briefcase } from "lucide-react";
import { CmsDemand } from "@/types/content";
import { DemandStatusBadgeComponent } from "./DemandStatusBadge";
import { ReadvertisementBadge } from "./ReadvertisementBadge";
import { formatDemandDate, toDateOnly } from "@/lib/demand-presentation";

interface DemandCardProps {
  demand: CmsDemand;
  lang?: string;
}

export function DemandCard({ demand }: DemandCardProps) {
  const isClosed = demand.status === "CLOSED" || demand.status === "ARCHIVED";

  return (
    <div className="bg-white/60 backdrop-blur-md border border-brand-charcoal/5 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-brand-gold/30 transition-all duration-300 flex flex-col h-full group relative">
      {/* Decorative top border */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-gold/20 via-brand-gold to-brand-gold/20 absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-6 flex-1 flex flex-col">
        {/* Header: Status and Reference */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <DemandStatusBadgeComponent status={demand.statusBadge} />
            {demand.isReadvertisement && <ReadvertisementBadge />}
          </div>
          {(demand.demandLotNumber || demand.demandReferenceNumber) && (
            <span className="max-w-[12rem] text-right text-xs font-mono text-brand-charcoal/60 break-words">
              Demand Lot Number: {demand.demandLotNumber || demand.demandReferenceNumber}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-light tracking-tight text-brand-black mb-4 line-clamp-2 leading-tight group-hover:text-brand-gold transition-colors">
          {demand.title}
        </h3>

        {/* Company & Location Info */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-brand-charcoal/80">
            <Building2 className="w-4 h-4 mr-2 shrink-0 text-brand-gold" />
            <span className="truncate">{demand.companyName}</span>
          </div>
          <div className="flex items-center text-sm text-brand-charcoal/80">
            <MapPin className="w-4 h-4 mr-2 shrink-0 text-brand-gold" />
            <span>
              {demand.city ? `${demand.city}, ` : ""}
              {demand.country}
            </span>
          </div>
          {demand.industry && (
            <div className="flex items-center text-sm text-brand-charcoal/80">
              <Briefcase className="w-4 h-4 mr-2 shrink-0 text-brand-gold" />
              <span>{demand.industry}</span>
            </div>
          )}
        </div>

        <div className="mt-auto">
          {/* Key Stats Row */}
          <div className="flex items-center justify-between py-3 border-t border-brand-charcoal/10">
            <div className="flex items-center text-sm text-brand-charcoal">
              <Users className="w-4 h-4 mr-1.5 text-brand-gold" />
              <span className="font-semibold">{demand.totalManpower}</span>
              <span className="ml-1 text-brand-charcoal/60 text-xs uppercase tracking-wider">
                Workers
              </span>
            </div>
            <div className="flex items-center text-sm text-brand-charcoal">
              <Briefcase className="w-4 h-4 mr-1.5 text-brand-gold" />
              <span className="font-semibold">{demand.totalPositions}</span>
              <span className="ml-1 text-brand-charcoal/60 text-xs uppercase tracking-wider">
                Positions
              </span>
            </div>
          </div>

          {demand.maleVacancies != null && demand.femaleVacancies != null && (
            <div className="grid grid-cols-3 gap-2 py-3 border-t border-brand-charcoal/10 text-center text-xs" aria-label="Worker requirements">
              <span><strong>{demand.maleVacancies}</strong> Male</span>
              <span><strong>{demand.femaleVacancies}</strong> Female</span>
              <span><strong>{demand.totalVacancies}</strong> Total</span>
            </div>
          )}

          {demand.interviewDate && (
            <div className="flex items-center py-3 border-t border-brand-charcoal/10 text-sm">
              <Calendar className="w-4 h-4 mr-2 text-brand-gold" />
              <span className="text-brand-charcoal/70">Interview Date:</span>
              <time className="ml-auto font-medium text-brand-black" dateTime={toDateOnly(demand.interviewDate)}>
                {formatDemandDate(demand.interviewDate)}
              </time>
            </div>
          )}

          {/* Deadline Row */}
          {demand.applicationDeadline && (
            <div className="flex items-center py-3 border-t border-brand-charcoal/10 text-sm">
              <Calendar className="w-4 h-4 mr-2 text-brand-gold" />
              <span className="text-brand-charcoal/70">Deadline:</span>
              <time className="ml-auto font-medium text-brand-black" dateTime={toDateOnly(demand.applicationDeadline)}>
                {formatDemandDate(demand.applicationDeadline)}
              </time>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="p-6 pt-0 mt-auto">
        <Link
          href={`/demands/${demand.slug}`}
          className={`block w-full text-center py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
            isClosed
              ? "bg-brand-charcoal/5 text-brand-charcoal/40 cursor-default pointer-events-none"
              : "bg-brand-black text-brand-white hover:bg-brand-gold hover:text-brand-black hover:shadow-md hover:shadow-brand-gold/20"
          }`}
        >
          {isClosed ? "Applications Closed" : "View Details"}
        </Link>
      </div>
    </div>
  );
}
