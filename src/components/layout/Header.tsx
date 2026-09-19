"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Globe, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GoogleTranslate } from "./GoogleTranslate";
import { toPublicHref } from "@/lib/public-href";
import { layoutCopy } from "@/lib/page-copy";
import { NoTranslate } from "@/components/i18n/NoTranslate";

import type { CmsNavigation } from "@/types/content";

function getSectionDefaultHref(nav: CmsNavigation): string {
  if (nav.id === "nav-about") return "/about";
  if (nav.id === "nav-workforce") return "/employers";
  if (nav.id === "nav-ethical") return "/ethical-recruitment";
  if (nav.id === "nav-industries") return "/industries";
  if (nav.id === "nav-training") return "/training-facilities";
  if (nav.id === "nav-trust") return "/trust-centre";
  const l = nav.label.toLowerCase();
  if (l.includes("about")) return "/about";
  if (l.includes("workforce") || l.includes("employer")) return "/employers";
  if (l.includes("ethical")) return "/ethical-recruitment";
  if (l.includes("industr")) return "/industries";
  if (l.includes("training")) return "/training-facilities";
  if (l.includes("trust")) return "/trust-centre";
  return nav.items?.[0]?.href || "/";
}

export function Header({
  navigation,
  copy = layoutCopy.header,
}: {
  navigation: CmsNavigation[];
  /** Resolved in the server layout; defaults keep the current wording. */
  copy?: typeof layoutCopy.header;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDesktopDropdown, setActiveDesktopDropdown] = useState<string | null>(null);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
    setActiveDesktopDropdown(null);
  }, [pathname]);

  const navConfig: Record<string, { label: string; href: string; items: { label: string; href: string }[] }> = {};
  navigation.forEach(nav => {
    if (nav.label.toLowerCase() === "resources") return;
    const resolvedHref = (nav as { href?: string }).href || getSectionDefaultHref(nav);
    navConfig[nav.id] = {
      label: nav.label,
      href: toPublicHref(resolvedHref),
      items: nav.items
        .filter((item): item is typeof item & { href: string } => typeof item.href === "string")
        .map(item => ({
          label: item.label,
          href: item.href
        }))
    };
  });

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-300 border-b",
        scrolled || activeDesktopDropdown || mobileMenuOpen
          ? "bg-brand-white border-brand-charcoal/10"
          : "bg-transparent border-transparent"
      )}
      onMouseLeave={() => setActiveDesktopDropdown(null)}
    >
      <div className="w-full px-4 sm:px-6 lg:px-6 xl:px-8 h-[var(--site-header-height)] flex items-center justify-between relative">
        {/* Logo */}
        <Link href="/" className="relative z-50 group shrink-0">
          <NoTranslate className="flex items-center gap-3">
            <Image
              src="/images/SSIS.webp"
              alt="Seven Seas Intercontinental"
              width={80}
              height={80}
              priority
              className="h-14 w-14 lg:h-16 lg:w-16 object-contain transition-transform duration-500 group-hover:scale-105"
            />
            <div
              className={cn(
                "hidden xl:block",
                !scrolled && !activeDesktopDropdown && pathname === "/"
                  ? "text-brand-white"
                  : "text-brand-charcoal"
              )}
            >
              <span className="font-brand block text-sm font-semibold tracking-wide uppercase leading-none">
                {copy.wordmarkLead}
              </span>
              <div className={cn(
                "h-[1px] w-full my-1.5 transition-colors duration-300",
                !scrolled && !activeDesktopDropdown && pathname === "/"
                  ? "bg-brand-gold/50"
                  : "bg-brand-gold/70"
              )} />
              <p className="font-brand text-[10px] uppercase tracking-[0.25em] text-brand-gold">
                {copy.wordmarkAccent}
              </p>
            </div>
          </NoTranslate>
        </Link>

        {/* Desktop Navigation */}
        {/* The link row needs ~849px for English labels but only gets ~729px at
            the xl breakpoint, so it used to overflow and `justify-center` clipped
            it under the logo and the demands button. Spacing is tightened at xl
            and relaxed once 2xl actually has the room. min-w-0 keeps the nav from
            forcing the flex row wider than the header. */}
        <nav aria-label="Main Navigation" className="hidden xl:flex flex-1 min-w-0 justify-center items-center gap-0.5 2xl:gap-3 px-0 2xl:px-3 h-full whitespace-nowrap overflow-hidden">
          {Object.entries(navConfig).map(([key, section]) => (
            <div
              key={key}
              className="h-full flex items-center"
              onMouseEnter={() => setActiveDesktopDropdown(key)}
            >
              <Link
                href={section.href}
                className={cn(
                  "public-nav-label font-brand relative min-h-11 px-1 2xl:px-1.5 py-2 text-[10px] 2xl:text-[11px] font-medium uppercase tracking-[0.02em] 2xl:tracking-[0.06em] flex items-center gap-1",
                  "transition-colors duration-200",
                  "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-brand-gold",
                  "after:origin-left after:scale-x-0 after:transition-transform after:duration-300 after:ease-out",
                  "hover:after:scale-x-100",
                  activeDesktopDropdown === key
                    ? "text-brand-gold after:scale-x-100"
                    : !scrolled && !activeDesktopDropdown && pathname === "/"
                    ? "text-brand-white/90 hover:text-brand-white"
                    : "text-brand-charcoal hover:text-brand-gold"
                )}
              >
                {section.label}
              </Link>
            </div>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden xl:flex items-center gap-5 shrink-0">
          <div className="hidden xl:flex items-center">
            <GoogleTranslate />
          </div>
          
          <Link href="/demands">
            <Button
              variant={!scrolled && !activeDesktopDropdown && pathname === "/" ? "outline" : "primary"}
              className={cn(
                "text-[10px] font-semibold uppercase tracking-widest h-10 px-5 xl:px-8 rounded-none transition-all duration-300 hover:bg-brand-gold hover:text-brand-black hover:border-brand-gold",
                !scrolled && !activeDesktopDropdown && pathname === "/" ? "text-brand-white border-brand-white/40" : ""
              )}
            >
              {copy.viewDemandsLabel}
            </Button>
          </Link>
        </div>

        {/* Mobile actions: the demands CTA was only inside the drawer, so it was
            invisible until the menu was opened. It now sits in the bar itself. */}
        <div className="flex items-center gap-2 xl:hidden">
          <Link href="/demands" className="z-50">
            <Button
              variant={!scrolled && !mobileMenuOpen && pathname === "/" ? "outline" : "primary"}
              className={cn(
                "h-10 px-4 sm:px-5 rounded-none text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap",
                "transition-all duration-300 hover:bg-brand-gold hover:text-brand-black hover:border-brand-gold",
                !scrolled && !mobileMenuOpen && pathname === "/"
                  ? "text-brand-white border-brand-white/40"
                  : ""
              )}
            >
              {copy.viewDemandsLabel}
            </Button>
          </Link>

        {/* Mobile Toggle */}
        <button
          className={cn(
            "p-2 z-50",
            !scrolled && !mobileMenuOpen && pathname === "/"
              ? "text-brand-white"
              : "text-brand-charcoal"
          )}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        </div>
      </div>

      {/* Desktop Mega Menu Dropdowns (Server-rendered for crawler discoverability) */}
      <div className="hidden xl:block">
        {Object.entries(navConfig).map(([key, section]) => {
          const isActive = activeDesktopDropdown === key;
          return (
            <div
              key={key}
              aria-hidden={!isActive}
              className={cn(
                "absolute top-[calc(var(--site-header-height)+env(safe-area-inset-top))] left-0 w-full bg-brand-white border-t border-brand-charcoal/10 shadow-xl transition-all duration-200 ease-in-out",
                isActive
                  ? "opacity-100 translate-y-0 pointer-events-auto visible z-40"
                  : "opacity-0 -translate-y-2 pointer-events-none invisible -z-10"
              )}
              onMouseEnter={() => setActiveDesktopDropdown(key)}
              onMouseLeave={() => setActiveDesktopDropdown(null)}
            >
              <div className="container-wide py-12">
                <div className="grid grid-cols-[minmax(200px,260px)_minmax(0,1fr)] gap-x-12">
                  <div className="min-w-0 border-r border-brand-charcoal/10 pr-12">
                    <div className="card-title text-brand-black mb-4 break-words">
                      <Link
                        href={section.href}
                        className="hover:text-brand-gold transition-colors"
                      >
                        {section.label}
                      </Link>
                    </div>
                    <p className="text-sm text-brand-muted leading-relaxed">
                      {copy.megaMenuDescription}
                    </p>
                  </div>
                  <div className="min-w-0 grid grid-cols-2 xl:grid-cols-3 gap-y-4 gap-x-12">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={toPublicHref(item.href)}
                        className="text-sm text-brand-charcoal hover:text-brand-gold transition-colors flex items-center group py-2"
                      >
                        <ChevronRight className="w-4 h-4 opacity-0 -ml-4 mr-2 group-hover:opacity-100 group-hover:ml-0 transition-all text-brand-gold" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-40 bg-brand-white xl:hidden flex flex-col pt-[calc(var(--site-header-height)+env(safe-area-inset-top))] overflow-y-auto"
          >
            <div className="px-6 flex-1">
              {Object.entries(navConfig).map(([key, section]) => (
                <div key={key} className="border-b border-brand-charcoal/10">
                  <div className="w-full flex items-center justify-between py-4">
                    <Link
                      href={section.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="font-brand text-left font-semibold uppercase tracking-wider text-sm text-brand-black hover:text-brand-gold transition-colors"
                    >
                      {section.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMobileDropdown(activeMobileDropdown === key ? null : key)
                      }
                      aria-label={`Toggle ${section.label} submenu`}
                      aria-expanded={activeMobileDropdown === key}
                      className="p-1 -mr-1 text-brand-charcoal hover:text-brand-gold transition-colors"
                    >
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          activeMobileDropdown === key ? "rotate-180" : ""
                        )}
                      />
                    </button>
                  </div>
                  <AnimatePresence>
                    {activeMobileDropdown === key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4 space-y-3">
                          {section.items.map((item) => (
                            <Link
                              key={item.href}
                              href={toPublicHref(item.href)}
                              className="block text-sm text-brand-muted hover:text-brand-gold"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            <div className="p-6 bg-brand-off-white space-y-4">
              <Link href="/demands">
                <Button variant="primary" fullWidth className="rounded-none">
                  {copy.viewDemandsLabel}
                </Button>
              </Link>

              <div className="flex justify-center py-2">
                <GoogleTranslate />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
