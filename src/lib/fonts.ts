import {
  Manrope,
  Noto_Sans,
  Noto_Sans_Arabic,
  Noto_Sans_Bengali,
  Noto_Sans_Devanagari,
  Noto_Sans_Ethiopic,
  Noto_Sans_Hebrew,
  Noto_Sans_Thai,
  Science_Gothic,
} from "next/font/google";

/**
 * Brand display face. Used only for branding surfaces (logo, navigation,
 * footer headings, hero and major headings, statistics) via the `font-brand`
 * / `font-heading` utilities — never as a body face.
 *
 * Weights are limited to the ones the branding surfaces actually use, because
 * Google serves this family as TTF rather than WOFF2 and every extra weight is
 * a full file.
 */
export const scienceGothic = Science_Gothic({
  subsets: ["latin"],
  // 300 display headings, 400 navigation, 600 small uppercase branding labels
  // (footer section titles, hero eyebrow, statistic labels). Every weight the
  // markup asks for must be loaded, or the browser synthesises a fake bold
  // that is heavier and wider than the real cut.
  weight: ["300", "400", "600"],
  variable: "--font-science-gothic",
  display: "swap",
  // Google publishes no metric overrides for this family, so Next cannot
  // synthesise a metric-matched fallback. Naming Manrope explicitly keeps the
  // swap-in close instead of dropping to Times.
  fallback: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
});

/**
 * Primary text face: body copy, forms, tables, cards, admin. Manrope is served
 * as a single variable WOFF2, so the weight range costs one file; 400 body,
 * 500 supporting emphasis, 600 labels/buttons, 700 the rare strong emphasis.
 */
export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const notoSans = Noto_Sans({ subsets: ["cyrillic", "greek", "latin", "vietnamese"], weight: ["400", "500"], variable: "--font-noto", display: "swap", preload: false });
const notoSansDevanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: ["400", "500"], variable: "--font-noto-devanagari", display: "swap", preload: false });
const notoSansArabic = Noto_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500"], variable: "--font-noto-arabic", display: "swap", preload: false });
const notoSansBengali = Noto_Sans_Bengali({ subsets: ["bengali"], weight: ["400", "500"], variable: "--font-noto-bengali", display: "swap", preload: false });
const notoSansEthiopic = Noto_Sans_Ethiopic({ subsets: ["ethiopic"], weight: ["400", "500"], variable: "--font-noto-ethiopic", display: "swap", preload: false });
const notoSansHebrew = Noto_Sans_Hebrew({ subsets: ["hebrew"], weight: ["400", "500"], variable: "--font-noto-hebrew", display: "swap", preload: false });
const notoSansThai = Noto_Sans_Thai({ subsets: ["thai"], weight: ["400", "500"], variable: "--font-noto-thai", display: "swap", preload: false });

/** Public surfaces get brand, body, and on-demand translated-script faces. */
export const publicFontVariables = [
  scienceGothic,
  manrope,
  notoSans,
  notoSansDevanagari,
  notoSansArabic,
  notoSansBengali,
  notoSansEthiopic,
  notoSansHebrew,
  notoSansThai,
].map(font => font.variable).join(" ");
