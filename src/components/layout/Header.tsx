"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Search, Globe, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GoogleTranslate } from "./GoogleTranslate";
import { toPublicHref } from "@/lib/public-href";
import { layoutCopy } from "@/lib/page-copy";
import { NoTranslate } from "@/components/i18n/NoTranslate";

import type { CmsNavigation } from "@/types/content";

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

  const navConfig: Record<string, { label: string; items: { label: string; href: string }[] }> = {};
  navigation.forEach(nav => {
    navConfig[nav.id] = {
      label: nav.label,
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled || activeDesktopDropdown || mobileMenuOpen
          ? "bg-brand-white border-brand-charcoal/10"
          : "bg-transparent border-transparent"
      )}
      onMouseLeave={() => setActiveDesktopDropdown(null)}
    >
      <div className="w-full px-6 lg:px-12 h-24 lg:h-28 flex items-center justify-between relative">
        {/* Logo */}
        <Link href="/" className="relative z-50 group shrink-0">
          <NoTranslate className="flex items-center gap-3">
            <Image
              src="/images/SSIS.png"
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
        <nav className="hidden lg:flex flex-1 justify-center items-center gap-4 xl:gap-6 px-4 h-full whitespace-nowrap overflow-hidden">
          {Object.entries(navConfig).map(([key, section]) => (
            <div
              key={key}
              className="h-full flex items-center"
              onMouseEnter={() => setActiveDesktopDropdown(key)}
            >
              <button
                className={cn(
                  // Science Gothic runs wider than Manrope, so the labels are set
                  // smaller with tracking to look elegant and save horizontal space.
                  "font-brand relative min-h-11 px-2 py-2 font-medium uppercase tracking-widest flex items-center gap-1",
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
                style={{ fontSize: "8px" }}
              >
                {section.label}
              </button>
            </div>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-5 shrink-0">
          <Link
            href="/search"
            aria-label="Search Seven Seas Intercontinental"
            className={cn(
              "p-2 transition-colors rounded-full hover:bg-brand-white/10",
              !scrolled && !activeDesktopDropdown && pathname === "/"
                ? "text-brand-white/80 hover:text-brand-white"
                : "text-brand-charcoal hover:text-brand-gold"
            )}
          >
            <Search aria-hidden="true" className="w-4 h-4 xl:w-5 xl:h-5" />
          </Link>

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
        <div className="flex items-center gap-2 lg:hidden">
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

      {/* Desktop Mega Menu Dropdown */}
      <AnimatePresence>
        {activeDesktopDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="hidden lg:block absolute top-24 lg:top-28 left-0 w-full bg-brand-white border-t border-brand-charcoal/10 shadow-xl"
            onMouseLeave={() => setActiveDesktopDropdown(null)}
          >
            <div className="container-wide py-12">
              <div className="grid grid-cols-[minmax(200px,260px)_minmax(0,1fr)] gap-x-12">
                <div className="min-w-0 border-r border-brand-charcoal/10 pr-12">
                  {/* card-title keeps this compact: the global .brand-headings h2
                      scale is a page-level size that would overflow this narrow
                      intro column and cross the divider. */}
                  <h2 className="card-title text-brand-black mb-4 break-words">
                    {navConfig[activeDesktopDropdown as keyof typeof navConfig].label}
                  </h2>
                  <p className="text-sm text-brand-muted leading-relaxed">
                    {copy.megaMenuDescription}
                  </p>
                </div>
                <div className="min-w-0 grid grid-cols-2 xl:grid-cols-3 gap-y-4 gap-x-12">
                  {navConfig[activeDesktopDropdown as keyof typeof navConfig].items.map((item) => (
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-40 bg-brand-white lg:hidden flex flex-col pt-28 overflow-y-auto"
          >
            <div className="px-6 flex-1">
              {Object.entries(navConfig).map(([key, section]) => (
                <div key={key} className="border-b border-brand-charcoal/10">
                  <button
                    onClick={() =>
                      setActiveMobileDropdown(activeMobileDropdown === key ? null : key)
                    }
                    className="font-brand w-full flex items-center justify-between py-4 text-left font-semibold uppercase tracking-wider text-sm text-brand-black"
                  >
                    {section.label}
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        activeMobileDropdown === key ? "rotate-180" : ""
                      )}
                    />
                  </button>
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
