# Theme

## Compact token summary

- Brand black `#000000`, charcoal `#171717`, gold `#B5913F`, accessible dark gold `#7A6224`
- Off-white `#F7F5F0`, stone `#EDE9E1`, muted `#77736A`, white `#FFFFFF`
- Admin font: Manrope/system sans. Public display font: Science Gothic.
- Admin surfaces use white cards, gray borders, charcoal text, gold focus/action accents.
- Project-wide aesthetic is sharp and rectangular; global CSS removes rounded corners and utility shadows.

## Raw theme source

Path: `src/app/globals.css`

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --color-brand-black: #000000;
  --color-brand-charcoal: #171717;
  --color-brand-gold: #B5913F;
  --color-brand-gold-dark: #7A6224;
  --color-brand-off-white: #F7F5F0;
  --color-brand-stone: #EDE9E1;
  --color-brand-muted: #77736A;
  --color-brand-white: #FFFFFF;
  --font-sans: var(--font-manrope), ui-sans-serif, system-ui, sans-serif;
  --font-body: var(--font-sans);
  --font-brand: var(--font-science-gothic), var(--font-sans);
  --font-heading: var(--font-brand);
}

@layer base {
  body { @apply bg-brand-off-white text-brand-charcoal font-sans antialiased; }
}

@layer components {
  .rounded-md, .rounded-lg, .rounded-xl, .rounded-2xl, .rounded-3xl, .rounded-full { @apply !rounded-none; }
  .shadow-sm, .shadow, .shadow-md, .shadow-lg, .shadow-xl, .shadow-2xl { @apply !shadow-none; }
}
```

