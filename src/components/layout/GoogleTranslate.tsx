"use client";

import { useEffect, useState, useRef } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GOOGLE_TRANSLATE_LANGUAGES,
  getPreferredLanguage,
  setGoogleTranslateCookie,
  LANGUAGE_CHANGE_EVENT,
  dispatchLanguageChange,
  getLanguageByCode
} from "@/lib/google-translate";

export function GoogleTranslate() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLangCode, setCurrentLangCode] = useState("en");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read initial language on mount
    const code = getPreferredLanguage();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentLangCode(code);

    const handleLanguageEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      setCurrentLangCode(customEvent.detail.code);
    };

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageEvent);
    return () => window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageEvent);
  }, []);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    window.dispatchEvent(new Event("ssis-load-google-translate"));
    // 1. Sync state across UI
    setGoogleTranslateCookie(langCode as typeof GOOGLE_TRANSLATE_LANGUAGES[number]["code"]);
    dispatchLanguageChange(langCode as typeof GOOGLE_TRANSLATE_LANGUAGES[number]["code"]);

    // 2. Trigger translation logic
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;

    if (select) {
      if (langCode === "en") {
        // To restore english reliably via Google Translate widget when there is no native "Restore" button easily accessible:
        // We clear the cookie (done above) and then either reload or trigger the select
        // In many cases, selecting the widget's "en" option doesn't exist if english is the base language.
        // Google translate adds a banner with a "Show Original" button, but that's suppressed here.
        // We rely on cookie clearing and reloading.
        window.location.reload();
      } else {
        select.value = langCode;
        select.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
      }
    } else {
      // Fallback: set cookie and reload if widget is not ready or blocked
      window.location.reload();
    }
    setIsOpen(false);
  };

  const currentLangObj = getLanguageByCode(currentLangCode) || GOOGLE_TRANSLATE_LANGUAGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Premium Custom Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); window.dispatchEvent(new Event("ssis-load-google-translate")); }}
        aria-label={`Select language (${currentLangObj.name})`}
        aria-expanded={isOpen}
        className="flex items-center gap-2 p-2 px-4 transition-all duration-300 rounded-full border border-brand-charcoal/20 hover:border-brand-gold hover:bg-brand-charcoal/5 group bg-brand-white/50 backdrop-blur-sm"
      >
        <Globe className="w-4 h-4 text-brand-charcoal group-hover:text-brand-gold transition-colors" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal group-hover:text-brand-charcoal transition-colors">
          {currentLangObj.code.toUpperCase()}
        </span>
        <ChevronDown className={cn("w-3 h-3 text-brand-charcoal transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      {/* Premium Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-4 w-[480px] max-w-[calc(100vw-32px)] bg-brand-white/95 backdrop-blur-xl border border-brand-charcoal/10 rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-brand-charcoal/10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/50">Select Language</h3>
            <span className="text-[10px] bg-brand-gold/20 text-brand-charcoal px-2 py-1 rounded-full font-bold uppercase tracking-widest">{GOOGLE_TRANSLATE_LANGUAGES.length} Supported</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {GOOGLE_TRANSLATE_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-left rounded-lg transition-all duration-200 text-xs font-medium",
                  currentLangCode === lang.code
                    ? "bg-brand-gold/10 text-brand-charcoal border border-brand-gold/30"
                    : "text-brand-charcoal/70 hover:bg-brand-charcoal/5 hover:text-brand-charcoal border border-transparent"
                )}
              >
                <span>{lang.name}</span>
                {currentLangCode === lang.code && <Check className="w-3 h-3 text-brand-gold" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
