---
name: Seven Seas Intercontinental
description: An evidence-first editorial system — flat, sharp-edged and precisely ruled, with gold reserved for what carries consequence.
colors:
  brand-black: "#000000"
  brand-charcoal: "#171717"
  brand-gold: "#B5913F"
  brand-gold-dark: "#7A6224"
  brand-off-white: "#F7F5F0"
  brand-stone: "#EDE9E1"
  brand-muted: "#77736A"
  brand-white: "#FFFFFF"
typography:
  display:
    fontFamily: "Science Gothic, Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 4.5vw, 4.5rem)"
    fontWeight: 300
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Science Gothic, Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3vw, 3rem)"
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 2vw, 2.125rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1rem, 1.1vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(0.625rem, 0.8vw, 0.75rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.28em"
rounded:
  none: "0px"
  pill: "999px"
spacing:
  section: "py-20 md:py-32"
  section-sm: "py-12 md:py-20"
  gutter: "24px"
  gutter-lg: "64px"
components:
  button-primary:
    backgroundColor: "{colors.brand-black}"
    textColor: "{colors.brand-white}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.brand-charcoal}"
    textColor: "{colors.brand-white}"
  button-gold:
    backgroundColor: "{colors.brand-gold}"
    textColor: "{colors.brand-black}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "44px"
  button-gold-hover:
    backgroundColor: "{colors.brand-gold-dark}"
    textColor: "{colors.brand-white}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.brand-charcoal}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "44px"
  input-default:
    backgroundColor: "{colors.brand-white}"
    textColor: "{colors.brand-charcoal}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "44px"
  badge-gold:
    backgroundColor: "rgba(181, 145, 63, 0.1)"
    textColor: "{colors.brand-gold-dark}"
    rounded: "{rounded.none}"
    padding: "2px 10px"
---

# Design System: Seven Seas Intercontinental

## Overview

**Creative North Star: "The Verified Dossier"**

The interface behaves like a document assembled for inspection rather than a website built to persuade. An employer evaluating a Nepali recruitment agency from 4,000 km away is performing an audit, and the design answers that posture directly: flat surfaces, sharp corners, hairline rules, and a near-total absence of ornament. Nothing is softened, because everything on the page is evidence being presented and evidence does not need decoration.

Density is low and deliberate. Sections breathe at `py-20 md:py-32`, headlines run to 4.5rem in a 300-weight face that is wide and thin rather than loud, and body copy sits at a generous 1.7 line-height. The effect is an unhurried, broadsheet-like calm — the visual equivalent of a company that says "compliant" where a competitor would say "certified". Restraint is the argument.

Colour is almost entirely absent. A black-charcoal-stone-offwhite range carries the entire interface, and a single gold accent appears only where something genuinely carries weight. The palette's near-monochrome discipline is what makes the gold legible as a signal at all.

**Key Characteristics:**
- Flat by doctrine — no radius, no drop shadows
- Editorial scale: very large, very light display type
- Hairline rules and column lines instead of boxes and cards
- Gold as a scarce signal, never as decoration
- Text-led hierarchy; imagery supports, never leads
- Generous vertical rhythm, low information density

## Colors

A near-monochrome warm-neutral range with one metallic brand accent; the warmth of the neutrals (off-white and stone carry a yellow cast, not a blue one) keeps the flatness from reading as cold or clinical.

Gold is the only *brand* chromatic accent. It is not the only colour permitted: semantic status colours (emerald, amber, red) remain available strictly for functional state feedback — validation errors, success confirmations, warnings and record status. Those are communication, not identity, and they never compete with gold because they never appear decoratively.

### Primary
- **Antique Gold** (`#B5913F`): The brand's only chromatic voice. Reserved for eyebrows, focus rings, active navigation states, the loader bar, and the single most consequential action on a surface.
- **Deep Bronze** (`#7A6224`): The accessible companion to Antique Gold, darkened specifically to clear WCAG AA (4.5:1) for small text on white and off-white. Use this — never the lighter gold — for gold-coloured body text, links and small labels.

### Neutral
- **Absolute Black** (`#000000`): Headings and primary button fills. Reserved for the strongest typographic statements; it is a deliberate step beyond charcoal, not a synonym for it.
- **Ink Charcoal** (`#171717`): Default body text and the standard UI foreground. Also the tonal panel colour for dark editorial sections.
- **Warm Paper** (`#F7F5F0`): The page ground. The site's default background, not white.
- **Dry Stone** (`#EDE9E1`): The one step up in tone from the page — secondary button fills, subtle panels, badge grounds. This is how the system makes a surface feel raised without a shadow.
- **Quiet Slate** (`#77736A`): Muted supporting text, placeholders and captions.
- **Pure White** (`#FFFFFF`): Input fields and cards that must separate from the warm ground. White is a *component* colour here, not the page colour.

### Named Rules

**The Scarce Gold Rule.** Gold marks only what carries consequence — an eyebrow, a focus ring, an active nav state, the one action that matters on the surface. Its rarity is the entire mechanism. Avoid competing *decorative or primary* gold accents within a single viewport: two gold-filled calls to action, or gold ornament placed beside a gold action, dilute the signal. Transient and functional states — focus rings, hover treatments, active navigation, and any accessibility affordance — do not count as competing brand accents and are never subject to this limit.

**The Two Golds Rule.** `#B5913F` is for large marks, fills and borders. Small text set in gold uses `#7A6224`, always. The split exists purely for contrast compliance and must never be collapsed back into one value.

**The Warm Ground Rule.** The page is Warm Paper (`#F7F5F0`), never white. White appears only inside components that need to lift off that ground — inputs, certain cards. Defaulting a page background to `#FFFFFF` breaks the system's warmth.

## Typography

**Display Font:** Science Gothic (with Manrope, then system sans, as fallback)
**Body Font:** Manrope (with `ui-sans-serif`, system-ui, Segoe UI)
**Script coverage:** Noto Sans families (Devanagari, Arabic, Bengali, Ethiopic, Hebrew, Thai) plus platform CJK stacks, swapped in per `html[lang]` because Science Gothic carries Latin glyphs only.

**Character:** A wide, thin grotesque at display scale against a compact, highly legible geometric sans for everything else. The pairing is the whole personality: the display face is expansive and quiet, and the body face is businesslike and dense. Neither is expressive; the contrast between them does the work.

The root font-size is set to **14px**, which proportionally scales every rem-based size in the system. Any absolute-pixel design handoff must be converted against 14px, not 16px.

### Hierarchy
- **Display** (300, `clamp(2.5rem, 4.5vw, 4.5rem)`, 0.98 line-height, `-0.035em`): Page titles. The negative tracking and sub-1.0 line-height are what make the ExtraLight weight read as deliberate rather than flimsy.
- **Headline** (300, `clamp(2rem, 3vw, 3rem)`, 1.05, `-0.03em`): Section titles.
- **Title** (600, `clamp(1.5rem, 2vw, 2.125rem)`, 1.15, `-0.02em`): Subsection titles. Note the weight jump — below headline scale the system switches from ExtraLight brand face to semibold body face.
- **Card Title** (600, `clamp(1.25rem, 1.5vw, 1.75rem)`, 1.3, `-0.025em`): Content card headings.
- **Compact Card Title** (600, `clamp(1.125rem, 1.3vw, 1.5rem)`, 1.2, `+0.07em`): Contact-style labels. Tracking goes *positive* here — at small sizes the system widens rather than tightens.
- **Body** (400, `clamp(1rem, 1.1vw, 1.125rem)`, 1.7): Running copy.
- **Small Body** (400, `clamp(0.9375rem, 1vw, 1rem)`, 1.6): Secondary copy.
- **Caption** (400, `clamp(0.75rem, 0.9vw, 0.875rem)`, 1.4, `+0.01em`): Metadata, figure captions.
- **Label / Eyebrow** (600, `clamp(0.625rem, 0.8vw, 0.75rem)`, 1.2, `+0.28em`, uppercase): Section eyebrows, nav labels. The extreme 0.28em tracking is a signature, not a default.
- **Footer Wordmark** (`clamp(3.5rem, 10vw, 11rem)`): A decorative brand lockup, deliberately display-scale and explicitly *not* a content heading.

### Named Rules

**The Structure-Is-Not-Scale Rule.** Semantic heading level and visual size are decoupled by design. `h1`–`h6` carry document structure for accessibility and SEO only; visual weight comes from a role class (`.page-title`, `.section-title`, `.card-title`, `.eyebrow`…). A card `<h3>` and a page `<h3>` are expected to look nothing alike. Never reach for a lower heading level to get a smaller size.

**The No Faux Bold Rule.** Science Gothic ships only at weights 200–400. Applying `font-bold` or `font-semibold` to a brand-face heading makes the browser synthesise a fake bold that is heavier and wider than any real cut — precisely the coarseness the system exists to avoid. The public display treatment is locked at 300, and the `.brand-headings h1/h2` rule is intentionally unlayered so it beats those utilities.

**The Public-Face Rule.** The brand face is a public-site treatment. Public brand surfaces carry Science Gothic at 300 for `h1`/`h2`; `h3`–`h6` stay on the body face because 300 is too fragile at those sizes. The admin platform runs on Manrope at working weights — recorded here as an observed boundary, not as governance over admin design.

**The Tracking Inversion Rule.** Large type tightens (down to `-0.035em`); small type widens (up to `+0.28em`). Any new size should follow that curve rather than inheriting a neutral `0`.

## Layout

The spatial model is a centred editorial column system, not a card grid.

- **Wide container** (`.container-wide`): `max-w-7xl`, centred, padding `24px → 48px (md) → 64px (lg)`. The default for nearly all sections.
- **Narrative container** (`.container-narrative`): `max-w-3xl`, centred, `24px → 48px (md)`. For long-form reading.
- **Section rhythm**: `py-20 md:py-32` standard, `py-12 md:py-20` compact. Editorial sections run wider still at `py-24 md:py-32`.
- **Editorial split**: the signature two-column arrangement is a **5/12 sticky left rail** (title and eyebrow, `md:sticky md:top-32`) against a **7/12 right column** of content, separated by `gap-16 lg:gap-24`. The left rail holding position while the right scrolls is the system's most recognisable layout behaviour.
- **Breakpoints**: Tailwind defaults; the meaningful public-site jumps are `md` (768px) for the editorial split and `xl` (1280px) for the desktop navigation, below which the header collapses to a full-screen mobile panel.
- **Header offset**: a single `--site-header-height` custom property (6rem, 7rem at `lg`) drives the fixed header, page offsets, and anchor `scroll-margin-top` together. Any new fixed chrome must consume this variable rather than hard-coding a height.

### Named Rules

**The Ruled Page Rule.** Editorial sections draw four evenly spaced vertical hairlines (`w-px`, charcoal or white at **4% opacity**, the group at 50% opacity) behind their content. This is the system's substitute for visible containers — structure implied by ruling, not by boxing.

**The Anchor Clearance Rule.** Every `[id]` and `:target` carries `scroll-margin-top: var(--site-header-height)`. Any new scroll-target must inherit it, or headings land underneath the fixed header.

## Elevation & Depth

**This system has no shadows.** Global overrides force `!shadow-none` on every Tailwind shadow utility (`shadow-sm` through `shadow-2xl`), so depth is conveyed entirely by **tonal layering, hairline borders and whitespace**.

The tonal ladder, lightest to heaviest, is: Warm Paper page ground (`#F7F5F0`) → Dry Stone panel (`#EDE9E1`) → Pure White component (`#FFFFFF`) → Ink Charcoal or Absolute Black inverted section. Separation between adjacent surfaces is a `1px` border at low opacity (typically `charcoal/10` or `charcoal/20`), never a shadow.

### Named Rules

**The Flat-By-Doctrine Rule.** Surfaces are flat at rest and flat in every state. Depth comes from tone, border and space. Do not reintroduce `box-shadow` — including on hover, including "just a subtle one".

**The Narrow Exception Rule.** The flatness doctrine has a small set of legitimate exceptions, and the list is closed: the loader bar (`.seven-seas-loader-bar`) uses a `999px` pill radius, and focus rings are outlines rather than shadows. Anything beyond these is a violation, not a precedent.

## Shapes

The form language is **uncompromisingly rectangular**. Global overrides force `!rounded-none` on every Tailwind radius utility (`rounded-md` through `rounded-full`), so buttons, inputs, cards, badges and images all terminate in true 90° corners.

Borders are hairline and low-contrast: `1px` at 10–20% charcoal opacity for component edges, and `1px` at 4% opacity for the decorative column rules. Gold borders appear only on focus or as a deliberate underline on call-to-action links.

The recurring silhouette is the **hard-edged rectangle with a single ruled edge** — a left or bottom border in gold or charcoal that marks a block as significant without enclosing it in a box.

### Named Rules

**The Square Corner Rule.** Radius is `0` everywhere. The only sanctioned exception is the loader bar's pill (`999px`). Writing `rounded-lg` is not an error the system will catch gracefully — the global override silently flattens it, so use no radius utility at all rather than one that appears to work.

## Components

### Buttons
Refined and restrained — deliberate understatement with careful proportion; the luxury is in what's withheld.

- **Shape:** True rectangle (`0` radius), `inline-flex` centred, `font-medium`.
- **Sizes:** `sm` 36px tall / 16px padding / 14px text · `md` **44px tall / 24px padding / 14px text** (default) · `lg` 52px tall / 32px padding / 16px text.
- **Primary:** Absolute Black fill, white text. Hover → Ink Charcoal.
- **Gold:** Antique Gold fill, black text. Hover → Deep Bronze fill with white text. Reserved for the single consequential action per surface.
- **Secondary:** Dry Stone fill, charcoal text. Hover → Warm Paper.
- **Outline:** Transparent with a `charcoal/20` hairline border. Hover → Dry Stone fill.
- **Ghost:** Transparent, no border. Hover → Dry Stone fill.
- **Focus:** `outline` 2px Antique Gold at 2px offset — an outline, never a ring-shadow.
- **Disabled:** 50% opacity, pointer events off.
- **Transition:** all properties, 200ms.

### Inputs / Fields
- **Style:** Pure White ground, `1px` `charcoal/20` border, `0` radius, 44px tall, 16px horizontal padding, 14px text. Placeholders in Quiet Slate.
- **Focus:** Border shifts to Antique Gold, plus a `2px` Antique Gold **outline** at `2px` offset — the same focus treatment as buttons. Use an outline, never a shadow-based ring utility: Tailwind's `ring-*` renders as a `box-shadow` and violates the no-shadow doctrine.
- **Error:** Border and focus outline switch to red-500, with a 12px red-600 message below carrying `role="alert"`.
- **Textarea:** Same treatment, `min-height: 120px`, vertical resize only, 12px vertical padding.
- **Select:** Same treatment with native appearance stripped.
- **Label:** 14px, `font-medium`, charcoal, 6px below; a required field appends a red asterisk.

### Badges
- **Style:** `inline-flex`, 10px horizontal / 2px vertical padding, 12px `font-medium`, square corners.
- **Variants:** default (Dry Stone ground, charcoal text) · gold (gold at 10% ground, Deep Bronze text) · success (emerald-50/700) · warning (amber-50/700) · danger (red-50/700) · outline (transparent with `charcoal/20` hairline).

### Navigation
- **Desktop** (≥1280px): horizontal, centred, uppercase labels at 10–11px with `0.02em–0.06em` tracking, `font-medium`. Dropdown groups open on hover.
- **Header behaviour:** fixed to the viewport top, spanning full width, with a bottom border. **Transparent over the hero at scroll-top**, switching to Pure White (`#FFFFFF`) ground with a `charcoal/10` border once scrolled, or whenever a dropdown or the mobile menu is open.
- **Mobile** (<1280px): a full-screen `fixed inset-0` panel on Pure White (`#FFFFFF`), sliding in from the right (tween, 300ms), offset below the header by `--site-header-height` plus the safe-area inset. It scrolls independently and is marked `data-lenis-prevent` so smooth scrolling does not drive the page behind it.
- **Active/hover:** label colour shifts to Antique Gold.

### Editorial Section
The signature layout component. A full-bleed section (`py-24 md:py-32`) in either light (Warm Paper ground, charcoal text) or **dark** (Absolute Black ground, white text) mode, with four 4%-opacity vertical hairlines ruled behind the content. Content splits 5/12 to 7/12: a sticky left rail carrying a gold `0.3em`-tracked 10px eyebrow above an oversized semibold headline (`text-4xl md:text-5xl lg:text-7xl`, `tracking-tighter`, `1.05` leading), against a right column of prose offset downward (`pt-4 md:pt-16`).

### Motion
Motion is sparse and functional. The standard entrance is a **scroll reveal**: `opacity 0 → 1` with a 20px upward translate over **600ms, ease-out**, triggered once on entering the viewport. Marquee strips run a 90s linear infinite translate. Smooth scrolling (Lenis) damps the document scroller at `lerp 0.14` with native wheel distance, disabled entirely under `prefers-reduced-motion`. The loader bar's animation is explicitly disabled under reduced motion, and any new animation must offer the same escape.

## Do's and Don'ts

### Do:
- **Do** set page backgrounds to Warm Paper (`#F7F5F0`) and reserve `#FFFFFF` for components that lift off it.
- **Do** use Deep Bronze (`#7A6224`) for any gold-coloured text below heading scale — it is the value that clears WCAG AA, and AA is the project's stated target.
- **Do** pick visual size with a role class (`.section-title`, `.card-title`, `.eyebrow`) and choose the heading tag purely for document structure.
- **Do** consume `var(--site-header-height)` for any fixed chrome, page offset or scroll target.
- **Do** convey depth with the tonal ladder — Warm Paper → Dry Stone → White → inverted Charcoal/Black — plus hairline borders.
- **Do** follow the tracking curve: tighten large type toward `-0.035em`, widen small type toward `+0.28em`.
- **Do** give every new animation a `prefers-reduced-motion` path, as the loader bar and smooth scrolling already do.
- **Do** keep the brand face at weight 300 on public `h1`/`h2`, and let `h3`–`h6` fall to Manrope.

### Don't:
- **Don't** add `border-radius` anywhere. The global override flattens radius utilities silently, so a `rounded-lg` that "looks fine" is simply being ignored.
- **Don't** add `box-shadow`, including on hover. The system is flat by doctrine, and shadow utilities are globally nulled.
- **Don't** apply `font-bold` or `font-semibold` to a Science Gothic heading — the browser will synthesise a faux bold, which is the exact coarseness the ExtraLight treatment exists to avoid.
- **Don't** let two gold elements compete in one viewport. Gold marks consequence; duplicating it destroys the signal.
- **Don't** use `#B5913F` for small text. That is what `#7A6224` is for.
- **Don't** resemble the saturated manpower-agency category — stock handshake photography, flag grids, blue gradients, badge clutter, rotating banner carousels. The restraint of this system exists specifically to escape that look.
- **Don't** drift toward generic SaaS/startup landing conventions — rounded cards, soft shadows, purple gradients, illustrated blobs, emoji feature icons.
- **Don't** hard-code a country or destination list into layout, navigation or copy; destination coverage is expected to grow.
- **Don't** convert a pixel handoff against a 16px root. This project's root font-size is **14px**.
