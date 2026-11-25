# Typography Refresh (`Outfit` + `Source Sans 3` + `Fira Code`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch Portfolio v2's font stack from `Fraunces` / `Plus Jakarta Sans` / `JetBrains Mono` to `Outfit` / `Source Sans 3` / `Fira Code` while keeping the Forest Emerald & Terracotta Light/Dark color palette intact.

**Architecture:** Update the Google Fonts `<link>` in `src/_includes/page.njk` and the Tailwind CSS v4 `@theme` font tokens + `.ec-prose` sizing in `src/assets/css/tailwind.css`, guarded by Red-Green TDD assertions in `tests/site-build.test.cjs`.

**Tech Stack:** Eleventy v2, Tailwind CSS v4, Nunjucks, Node `node:test`.

## Global Constraints

- Preserve all `:root` (Light) and `.dark` (Dark) Forest Emerald & Terracotta color tokens unchanged.
- Remove all references to `Fraunces`, `Plus Jakarta Sans`, and `JetBrains Mono` from active v2 templates and CSS (`src/**/v1/**` stays untouched).
- Maintain `68ch` left-aligned prose measure (`1.09375rem`, `line-height: 1.8`) and load genuine `400` italic for `Source Sans 3`.

---

### Task 1: Replace Font Stack & Tune Prose Sizing

**Files:**
- Modify: `tests/site-build.test.cjs:56-65`
- Modify: `src/_includes/page.njk:25-28`
- Modify: `src/assets/css/tailwind.css:8-12,193-200`

**Interfaces:**
- Consumes: `@theme` CSS custom properties `--font-display`, `--font-sans`, `--font-mono`.
- Produces: Compiled `_site/assets/css/tailwind.css` and `_site/**/*.html` loading `Outfit`, `Source Sans 3`, and `Fira Code`.

- [ ] **Step 1: Update font test in `tests/site-build.test.cjs` (RED)**

```javascript
test("compiled CSS and HTML head register Outfit, Source Sans 3, and Fira Code font families", () => {
  const css = fs.readFileSync(
    path.join(SITE, "assets", "css", "tailwind.css"),
    "utf8"
  );
  assert.ok(css.includes("Outfit"), "Missing Outfit in compiled CSS");
  assert.ok(css.includes("Source Sans 3"), "Missing Source Sans 3 in compiled CSS");
  assert.ok(css.includes("Fira Code"), "Missing Fira Code in compiled CSS");
  assert.ok(!css.includes("Fraunces"), "Old font Fraunces still in compiled CSS");
  assert.ok(!css.includes("Plus Jakarta Sans"), "Old font Plus Jakarta Sans still in compiled CSS");
  assert.ok(!css.includes("JetBrains Mono"), "Old font JetBrains Mono still in compiled CSS");

  const indexHtml = fs.readFileSync(path.join(SITE, "index.html"), "utf8");
  assert.ok(indexHtml.includes("family=Outfit:"), "Missing Outfit Google Font link");
  assert.ok(indexHtml.includes("family=Source+Sans+3:"), "Missing Source Sans 3 Google Font link");
  assert.ok(indexHtml.includes("family=Fira+Code:"), "Missing Fira Code Google Font link");
});
```

- [ ] **Step 2: Run `npm test` to verify RED failure**

Run: `npm test`
Expected: FAIL with `"Missing Outfit in compiled CSS"`.

- [ ] **Step 3: Update `src/_includes/page.njk` and `src/assets/css/tailwind.css` (GREEN)**

In `src/_includes/page.njk`, replace the Google Fonts `<link>`:

```html
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Outfit:wght@500;600;700&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

In `src/assets/css/tailwind.css`, update `@theme` and `.ec-prose`:

```css
@theme {
  --font-display: "Outfit", system-ui, -apple-system, sans-serif;
  --font-sans: "Source Sans 3", system-ui, -apple-system, sans-serif;
  --font-mono: "Fira Code", ui-monospace, SFMono-Regular, monospace;
}
```

```css
.ec-prose {
  max-width: 68ch;
  color: var(--text-primary);
  font-size: 1.09375rem;
  line-height: 1.8;
  text-align: left;
}
```

- [ ] **Step 4: Run `npm run build && npm test` to verify GREEN pass**

Run: `npm run build && npm test`
Expected: `npm run build` exits 0 and `npm test` passes (14/14 passing).

- [ ] **Step 5: Commit implementation**

```powershell
C:/configs/tools/snip.exe -- git add tests/site-build.test.cjs src/_includes/page.njk src/assets/css/tailwind.css
C:/configs/tools/snip.exe -- git commit -m "feat(typography): switch font pairing to Outfit, Source Sans 3, and Fira Code" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>" -m "Copilot-Session: 6590bf14-7f67-42d7-9178-7aec0023b047"
```
