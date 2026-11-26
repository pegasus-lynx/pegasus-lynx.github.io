# Portfolio v2 Single-Source SVG Icon System Design

**Date:** 2026-11-26
**Branch:** `feat/v2/svg-icons` (branched from `main`)
**Related Epic:** #5 (`[EPIC] dipeshkr.me v2`)

## 1. Goal & Scope

Eliminate the external Font Awesome 6 CDN kit (`https://kit.fontawesome.com/a69420ddea.js`), raw ad-hoc inline `<svg>` tags, unused legacy Devicon `svgpath` shortcodes, and directional Unicode glyphs (`↗`, `←`, `→`) across active v2 templates in favor of **one build-time inline SVG icon registry** exposed through an Eleventy `{% icon %}` shortcode.

Included scope from #5:
1. Replace Font Awesome across all v2 templates with build-time inline SVGs (`{% icon %}`).
2. Update the Dark / Light mode toggle button to flash-free CSS-driven inline SVGs (`moon` and `sun`).
3. Replace inline mobile menu/close SVGs and directional link glyphs (`↗`, `←`, `→`) with `{% icon %}` calls.
4. Remove the redundant `Email` entry from `src/_data/info.json` `socials` (since the Home sidebar already provides the `Say Hello` `mailto:` CTA button).

Out of scope:
- Ignored `src/**/v1/**` archive files.
- Navbar scroll hide/show, `About` navbar link, and Gallery mobile carousel (tracked separately in #5).

## 2. Architecture & Components

### 2.1 Icon Registry (`src/_data/icons.js`)
A CommonJS module exporting a frozen map of named icon definitions (`24x24` `viewBox="0 0 24 24"`) and a `renderIcon(name, className = "w-4 h-4", attrs = {})` helper:

- **Stroke UI icons** (`fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"`):
  - `sun` — light mode indicator
  - `moon` — dark mode indicator
  - `menu` — mobile drawer open button
  - `close` — mobile drawer close button
  - `copy` — copy article URL button
  - `check` — copied feedback icon (optional companion)
  - `arrow-up-right` — external link indicator (Resume, Source Code, GitHub)
  - `arrow-left` — back / newer post indicator
  - `arrow-right` — forward / older post / archive CTA indicator
- **Filled Brand icons** (`fill="currentColor"`):
  - `github`
  - `linkedin`
  - `medium`
  - `instagram`

Every rendered `<svg>` sets `aria-hidden="true"` and `focusable="false"` by default because interactive labels live on wrapping `<a>` (`aria-label` or visible text) or `<button>` (`aria-label`) elements.

### 2.2 Eleventy Shortcode (`.eleventy.js`)
- Register synchronous `eleventyConfig.addShortcode("icon", (name, className = "w-4 h-4") => renderIcon(name, className))`.
- Remove unused legacy `svgiconpaths` constant and `svgpath` shortcode from `.eleventy.js` (only referenced by ignored `src/pages/v1/index.njk`).
- **Fail-fast error handling:** Calling `renderIcon` with an unknown `name` throws `new Error(\`Unknown icon "\${name}"\`)`, failing `npm run build` immediately rather than rendering broken markup.

### 2.3 Flash-Free Theme Toggle (`src/_includes/_navbar.njk`, `src/assets/css/tailwind.css`, `src/assets/js/index.js`)
- Inside both desktop and mobile theme toggle buttons in `_navbar.njk`, render both SVGs:
  - `<span class="ec-theme-icon-light">{% icon "moon", "w-4 h-4" %}</span>` (shown when `html:not(.dark)`)
  - `<span class="ec-theme-icon-dark">{% icon "sun", "w-4 h-4" %}</span>` (shown when `html.dark`)
- Because `<head>` applies `.dark` on `<html>` synchronously before first paint, CSS toggles the correct SVG immediately with zero JS icon-swap flash.
- Remove Font Awesome class-toggling (`fa-sun` / `fa-moon`) from `src/assets/js/index.js`, keeping `toggleTheme()` focused on toggling `document.documentElement.classList("dark")`, updating `localStorage`, and setting `aria-pressed` / `data-theme-state`.

### 2.4 Data & Template Updates
- **`src/_includes/page.njk`:** Remove `<script src="https://kit.fontawesome.com/a69420ddea.js" crossorigin="anonymous" defer></script>`.
- **`src/_data/info.json`:** Replace Font Awesome classes in `socials` with registry keys (`"github"`, `"linkedin"`, `"medium"`, `"instagram"`) and remove the `"Email"` entry.
- **Templates updated to `{% icon %}`:**
  - `src/_includes/_navbar.njk` (`moon`, `sun`, `menu`, `close`, `arrow-up-right`, social icons)
  - `src/_includes/_footer.njk` (social icons)
  - `src/pages/index.njk` (`arrow-up-right`, `arrow-right`, social icons)
  - `src/_includes/article.njk` (`arrow-left`, `arrow-right`, `arrow-up-right`, `github`, `copy`)
  - `src/pages/blogs.njk` (`arrow-right`)
  - `src/pages/projects.njk` (`arrow-up-right`)
  - `src/pages/tag.njk` (`arrow-left`)

## 3. Verification Strategy

Update `tests/site-build.test.cjs` via Red-Green TDD:
1. Assert `info.json` `socials` uses valid keys present in `src/_data/icons.js` and excludes `Email` / `mailto:`.
2. Assert `renderIcon()` throws on unknown icon names and renders valid `<svg` markup for every registered key.
3. Assert no built `_site/**/*.html` file references `fontawesome.com`, `fa-brands`, `fa-solid`, `fa-regular`, or directional text glyphs (`↗`, `←`, `→`) in navigation/CTA links.
4. Assert `_site/index.html` and article pages render inline `<svg` elements inside theme toggles, social links, and CTA links, and all existing build + link-integrity tests pass.
