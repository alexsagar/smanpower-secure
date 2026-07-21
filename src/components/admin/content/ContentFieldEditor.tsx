"use client";

import React from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { MediaInput } from "@/components/admin/MediaInput";
import { isMediaField, mediaFieldKind, mediaFieldPurpose } from "@/lib/cms/media-fields";

/**
 * Generic, recursive, type-driven editor for CMS block content.
 *
 * Field visibility is decided by VALUE TYPE, never by field name, so any field
 * added to block content in future automatically becomes editable with no code
 * change here. Keys are only ever hidden by explicit exclusion.
 */

/** Keys never surfaced as free-form fields. */
export const EXCLUDED_CONTENT_KEYS = new Set([
  "id",
  "blockKey",
  "blockType",
  "order",
]);

/**
 * Media is placed through MediaInput against dedicated columns, so any `*Id`
 * reference inside block content is excluded to avoid a second, unvalidated
 * way of setting a media reference.
 */
export function isEditableContentKey(key: string): boolean {
  return !EXCLUDED_CONTENT_KEYS.has(key) && !/Id$/.test(key);
}

/** "primaryCtaText" -> "Primary Cta Text" */
export function humanizeKey(key: string): string {
  const spaced = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim();

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Long or multi-line copy gets a textarea; short labels get a single line. */
export function shouldUseTextarea(value: string): boolean {
  return value.length > 80 || value.includes("\n");
}

/**
 * Build a blank item for an array "Add" action by emptying a template item,
 * preserving its shape and types so saved data stays consistent.
 */
export function blankFrom(template: unknown): unknown {
  if (typeof template === "string") return "";
  if (typeof template === "number") return 0;
  if (typeof template === "boolean") return false;
  if (Array.isArray(template)) return [];
  if (template && typeof template === "object") {
    return Object.fromEntries(
      Object.entries(template as Record<string, unknown>).map(([k, v]) => [k, blankFrom(v)])
    );
  }
  return "";
}

/**
 * Order content fields deterministically: scalars first (headings, eyebrows,
 * CTA text), then nested objects and arrays, which are visually much taller.
 */
export function orderContentKeys(content: Record<string, unknown>): string[] {
  const keys = Object.keys(content).filter(isEditableContentKey);
  const weight = (key: string) => {
    const value = content[key];
    if (Array.isArray(value)) return 2;
    if (value !== null && typeof value === "object") return 1;
    return 0;
  };

  return keys.sort((a, b) => weight(a) - weight(b) || a.localeCompare(b));
}

type FieldProps = {
  label: string;
  /** Raw content key, used to detect media fields. Falls back to the label. */
  fieldKey?: string;
  value: unknown;
  onChange: (next: unknown) => void;
  depth?: number;
  /** Objects render their own bordered fieldset unless the parent already draws one. */
  chrome?: boolean;
};

const inputClass =
  "w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50";

export function ContentFieldEditor({
  label,
  fieldKey,
  value,
  onChange,
  depth = 0,
  chrome = true,
}: FieldProps) {
  const key = fieldKey ?? label;

  // Media is edited through the Media Library, never as a raw path. The stored
  // value stays a URL string, so rendering and existing content are unaffected.
  if (isMediaField(key, value)) {
    return (
      <MediaInput
        label={label}
        value={typeof value === "string" ? value : ""}
        allowedResourceTypes={[mediaFieldKind(key, value)]}
        uploadPurpose={mediaFieldPurpose(key, value)}
        onChange={(_id, url) => onChange(url)}
      />
    );
  }

  // null/undefined are treated as empty text so previously-unset fields are
  // still editable instead of silently disappearing.
  if (value === null || value === undefined) {
    return <StringField label={label} value="" onChange={onChange} />;
  }

  if (typeof value === "string") {
    return <StringField label={label} value={value} onChange={onChange} />;
  }

  if (typeof value === "number") {
    return (
      <div>
        <FieldLabel>{label}</FieldLabel>
        <input
          type="number"
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => {
            const next = e.target.value === "" ? "" : Number(e.target.value);
            onChange(next === "" || Number.isNaN(next) ? 0 : next);
          }}
          className={inputClass}
        />
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-gray-300"
        />
        <span className="text-sm font-semibold">{label}</span>
      </label>
    );
  }

  if (Array.isArray(value)) {
    return <ArrayField label={label} fieldKey={key} value={value} onChange={onChange} depth={depth} />;
  }

  return (
    <ObjectField
      label={label}
      value={value as Record<string, unknown>}
      onChange={onChange}
      depth={depth}
      chrome={chrome}
    />
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold mb-2">{children}</label>;
}

function StringField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: unknown) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {shouldUseTextarea(value) ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={Math.min(10, Math.max(3, value.split("\n").length + 1))}
          className={inputClass}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );
}

function ObjectField({
  label,
  value,
  onChange,
  depth = 0,
  chrome = true,
}: {
  label: string;
  value: Record<string, unknown>;
  onChange: (next: unknown) => void;
  depth?: number;
  chrome?: boolean;
}) {
  const keys = Object.keys(value).filter(isEditableContentKey);

  if (keys.length === 0) return null;

  const fields = (
    <div className="space-y-4">
      {keys.map((key) => (
        <ContentFieldEditor
          key={key}
          label={humanizeKey(key)}
          fieldKey={key}
          value={value[key]}
          depth={depth + 1}
          onChange={(next) => onChange({ ...value, [key]: next })}
        />
      ))}
    </div>
  );

  if (!chrome) return fields;

  return (
    <fieldset className="border border-gray-200 rounded-md p-4 bg-gray-50/60">
      <legend className="px-2 text-sm font-semibold text-gray-700">{label}</legend>
      {fields}
    </fieldset>
  );
}

/** Short preview so collapsed repeater rows stay identifiable. */
function itemSummary(item: unknown, index: number): string {
  if (typeof item === "string") return item || `Item ${index + 1}`;
  if (item && typeof item === "object" && !Array.isArray(item)) {
    for (const v of Object.values(item as Record<string, unknown>)) {
      if (typeof v === "string" && v.trim()) return v;
    }
  }
  return `Item ${index + 1}`;
}

function ArrayField({
  label,
  fieldKey,
  value,
  onChange,
  depth = 0,
}: {
  label: string;
  fieldKey?: string;
  value: unknown[];
  onChange: (next: unknown) => void;
  depth?: number;
}) {
  const replaceAt = (index: number, next: unknown) =>
    onChange(value.map((item, i) => (i === index ? next : item)));

  const removeAt = (index: number) => onChange(value.filter((_, i) => i !== index));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  // New entries copy the shape of an existing item so arrays stay homogeneous.
  const addItem = () => onChange([...value, blankFrom(value[0] ?? "")]);

  return (
    <div className="border border-gray-200 rounded-md p-4 bg-gray-50/60">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">
          {label}{" "}
          <span className="text-xs font-normal text-gray-500">({value.length})</span>
        </span>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1 text-xs font-semibold text-brand-black hover:text-brand-gold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {value.length === 0 ? (
        <p className="text-xs text-gray-500">No entries yet.</p>
      ) : (
        <div className="space-y-3">
          {value.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded bg-white p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 truncate max-w-[60%]">
                  {itemSummary(item, index)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${label} item ${index + 1} up`}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === value.length - 1}
                    aria-label={`Move ${label} item ${index + 1} down`}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    aria-label={`Remove ${label} item ${index + 1}`}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <ContentFieldEditor
                label={humanizeKey(label).replace(/s$/, "")}
                fieldKey={fieldKey}
                value={item}
                depth={depth + 1}
                chrome={false}
                onChange={(next) => replaceAt(index, next)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
