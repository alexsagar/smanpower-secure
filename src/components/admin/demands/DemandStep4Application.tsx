import React from "react";
import { Info, ShieldAlert } from "lucide-react";

export function DemandStep4Application({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold font-serif mb-1">Application Settings</h3>
        <p className="text-sm text-brand-charcoal/70 mb-6">Configure how candidates apply and set mandatory transparency notices.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-brand-charcoal/5 p-4 rounded-sm border border-brand-charcoal/10 flex items-start gap-4">
            <div className="pt-0.5">
              <input
                type="checkbox"
                checked={data.enableApplication}
                onChange={(e) => updateData({ enableApplication: e.target.checked })}
                className="w-5 h-5 text-brand-gold border-brand-charcoal/30 rounded-sm focus:ring-brand-gold"
              />
            </div>
            <div>
              <label className="font-bold text-brand-black cursor-pointer block" onClick={() => updateData({ enableApplication: !data.enableApplication })}>
                Enable Online Applications
              </label>
              <p className="text-xs text-brand-charcoal/70 mt-1">
                If checked, candidates can apply for the open positions in this demand directly from the website.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Application Deadline</label>
            <input
              type="date"
              value={data.applicationDeadline ? data.applicationDeadline.split("T")[0] : ""}
              onChange={(e) => updateData({ applicationDeadline: e.target.value ? new Date(e.target.value).toISOString() : null })}
              className="w-full border-brand-charcoal/20 rounded-sm"
            />
            <p className="text-xs text-brand-charcoal/50 mt-1">Applications will automatically disable after this date.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Special Instructions for Candidates</label>
            <textarea
              value={data.candidateInstructions || ""}
              onChange={(e) => updateData({ candidateInstructions: e.target.value })}
              className="w-full border-brand-charcoal/20 rounded-sm"
              rows={4}
              placeholder="e.g. Please bring original passport and 12 passport size photos for interview."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-sm border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wider">Fee Transparency Notice</h4>
            </div>
            <textarea
              value={data.feeTransparencyNotice}
              onChange={(e) => updateData({ feeTransparencyNotice: e.target.value })}
              className="w-full border-blue-200 bg-white rounded-sm text-sm"
              rows={3}
              required
            />
            <p className="text-xs text-blue-800/70 mt-2">Required by ethical recruitment policies. Must explicitly state fee structure.</p>
          </div>

          <div className="bg-red-50 p-6 rounded-sm border border-red-100">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h4 className="font-bold text-red-900 text-sm uppercase tracking-wider">Candidate Safety Notice</h4>
            </div>
            <textarea
              value={data.candidateSafetyNotice}
              onChange={(e) => updateData({ candidateSafetyNotice: e.target.value })}
              className="w-full border-red-200 bg-white rounded-sm text-sm"
              rows={3}
              required
            />
            <p className="text-xs text-red-800/70 mt-2">Warning regarding fraudulent agents or unauthorized payment collection.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
