"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { saveFooterContactAction, type FooterContactInput } from "@/actions/settings";

type ContactState = Record<keyof FooterContactInput, string>;

const FIELDS: { key: keyof FooterContactInput; label: string; full?: boolean }[] = [
  { key: "address", label: "Address line 1", full: true },
  { key: "addressLine2", label: "Address line 2", full: true },
  { key: "city", label: "City" },
  { key: "province", label: "Province / State" },
  { key: "country", label: "Country" },
  { key: "postalCode", label: "Postal code" },
  { key: "phone", label: "Corporate phone" },
  { key: "fax", label: "Fax" },
  { key: "email", label: "General email" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "officeHours", label: "Office hours", full: true },
];

export function ContactSettingsForm({ initialData }: { initialData: Partial<ContactState> }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<ContactState>(() => {
    const base = {} as ContactState;
    for (const { key } of FIELDS) base[key] = initialData[key] ?? "";
    return base;
  });

  const update = (key: keyof FooterContactInput, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await saveFooterContactAction(values);
          if (result.success) {
            toast.success("Contact info saved");
            router.refresh();
          } else {
            toast.error(result.error || "Failed to save contact info");
          }
        });
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map(({ key, label, full }) => (
          <label key={key} className={`grid gap-1 text-sm font-medium ${full ? "sm:col-span-2" : ""}`}>
            {label}
            <input
              value={values[key]}
              onChange={(event) => update(key, event.target.value)}
              className="border px-3 py-2 text-sm font-normal"
            />
          </label>
        ))}
      </div>
      <div className="border-t pt-4">
        <button type="submit" disabled={isPending} className="bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {isPending ? "Saving..." : "Save contact info"}
        </button>
      </div>
    </form>
  );
}
