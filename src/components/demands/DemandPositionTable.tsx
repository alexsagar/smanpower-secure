import React from "react";
import Link from "next/link";
import { Check, X, Minus } from "lucide-react";
import { CmsDemand, CmsDemandPosition } from "@/types/content";

interface DemandPositionTableProps {
  demand: CmsDemand;
  lang: string;
}

export function DemandPositionTable({ demand, lang }: DemandPositionTableProps) {
  const isClosed = demand.status === "CLOSED" || demand.status === "ARCHIVED";

  const renderFacilityIcon = (status: string) => {
    switch (status) {
      case "PROVIDED":
        return <Check className="w-4 h-4 text-green-600 mx-auto" />;
      case "NOT_PROVIDED":
        return <X className="w-4 h-4 text-red-600 mx-auto" />;
      case "ALLOWANCE_PROVIDED":
        return <span className="text-xs font-semibold text-brand-gold">Allowance</span>;
      default:
        return <Minus className="w-4 h-4 text-brand-charcoal/30 mx-auto" />;
    }
  };

  return (
    <div className="overflow-x-auto border border-brand-charcoal/10 rounded-sm bg-white shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-brand-charcoal text-brand-white">
          <tr>
            <th className="px-4 py-4 font-semibold tracking-wider">S.N.</th>
            <th className="px-4 py-4 font-semibold tracking-wider">Position</th>
            <th className="px-4 py-4 font-semibold tracking-wider text-center">Required</th>
            <th className="px-4 py-4 font-semibold tracking-wider text-right">Salary (Local)</th>
            <th className="px-4 py-4 font-semibold tracking-wider text-right">Salary (NPR)</th>
            <th className="px-4 py-4 font-semibold tracking-wider text-center">Food</th>
            <th className="px-4 py-4 font-semibold tracking-wider text-center">Accommodation</th>
            <th className="px-4 py-4 font-semibold tracking-wider text-center">Hours/Days</th>
            <th className="px-4 py-4 font-semibold tracking-wider"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-charcoal/10">
          {demand.positions.map((pos, idx) => {
            const positionClosed = pos.status === "CLOSED" || pos.status === "FILLED" || isClosed;

            return (
              <tr key={pos.id} className="hover:bg-brand-charcoal/5 transition-colors">
                <td className="px-4 py-4 font-mono text-brand-charcoal/60">
                  {String(idx + 1).padStart(2, "0")}
                </td>
                <td className="px-4 py-4 font-medium text-brand-black">
                  {pos.title}
                </td>
                <td className="px-4 py-4 text-center font-medium">
                  {pos.totalCount}
                  {/* Breakdown appears only where it was recorded; legacy
                      total-only rows stay exactly as they were. */}
                  {pos.maleCount != null && pos.femaleCount != null && (
                    <span className="block text-xs font-normal text-brand-charcoal/60">
                      Male: {pos.maleCount} · Female: {pos.femaleCount}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-right font-medium">
                  {pos.salaryCurrency} {pos.salaryAmount}
                </td>
                <td className="px-4 py-4 text-right text-brand-charcoal/70">
                  {pos.nprEquivalent || "-"}
                </td>
                <td className="px-4 py-4 text-center">
                  {renderFacilityIcon(pos.foodFacilityStatus)}
                </td>
                <td className="px-4 py-4 text-center">
                  {renderFacilityIcon(pos.accommodationStatus)}
                </td>
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  {pos.workHoursPerDay}h / {pos.workDaysPerWeek}d
                </td>
                <td className="px-4 py-4 text-right">
                  {!positionClosed ? (
                    <span className="text-xs font-medium text-brand-charcoal/60 uppercase tracking-wider px-2">
                      {demand.applicationStatusLabel}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-brand-charcoal/50 uppercase tracking-wider px-2">
                      Closed
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
