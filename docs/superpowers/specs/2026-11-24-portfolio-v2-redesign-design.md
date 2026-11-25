# Portfolio v2 Redesign — Editorial Craft Design Specification

**Date:** 2026-11-24
**Repository:** `pegasus-lynx/pegasus-lynx.github.io` (`dipeshkr.me`)
**Stack:** Eleventy (11ty v2) · Nunjucks · Markdown · Tailwind CSS v4 · Vanilla JS (`esbuild`) · `11ty-img`

---

## 1. Goals & Scope

### Primary Goals
1. **Long-Form Reading Excellence:** Make Blog essays and technical/research Project write-ups effortless to read across 10–15 minute articles containing headings, lists, code, images, and experimental result tables.
2. **First-Class Light & Dark Modes:** Support flash-free Light and Dark themes with `localStorage` persistence and OS `prefers-color-scheme` fallback, where both palettes are intentionally designed rather than inverted grayscale.
3. **Distinctive Typography & Warm Color Hierarchy:** Replace the monochromatic `Open Sans` look with a 3-font editorial system (`Fraunces` + `Plus Jakarta Sans` + `JetBrains Mono`) and a warm dual-accent palette (Forest Emerald + Terracotta in light mode; Sage Mint + Warm Ochre in dark mode).
4. **Professional Engineering Identity:** Present Dipesh's Windows UI framework work (WPF/WinUI at Microsoft), systems engineering, NLP/graphics projects, writing, and photography cohesively.

### Scope & Constraints
- **v1 Reference Preservation:** Keep existing `src/**/v1/**` files untouched in the repository as inactive historical reference while excluding them from Eleventy builds (`eleventyConfig.ignores.add("src/**/v1/**")`).
- **Page Lineup:** Home (`/`), Projects (`/projects/` and `/project/<slug>/`), Blogs (`/blogs/` and `/blog/<slug>/`), Gallery (`/gallery/`), and Tags (`/tags/<slug>/`). Drop the standalone `/contact/` page; surface email, resume, and social links directly in the Home sidebar and site footer.
- **Zero Framework Bloat:** Stay on Eleventy v2, Tailwind CSS v4 (`@tailwindcss/cli` + `@tailwindcss/typography`), and bundled vanilla JS (`esbuild`) with no client framework dependencies.

---

## 2. Visual Design System

### 2.1 Typography (`Google Fonts`)
Loaded via `<link rel="preconnect">` + Google Fonts CSS2 stylesheet in `src/_includes/page.njk` (replacing the legacy `eleventy-google-fonts` runtime fetches that can slow or fail offline builds):

| Role | Family | Weights | Usage |
|---|---|---|---|
| `--font-display` | `Fraunces` (optical size `9..144`) | `600`, `700` | Hero name, page titles, section titles, article `h1`–`h3`, brand mark |
| `--font-sans` | `Plus Jakarta Sans` | `400`, `500`, `600`, `700` | Long-form body prose, UI navigation, cards, descriptions |
| `--font-mono` | `JetBrains Mono` | `400`, `500` | Role kickers, dates, reading times, tag chips, section numbers, tables, inline/block code |

### 2.2 Semantic Color Tokens (`src/assets/css/tailwind.css`)
Defined on `:root` (Light Mode) and `.dark` (Dark Mode), exposed to Tailwind CSS v4 via `@theme`:

| Semantic Token | Light Mode (Warm Alabaster) | Dark Mode (Warm Obsidian) | Purpose |
|---|---|---|---|
| `--bg-canvas` | `#FAF8F5` | `#131615` | Page background |
| `--bg-surface` | `#F2EFE9` | `#1A1F1D` | Subtle section/blockquote/code surfaces |
| `--bg-card` | `#FFFFFF` | `#1E2422` | Elevated project, experience, and gallery cards |
| `--text-primary` | `#1C1917` | `#EDEAE4` | Headings and primary body copy |
| `--text-secondary` | `#57534E` | `#B0ACA4` | Supporting descriptions and secondary prose |
| `--text-muted` | `#78716C` | `#8A867E` | Captions, inactive TOC items, subtle dividers |
| `--border-subtle` | `rgba(28, 25, 23, 0.12)` | `rgba(237, 234, 228, 0.12)` | Hairline borders on nav, cards, toolbars, tables |
| `--accent-primary` | `#1F6F54` (Forest Emerald) | `#6EE7B7` (Sage Mint) | Primary interactive links, active nav/TOC, tag text, primary CTA |
| `--accent-primary-fg` | `#FFFFFF` | `#131615` | Text on `--accent-primary` filled buttons |
| `--accent-secondary` | `#C85A32` (Terracotta) | `#F4A261` (Warm Ochre) | Kickers, date badges, blockquote rules, reading progress gradient |
| `--accent-chip-bg` | `rgba(31, 111, 84, 0.10)` | `rgba(110, 231, 183, 0.12)` | Tag and skill pill background |
| `--code-bg` | `#EFECE6` | `#1B211F` | Inline code and preformatted block background |

All primary/secondary text and accent pairings meet WCAG AA contrast ratios on their respective surfaces.

---

## 3. Page & Layout Architecture

```
src/_includes/
  page.njk        # Base HTML shell, flash-free theme init, _navbar, main slot, _footer
  _navbar.njk     # Sticky frosted top navigation + theme toggle + mobile menu drawer
  _footer.njk     # Social links, colophon, copyright, quick links
  article.njk     # Shared long-form reader shell (progress bar, header, 68ch prose, sticky TOC)
  blog.njk        # Thin wrapper around article.njk setting articleType = "blog"
  project.njk     # Thin wrapper around article.njk setting articleType = "project"

src/pages/
  pages.json      # Default layout: "page"
  index.njk       # / — Desktop split sticky left rail + scrolling right feed
  projects.njk    # /projects/ — 2-column rich project showcase cards
  blogs.njk       # /blogs/ — Editorial essay index with tag filter strip
  gallery.njk     # /gallery/ — Responsive framed WebP masonry grid
  tag.njk         # /tags/<slug>/ — Combined essays + projects tagged view
```

*(Legacy `src/_includes/list.njk` is removed once `blogs.njk`, `projects.njk`, and `tag.njk` render directly through `page.njk` with purpose-built editorial templates.)*

### 3.1 Base Shell & Navigation (`page.njk`, `_navbar.njk`, `_footer.njk`)
- **Flash-Free Theme Initialization:** An inline synchronous `<script>` in `<head>` reads `localStorage.getItem('theme')`; if unset, checks `window.matchMedia('(prefers-color-scheme: dark)').matches`; applies or removes `document.documentElement.classList.add('dark')` before CSS paint.
- **Sticky Navbar (`_navbar.njk`):**
  - Left: Brand link (`Dipesh Kumar` in `Fraunces` with subtle monogram/icon).
  - Right (Desktop): `Projects`, `Blogs`, `Gallery`, `Resume ↗` (opens `info.resumeUrl` in new tab), and accessible Light/Dark toggle button (`aria-label="Toggle color theme"` showing sun/moon state). Active route receives `--accent-primary` indicator via `page.url`.
  - Mobile (`< md`): Theme toggle + menu button opening a clean slide-over drawer with navigation links, `Resume ↗`, and social links.
- **Footer (`_footer.njk`):** Flex layout (not `position: absolute`, using `min-h-screen flex flex-col` on `<body>` and `flex-1` on content so footer never overlaps short or dynamic content) with social links, `Built with 11ty & Tailwind CSS` colophon, copyright year, and quick links.

### 3.2 Home Page — Split Sticky Sidebar + Scrolling Feed (`src/pages/index.njk`)
- **Container:** `max-w-6xl mx-auto px-6 md:px-10 py-12 lg:py-20`.
- **Desktop Grid (`lg:grid lg:grid-cols-12 lg:gap-12`):**
  - **Left Rail (`lg:col-span-5 lg:sticky lg:top-24 lg:self-start`):**
    - Compact framed portrait (`/assets/images/dipesh2.webp`, `w-20 h-20 rounded-2xl object-cover` with subtle border) + mono kicker (`SOFTWARE ENGINEER II · MICROSOFT`).
    - `Fraunces` H1 (`Dipesh Kumar`), punchline (`info.punch`), and concise intro (`info.intro`).
    - Desktop Scroll-Spy Jump Navigation (`hidden lg:flex flex-col`): `01 About`, `02 Experience`, `03 Skills`, `04 Projects`, `05 Writing` with active indicator line/color updated as sections enter viewport.
    - Action row: `Resume ↗` button + `Say Hello` (`mailto:`) button + social icon row (`info.socials`).
  - **Right Scrolling Feed (`lg:col-span-7 space-y-20`):**
    - **`#about` (01 About):** Left-aligned narrative paragraphs from `info.about` with comfortable `1.75` line-height.
    - **`#experience` (02 Experience):** Clean timeline cards from `info.experiences` showing mono timeframe (`SEP 2023 — PRESENT`), `role · company` heading, and concise bullet points.
    - **`#skills` (03 Skills):** Grouped skill cards/rows from `info.skillGroups` (`Languages`, `Desktop Development`, `Web Development`, `Other Technologies`) using mono skill pills.
    - **`#projects` (04 Selected Projects):** Cards for `info.selectedprojects` resolved from `collections.projectsSorted` (thumbnail image, timeframe, `Fraunces` title, summary, tag pills, and direct case-study + GitHub source links) plus a `View all projects →` link to `/projects/`.
    - **`#writing` (05 Latest Writing):** Latest 3 posts from `collections.blogsSorted` (mono date + reading time, `Fraunces` title, summary) plus a `Read all articles →` link to `/blogs/`.

### 3.3 Long-Form Blog & Project Reader (`article.njk`, `blog.njk`, `project.njk`)
- **Reading Progress Bar:** Fixed `top-0 left-0 h-[3px] z-50` bar (`background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))`) scaled `0%`–`100%` against article scroll progress.
- **Article Header (`max-w-4xl mx-auto`):**
  - Back link: `← All Blogs` (`/blogs/`) or `← All Projects` (`/projects/`).
  - Mono kicker: `ESSAY · {{ readingtime }} · {{ publishdate | postDate }}` (blogs) or `PROJECT · {{ startdate | postMonth }} — {{ enddate | postMonth }}` (projects).
  - `Fraunces` H1 (`text-3xl md:text-5xl font-bold leading-tight tracking-tight`).
  - Lead subtitle (`description`, `text-lg md:text-xl text-[var(--text-secondary)]`).
  - Action & Tag Toolbar: Tag chips linking to `/tags/{{ tag | slugify }}/` on the left; `Source Code ↗` (when `sourcecode` is defined) and `Copy Link` button (copies URL via `navigator.clipboard.writeText` with fallback and displays `"Copied!"` for 2 seconds) on the right.
  - Cover Image (`if post_image`): Framed inside the container (`rounded-2xl border border-[var(--border-subtle)] overflow-hidden max-h-[420px] w-full object-cover`), never stretched full-bleed across wide monitors.
- **Reader Grid (`xl:grid xl:grid-cols-[minmax(0,68ch)_220px] xl:gap-14 justify-center`):**
  - **Prose Column (`article#article-prose`):**
    - `max-w-[68ch] text-left text-base md:text-[1.0625rem] leading-[1.8]`. Never uses `text-justify`.
    - Custom typography styling: `Fraunces` `h2`/`h3`/`h4` with generous top rhythm (`scroll-mt-24` for smooth anchor jumps), terracotta-bordered blockquotes on `--bg-surface`, horizontally scrollable responsive tables with mono numbers and crisp borders, `--code-bg` inline `<code>` and `<pre>` blocks, and rounded content images.
  - **Sticky Table of Contents (`aside#toc-rail`, `hidden xl:block sticky top-28 self-start`):**
    - Populated automatically from `h2, h3, h4` inside `#article-prose`. Remains hidden if an article has fewer than 2 headings. Highlights active section while scrolling.
- **Article Footer:** Previous / Next post navigation within the same collection (`collections.blogsSorted` or `collections.projectsSorted`).

### 3.4 Index & Gallery Pages (`blogs.njk`, `projects.njk`, `tag.njk`, `gallery.njk`)
- **`/blogs/` (`blogs.njk`):** Editorial header + clickable tag filter strip linking to `/tags/<slug>/` + chronological essay list (`collections.blogsSorted`) showing publish date, reading time, `Fraunces` title, summary, and tags.
- **`/projects/` (`projects.njk`):** Editorial header + 2-column grid (`md:grid-cols-2 gap-8`) of all `show: true` items in `collections.projectsSorted` with cover image, date range, title, summary, tags, case-study link, and external `Source Code ↗` icon link.
- **`/tags/<slug>/` (`tag.njk`):** Excludes internal meta-tags (`all`, `Blog`, `Project`, `gallery`) from redundant noisy listings where appropriate while preserving valid tag URLs; displays tagged items with a mono `ESSAY` or `PROJECT` badge, date, title, description, and tags, plus a `← Browse all articles & projects` link.
- **`/gallery/` (`gallery.njk`):** Editorial header + CSS multi-column masonry (`1` col mobile, `2` col tablet, `3` col desktop) rendering `11ty-img` responsive WebP images inside warm `--bg-card` frames with subtle hover lift.

---

## 4. Data, Build & Client Script Details

### 4.1 Unified `src/_data/info.json`
Consolidates fields from current `src/_data/info.json` and `dev/v2/base`:
- `name`, `sitename`, `role` (`"Software Engineer II · Microsoft"`), `punch`, `intro`, `resumeUrl`
- `about`: Array of 3 narrative paragraphs (clean data rather than inline `<br><br>` HTML)
- `socials`: Array of `{ name, icon, url }` (fixes `"fa-brands, fa-linkedin"` typo to `"fa-brands fa-linkedin"`)
- `experiences`: Array of `{ role, company, time, details[] }`
- `skillGroups`: Array of `{ name, skills[] }`
- `selectedprojects`: Array of featured project `post_slug`s

### 4.2 Eleventy Configuration (`.eleventy.js`)
- Ignore archived v1 files: `eleventyConfig.ignores.add("src/**/v1/**")`.
- Configure `markdown-it` with automatic heading IDs (slugified heading text, deduplicated per page) so Markdown `###` / `####` headings in blogs and projects automatically receive `id` attributes for TOC links—requiring zero new npm packages.
- Add sorted collections:
  - `blogsSorted`: `collectionsApi.getFilteredByTag("Blog").filter(p => p.data.show !== false)` sorted descending by `publishdate` (`dd-MM-yyyy`).
  - `projectsSorted`: `collectionsApi.getFilteredByTag("Project").filter(p => p.data.show !== false)` sorted descending by `startdate` (`dd-MM-yyyy`).
- Remove unused inline Devicon `getSvgPath` map once v1 is ignored (or keep harmlessly for compatibility).

### 4.3 Client Bundle (`src/assets/js/index.js`)
Clean modular vanilla JS exposed on `window.App` and initialized on `DOMContentLoaded`:
1. `toggleTheme()`: Toggles `html.dark`, persists `'dark' | 'light'` to `localStorage.setItem('theme', ...)`, updates theme toggle icons (`aria-pressed`).
2. `toggleMobileMenu()` / ESC & backdrop close for mobile drawer.
3. `copyPageUrl(btn)`: Uses `navigator.clipboard.writeText(window.location.href)` (with textarea fallback) and swaps button label to `"Copied!"` for 2000ms.
4. `initArticleReader()`: Drives `#reading-progress` width on `scroll` (`passive: true`) and builds `#toc-rail` links + `IntersectionObserver` active highlight when `#article-prose` has `>= 2` headings.
5. `initHomeScrollSpy()`: Highlights active `#about` / `#experience` / `#skills` / `#projects` / `#writing` link in the desktop Home sidebar via `IntersectionObserver`.

---

## 5. Verification Plan
1. **Build Gate:** `npm run build` (`eleventy` + `tailwindcss`) exits with code `0`.
2. **Route & Isolation Audit:** Verify `_site/` contains `/index.html`, `/blogs/index.html`, `/projects/index.html`, `/gallery/index.html`, all `/blog/<slug>/index.html`, all `/project/<slug>/index.html`, `/tags/<slug>/index.html`, `/js/bundle.js`, and `/assets/css/tailwind.css`—and does **not** contain `/v1/` or `/contact/`.
3. **HTML & Link Integrity Check:** Scripted verification across all generated `_site/**/*.html` files confirming zero broken internal `href`/`src` paths, presence of flash-free theme script, heading `id` attributes in blog/project articles, and absence of `text-justify` on article prose.
4. **Visual Browser Smoke Check:** Render Home (`/`), a long blog (`/blog/journey-with-11ty-and-tailwind/`), a table-heavy project (`/project/mwe-bpe/`), `/projects/`, `/blogs/`, and `/gallery/` in both Light and Dark modes at desktop and mobile viewports.
