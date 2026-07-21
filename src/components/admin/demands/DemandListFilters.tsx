"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";

export type DemandListRow = {
  id: string;
  title: string;
  companyName: string;
  country: string;
  status: string;
};

/**
 * Client-side search and status filter for the demand list.
 *
 * The toolbar previously rendered an input and a select with no handlers, so
 * neither did anything. Filtering happens in the browser over the already
 * fetched rows; no query, route or data shape changed.
 */
export function useDemandListFilter<T extends DemandListRow>(rows: T[]) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((row) => {
      if (status && row.status !== status) return false;
      if (!q) return true;

      return (
        row.title.toLowerCase().includes(q) ||
        row.companyName.toLowerCase().includes(q) ||
        row.country.toLowerCase().includes(q)
      );
    });
  }, [rows, query, status]);

  return { query, setQuery, status, setStatus, filtered };
}

export function DemandListToolbar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  shown,
  total,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  shown: number;
  total: number;
}) {
  return (
    <div className="p-4 border-b border-brand-charcoal/10 flex flex-wrap gap-4 items-center justify-between bg-brand-charcoal/5">
      <div className="relative w-full sm:w-64">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-charcoal/40" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search demands..."
          aria-label="Search demands"
          className="w-full pl-9 pr-4 py-2 border-brand-charcoal/20 rounded-sm text-sm"
        />
      </div>
      <div className="flex gap-3 items-center">
        <span className="text-xs text-brand-charcoal/60">
          {query || status ? `${shown} of ${total}` : `${total} demands`}
        </span>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by status"
          className="border-brand-charcoal/20 rounded-sm text-sm py-2"
        >
          <option value="">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>
    </div>
  );
}
