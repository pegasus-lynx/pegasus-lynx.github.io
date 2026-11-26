# Single-Source SVG Icon System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify every UI icon, directional glyph, theme toggle icon, and social brand logo across Portfolio v2 onto a single build-time Eleventy `{% icon %}` inline SVG registry, removing the external Font Awesome kit and redundant `Email` social entry.

**Architecture:** `src/_data/icons.js` exports a frozen `ICONS` dictionary (`24x24` stroke UI icons and filled Simple Icons brand paths) plus a fail-fast `renderIcon(name, className)` helper registered as a synchronous `{% icon %}` shortcode in `.eleventy.js`. Flash-free theme toggle icons (`moon` and `sun`) are controlled purely via CSS (`html.dark`) so icons match the active theme before client JS loads.

**Tech Stack:** Eleventy v2 (CommonJS + Nunjucks), Tailwind CSS v4, esbuild, Node.js `node:test` (`v26`).

## Global Constraints

- Work on branch `feat/v2/svg-icons` (branched from `main`).
- **Do NOT run `git commit`** — leave all changes uncommitted in the working tree per user instruction.
- Do not modify ignored `src/**/v1/**` archive files.
- `renderIcon(name)` must throw an `Error` at build time if `name` is unknown.
- Every rendered `<svg>` must include `aria-hidden="true"` and `focusable="false"`.

---

### Task 1: SVG Icon Registry, Eleventy Shortcode, and `info.json` Social Keys

**Files:**
- Create: `src/_data/icons.js`
- Modify: `.eleventy.js`
- Modify: `src/_data/info.json`
- Test: `tests/site-build.test.cjs`

**Interfaces:**
- Consumes: `src/_data/info.json` (`socials[].icon`)
- Produces:
  - `src/_data/icons.js` exporting `{ ICONS, renderIcon(name, className = "w-4 h-4") }`
  - Eleventy synchronous Nunjucks shortcode `{% icon name, className %}` returning `<svg ...>...</svg>`

- [ ] **Step 1: Write failing tests in `tests/site-build.test.cjs`**

Replace the old `info.json social icons contain valid space-separated CSS classes` test in `tests/site-build.test.cjs` with:

```javascript
test("icon registry renders accessible SVGs, rejects unknown names, and matches info.json socials", () => {
  const { ICONS, renderIcon } = require("../src/_data/icons.js");
  const requiredKeys = [
    "sun",
    "moon",
    "menu",
    "close",
    "copy",
    "check",
    "arrow-up-right",
    "arrow-left",
    "arrow-right",
    "github",
    "linkedin",
    "medium",
    "instagram",
  ];
  for (const key of requiredKeys) {
    assert.ok(ICONS[key], `Missing icon key "${key}" in icons.js`);
    const svg = renderIcon(key, "w-5 h-5");
    assert.match(svg, /^<svg\b[^>]*aria-hidden="true"[^>]*focusable="false"/);
    assert.ok(svg.includes('class="w-5 h-5"'), `Missing custom class on ${key}`);
    assert.ok(svg.endsWith("</svg>"));
  }

  assert.throws(() => renderIcon("non-existent-icon"), /Unknown icon/);

  const info = JSON.parse(
    fs.readFileSync(path.join(ROOT, "src", "_data", "info.json"), "utf8")
  );
  assert.equal(info.socials.length, 4, "Expected 4 socials after removing Email");
  for (const social of info.socials) {
    assert.notEqual(social.name, "Email", "Redundant Email social entry must be removed");
    assert.ok(ICONS[social.icon], `Social icon "${social.icon}" missing from icons.js`);
  }
});
```

- [ ] **Step 2: Run tests to verify RED failure**

Run: `npm test`
Expected: FAIL with `Cannot find module '../src/_data/icons.js'`.

- [ ] **Step 3: Create `src/_data/icons.js`, update `.eleventy.js` and `src/_data/info.json`**

Create `src/_data/icons.js`:

```javascript
const ICONS = Object.freeze({
  sun: {
    type: "stroke",
    body: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  },
  moon: {
    type: "stroke",
    body: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  },
  menu: {
    type: "stroke",
    body: '<path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>',
  },
  close: {
    type: "stroke",
    body: '<path d="M6 18 18 6M6 6l12 12"/>',
  },
  copy: {
    type: "stroke",
    body: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  },
  check: {
    type: "stroke",
    body: '<path d="M20 6 9 17l-5-5"/>',
  },
  "arrow-up-right": {
    type: "stroke",
    body: '<path d="M7 17 17 7M7 7h10v10"/>',
  },
  "arrow-left": {
    type: "stroke",
    body: '<path d="m12 19-7-7 7-7M19 12H5"/>',
  },
  "arrow-right": {
    type: "stroke",
    body: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
  },
  github: {
    type: "fill",
    body: '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',
  },
  linkedin: {
    type: "fill",
    body: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
  },
  medium: {
    type: "fill",
    body: '<path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>',
  },
  instagram: {
    type: "fill",
    body: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>',
  },
});

function renderIcon(name, className = "w-4 h-4") {
  const entry = ICONS[name];
  if (!entry) {
    throw new Error(`Unknown icon "${name}" requested in {% icon %}`);
  }
  const safeClass = String(className || "w-4 h-4").replace(/"/g, "&quot;");
  if (entry.type === "fill") {
    return `<svg viewBox="0 0 24 24" fill="currentColor" class="${safeClass}" aria-hidden="true" focusable="false">${entry.body}</svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="${safeClass}" aria-hidden="true" focusable="false">${entry.body}</svg>`;
}

module.exports = { ICONS, renderIcon };
```

Update `.eleventy.js`:
- Require `{ renderIcon } = require("./src/_data/icons.js")`.
- Remove unused `svgiconpaths`, `getSvgPath`, and `eleventyConfig.addShortcode("svgpath", ...)`.
- Register `eleventyConfig.addShortcode("icon", (name, className = "w-4 h-4") => renderIcon(name, className))`.

Update `src/_data/info.json` `socials` array:

```json
  "socials": [
    {
      "name": "GitHub",
      "icon": "github",
      "url": "https://github.com/pegasus-lynx"
    },
    {
      "name": "LinkedIn",
      "icon": "linkedin",
      "url": "https://www.linkedin.com/in/dipeshkr/"
    },
    {
      "name": "Medium",
      "icon": "medium",
      "url": "https://medium.com/@dipeshkrj14"
    },
    {
      "name": "Instagram",
      "icon": "instagram",
      "url": "https://www.instagram.com/_chai_there_/"
    }
  ],
```

- [ ] **Step 4: Run `npm test` to verify Task 1 tests pass**

Run: `npm test`
Expected: PASS (15/15).

---

### Task 2: Template Migration, Flash-Free Theme SVGs, and Font Awesome Removal

**Files:**
- Modify: `src/_includes/page.njk`
- Modify: `src/_includes/_navbar.njk`
- Modify: `src/_includes/_footer.njk`
- Modify: `src/_includes/article.njk`
- Modify: `src/pages/index.njk`
- Modify: `src/pages/blogs.njk`
- Modify: `src/pages/projects.njk`
- Modify: `src/pages/tag.njk`
- Modify: `src/assets/css/tailwind.css`
- Modify: `src/assets/js/index.js`
- Test: `tests/site-build.test.cjs`

**Interfaces:**
- Consumes: `{% icon name, className %}` from `.eleventy.js`, `info.socials[].icon` from `src/_data/info.json`
- Produces: Zero external icon CDN calls; 100% inline SVG icons across `_site/**/*.html`

- [ ] **Step 1: Add failing integration tests in `tests/site-build.test.cjs`**

Append to `tests/site-build.test.cjs`:

```javascript
test("built pages eliminate Font Awesome, text arrow glyphs, and render inline SVG icons", () => {
  const htmlFiles = walkHtmlFiles(SITE);
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    const rel = path.relative(SITE, file);
    assert.ok(!html.includes("fontawesome.com"), `Font Awesome script still present in ${rel}`);
    assert.doesNotMatch(html, /\bfa-(?:brands|solid|regular|moon|sun)\b/, `Legacy fa-* class in ${rel}`);
    assert.doesNotMatch(html, /[↗←→]/, `Raw directional Unicode glyph remaining in ${rel}`);
  }

  const indexHtml = fs.readFileSync(path.join(SITE, "index.html"), "utf8");
  assert.ok(indexHtml.includes("ec-theme-icon-light"), "Missing light-mode moon icon wrapper");
  assert.ok(indexHtml.includes("ec-theme-icon-dark"), "Missing dark-mode sun icon wrapper");
  assert.ok(!indexHtml.includes('aria-label="Email"'), "Removed Email social link still rendered");

  const css = fs.readFileSync(path.join(SITE, "assets", "css", "tailwind.css"), "utf8");
  assert.ok(css.includes(".ec-theme-icon-dark"), "Missing CSS rule for .ec-theme-icon-dark");
});
```

- [ ] **Step 2: Run `npm test` to verify RED failure**

Run: `npm test`
Expected: FAIL with `Font Awesome script still present in ...`.

- [ ] **Step 3: Migrate templates, CSS, and client JS**

1. **`src/_includes/page.njk`:** Delete `<script src="https://kit.fontawesome.com/a69420ddea.js" crossorigin="anonymous" defer></script>`.
2. **`src/assets/css/tailwind.css`:** Add flash-free theme toggle icon visibility rules:
   ```css
   .ec-theme-icon-light {
     display: inline-flex;
   }
   .ec-theme-icon-dark {
     display: none;
   }
   .dark .ec-theme-icon-light {
     display: none;
   }
   .dark .ec-theme-icon-dark {
     display: inline-flex;
   }
   ```
3. **`src/assets/js/index.js`:** Replace `fa-sun` / `fa-moon` class toggling in `syncThemeIcons()` with accessible `aria-pressed` synchronization on `[data-theme-toggle]`:
   ```javascript
   function syncThemeIcons() {
     const isDark = document.documentElement.classList.contains("dark");
     document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
       btn.setAttribute("aria-pressed", String(isDark));
     });
   }
   ```
4. **`src/_includes/_navbar.njk`:**
   - Replace `<span class="font-mono text-xs" aria-hidden="true">↗</span>` with `{% icon "arrow-up-right", "w-3.5 h-3.5" %}`.
   - Add `data-theme-toggle` to both theme buttons and replace `<i data-theme-icon ...>` with:
     ```njk
     <span class="ec-theme-icon-light">{% icon "moon", "w-4 h-4" %}</span>
     <span class="ec-theme-icon-dark">{% icon "sun", "w-4 h-4" %}</span>
     ```
   - Replace hardcoded hamburger `<svg>` with `{% icon "menu", "w-5 h-5" %}` and close `<svg>` with `{% icon "close", "w-5 h-5" %}`.
   - Replace mobile `Resume ↗` with `<span class="inline-flex items-center gap-1.5"><span>Resume</span>{% icon "arrow-up-right", "w-4 h-4" %}</span>`.
   - Replace `<i class="{{ social.icon }} fa-lg"></i>` with `{% icon social.icon, "w-5 h-5" %}`.
5. **`src/_includes/_footer.njk`:**
   - Replace `<i class="{{ social.icon }} fa-lg"></i>` with `{% icon social.icon, "w-5 h-5" %}`.
6. **`src/pages/index.njk`:**
   - Resume CTA: replace `↗` span with `{% icon "arrow-up-right", "w-4 h-4" %}`.
   - Social links: replace `<i class="{{ social.icon }} fa-lg"></i>` with `{% icon social.icon, "w-5 h-5" %}`.
   - `All projects →` and `All essays →`: wrap with `inline-flex items-center gap-1` and `{% icon "arrow-right", "w-3.5 h-3.5" %}`.
   - `GitHub ↗`: wrap with `inline-flex items-center gap-1` and `{% icon "arrow-up-right", "w-3.5 h-3.5" %}`.
7. **`src/_includes/article.njk`:**
   - Back links (`← All Projects`, `← All Essays`): use `gap-1.5` and `{% icon "arrow-left", "w-3.5 h-3.5" %}`.
   - `Source Code ↗`: `{% icon "github", "w-3.5 h-3.5" %}<span>Source Code</span>{% icon "arrow-up-right", "w-3.5 h-3.5" %}`.
   - `Copy Link`: `{% icon "copy", "w-3.5 h-3.5" %}<span data-copy-label>Copy Link</span>`.
   - Adjacent post cards (`← Newer` / `Older →`): `inline-flex items-center gap-1` with `{% icon "arrow-left", "w-3.5 h-3.5" %}` and `{% icon "arrow-right", "w-3.5 h-3.5" %}`.
8. **`src/pages/blogs.njk`:**
   - `Read essay →`: `inline-flex items-center gap-1` with `{% icon "arrow-right", "w-3.5 h-3.5" %}`.
9. **`src/pages/projects.njk`:**
   - `Source ↗`: `inline-flex items-center gap-1` with `{% icon "arrow-up-right", "w-3.5 h-3.5" %}`.
10. **`src/pages/tag.njk`:**
    - `← Projects`: `inline-flex items-center gap-1` with `{% icon "arrow-left", "w-3.5 h-3.5" %}`.

- [ ] **Step 4: Run full build and test suite**

Run: `npm run build && npm test`
Expected: PASS (16/16 tests passing, 43 pages built, zero uncommitted git commits).
