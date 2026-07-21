"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit2,
  Eye,
  Image as ImageIcon,
  Layers,
  Search,
  Type,
  Video,
} from "lucide-react";
import {
  countTreePages,
  filterContentTree,
  type ContentTreeGroup,
  type ContentTreeNode,
} from "@/lib/cms/content-tree";

function formatUpdated(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const published = status === "PUBLISHED";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
        published
          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
          : "bg-amber-50 text-amber-700 border-amber-100"
      }`}
    >
      {published ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {published ? "Live" : "Draft"}
    </span>
  );
}

function HeroIcon({ node }: { node: ContentTreeNode }) {
  if (!node.hasHero) return null;
  return <Type className="w-3.5 h-3.5 text-brand-gold" aria-hidden />;
}

function PageRow({ node, depth }: { node: ContentTreeNode; depth: number }) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children.length > 0;
  const previewHref = node.slug === "home" ? "/" : `/${node.slug}`;

  return (
    <div>
      <div
        className="group flex items-center gap-3 py-2.5 pr-3 rounded-lg hover:bg-gray-50 transition-colors"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={`${open ? "Collapse" : "Expand"} ${node.label}`}
            className="p-0.5 text-gray-400 hover:text-brand-black rounded"
          >
            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <span className="w-5" aria-hidden />
        )}

        <Link
          href={`/admin/content/${node.slug}`}
          className="flex-1 min-w-0 flex items-center gap-3"
        >
          <span className="font-medium text-brand-black group-hover:text-brand-gold transition-colors truncate">
            {node.label}
          </span>
          <span className="text-xs font-mono text-gray-400 truncate hidden md:inline">
            /{node.slug}
          </span>
        </Link>

        <div className="flex items-center gap-3 shrink-0">
          <HeroIcon node={node} />
          <span
            className="hidden sm:inline-flex items-center gap-1 text-[11px] text-gray-500"
            title={`${node.blockCount} section${node.blockCount === 1 ? "" : "s"}`}
          >
            <Layers className="w-3.5 h-3.5" />
            {node.blockCount}
          </span>
          <span className="hidden lg:inline text-[11px] text-gray-400 w-24 text-right">
            {formatUpdated(node.updatedAt)}
          </span>
          <StatusBadge status={node.status} />
          <Link
            href={previewHref}
            target="_blank"
            className="p-1.5 text-gray-400 hover:text-brand-black rounded"
            aria-label={`Preview ${node.label}`}
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            href={`/admin/content/${node.slug}`}
            className="p-1.5 text-gray-400 hover:text-brand-gold rounded"
            aria-label={`Edit ${node.label}`}
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {hasChildren && open && (
        <div>
          {node.children.map((child) => (
            <PageRow key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ContentTree({ groups }: { groups: ContentTreeGroup[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => filterContentTree(groups, query), [groups, query]);
  const total = useMemo(() => countTreePages(groups), [groups]);
  const shown = useMemo(() => countTreePages(filtered), [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-gold transition-colors" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages by name or slug..."
            aria-label="Search pages"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
          />
        </div>
        <div className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
          {query ? `${shown} of ${total} pages` : `${total} pages`}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-brand-muted">No pages match &ldquo;{query}&rdquo;.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((group) => (
            <section key={group.key} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <header className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                <h2 className="text-sm font-semibold text-brand-black">{group.label}</h2>
                <p className="text-xs text-brand-muted mt-0.5">{group.description}</p>
              </header>
              <div className="p-2">
                {group.nodes.map((node) => (
                  <PageRow key={node.id} node={node} depth={0} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
