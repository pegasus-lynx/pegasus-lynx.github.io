# Portfolio v2 Typography Refresh Design (`Outfit` + `Source Sans 3` + `Fira Code`)

**Date:** 2026-11-25  
**Repository:** `pegasus-lynx/pegasus-lynx.github.io`  
**Branch:** `dev/v2/core`  
**Supersedes:** Typography section of `docs/superpowers/specs/2026-11-24-portfolio-v2-redesign-design.md`

---

## 1. Summary & Goal

Replace the initial v2 serif-led font stack (`Fraunces` + `Plus Jakarta Sans` + `JetBrains Mono`) with a clean geometric display and dedicated long-form reading sans-serif pairing (**`Outfit` + `Source Sans 3` + `Fira Code`**), while keeping the approved **Forest Emerald & Terracotta** Light/Dark color palette untouched.

---

## 2. Color Scheme (Retained Unchanged)

- **Light Mode (`:root`):** Warm Alabaster `#FAF8F5` canvas, Soft Linen `#F2EFE9` surface, Pure White `#FFFFFF` cards, Forest Emerald `#1F6F54` primary accent, Terracotta `#C85A32` secondary accent.
- **Dark Mode (`.dark`):** Warm Obsidian `#131615` canvas, Elevated Charcoal `#1A1F1D` surface, `#1E2422` cards, Sage Mint `#6EE7B7` primary accent, Warm Ochre `#F4A261` secondary accent.

---

## 3. Typography Specification

### 3.1 Google Fonts Stylesheet (`src/_includes/page.njk`)

Load a single combined Google Fonts v2 stylesheet with `display=swap`:

```html
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Outfit:wght@500;600;700&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

- **`Outfit` (`500`, `600`, `700`):** Geometric sans-serif display headings (`h1`–`h4`, navbar brand, adjacent post titles).
- **`Source Sans 3` (`400`, `500`, `600`, `700`, plus `400` italic):** Adobe's long-form humanist reading sans-serif for UI body copy and `68ch` blog/project essays; genuine `400` italic avoids browser-synthesized faux italics in blockquotes and inline emphasis.
- **`Fira Code` (`400`, `500`):** Developer monospace for kickers, date ranges, tag chips, scroll-spy labels, and inline/fenced code blocks.

### 3.2 Tailwind v4 `@theme` Tokens & Prose Tuning (`src/assets/css/tailwind.css`)

```css
@theme {
  --font-display: "Outfit", system-ui, -apple-system, sans-serif;
  --font-sans: "Source Sans 3", system-ui, -apple-system, sans-serif;
  --font-mono: "Fira Code", ui-monospace, SFMono-Regular, monospace;
}
```

- Update `.ec-prose` body size from `1.0625rem` (`17px`) to `1.09375rem` (`17.5px`) with `line-height: 1.8` and `max-width: 68ch` so `Source Sans 3`'s slightly compact x-height reads effortlessly across dense essays and research write-ups.

---

## 4. Verification & Testing (`tests/site-build.test.cjs`)

1. Compiled `_site/assets/css/tailwind.css` registers `Outfit`, `Source Sans 3`, and `Fira Code`, and contains zero references to `Fraunces`, `Plus Jakarta Sans`, or `JetBrains Mono`.
2. Rendered HTML `<head>` loads the Google Fonts stylesheet for `Outfit`, `Source+Sans+3`, and `Fira+Code`.
3. Existing 14 build, color token, layout, reader, and link-integrity tests continue passing (`npm run build && npm test`).
