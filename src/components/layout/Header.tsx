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
      <div className="w-full px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative z-50 group shrink-0">
          <NoTranslate className="flex items-center gap-3">
            <Image
              src="/images/SSIS.png"
              alt="Seven Seas Intercontinental"
              width={40}
              height={40}
              className="transition-transform duration-500 group-hover:scale-105"
            />
            <div
              className={cn(
                "hidden xl:block",
                !scrolled && !activeDesktopDropdown && pathname === "/"
                  ? "text-brand-white"
                  : "text-brand-charcoal"
              )}
            >
              <span className="block text-sm font-semibold tracking-wide uppercase leading-none">
                {copy.wordmarkLead}
              </span>
              <p className="text-[9px] uppercase tracking-[0.2em] text-brand-gold mt-1">
                {copy.wordmarkAccent}
              </p>
            </div>
          </NoTranslate>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-5 h-full">
          {Object.entries(navConfig).map(([key, section]) => (
            <div
              key={key}
              className="h-full flex items-center"
              onMouseEnter={() => setActiveDesktopDropdown(key)}
            >
              <button
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1 transition-colors relative after:absolute after:bottom-1/3 after:left-0 after:w-full after:h-px after:bg-brand-gold after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-300",
                  activeDesktopDropdown === key
                    ? "text-brand-gold after:scale-x-100"
                    : !scrolled && !activeDesktopDropdown && pathname === "/"
                    ? "text-brand-white/90 hover:text-brand-white"
                    : "text-brand-charcoal hover:text-brand-gold"
                )}
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
            className={cn(
              "p-2 transition-colors rounded-full hover:bg-brand-white/10",
              !scrolled && !activeDesktopDropdown && pathname === "/"
                ? "text-brand-white/80 hover:text-brand-white"
                : "text-brand-charcoal hover:text-brand-gold"
            )}
          >
            <Search className="w-4 h-4 xl:w-5 xl:h-5" />
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

        {/* Mobile Toggle */}
        <button
          className={cn(
            "lg:hidden p-2 z-50",
            !scrolled && !mobileMenuOpen && pathname === "/"
              ? "text-brand-white"
              : "text-brand-charcoal"
          )}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Mega Menu Dropdown */}
      <AnimatePresence>
        {activeDesktopDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="hidden lg:block absolute top-20 left-0 w-full bg-brand-white border-t border-brand-charcoal/10 shadow-xl"
            onMouseLeave={() => setActiveDesktopDropdown(null)}
          >
            <div className="container-wide py-12">
              <div className="grid grid-cols-4 gap-x-12">
                <div className="col-span-1 border-r border-brand-charcoal/10 pr-12">
                  <h2 className="text-2xl font-semibold text-brand-black mb-4">
                    {navConfig[activeDesktopDropdown as keyof typeof navConfig].label}
                  </h2>
                  <p className="text-sm text-brand-muted leading-relaxed">
                    {copy.megaMenuDescription}
                  </p>
                </div>
                <div className="col-span-3 grid grid-cols-3 gap-y-4 gap-x-12">
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
            className="fixed inset-0 z-40 bg-brand-white lg:hidden flex flex-col pt-24 overflow-y-auto"
          >
            <div className="px-6 flex-1">
              {Object.entries(navConfig).map(([key, section]) => (
                <div key={key} className="border-b border-brand-charcoal/10">
                  <button
                    onClick={() =>
                      setActiveMobileDropdown(activeMobileDropdown === key ? null : key)
                    }
                    className="w-full flex items-center justify-between py-4 text-left font-semibold uppercase tracking-wider text-sm text-brand-black"
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
