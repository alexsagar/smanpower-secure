"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { GOOGLE_TRANSLATE_LANGUAGES, parseGoogtransCookie } from "@/lib/google-translate";

export function GoogleTranslateScript() {
  const pathname = usePathname();
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const load = () => {
      if (document.getElementById("google-translate-script") || scriptLoaded.current) return;
      scriptLoaded.current = true;

    (window as any).googleTranslateElementInit = () => {
      try {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: GOOGLE_TRANSLATE_LANGUAGES.map(l => l.code).join(","),
            autoDisplay: false,
          },
          "google_translate_element"
        );
      } catch (e) {
        console.warn("Google Translate initialization failed", e);
      }
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit&hl=en";
    script.async = true;
    script.onerror = () => {
      console.warn("Failed to load Google Translate script");
    };
      document.body.appendChild(script);
    };

    window.addEventListener("ssis-load-google-translate", load);
    if (parseGoogtransCookie(document.cookie) !== "en") setTimeout(load, 0);

    return () => {
      // We don't remove the script on unmount because this is a singleton
      // that lives at the layout level, but we ensure we don't recreate it.
      window.removeEventListener("ssis-load-google-translate", load);
    };
  }, []);

  // Handle client-side navigation persistence
  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return;

    const currentLang = parseGoogtransCookie(document.cookie);
    if (currentLang === "en") return;

    let retries = 0;
    const maxRetries = 10;

    const applyTranslation = () => {
      const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (select) {
        // If it's already set to the target language, we might not need to do anything,
        // but Next.js might have replaced DOM nodes so we dispatch the event again to let the widget observe it.
        select.value = currentLang;
        select.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
      } else if (retries < maxRetries) {
        retries++;
        timer = setTimeout(applyTranslation, 300);
      }
    };

    let timer = setTimeout(applyTranslation, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div id="google_translate_element" className="opacity-0 fixed -z-[9999] pointer-events-none" aria-hidden="true" />
  );
}
