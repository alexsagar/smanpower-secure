export const GOOGLE_TRANSLATE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ne", name: "Nepali" },
  { code: "ar", name: "Arabic" },
  { code: "am", name: "Amharic" },
  { code: "it", name: "Italian" },
  { code: "id", name: "Indonesian" },
  { code: "ur", name: "Urdu" },
  { code: "ko", name: "Korean" },
  { code: "el", name: "Greek" },
  { code: "zh-TW", name: "Chinese (Traditional)" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
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
] as const;

export type SupportedLanguageCode = typeof GOOGLE_TRANSLATE_LANGUAGES[number]["code"];

export const DEFAULT_LANGUAGE: SupportedLanguageCode = "en";
const LANGUAGE_STORAGE_KEY = "ssis-language";

export function isSupportedLanguage(code: string): code is SupportedLanguageCode {
  return GOOGLE_TRANSLATE_LANGUAGES.some((lang) => lang.code === code);
}

export function getLanguageByCode(code: string) {
  return GOOGLE_TRANSLATE_LANGUAGES.find((lang) => lang.code === code) || null;
}

export function parseGoogtransCookie(cookieHeader: string | null | undefined): SupportedLanguageCode {
  if (!cookieHeader) return DEFAULT_LANGUAGE;

  // googtrans can appear multiple times with different scopes. We take the first valid one,
  // or return default if none are valid or it's malformed.
  const cookies = cookieHeader.split(";").map(c => c.trim());
  const googtransCookies = cookies.filter(c => c.startsWith("googtrans="));

  for (const cookie of googtransCookies) {
    const value = cookie.substring("googtrans=".length);
    // Value must be strictly /en/<target>
    const match = value.match(/^\/en\/([^/]+)$/);
    if (match && match[1]) {
      const code = match[1].trim();
      if (isSupportedLanguage(code)) {
        return code as SupportedLanguageCode;
      }
    }
  }

  return DEFAULT_LANGUAGE;
}

export function getPreferredLanguage(): SupportedLanguageCode {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return saved && isSupportedLanguage(saved) ? saved : parseGoogtransCookie(document.cookie);
}

export function setGoogleTranslateCookie(code: SupportedLanguageCode) {
  if (typeof window === "undefined") return;
  const val = `/en/${code}`;
  const hostname = window.location.hostname;
  const parentDomain = hostname.split(".").slice(-2).join(".");

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  document.cookie = `googtrans=${val}; path=/`;
  document.cookie = `googtrans=${val}; domain=.${hostname}; path=/`;
  if (parentDomain !== hostname && parentDomain.includes(".")) {
    document.cookie = `googtrans=${val}; domain=.${parentDomain}; path=/`;
  }
}

// We dispatch a custom event to keep multiple instances (like desktop and mobile) synchronized.
export const LANGUAGE_CHANGE_EVENT = "ssis-language-change";

export function dispatchLanguageChange(code: SupportedLanguageCode) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: { code } }));
  }
}
