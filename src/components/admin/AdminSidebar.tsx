"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  Building2,
  Newspaper,
  Shield,
  Star,
  GraduationCap,
  BarChart3,
  Search,
  Image as ImageIcon,
  History,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { useState } from "react";

interface AdminSidebarProps {
  user: { name: string; email: string; role: string };
}

const sidebarItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Partners", href: "/admin/partners", icon: Building2 },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "Demands", href: "/admin/demands", icon: Briefcase },
  { label: "Applications", href: "/admin/applications", icon: Shield },
  { label: "Insights", href: "/admin/insights", icon: FileText },
  { label: "Intelligence", href: "/admin/intelligence", icon: BarChart3 },
  { label: "Newsroom", href: "/admin/news", icon: Newspaper },
  { label: "Careers", href: "/admin/careers", icon: GraduationCap },
  { label: "Stories", href: "/admin/stories", icon: Star },
  { label: "SEO", href: "/admin/seo", icon: Search },
  { label: "Media", href: "/admin/media", icon: ImageIcon },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Footer", href: "/admin/settings/footer", icon: Settings },
  { label: "Profile", href: "/admin/profile", icon: Settings },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-brand-black text-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-white/10">
        {!collapsed && (
          <Image
            src="/images/SSIS.png"
            alt="Seven Seas"
            width={32}
            height={32}
            className="mr-3"
          />
        )}
        {!collapsed && (
          <span className="text-sm font-semibold">Seven Seas</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "ml-auto p-1 text-white/40 hover:text-white transition-colors",
            collapsed && "mx-auto"
          )}
        >
          <ChevronLeft
            className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-white/10 text-white border-r-2 border-brand-gold"
                  : "text-white/60 hover:text-white hover:bg-white/5",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-white/10 p-4">
        {!collapsed && (
          <div className="mb-3">
            <p className="text-xs font-medium text-white truncate">
              {user.name}
            </p>
            <p className="text-[10px] text-white/40 truncate">{user.role}</p>
          </div>
        )}
        <form action={logoutAction}>
          <button
            type="submit"
            className={cn(
              "flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors",
              collapsed && "mx-auto"
            )}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && "Sign Out"}
          </button>
        </form>
      </div>
    </aside>
  );
}
