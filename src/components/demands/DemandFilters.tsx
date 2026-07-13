"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemandFiltersProps {
  options: {
    countries: string[];
    cities: string[];
    companies: string[];
    industries: string[];
  };
  className?: string;
}

export function DemandFilters({ options, className }: DemandFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    country: searchParams.get("country") || "",
    industry: searchParams.get("industry") || "",
    company: searchParams.get("company") || "",
    status: searchParams.get("status") || "",
  });

  // Sync state when URL changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters({
      country: searchParams.get("country") || "",
      industry: searchParams.get("industry") || "",
      company: searchParams.get("company") || "",
      status: searchParams.get("status") || "",
    });
  }, [searchParams]);

  const updateFilters = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 on filter change
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({ country: "", industry: "", company: "", status: "" });
    router.push(pathname);
    setIsOpen(false);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className={cn("bg-white/60 backdrop-blur-md border border-brand-charcoal/5 rounded-2xl shadow-sm overflow-hidden", className)}>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 lg:hidden text-brand-black font-semibold hover:bg-brand-off-white/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter Demands
        </span>
        {activeFilterCount > 0 && (
          <span className="bg-brand-gold text-brand-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Form */}
      <div className={cn("p-6 lg:block", isOpen ? "block" : "hidden")}>
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-charcoal/5">
          <h3 className="font-bold text-lg hidden lg:flex items-center gap-2">
            <Filter className="w-5 h-5 text-brand-gold" />
            Filters
          </h3>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-brand-charcoal/60 hover:text-brand-black flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear All
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Country Filter */}
          <div>
            <label className="block text-xs font-bold text-brand-charcoal/60 mb-2 uppercase tracking-widest">
              Country
            </label>
            <select
              value={filters.country}
              onChange={(e) => updateFilters("country", e.target.value)}
              className="w-full border-brand-charcoal/10 bg-white focus:border-brand-gold focus:ring-brand-gold rounded-xl text-sm py-3 px-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <option value="">All Countries</option>
              {options.countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Industry Filter */}
          <div>
            <label className="block text-xs font-bold text-brand-charcoal/60 mb-2 uppercase tracking-widest">
              Industry
            </label>
            <select
              value={filters.industry}
              onChange={(e) => updateFilters("industry", e.target.value)}
              className="w-full border-brand-charcoal/10 bg-white focus:border-brand-gold focus:ring-brand-gold rounded-xl text-sm py-3 px-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <option value="">All Industries</option>
              {options.industries.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <label className="block text-xs font-bold text-brand-charcoal/60 mb-2 uppercase tracking-widest">
              Company
            </label>
            <select
              value={filters.company}
              onChange={(e) => updateFilters("company", e.target.value)}
              className="w-full border-brand-charcoal/10 bg-white focus:border-brand-gold focus:ring-brand-gold rounded-xl text-sm py-3 px-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <option value="">All Companies</option>
              {options.companies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold text-brand-charcoal/60 mb-2 uppercase tracking-widest">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => updateFilters("status", e.target.value)}
              className="w-full border-brand-charcoal/10 bg-white focus:border-brand-gold focus:ring-brand-gold rounded-xl text-sm py-3 px-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <option value="">Any Status</option>
              <option value="OPEN">Open (Accepting Applications)</option>
              <option value="CLOSING_SOON">Closing Soon</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
