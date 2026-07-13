"use client";

import { Bell, Search, Menu } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface AdminTopBarProps {
  user: { name: string; email: string; role: string };
}

export function AdminTopBar({ user }: AdminTopBarProps) {
  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-brand-charcoal/10 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button className="lg:hidden p-1 text-brand-muted">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-medium text-brand-charcoal hidden md:block">
          Admin Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-brand-muted hover:text-brand-charcoal transition-colors">
          <Search className="w-4.5 h-4.5" />
        </button>
        <button className="p-2 text-brand-muted hover:text-brand-charcoal transition-colors relative">
          <Bell className="w-4.5 h-4.5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-gold text-white text-xs font-semibold flex items-center justify-center">
            {getInitials(user.name)}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-medium text-brand-charcoal leading-tight">
              {user.name}
            </p>
            <p className="text-[10px] text-brand-muted leading-tight">
              {user.role.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
