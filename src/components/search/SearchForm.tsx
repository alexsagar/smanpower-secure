"use client";

import { Search, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-3xl w-full mx-auto group">
      <div className="absolute inset-0 bg-brand-gold/10 blur-xl group-hover:bg-brand-gold/20 transition-colors duration-500 rounded-full" />
      <div className="relative flex items-center bg-brand-white border-2 border-brand-charcoal/10 focus-within:border-brand-gold rounded-none transition-colors">
        <Search className="w-6 h-6 text-brand-muted ml-6" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search jobs, facilities, insights, or industries..."
          className="w-full bg-transparent border-none text-brand-black placeholder:text-brand-muted text-lg lg:text-xl py-6 px-4 focus:outline-none focus:ring-0"
        />
        <button 
          type="submit"
          className="bg-brand-black text-brand-white h-full px-8 uppercase tracking-widest text-sm font-semibold hover:bg-brand-gold hover:text-brand-black transition-colors flex items-center gap-2 mr-2"
        >
          Search <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
