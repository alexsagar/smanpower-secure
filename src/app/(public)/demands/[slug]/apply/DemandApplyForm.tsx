"use client";

import React, { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Upload, AlertCircle, CheckCircle, ChevronRight, Loader2 } from "lucide-react";
import { CmsDemand } from "@/types/content";
import { applyToDemandAction } from "@/actions/demands";

// The browser's default "Choose file" button renders borderless and is easy to
// miss. These file:* utilities give it a real outline plus hover/focus/disabled
// states, without hiding the input (keyboard users still tab straight to it).
const FILE_INPUT_CLASS = [
  "mt-4 w-full text-xs text-brand-charcoal",
  "file:mr-3 file:rounded-sm file:border file:border-brand-charcoal/40",
  "file:bg-white file:px-4 file:py-2",
  "file:text-xs file:font-semibold file:uppercase file:tracking-wider file:text-brand-black",
  "file:cursor-pointer hover:file:border-brand-gold hover:file:bg-brand-gold/10",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2",
  "disabled:opacity-50 disabled:file:cursor-not-allowed",
].join(" ");

const FORM_CONTROL_CLASS = [
  "w-full min-h-11 rounded-sm border border-brand-charcoal/30 bg-white px-3 py-2 text-brand-charcoal shadow-sm transition-colors",
  "hover:border-brand-charcoal/50",
  "focus-visible:outline-none focus-visible:border-brand-gold focus-visible:ring-2 focus-visible:ring-brand-gold/30 focus-visible:ring-offset-1",
  "disabled:cursor-not-allowed disabled:border-brand-charcoal/20 disabled:bg-brand-stone disabled:text-brand-muted",
  "user-invalid:border-red-500 user-invalid:ring-1 user-invalid:ring-red-500/20",
].join(" ");

interface DemandApplyFormProps {
  demand: CmsDemand;
  selectedPositionId?: string;
}

export function DemandApplyForm({ demand, selectedPositionId }: DemandApplyFormProps) {
  const router = useRouter();
  
  const [state, formAction, isPending] = useActionState(applyToDemandAction, null);
  const [cvFileName, setCvFileName] = useState("");
  const [certFileName, setCertFileName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form State
  const [formData, setFormData] = useState({
    positionId: selectedPositionId || (demand.positions.length === 1 ? demand.positions[0].id : ""),
    fullName: "",
    phone: "",
    email: "",
    provinceDistrict: "",
    dateOfBirth: "",
    educationLevel: "",
    workExperience: "",
    skillCategory: "",
    passportStatus: "NO_PASSPORT",
    availableForInterview: true,
    demandDetailsRead: false,
    privacyConsentGiven: false,
    safetyAcknowledgement: false,
  });

  useEffect(() => {
    if (state?.success) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state?.success]);

  // A Turnstile token is single-use. After any server-side rejection the token
  // already in the form is spent, so without this reset every retry fails with
  // a token error even once the applicant has corrected the real problem.
  useEffect(() => {
    if (state && !state.success) {
      (window as any).turnstile?.reset();
    }
  }, [state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    setFieldErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
  };

  const validationProps = (name: string) => ({
    "aria-invalid": fieldErrors[name] ? true : undefined,
    "aria-describedby": fieldErrors[name] ? `${name}-error` : undefined,
    onInvalid: (event: React.InvalidEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFieldErrors((previous) => ({ ...previous, [name]: event.currentTarget.validationMessage })),
  });

  const fieldError = (name: string) => fieldErrors[name] && (
    <p id={`${name}-error`} className="mt-1.5 text-xs font-medium text-red-700" role="alert">{fieldErrors[name]}</p>
  );

  if (state?.success) {
    return (
      <div className="bg-white border border-green-200 p-12 text-center rounded-sm shadow-sm">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold font-serif mb-4 text-green-900">Application Submitted!</h2>
        <p className="text-green-800 max-w-lg mx-auto mb-8">
          Thank you for applying for the position at {demand.companyName}. We have received your application and will review it shortly.
        </p>
        <button
          onClick={() => router.push("/demands")}
          className="inline-flex items-center gap-2 bg-brand-black text-brand-white px-8 py-3 font-semibold uppercase tracking-wider text-sm hover:bg-brand-gold hover:text-brand-black transition-colors"
        >
          Browse More Demands <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="bg-white border border-brand-charcoal/10 shadow-sm rounded-sm p-6 md:p-8" aria-busy={isPending}>
      {/* Hidden fields for required demand logic */}
      <input type="hidden" name="demandId" value={demand.id} />
      
      {state?.formError && (
        <div role="alert" className="bg-red-50 text-red-700 p-4 rounded-sm border border-red-200 mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            {/* Lead with the human-readable message; the raw code (e.g.
                MISSING_TOKEN) is only a support reference, not a headline. */}
            <p className="font-bold">{state.message || "We could not submit your application."}</p>
            <p className="text-xs mt-1 text-red-600/80">Reference: {state.formError}</p>
          </div>
        </div>
      )}

      {/* Position Selection */}
      <div className="mb-8 pb-8 border-b border-brand-charcoal/10">
        <label htmlFor="positionId" className="block text-sm font-semibold text-brand-black mb-2 uppercase tracking-wider">
          Select Position <span className="text-red-500">*</span>
        </label>
        <select
          id="positionId"
          name="positionId"
          value={formData.positionId}
          onChange={handleChange}
          required
          {...validationProps("positionId")}
          className={`${FORM_CONTROL_CLASS} pr-10`}
        >
          <option value="" disabled>-- Select a position --</option>
          {demand.positions.map((pos) => {
            const isClosed = pos.status === "CLOSED" || pos.status === "FILLED";
            return (
              <option key={pos.id} value={pos.id} disabled={isClosed}>
                {pos.title} {isClosed ? "(Closed)" : ""}
              </option>
            );
          })}
        </select>
        {fieldError("positionId")}
      </div>

      {/* Personal Information */}
      <div className="mb-8 pb-8 border-b border-brand-charcoal/10">
        <h3 className="text-lg font-bold font-serif mb-6 text-brand-black">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-brand-black mb-2 uppercase tracking-wider">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              {...validationProps("fullName")}
              className={FORM_CONTROL_CLASS}
            />
            {fieldError("fullName")}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-brand-black mb-2 uppercase tracking-wider">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              {...validationProps("phone")}
              className={FORM_CONTROL_CLASS}
            />
            {fieldError("phone")}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-brand-black mb-2 uppercase tracking-wider">
              Email Address (Optional)
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              {...validationProps("email")}
              className={FORM_CONTROL_CLASS}
            />
            {fieldError("email")}
          </div>
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-brand-black mb-2 uppercase tracking-wider">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              id="dateOfBirth"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              {...validationProps("dateOfBirth")}
              className={`${FORM_CONTROL_CLASS} pr-3`}
            />
            {fieldError("dateOfBirth")}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="provinceDistrict" className="block text-sm font-semibold text-brand-black mb-2 uppercase tracking-wider">
              Current Province / District <span className="text-red-500">*</span>
            </label>
            <input
              id="provinceDistrict"
              type="text"
              name="provinceDistrict"
              value={formData.provinceDistrict}
              onChange={handleChange}
              required
              {...validationProps("provinceDistrict")}
              placeholder="e.g. Bagmati / Kathmandu"
              className={FORM_CONTROL_CLASS}
            />
            {fieldError("provinceDistrict")}
          </div>
        </div>
      </div>

      {/* Qualifications & Experience */}
      <div className="mb-8 pb-8 border-b border-brand-charcoal/10">
        <h3 className="text-lg font-bold font-serif mb-6 text-brand-black">Qualifications & Experience</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="educationLevel" className="block text-sm font-semibold text-brand-black mb-2 uppercase tracking-wider">
              Education Level <span className="text-red-500">*</span>
            </label>
            <select
              id="educationLevel"
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleChange}
              required
              {...validationProps("educationLevel")}
              className={`${FORM_CONTROL_CLASS} pr-10`}
            >
              <option value="">-- Select Education --</option>
              <option value="Below SLC/SEE">Below SLC/SEE</option>
              <option value="SLC/SEE">SLC / SEE</option>
              <option value="Plus Two/Diploma">+2 / Diploma</option>
              <option value="Bachelors Degree">Bachelor's Degree</option>
              <option value="Masters Degree">Master's Degree</option>
            </select>
            {fieldError("educationLevel")}
          </div>
          <div>
            <label htmlFor="skillCategory" className="block text-sm font-semibold text-brand-black mb-2 uppercase tracking-wider">
              Main Skills / Trade Category <span className="text-red-500">*</span>
            </label>
            <input
              id="skillCategory"
              type="text"
              name="skillCategory"
              value={formData.skillCategory}
              onChange={handleChange}
              required
              {...validationProps("skillCategory")}
              placeholder="e.g. Mason, Welder, Chef, Guard"
              className={FORM_CONTROL_CLASS}
            />
            {fieldError("skillCategory")}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="workExperience" className="block text-sm font-semibold text-brand-black mb-2 uppercase tracking-wider">
              Current / Previous Work Experience <span className="text-red-500">*</span>
            </label>
            <textarea
              id="workExperience"
              name="workExperience"
              value={formData.workExperience}
              onChange={handleChange}
              required
              {...validationProps("workExperience")}
              rows={3}
              placeholder="Briefly describe your relevant work experience..."
              className={`${FORM_CONTROL_CLASS} min-h-28 resize-y`}
            />
            {fieldError("workExperience")}
          </div>
          <div>
            <label htmlFor="passportStatus" className="block text-sm font-semibold text-brand-black mb-2 uppercase tracking-wider">
              Passport Status <span className="text-red-500">*</span>
            </label>
            <select
              id="passportStatus"
              name="passportStatus"
              value={formData.passportStatus}
              onChange={handleChange}
              required
              {...validationProps("passportStatus")}
              className={`${FORM_CONTROL_CLASS} pr-10`}
            >
              <option value="VALID">I have a valid passport</option>
              <option value="EXPIRED_OR_EXPIRING">I have a passport but it is expired / expiring soon</option>
              <option value="NO_PASSPORT">I do not currently have a passport</option>
            </select>
            {fieldError("passportStatus")}
          </div>
        </div>
      </div>

      {/* Documents Upload */}
      <div className="mb-8 pb-8 border-b border-brand-charcoal/10">
        <h3 className="text-lg font-bold font-serif mb-6 text-brand-black">Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-dashed border-brand-charcoal/30 p-6 text-center rounded-sm bg-brand-charcoal/5 transition-colors hover:border-brand-charcoal/50 focus-within:border-brand-gold focus-within:ring-2 focus-within:ring-brand-gold/30">
            <Upload className="w-8 h-8 text-brand-charcoal/40 mx-auto mb-2" />
            <label htmlFor="cvFile" className="font-semibold text-brand-black text-sm block cursor-pointer">
              Upload CV (Optional)
            </label>
            <p id="cvFile-hint" className="text-xs text-brand-charcoal/60 mt-1">PDF only, up to 5MB</p>
            <input
              id="cvFile"
              type="file"
              name="cvFile"
              accept=".pdf"
              disabled={isPending}
              aria-describedby="cvFile-hint"
              onChange={(event) => setCvFileName(event.target.files?.[0]?.name || "")}
              className={FILE_INPUT_CLASS}
            />
            {cvFileName && <p className="mt-2 truncate text-xs text-brand-gold">Selected: {cvFileName}</p>}
          </div>
          <div className="border-2 border-dashed border-brand-charcoal/30 p-6 text-center rounded-sm bg-brand-charcoal/5 transition-colors hover:border-brand-charcoal/50 focus-within:border-brand-gold focus-within:ring-2 focus-within:ring-brand-gold/30">
            <Upload className="w-8 h-8 text-brand-charcoal/40 mx-auto mb-2" />
            <label htmlFor="certFile" className="font-semibold text-brand-black text-sm block cursor-pointer">
              Trade Certificate (Optional)
            </label>
            <p id="certFile-hint" className="text-xs text-brand-charcoal/60 mt-1">PDF, JPG, PNG up to 5MB</p>
            <input
              id="certFile"
              type="file"
              name="certFile"
              accept=".pdf,.jpg,.jpeg,.png"
              disabled={isPending}
              aria-describedby="certFile-hint"
              onChange={(event) => setCertFileName(event.target.files?.[0]?.name || "")}
              className={FILE_INPUT_CLASS}
            />
            {certFileName && <p className="mt-2 truncate text-xs text-brand-gold">Selected: {certFileName}</p>}
          </div>
        </div>
      </div>

      {/* Consents & Acknowledgements */}
      <div className="mb-8 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="pt-0.5">
            <input
              type="checkbox"
              name="availableForInterview"
              checked={formData.availableForInterview}
              onChange={handleChange}
              {...validationProps("availableForInterview")}
              className="w-4 h-4 text-brand-gold border-brand-charcoal/40 focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 rounded-sm"
            />
          </div>
          <span className="text-sm text-brand-black group-hover:text-brand-gold transition-colors">
            I am available to attend an interview if shortlisted.
          </span>
        </label>
        {fieldError("availableForInterview")}
        
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="pt-0.5">
            <input
              type="checkbox"
              name="demandDetailsRead"
              checked={formData.demandDetailsRead}
              onChange={handleChange}
              required
              {...validationProps("demandDetailsRead")}
              className="w-4 h-4 text-brand-gold border-brand-charcoal/40 focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 rounded-sm"
            />
          </div>
          <span className="text-sm text-brand-black group-hover:text-brand-gold transition-colors">
            I confirm that I have read and understood the demand details, salary, and working conditions. <span className="text-red-500">*</span>
          </span>
        </label>
        {fieldError("demandDetailsRead")}

        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="pt-0.5">
            <input
              type="checkbox"
              name="privacyConsentGiven"
              checked={formData.privacyConsentGiven}
              onChange={handleChange}
              required
              {...validationProps("privacyConsentGiven")}
              className="w-4 h-4 text-brand-gold border-brand-charcoal/40 focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 rounded-sm"
            />
          </div>
          <span className="text-sm text-brand-black group-hover:text-brand-gold transition-colors">
            I consent to Seven Seas Intercontinental processing my personal data for recruitment purposes. <span className="text-red-500">*</span>
          </span>
        </label>
        {fieldError("privacyConsentGiven")}

        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="pt-0.5">
            <input
              type="checkbox"
              name="safetyAcknowledgement"
              checked={formData.safetyAcknowledgement}
              onChange={handleChange}
              required
              {...validationProps("safetyAcknowledgement")}
              className="w-4 h-4 text-brand-gold border-brand-charcoal/40 focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 rounded-sm"
            />
          </div>
          <div className="text-sm text-brand-black">
            <span className="group-hover:text-brand-gold transition-colors block">
              I acknowledge the candidate safety and fee transparency notices. <span className="text-red-500">*</span>
            </span>
            <p className="text-xs text-brand-charcoal/60 mt-1">I will not make payments to unauthorized individuals.</p>
          </div>
        </label>
        {fieldError("safetyAcknowledgement")}
      </div>

      {process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === "true" && (
        <div className="mb-8 flex justify-center">
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
          {/* data-refresh-expired keeps the token valid on long forms, where the
              applicant can easily outlast Turnstile's ~5 minute token lifetime. */}
          <div
            className="cf-turnstile"
            data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            data-refresh-expired="auto"
          ></div>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="w-full bg-brand-gold text-brand-black py-4 text-sm font-bold uppercase tracking-widest hover:bg-brand-black hover:text-brand-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending ? <><Loader2 className="w-5 h-5 motion-safe:animate-spin motion-reduce:animate-none" /> Submitting Application...</> : "Submit Application"}
      </button>
    </form>
  );
}
