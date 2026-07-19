import {
  GOOGLE_TRANSLATE_LANGUAGES,
  isSupportedLanguage,
  parseGoogtransCookie
} from "./google-translate";

describe("Google Translate Language Contract", () => {
  it("defines exactly 39 languages", () => {
    expect(GOOGLE_TRANSLATE_LANGUAGES).toHaveLength(39);
  });

  it("has unique codes", () => {
    const codes = new Set(GOOGLE_TRANSLATE_LANGUAGES.map(l => l.code));
    expect(codes.size).toBe(39);
  });

  it("provides safe validation", () => {
    expect(isSupportedLanguage("en")).toBe(true);
    expect(isSupportedLanguage("ne")).toBe(true);
    expect(isSupportedLanguage("iw")).toBe(true);
    expect(isSupportedLanguage("invalid")).toBe(false);
  });
});

describe("Google Translate Cookie Parsing", () => {
  it("parses valid cookie", () => {
    expect(parseGoogtransCookie("googtrans=/en/fr")).toBe("fr");
  });

  it("falls back to missing/malformed/unsupported", () => {
    expect(parseGoogtransCookie(null)).toBe("en");
    expect(parseGoogtransCookie("googtrans=/en/xyz")).toBe("en");
    expect(parseGoogtransCookie("googtrans=xyz")).toBe("en");
  });

  it("handles duplicate cookies safely", () => {
    // First valid one wins
    expect(parseGoogtransCookie("googtrans=/en/invalid; googtrans=/en/de")).toBe("de");
  });
});
