"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Users, Check, X, Minus } from "lucide-react";
import { CmsDemand } from "@/types/content";
import { cn } from "@/lib/utils";

interface DemandPositionCardsProps {
  demand: CmsDemand;
  lang: string;
}

export function DemandPositionCards({ demand, lang }: DemandPositionCardsProps) {
  const isClosed = demand.status === "CLOSED" || demand.status === "ARCHIVED";

  return (
    <div className="space-y-4">
      {demand.positions.map((pos) => (
        <PositionCard
          key={pos.id}
          position={pos}
          demand={demand}
          lang={lang}
          isDemandClosed={isClosed}
        />
      ))}
    </div>
  );
}

function PositionCard({ position: pos, demand, lang, isDemandClosed }: any) {
  const [expanded, setExpanded] = useState(false);
  const positionClosed = pos.status === "CLOSED" || pos.status === "FILLED" || isDemandClosed;

  const renderFacilityText = (status: string, notes?: string) => {
    switch (status) {
      case "PROVIDED":
        return <span className="text-green-700 flex items-center gap-1"><Check className="w-3 h-3"/> Provided {notes && `(${notes})`}</span>;
      case "NOT_PROVIDED":
        return <span className="text-red-700 flex items-center gap-1"><X className="w-3 h-3"/> Not Provided</span>;
      case "ALLOWANCE_PROVIDED":
        return <span className="text-brand-gold font-semibold flex items-center gap-1">Allowance {notes && `(${notes})`}</span>;
      default:
        return <span className="text-brand-charcoal/50 flex items-center gap-1"><Minus className="w-3 h-3"/> Not Specified</span>;
    }
  };

  return (
    <div className="bg-white border border-brand-charcoal/10 rounded-sm overflow-hidden">
      {/* Header - Always visible */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-brand-charcoal/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h4 className="font-bold text-brand-black">{pos.title}</h4>
          <div className="flex items-center text-sm text-brand-charcoal/70 mt-1 gap-3">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {pos.totalCount} Req.
            </span>
            {/* Only shown when a breakdown was actually recorded. Older demands
                store a total only and must not be labelled male or female. */}
            {pos.maleCount != null && pos.femaleCount != null && (
              <span className="text-brand-charcoal/60">
                Male: {pos.maleCount} · Female: {pos.femaleCount}
              </span>
            )}
            <span className="font-semibold text-brand-black">
              {pos.salaryCurrency} {pos.salaryAmount}
            </span>
          </div>
        </div>
        <div className="text-brand-charcoal/40">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-brand-charcoal/10 bg-brand-charcoal/5 p-4 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-brand-charcoal/60 text-xs uppercase tracking-wider mb-1">Salary (NPR)</p>
              <p className="font-medium">{pos.nprEquivalent || "-"}</p>
            </div>
            <div>
              <p className="text-brand-charcoal/60 text-xs uppercase tracking-wider mb-1">Work Schedule</p>
              <p className="font-medium">{pos.workHoursPerDay}h / {pos.workDaysPerWeek} days</p>
            </div>
            <div>
              <p className="text-brand-charcoal/60 text-xs uppercase tracking-wider mb-1">Food</p>
              <p className="font-medium">{renderFacilityText(pos.foodFacilityStatus, pos.foodFacilityNotes)}</p>
            </div>
            <div>
              <p className="text-brand-charcoal/60 text-xs uppercase tracking-wider mb-1">Accommodation</p>
              <p className="font-medium">{renderFacilityText(pos.accommodationStatus, pos.accommodationNotes)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-brand-charcoal/60 text-xs uppercase tracking-wider mb-1">Min. Qualification</p>
              <p className="font-medium">{pos.minimumQualification || "Not Specified"}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-brand-charcoal/10">
            {!positionClosed ? (
              <div className="w-full text-center bg-brand-gray text-brand-charcoal px-4 py-3 text-sm font-bold uppercase tracking-wider">
                Check demand detail for application availability
              </div>
            ) : (
              <div className="w-full text-center bg-brand-charcoal/10 text-brand-charcoal/50 px-4 py-3 text-sm font-bold uppercase tracking-wider">
                Position Closed
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
