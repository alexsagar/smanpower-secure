"use client";

import React from "react";
import { MediaInput } from "@/components/admin/MediaInput";

interface Country {
  id: string;
  name: string;
  code?: string | null;
}

interface Industry {
  id: string;
  name: string;
}

// Countries and industries are loaded server-side by the page and passed in.
// They were previously fetched client-side in an effect whose .catch swallowed
// every failure, so a slow or failed lookup rendered a permanently empty
// selector with no loading state, no error and no way to retry.
export function DemandStep1Company({
  data,
  updateData,
  countries,
  industries,
}: {
  data: any;
  updateData: (d: any) => void;
  countries: Country[];
  industries: Industry[];
}) {
  const countriesUnavailable = countries.length === 0;

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
            allowedResourceTypes={["IMAGE"]}
            uploadPurpose="demand_image"
            value={data.companyLogoId || ""}
            onChange={(id) => updateData({ companyLogoId: id })}
          />
        </div>

        <div className="md:col-span-2">
          <MediaInput
            label="Demand Letter / Featured Image"
            helperText="Optional. Shown in full at the top of the public demand page."
            allowedResourceTypes={["IMAGE"]}
            uploadPurpose="demand_image"
            value={data.featuredImageId || ""}
            previewUrl={data.featuredImageUrl || data.featuredImage?.fileUrl}
            previewFit="contain"
            onChange={(id, url) => updateData({ featuredImageId: id, featuredImageUrl: url })}
          />
        </div>

        <div>
          <label htmlFor="demand-country" className="block text-sm font-semibold mb-2">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            id="demand-country"
            value={data.countryId || ""}
            onChange={(e) => updateData({ countryId: e.target.value })}
            className="w-full border border-brand-charcoal/20 rounded-sm px-3 py-2 disabled:bg-brand-charcoal/5 disabled:cursor-not-allowed"
            required
            disabled={countriesUnavailable}
            aria-describedby={countriesUnavailable ? "demand-country-error" : undefined}
          >
            <option value="">-- Select Country --</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>
                {c.code ? `${c.name} (${c.code})` : c.name}
              </option>
            ))}
          </select>
          {countriesUnavailable && (
            <p id="demand-country-error" role="alert" className="mt-2 text-sm text-red-700">
              The country list could not be loaded. Reload this page to try again.
            </p>
          )}
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
