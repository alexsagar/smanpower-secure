"use client";

import { useEffect, useState, useRef } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", name: "English" },
  { code: "ne", name: "Nepali" },
  { code: "ar", name: "Arabic" },
  { code: "am", name: "Amharic" },
  { code: "it", name: "Italian" },
  { code: "id", name: "Indonesian" },
  { code: "ur", name: "Urdu" },
  { code: "ko", name: "Korean" },
  { code: "el", name: "Greek" },
  { code: "zh-TW", name: "Chinese (Trad)" },
  { code: "zh-CN", name: "Chinese (Simp)" },
  { code: "cs", name: "Czech" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "zu", name: "Zulu" },
  { code: "tr", name: "Turkish" },
  { code: "nl", name: "Dutch" },
  { code: "da", name: "Danish" },
  { code: "th", name: "Thai" },
  { code: "no", name: "Norwegian" },
  { code: "pt", name: "Portuguese" },
  { code: "pl", name: "Polish" },
  { code: "fa", name: "Persian" },
  { code: "fi", name: "Finnish" },
  { code: "tl", name: "Filipino" },
  { code: "fr", name: "French" },
  { code: "bn", name: "Bengali" },
  { code: "vi", name: "Vietnamese" },
  { code: "ms", name: "Malay" },
  { code: "uk", name: "Ukrainian" },
  { code: "yo", name: "Yoruba" },
  { code: "ru", name: "Russian" },
  { code: "ro", name: "Romanian" },
  { code: "es", name: "Spanish" },
  { code: "sw", name: "Swahili" },
  { code: "sv", name: "Swedish" },
  { code: "hu", name: "Hungarian" },
  { code: "hi", name: "Hindi" },
  { code: "iw", name: "Hebrew" },
];

export function GoogleTranslate() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("English");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only initialize once
    if (document.getElementById("google-translate-script")) return;

    // Set up the callback before loading the script
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: languages.map(l => l.code).join(","),
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit&hl=en";
    script.async = true;
    document.body.appendChild(script);
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

  const handleLanguageChange = (langCode: string, langName: string) => {
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    } else {
      // Fallback: set cookie and reload if widget is not ready or blocked
      // eslint-disable-next-line react-hooks/immutability
      document.cookie = `googtrans=/en/${langCode}; path=/`;
      // eslint-disable-next-line react-hooks/immutability
      document.cookie = `googtrans=/en/${langCode}; domain=.${window.location.hostname}; path=/`;
      window.location.reload();
    }
    setCurrentLang(langName);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden Native Google Translate Widget */}
      <div id="google_translate_element" className="opacity-0 fixed -z-50 pointer-events-none" />

      {/* Premium Custom Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 px-4 transition-all duration-300 rounded-full border border-brand-charcoal/20 hover:border-brand-gold hover:bg-brand-charcoal/5 group bg-brand-white/50 backdrop-blur-sm"
      >
        <Globe className="w-4 h-4 text-brand-charcoal group-hover:text-brand-gold transition-colors" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal group-hover:text-brand-charcoal transition-colors">
          {currentLang}
        </span>
        <ChevronDown className={cn("w-3 h-3 text-brand-charcoal transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      {/* Premium Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-4 w-[480px] bg-brand-white/95 backdrop-blur-xl border border-brand-charcoal/10 rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-brand-charcoal/10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/50">Select Language</h3>
            <span className="text-[10px] bg-brand-gold/20 text-brand-charcoal px-2 py-1 rounded-full font-bold uppercase tracking-widest">39 Supported</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code, lang.name)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-left rounded-lg transition-all duration-200 text-xs font-medium",
                  currentLang === lang.name
                    ? "bg-brand-gold/10 text-brand-charcoal border border-brand-gold/30"
                    : "text-brand-charcoal/70 hover:bg-brand-charcoal/5 hover:text-brand-charcoal border border-transparent"
                )}
              >
                <span>{lang.name}</span>
                {currentLang === lang.name && <Check className="w-3 h-3 text-brand-gold" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
