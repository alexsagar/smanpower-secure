"use client";

import React, { useEffect, useState } from "react";
import { MediaInput } from "@/components/admin/MediaInput";

interface Country {
  id: string;
  name: string;
  code: string;
}

interface Industry {
  id: string;
  name: string;
}

export function DemandStep1Company({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);

  useEffect(() => {
    // Load lookup data via lightweight API
    fetch("/api/admin/lookups?type=countries")
      .then(r => r.json())
      .then(data => setCountries(data || []))
      .catch(() => setCountries([]));

    fetch("/api/admin/lookups?type=industries")
      .then(r => r.json())
      .then(data => setIndustries(data || []))
      .catch(() => setIndustries([]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold font-serif mb-1">Company &amp; Basic Details</h3>
        <p className="text-sm text-brand-charcoal/70 mb-6">Enter the employer details and demand metadata.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">Demand Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => updateData({ title: e.target.value })}
            className="w-full border border-brand-charcoal/20 rounded-sm px-3 py-2"
            placeholder="e.g. Urgent Requirement for Security Guards in UAE"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Company Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={data.companyName}
            onChange={(e) => updateData({ companyName: e.target.value })}
            className="w-full border border-brand-charcoal/20 rounded-sm px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Employer Address</label>
          <input
            type="text"
            value={data.employerAddress || ""}
            onChange={(e) => updateData({ employerAddress: e.target.value })}
            className="w-full border border-brand-charcoal/20 rounded-sm px-3 py-2"
            placeholder="e.g. Al Quoz Industrial Area, Dubai"
          />
        </div>

        <div className="row-span-2">
          <MediaInput
            label="Company Logo"
            value={data.companyLogoId || ""}
            onChange={(id) => updateData({ companyLogoId: id })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Country <span className="text-red-500">*</span></label>
          <select
            value={data.countryId || ""}
            onChange={(e) => updateData({ countryId: e.target.value })}
            className="w-full border border-brand-charcoal/20 rounded-sm px-3 py-2"
            required
          >
            <option value="">-- Select Country --</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">City</label>
          <input
            type="text"
            value={data.city || ""}
            onChange={(e) => updateData({ city: e.target.value })}
            className="w-full border border-brand-charcoal/20 rounded-sm px-3 py-2"
            placeholder="e.g. Dubai"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Industry</label>
          <select
            value={data.industryId || ""}
            onChange={(e) => updateData({ industryId: e.target.value })}
            className="w-full border border-brand-charcoal/20 rounded-sm px-3 py-2"
          >
            <option value="">-- Select Industry --</option>
            {industries.map(ind => (
              <option key={ind.id} value={ind.id}>{ind.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Demand Reference No.</label>
          <input
            type="text"
            value={data.demandReferenceNumber || ""}
            onChange={(e) => updateData({ demandReferenceNumber: e.target.value })}
            className="w-full border border-brand-charcoal/20 rounded-sm px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Approval Date</label>
          <input
            type="date"
            value={data.approvalDate ? data.approvalDate.split("T")[0] : ""}
            onChange={(e) => updateData({ approvalDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
            className="w-full border border-brand-charcoal/20 rounded-sm px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Received Date</label>
          <input
            type="date"
            value={data.receivedDate ? data.receivedDate.split("T")[0] : ""}
            onChange={(e) => updateData({ receivedDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
            className="w-full border border-brand-charcoal/20 rounded-sm px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Application Start Date</label>
          <input
            type="date"
            value={data.applicationStartDate ? data.applicationStartDate.split("T")[0] : ""}
            onChange={(e) => updateData({ applicationStartDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
            className="w-full border border-brand-charcoal/20 rounded-sm px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Application Deadline</label>
          <input
            type="date"
            value={data.applicationDeadline ? data.applicationDeadline.split("T")[0] : ""}
            onChange={(e) => updateData({ applicationDeadline: e.target.value ? new Date(e.target.value).toISOString() : null })}
            className="w-full border border-brand-charcoal/20 rounded-sm px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Interview Date</label>
          <input
            type="date"
            value={data.interviewDate ? data.interviewDate.split("T")[0] : ""}
            onChange={(e) => updateData({ interviewDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
            className="w-full border border-brand-charcoal/20 rounded-sm px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Interview Location</label>
          <input
            type="text"
            value={data.interviewLocation || ""}
            onChange={(e) => updateData({ interviewLocation: e.target.value })}
            className="w-full border border-brand-charcoal/20 rounded-sm px-3 py-2"
            placeholder="e.g. Seven Seas Office, Kathmandu"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Contract Type / Period</label>
          <input
            type="text"
            value={data.contractType || ""}
            onChange={(e) => updateData({ contractType: e.target.value })}
            className="w-full border border-brand-charcoal/20 rounded-sm px-3 py-2"
            placeholder="e.g. 2 Years Renewable"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">General Notes (Public)</label>
          <textarea
            value={data.generalNotes || ""}
            onChange={(e) => updateData({ generalNotes: e.target.value })}
            className="w-full border border-brand-charcoal/20 rounded-sm px-3 py-2"
            rows={4}
            placeholder="Any general information about this demand..."
          />
        </div>
      </div>
    </div>
  );
}
