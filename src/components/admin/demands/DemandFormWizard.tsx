"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Save, X } from "lucide-react";
import { createDemandAction, updateDemandAction } from "@/actions/demands";
import { DemandStep1Company } from "./DemandStep1Company";
import { DemandStep2Documents } from "./DemandStep2Documents";
import { DemandStep3Positions } from "./DemandStep3Positions";
import { DemandStep4Application } from "./DemandStep4Application";
import { DemandStep5SEO } from "./DemandStep5SEO";

const STEPS = [
  { id: 1, title: "Company & Basics" },
  { id: 2, title: "Official Documents" },
  { id: 3, title: "Vacancy Positions" },
  { id: 4, title: "Application Settings" },
  { id: 5, title: "SEO & Publishing" },
];

export function DemandFormWizard({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState(initialData || {
    title: "",
    companyName: "",
    companyLogoId: "",
    industryId: "",
    countryId: "",
    city: "",
    employerAddress: "",
    demandReferenceNumber: "",
    approvalDate: "",
    receivedDate: "",
    applicationStartDate: "",
    applicationDeadline: "",
    interviewDate: "",
    interviewLocation: "",
    contractType: "",
    generalNotes: "",
    documents: [],
    positions: [],
    enableApplication: true,
    requiredApplicationDocuments: "",
    candidateInstructions: "",
    feeTransparencyNotice: "Seven Seas Intercontinental does not charge candidates any fee for job placement.",
    candidateSafetyNotice: "Do not make any payment or submit original documents unless instructed through an official Seven Seas Intercontinental communication channel.",
    contactPerson: "",
    contactPhone: "",
    contactWhatsapp: "",
    applicationConfirmationMessage: "",
    seoTitle: "",
    metaDescription: "",
    ogImageUrl: "",
    canonicalUrl: "",
  });

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("data", JSON.stringify(formData));

      let res;
      if (initialData?.id) {
        res = await updateDemandAction(initialData.id, form);
      } else {
        res = await createDemandAction(form);
      }

      if (!res.success) {
        if (res.fieldErrors) {
          // Format field errors
          const errDetails = Object.entries(res.fieldErrors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ');
          throw new Error(`${res.formError} - ${errDetails}`);
        }
        throw new Error(res.formError || "Failed to save demand.");
      }
      
      router.push("/admin/demands");
      router.refresh(); // Ensure the list gets refetched
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the demand.");
      setIsSubmitting(false);
    }
  };

  const updateFormData = (updates: any) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
  };

  return (
    <div className="bg-white border border-brand-charcoal/10 rounded-sm shadow-sm">
      {/* Wizard Header / Progress */}
      <div className="flex border-b border-brand-charcoal/10 overflow-x-auto">
        {STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <div
              key={step.id}
              className={`flex items-center px-6 py-4 shrink-0 cursor-pointer ${
                isActive ? "bg-brand-charcoal/5 border-b-2 border-brand-gold" : ""
              }`}
              onClick={() => {
                // Allow jumping to previous steps freely, but restrict jumping ahead
                if (step.id < currentStep) setCurrentStep(step.id);
              }}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                  isCompleted
                    ? "bg-green-100 text-green-700"
                    : isActive
                    ? "bg-brand-gold text-brand-black"
                    : "bg-brand-charcoal/10 text-brand-charcoal/50"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
              </div>
              <span
                className={`text-sm font-semibold whitespace-nowrap ${
                  isActive || isCompleted ? "text-brand-black" : "text-brand-charcoal/50"
                }`}
              >
                {step.title}
              </span>
              {step.id < 5 && <ChevronRight className="w-4 h-4 mx-4 text-brand-charcoal/20" />}
            </div>
          );
        })}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="m-6 bg-red-50 text-red-700 p-4 rounded-sm border border-red-200 flex items-start gap-3">
          <X className="w-5 h-5 shrink-0 mt-0.5 cursor-pointer" onClick={() => setError(null)} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Wizard Body */}
      <div className="p-6 md:p-8 min-h-[500px]">
        {currentStep === 1 && <DemandStep1Company data={formData} updateData={updateFormData} />}
        {currentStep === 2 && <DemandStep2Documents data={formData} updateData={updateFormData} />}
        {currentStep === 3 && <DemandStep3Positions data={formData} updateData={updateFormData} />}
        {currentStep === 4 && <DemandStep4Application data={formData} updateData={updateFormData} />}
        {currentStep === 5 && <DemandStep5SEO data={formData} updateData={updateFormData} />}
      </div>

      {/* Wizard Footer / Actions */}
      <div className="border-t border-brand-charcoal/10 p-6 flex justify-between bg-brand-gray/20">
        <button
          onClick={() => router.push("/admin/demands")}
          className="px-6 py-2 border border-brand-charcoal/20 text-brand-charcoal text-sm font-bold uppercase tracking-wider hover:bg-brand-charcoal/5 transition-colors"
        >
          Cancel
        </button>
        
        <div className="flex gap-4">
          {currentStep > 1 && (
            <button
              onClick={handlePrev}
              className="px-6 py-2 border border-brand-charcoal/20 text-brand-charcoal text-sm font-bold uppercase tracking-wider hover:bg-brand-charcoal/5 transition-colors"
            >
              Previous
            </button>
          )}
          
          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="px-8 py-2 bg-brand-black text-brand-white text-sm font-bold uppercase tracking-wider hover:bg-brand-gold hover:text-brand-black transition-colors"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2 bg-green-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Saving..." : "Save Demand"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
