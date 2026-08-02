import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { GoogleTranslate } from "./GoogleTranslate";
import { LANGUAGE_CHANGE_EVENT } from "@/lib/google-translate";

describe("GoogleTranslate Component", () => {
  beforeEach(() => {
    // Clear cookies
    if (typeof document !== "undefined") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  });

  it("identifies current language accessibly", () => {
    const html = renderToStaticMarkup(<GoogleTranslate />);
    // Static markup should render English initially and a button
    expect(html).toContain("English");
    expect(html).toContain('aria-label="Select language (English)"');
  });

  it("does not render duplicate script containers", () => {
    const html = renderToStaticMarkup(<GoogleTranslate />);
    expect(html).not.toContain('id="google_translate_element"');
    expect(html).not.toContain("google.translate.TranslateElement");
  });

  it("does not render a raw script tag through React", async () => {
    const { GoogleTranslateScript } = await import("./GoogleTranslateScript");
    const html = renderToStaticMarkup(<GoogleTranslateScript />);
    expect(html).toContain('id="google_translate_element"');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("google-translate-script");
  });
});

describe("GoogleTranslateScript", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    delete (globalThis as { window?: unknown }).window;
    delete (globalThis as { document?: unknown }).document;
  });

  it("injects one HTTPS Google script and reuses an existing script", async () => {
    const scripts: Array<{ id: string; src: string; async?: boolean; onerror?: () => void }> = [];
    const documentMock = {
      body: {
        appendChild: vi.fn((script: { id: string; src: string }) => {
          scripts.push(script);
        }),
      },
      getElementById: vi.fn((id: string) => scripts.find(script => script.id === id) ?? null),
      createElement: vi.fn(() => ({ id: "", src: "" })),
      cookie: "",
    };

    vi.doMock("react", async importOriginal => ({
      ...(await importOriginal<typeof import("react")>()),
      useEffect: (callback: () => void) => callback(),
      useRef: () => ({ current: false }),
    }));
    vi.doMock("next/navigation", () => ({ usePathname: () => "/" }));

    const listeners: Record<string, () => void> = {};
    (globalThis as { window?: unknown }).window = {
      addEventListener: vi.fn((name: string, callback: () => void) => { listeners[name] = callback; }),
      removeEventListener: vi.fn(),
      localStorage: { getItem: vi.fn(() => null), setItem: vi.fn() },
      location: { hostname: "www.smanpower.com" },
    };
    (globalThis as { document?: unknown }).document = documentMock;

    const { GoogleTranslateScript } = await import("./GoogleTranslateScript");
    GoogleTranslateScript();
    listeners["ssis-load-google-translate"]?.();
    listeners["ssis-load-google-translate"]?.();

    expect(scripts).toHaveLength(1);
    expect(scripts[0]?.id).toBe("google-translate-script");
    expect(scripts[0]?.src.startsWith("https://translate.google.com/")).toBe(true);
    expect(scripts[0]?.src.startsWith("//translate.google.com/")).toBe(false);
    expect(scripts[0]?.src.startsWith("http://")).toBe(false);
    expect(documentMock.body.appendChild).toHaveBeenCalledTimes(1);
  });
});
