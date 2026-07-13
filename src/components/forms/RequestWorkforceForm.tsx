"use client";

import { useActionState } from "react";
import { submitEmployerLead, type EmployerLeadFormState } from "@/actions/forms";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label } from "@/components/ui/input";
import { SectionLabel, SectionHeading } from "@/components/ui/shared";
import { CheckCircle, AlertCircle } from "lucide-react";

interface RequestWorkforceFormProps {
  dict: Record<string, Record<string, string>>;
}

const initialState: EmployerLeadFormState = {
  success: false,
};

export function RequestWorkforceForm({ dict }: RequestWorkforceFormProps) {
  const [state, formAction, pending] = useActionState(
    submitEmployerLead,
    initialState
  );

  if (state.success) {
    return (
      <div className="bg-brand-off-white border border-brand-charcoal/5 p-12 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-brand-black mb-2">
          Enquiry Submitted
        </h3>
        <p className="text-brand-muted text-sm">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.message && !state.success && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="companyName" required>
            {dict.employer.companyName}
          </Label>
          <Input
            id="companyName"
            name="companyName"
            required
            error={state.errors?.companyName?.[0]}
          />
        </div>
        <div>
          <Label htmlFor="contactPerson" required>
            {dict.employer.contactPerson}
          </Label>
          <Input
            id="contactPerson"
            name="contactPerson"
            required
            error={state.errors?.contactPerson?.[0]}
          />
        </div>
        <div>
          <Label htmlFor="designation">{dict.employer.designation}</Label>
          <Input id="designation" name="designation" />
        </div>
        <div>
          <Label htmlFor="businessEmail" required>
            {dict.employer.businessEmail}
          </Label>
          <Input
            id="businessEmail"
            name="businessEmail"
            type="email"
            required
            error={state.errors?.businessEmail?.[0]}
          />
        </div>
        <div>
          <Label htmlFor="phone" required>
            {dict.employer.phoneNumber}
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            error={state.errors?.phone?.[0]}
          />
        </div>
        <div>
          <Label htmlFor="country" required>
            {dict.employer.country}
          </Label>
          <Input
            id="country"
            name="country"
            required
            error={state.errors?.country?.[0]}
          />
        </div>
        <div>
          <Label htmlFor="industry" required>
            {dict.employer.industry}
          </Label>
          <Select
            id="industry"
            name="industry"
            placeholder="Select industry"
            options={[
              { value: "security", label: "Security Services" },
              { value: "construction", label: "Construction & Technical Trades" },
              { value: "hospitality", label: "Hospitality & Hotels" },
              { value: "facility", label: "Facility Management" },
              { value: "aviation", label: "Aviation & Ground Handling" },
              { value: "manufacturing", label: "Manufacturing" },
              { value: "healthcare", label: "Healthcare Support" },
              { value: "logistics", label: "Logistics & Transport" },
              { value: "other", label: "Other" },
            ]}
            error={state.errors?.industry?.[0]}
          />
        </div>
        <div>
          <Label htmlFor="workforceCategory">
            {dict.employer.workforceCategory}
          </Label>
          <Input id="workforceCategory" name="workforceCategory" />
        </div>
        <div>
          <Label htmlFor="numberOfWorkers">
            {dict.employer.numberOfWorkers}
          </Label>
          <Input
            id="numberOfWorkers"
            name="numberOfWorkers"
            type="number"
            min="1"
          />
        </div>
        <div>
          <Label htmlFor="expectedMobilisation">
            {dict.employer.expectedMobilisation}
          </Label>
          <Input
            id="expectedMobilisation"
            name="expectedMobilisation"
            type="date"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="requiredSkills">{dict.employer.requiredSkills}</Label>
        <Input id="requiredSkills" name="requiredSkills" />
      </div>

      <div>
        <Label htmlFor="message">{dict.common.message}</Label>
        <Textarea id="message" name="message" rows={4} />
      </div>

      <div className="flex items-start gap-3">
        <input
          id="consentGiven"
          name="consentGiven"
          type="checkbox"
          required
          className="mt-1 w-4 h-4 accent-brand-gold"
        />
        <Label htmlFor="consentGiven" className="mb-0 text-sm font-normal text-brand-muted">
          {dict.employer.consent}
        </Label>
      </div>
      {state.errors?.consentGiven && (
        <p className="text-xs text-red-600">{state.errors.consentGiven[0]}</p>
      )}

      <Button type="submit" variant="gold" size="lg" disabled={pending}>
        {pending ? "Submitting..." : dict.common.submit}
      </Button>
    </form>
  );
}
