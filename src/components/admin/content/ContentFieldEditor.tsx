"use client";

import React from "react";
import { ChevronDown, ChevronRight, ChevronUp, Plus, Trash2 } from "lucide-react";
import { MediaInput } from "@/components/admin/MediaInput";
import { isMediaField, mediaFieldKind, mediaFieldPurpose } from "@/lib/cms/media-fields";
import { confirmToast } from "@/lib/confirm-toast";
import { RichTextEditor } from "@/components/admin/editor/RichTextEditor";
import type { TiptapContent } from "@/types/content";

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

/**
 * Codebase abbreviations spelled out for editors, who should never have to read
 * "Desc" or "Cta" to work out what a field is. Applied word by word, so
 * `primaryCtaText` and `ctaHref` are both covered by one entry.
 */
const WORD_LABELS: Record<string, string> = {
  desc: "Description",
  cta: "Call to action",
  img: "Image",
  src: "Source",
  url: "URL",
  href: "Link",
  seo: "SEO",
  faq: "FAQ",
  faqs: "FAQs",
  cms: "CMS",
  id: "ID",
  q: "Question",
  a: "Answer",
  nav: "Navigation",
  info: "Information",
};

/** "primaryCtaText" -> "Primary Call to action Text", "desc" -> "Description" */
export function humanizeKey(key: string): string {
  const spaced = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    // `headingLine1` -> "Heading Line 1", not "Heading Line1".
    .replace(/([a-zA-Z])(\d)/g, "$1 $2")
    .trim()
    .split(/\s+/)
    .map((word) => WORD_LABELS[word.toLowerCase()] ?? word)
    .join(" ");

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Help text for fields whose meaning is not self-evident from the label alone.
 * Keyed by content key, so it applies wherever that field appears.
 */
const FIELD_HELP: Record<string, string> = {
  hiddenSections:
    "Ticked sections are hidden from the public page. Untick to show a section again.",
};

/**
 * Keys that name a repeater entry. The collapsed row shows this, so an editor
 * scanning a list reads "Economic Independence" rather than the first sentence
 * of its description.
 */
const IDENTIFIER_KEYS = ["title", "name", "heading", "label", "question", "q", "year", "step"];

/**
 * Array keys too generic to label a repeater with. `pillars.items` reads as
 * "Pillars", not "Items" — the parent already says what the entries are.
 */
const GENERIC_ARRAY_KEYS = new Set(["items", "entries", "list", "rows", "values", "children"]);

/**
 * Rich text is stored as a Tiptap/ProseMirror document. Recursing into one
 * treats its internals as content fields, so an editor is asked to manage
 * "Type: doc" wrapping "Type: paragraph" wrapping a text node — four levels of
 * repeater for one sentence, whose unbreakable width also forced the whole
 * editor to scroll sideways. Detected documents get the rich text editor.
 */
export function isRichTextDoc(value: unknown): value is TiptapContent {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (value as Record<string, unknown>).type === "doc" &&
    Array.isArray((value as Record<string, unknown>).content)
  );
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
  // A nested array of objects keeps one blanked row: emptied, it would lose its
  // item shape and the next "Add" inside it would have no template to copy.
  // Scalar arrays stay empty — a blank string row is rebuildable from nothing.
  if (Array.isArray(template)) {
    const first = template[0];
    return first && typeof first === "object" ? [blankFrom(first)] : [];
  }
  if (template && typeof template === "object") {
    return Object.fromEntries(
      Object.entries(template as Record<string, unknown>).map(([k, v]) => [k, blankFrom(v)])
    );
  }
  return "";
}

/**
 * Order content fields deterministically, at every depth:
 *
 *   identifier (title/name/heading) -> other scalars -> objects -> arrays
 *
 * The identifier goes first because it names the thing being edited; without
 * this the order is whatever the stored JSON happens to hold, which is how a
 * repeater entry ended up showing its description above its title. Objects and
 * arrays go last because they are visually much taller.
 */
export function orderContentKeys(content: Record<string, unknown>): string[] {
  const keys = Object.keys(content).filter(isEditableContentKey);
  const weight = (key: string) => {
    const value = content[key];
    if (Array.isArray(value)) return 3;
    // Rich text renders as one field, not a nested box, so it sorts with the
    // scalars — body copy belongs above nested objects, not below them.
    if (value !== null && typeof value === "object" && !isRichTextDoc(value)) return 2;
    if (IDENTIFIER_KEYS.includes(key.toLowerCase())) return 0;
    return 1;
  };

  return keys.sort((a, b) => {
    const byWeight = weight(a) - weight(b);
    if (byWeight !== 0) return byWeight;
    // Among identifiers, keep the IDENTIFIER_KEYS precedence (title before name).
    if (weight(a) === 0) {
      return IDENTIFIER_KEYS.indexOf(a.toLowerCase()) - IDENTIFIER_KEYS.indexOf(b.toLowerCase());
    }
    return a.localeCompare(b);
  });
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
  /** Enclosing object's label, used to name arrays whose own key is generic. */
  parentLabel?: string;
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
  parentLabel,
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

  // Rich text keeps its stored document shape; only the editing UI changes.
  if (isRichTextDoc(value)) {
    return (
      <div className="min-w-0">
        <FieldLabel>{label}</FieldLabel>
        <RichTextEditor initialContent={value} onChange={(next) => onChange(next)} />
      </div>
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
      <label className="flex items-center gap-2.5 py-1 cursor-pointer">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold/50"
        />
        <span className="text-sm text-gray-700">{label}</span>
      </label>
    );
  }

  if (Array.isArray(value)) {
    // A generic key like `items` says nothing; the parent object's label does.
    const arrayLabel =
      parentLabel && GENERIC_ARRAY_KEYS.has(key.toLowerCase()) ? parentLabel : label;

    return (
      <ArrayField label={arrayLabel} fieldKey={key} value={value} onChange={onChange} depth={depth} />
    );
  }

  return (
    <ObjectField
      label={label}
      fieldKey={key}
      value={value as Record<string, unknown>}
      onChange={onChange}
      depth={depth}
      chrome={chrome}
    />
  );
}

/**
 * Field labels are medium-weight, not bold: when every label is bold nothing is
 * emphasised, and the content the editor typed should be the loudest thing on
 * screen. Section legends stay semibold to keep the hierarchy readable.
 */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1.5">{children}</label>;
}

function FieldHelp({ fieldKey }: { fieldKey: string }) {
  const help = FIELD_HELP[fieldKey];
  if (!help) return null;
  return <p className="mb-2 text-xs text-gray-500">{help}</p>;
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
  fieldKey,
  value,
  onChange,
  depth = 0,
  chrome = true,
}: {
  label: string;
  fieldKey?: string;
  value: Record<string, unknown>;
  onChange: (next: unknown) => void;
  depth?: number;
  chrome?: boolean;
}) {
  // Same ordering rule at every depth, so an entry's name is always its first
  // field rather than whichever key the stored JSON happened to list first.
  const keys = orderContentKeys(value);

  if (keys.length === 0) return null;

  // An object that is only a wrapper around one array adds a box around a box:
  // the array renders with this object's label and the wrapper is dropped.
  if (keys.length === 1 && Array.isArray(value[keys[0]])) {
    const soleArrayKey = keys[0];
    return (
      <ArrayField
        label={label}
        fieldKey={soleArrayKey}
        value={value[soleArrayKey] as unknown[]}
        depth={depth}
        onChange={(next) => onChange({ ...value, [soleArrayKey]: next })}
      />
    );
  }

  const fields = (
    <div className="space-y-4">
      {fieldKey ? <FieldHelp fieldKey={fieldKey} /> : null}
      {keys.map((key) => (
        <ContentFieldEditor
          key={key}
          label={humanizeKey(key)}
          fieldKey={key}
          value={value[key]}
          depth={depth + 1}
          parentLabel={label}
          onChange={(next) => onChange({ ...value, [key]: next })}
        />
      ))}
    </div>
  );

  if (!chrome) return fields;

  return (
    // `min-w-0` is required, not cosmetic: a fieldset's min-width is min-content
    // and it will not shrink below it, so one long unbreakable line inside
    // nested fieldsets widened the whole editor and scrolled the page sideways
    // instead of letting the text truncate.
    <fieldset className="min-w-0 border border-gray-200 rounded-md p-4 bg-gray-50/60">
      <legend className="px-2 text-sm font-semibold text-gray-700">{label}</legend>
      {fields}
    </fieldset>
  );
}

/**
 * Name for a collapsed repeater row. Identifier fields win over any other
 * string: taking "the first non-empty string" meant a row whose stored JSON put
 * `desc` before `title` was labelled with its own description, which the row
 * then repeated in full when expanded.
 */
function itemSummary(item: unknown, index: number): string {
  if (typeof item === "string") return item.trim() || `Item ${index + 1}`;

  if (item && typeof item === "object" && !Array.isArray(item)) {
    const record = item as Record<string, unknown>;

    for (const key of IDENTIFIER_KEYS) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    for (const value of Object.values(record)) {
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }

  return `Item ${index + 1}`;
}

/** Secondary line for a collapsed row: the longest text that isn't the name. */
function itemExcerpt(item: unknown, name: string): string {
  if (!item || typeof item !== "object" || Array.isArray(item)) return "";

  const texts = Object.entries(item as Record<string, unknown>)
    .filter(([key, value]) =>
      typeof value === "string" && value.trim() && value.trim() !== name && !isMediaField(key, value)
    )
    .map(([, value]) => (value as string).trim());

  return texts.sort((a, b) => b.length - a.length)[0] ?? "";
}

/** Image URL on a repeater entry, so image rows show the image. */
function itemThumbnail(item: unknown): string {
  if (!item || typeof item !== "object" || Array.isArray(item)) return "";

  for (const [key, value] of Object.entries(item as Record<string, unknown>)) {
    if (typeof value !== "string" || !value.trim()) continue;
    if (!isMediaField(key, value)) continue;
    if (mediaFieldKind(key, value) !== "IMAGE") continue;
    // Only URL-valued fields can be shown without a MediaAsset lookup.
    if (value.startsWith("/") || value.startsWith("http")) return value;
  }

  return "";
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
  // Entries of objects collapse to one row each, so a repeater reads as a list
  // instead of a wall of every field of every entry. Plain-string entries are a
  // single input already, so they stay inline — collapsing them would hide the
  // whole entry behind a click.
  const collapsible = value.some((item) => item && typeof item === "object" && !Array.isArray(item));
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const replaceAt = (index: number, next: unknown) =>
    onChange(value.map((item, i) => (i === index ? next : item)));

  // Removing an entry discards copy that cannot be recovered — there is no
  // autosave or undo behind this editor — so it is confirmed like block delete.
  const removeAt = async (index: number, name: string) => {
    if (!(await confirmToast(`Remove “${name}”?`, { confirmLabel: "Remove" }))) return;
    onChange(value.filter((_, i) => i !== index));
    setOpenIndex(null);
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    if (openIndex === index) setOpenIndex(target);
  };

  // New entries copy the shape of an existing item so arrays stay homogeneous.
  // The last seen shape is remembered, so an editor who removes every row and
  // adds again gets a properly shaped object rather than a bare string.
  const shape = React.useRef<unknown>(undefined);
  if (value.length) shape.current = value[0];
  const addItem = () => {
    onChange([...value, blankFrom(value[0] ?? shape.current ?? "")]);
    // A new entry is empty, so open it: nothing useful would show collapsed.
    setOpenIndex(value.length);
  };

  const singular = label.replace(/s$/, "");

  return (
    <div className="min-w-0 border border-gray-200 rounded-md p-4 bg-gray-50/60">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="min-w-0 truncate text-sm font-semibold text-gray-700">
          {label}{" "}
          <span className="text-xs font-normal text-gray-500">({value.length})</span>
        </span>
        <button
          type="button"
          onClick={addItem}
          className="flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-brand-black hover:text-brand-gold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add {singular.toLowerCase()}
        </button>
      </div>

      {value.length === 0 ? (
        <p className="text-xs text-gray-500">No entries yet.</p>
      ) : (
        <div className="space-y-2">
          {value.map((item, index) => {
            const name = itemSummary(item, index);
            const open = !collapsible || openIndex === index;
            const thumbnail = itemThumbnail(item);
            const excerpt = itemExcerpt(item, name);

            return (
              <div key={index} className="min-w-0 border border-gray-200 rounded bg-white">
                <div className="flex items-center gap-2 p-2">
                  {collapsible ? (
                    <button
                      type="button"
                      onClick={() => setOpenIndex(open ? null : index)}
                      aria-expanded={open}
                      aria-label={`${open ? "Collapse" : "Expand"} ${name}`}
                      className="flex flex-1 min-w-0 items-center gap-3 p-1.5 text-left rounded hover:bg-gray-50"
                    >
                      <span className="flex items-center gap-2 shrink-0 text-gray-400">
                        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        <span className="w-4 text-right text-xs font-mono text-gray-400">{index + 1}</span>
                      </span>

                      {thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element -- editor
                        // thumbnail of an arbitrary editor-supplied URL; next/image
                        // would need every possible host allow-listed.
                        <img
                          src={thumbnail}
                          alt=""
                          className="h-9 w-12 shrink-0 rounded-sm object-cover bg-gray-100"
                        />
                      ) : null}

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-brand-black">{name}</span>
                        {!open && excerpt ? (
                          <span className="block truncate text-xs text-gray-500">{excerpt}</span>
                        ) : null}
                      </span>
                    </button>
                  ) : (
                    <span className="flex-1 min-w-0 px-1.5 text-xs font-mono text-gray-400">{index + 1}</span>
                  )}

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${name} up`}
                      title="Move up"
                      className="p-2 text-gray-400 rounded hover:bg-gray-100 hover:text-gray-700 disabled:text-gray-200 disabled:hover:bg-transparent"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === value.length - 1}
                      aria-label={`Move ${name} down`}
                      title="Move down"
                      className="p-2 text-gray-400 rounded hover:bg-gray-100 hover:text-gray-700 disabled:text-gray-200 disabled:hover:bg-transparent"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAt(index, name)}
                      aria-label={`Remove ${name}`}
                      title="Remove"
                      className="p-2 text-gray-400 rounded hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {open ? (
                  <div className="min-w-0 border-t border-gray-100 p-3">
                    <ContentFieldEditor
                      label={humanizeKey(singular)}
                      fieldKey={fieldKey}
                      value={item}
                      depth={depth + 1}
                      chrome={false}
                      onChange={(next) => replaceAt(index, next)}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
