const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SITE = path.join(ROOT, "_site");

test("info.json exposes unified v2 schema fields", () => {
  const info = JSON.parse(
    fs.readFileSync(path.join(ROOT, "src", "_data", "info.json"), "utf8")
  );
  assert.equal(info.name, "Dipesh Kumar");
  assert.ok(info.sitename && info.sitename.length > 0);
  assert.ok(info.role && info.role.length > 0);
  assert.ok(info.resumeUrl && info.resumeUrl.startsWith("https://"));
  assert.ok(Array.isArray(info.about) && info.about.length >= 3);
  assert.ok(Array.isArray(info.experiences) && info.experiences.length >= 3);
  assert.ok(Array.isArray(info.skillGroups) && info.skillGroups.length >= 4);
  assert.ok(Array.isArray(info.selectedprojects) && info.selectedprojects.length >= 3);
});

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

test("eleventy build omits legacy contact route", () => {
  assert.equal(
    fs.existsSync(path.join(SITE, "contact", "index.html")),
    false,
    "_site/contact/index.html should not be generated in v2"
  );
});

test("markdown headings render deterministic slug IDs", () => {
  const blogHtml = fs.readFileSync(
    path.join(SITE, "blog", "journey-with-11ty-and-tailwind", "index.html"),
    "utf8"
  );
  assert.match(blogHtml, /<h3 id="finding-the-right-ssg">/);
});

test("compiled CSS defines Editorial Craft light and dark semantic color tokens", () => {
  const css = fs.readFileSync(
    path.join(SITE, "assets", "css", "tailwind.css"),
    "utf8"
  );
  assert.match(css, /--bg-canvas:\s*#faf8f5/i);
  assert.match(css, /--bg-canvas:\s*#131615/i);
  assert.match(css, /--accent-primary:\s*#1f6f54/i);
  assert.match(css, /--accent-primary:\s*#6ee7b7/i);
});

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

test("base page shell embeds flash-free theme initializer and accessible theme toggle", () => {
  const blogHtml = fs.readFileSync(
    path.join(SITE, "blog", "journey-with-11ty-and-tailwind", "index.html"),
    "utf8"
  );
  assert.match(blogHtml, /localStorage\.getItem\(['"]theme['"]\)/);
  assert.match(blogHtml, /prefers-color-scheme:\s*dark/);
  assert.match(blogHtml, /aria-label="Toggle color theme"/);
  assert.doesNotMatch(blogHtml, /<footer[^>]*\babsolute\b/);
});

test("bundled client JS exports theme, article reader, and home scroll-spy handlers", () => {
  const bundleJs = fs.readFileSync(path.join(SITE, "js", "bundle.js"), "utf8");
  assert.match(bundleJs, /toggleTheme/);
  assert.match(bundleJs, /initArticleReader/);
  assert.match(bundleJs, /initHomeScrollSpy/);
});

test("home page renders split sticky sidebar navigation targets", () => {
  const indexPath = path.join(SITE, "index.html");
  assert.equal(fs.existsSync(indexPath), true, "_site/index.html must exist");
  const html = fs.readFileSync(indexPath, "utf8");
  for (const sectionId of ["about", "experience", "skills", "projects", "writing"]) {
    assert.ok(html.includes(`id="${sectionId}"`), `Missing #${sectionId} section`);
    assert.ok(html.includes(`data-spy-target="${sectionId}"`), `Missing spy link for ${sectionId}`);
  }
});

test("home page populates experience, skill groups, featured projects, and latest essays", () => {
  const html = fs.readFileSync(path.join(SITE, "index.html"), "utf8");
  assert.ok(html.includes("Software Engineer II"));
  assert.ok(html.includes("OpenFolderDialog"));
  assert.ok(html.includes("Desktop &amp; Systems"));
  assert.ok(html.includes("/project/mwe-bpe/"));
  assert.ok(html.includes("/blog/journey-with-11ty-and-tailwind/"));
  assert.ok(!html.includes("text-justify"));
});

test("blog reader renders 68ch prose container, progress bar, and sticky TOC rail", () => {
  const blogHtml = fs.readFileSync(
    path.join(SITE, "blog", "journey-with-11ty-and-tailwind", "index.html"),
    "utf8"
  );
  assert.ok(blogHtml.includes('id="reading-progress"'), "Missing #reading-progress");
  assert.ok(blogHtml.includes('id="article-prose"'), "Missing #article-prose");
  assert.ok(blogHtml.includes('id="toc-rail"'), "Missing #toc-rail");
  assert.ok(blogHtml.includes("All Essays"), "Missing back link");
  assert.ok(!blogHtml.includes("text-justify"), "Blog prose must not use text-justify");
});

test("project reader renders case study metadata, blockquotes, figures, and guarded source links", () => {
  const projectHtml = fs.readFileSync(
    path.join(SITE, "project", "mwe-bpe", "index.html"),
    "utf8"
  );
  assert.ok(projectHtml.includes('id="article-prose"'), "Missing #article-prose");
  assert.ok(projectHtml.includes("All Projects"), "Missing back link");
  assert.ok(projectHtml.includes("https://github.com/pegasus-lynx/mwe-bpe"), "Missing source code link");
  assert.ok(projectHtml.includes("<blockquote>"), "Missing rendered blockquote");
  assert.ok(projectHtml.includes("/assets/images/mwe-bpe-score-table.webp"), "Missing figure image");
  assert.ok(!projectHtml.includes("text-justify"), "Project prose must not use text-justify");

  const draftHtml = fs.readFileSync(
    path.join(SITE, "project", "cross-lingual-rdf-extraction", "index.html"),
    "utf8"
  );
  assert.ok(!draftHtml.includes("Source Code"), "Draft with sourcecode:# must omit Source Code button");
});

function walkHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkHtmlFiles(full));
    } else if (entry.name.endsWith(".html")) {
      results.push(full);
    }
  }
  return results;
}

test("blogs, projects, gallery, and tag pages render cleanly and exclude show:false drafts", () => {
  for (const route of ["blogs", "projects", "gallery"]) {
    assert.equal(
      fs.existsSync(path.join(SITE, route, "index.html")),
      true,
      `Missing _site/${route}/index.html`
    );
  }

  const projectsHtml = fs.readFileSync(path.join(SITE, "projects", "index.html"), "utf8");
  assert.ok(projectsHtml.includes("BPE beyond Word Boundary"), "Missing mwe-bpe card");
  assert.ok(!projectsHtml.includes("cross-lingual-rdf-extraction"), "Draft must be excluded");

  const galleryHtml = fs.readFileSync(path.join(SITE, "gallery", "index.html"), "utf8");
  assert.ok(galleryHtml.includes("ec-gallery-masonry"), "Missing masonry container");
  assert.ok(galleryHtml.includes("/assets/images/gallery/"), "Missing gallery images");

  assert.equal(
    fs.existsSync(path.join(SITE, "tags", "11ty", "index.html")),
    true,
    "Expected /tags/11ty/ page"
  );
  assert.equal(
    fs.existsSync(path.join(SITE, "tags", "rdf-extraction", "index.html")),
    false,
    "Hidden draft tag rdf-extraction must not generate a tag page"
  );
});

test("every internal href and img src in visible _site pages resolves on disk", () => {
  const htmlFiles = walkHtmlFiles(SITE).filter(
    (f) => !f.includes(`${path.sep}cross-lingual-rdf-extraction${path.sep}`)
  );
  assert.ok(htmlFiles.length >= 25, `Expected >=25 HTML pages, found ${htmlFiles.length}`);

  const attrRegex = /\b(?:href|src)="(\/[^"#?]*)"/g;
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    let match;
    while ((match = attrRegex.exec(html)) !== null) {
      const ref = match[1];
      const diskTarget = ref.endsWith("/")
        ? path.join(SITE, ref, "index.html")
        : path.join(SITE, ref);
      assert.equal(
        fs.existsSync(diskTarget),
        true,
        `Broken internal reference "${ref}" in ${path.relative(SITE, file)}`
      );
    }
  }
});

test("GitHub Actions workflow pins Node 26 LTS, uses v4 actions, and runs tests", () => {
  const workflow = fs.readFileSync(
    path.join(ROOT, ".github", "workflows", "build.yml"),
    "utf8"
  );
  assert.ok(
    !/node-version:\s*['"]?current['"]?/.test(workflow),
    "Workflow must not use unstable node-version: current"
  );
  assert.match(workflow, /node-version:\s*['"]?26['"]?/);
  assert.match(workflow, /actions\/checkout@v4/);
  assert.match(workflow, /actions\/setup-node@v4/);
  assert.match(workflow, /peaceiris\/actions-gh-pages@v4/);
  assert.match(workflow, /npm test/);
});

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

test("smart navbar state machine hides on scroll down, shows on scroll up, and guards top/menu/focus", () => {
  delete require.cache[require.resolve(path.join(SITE, "js", "bundle.js"))];
  require(path.join(SITE, "js", "bundle.js"));
  assert.equal(typeof globalThis.App?.updateNavbarScrollState, "function");

  const makeEl = (initialClasses = []) => {
    const set = new Set(initialClasses);
    return {
      classList: {
        add: (c) => set.add(c),
        remove: (c) => set.delete(c),
        contains: (c) => set.has(c),
      },
      contains: (node) => Boolean(node && node === focusedInside),
    };
  };

  let focusedInside = null;
  const header = makeEl();
  const mobileMenu = makeEl(["hidden"]);
  const { updateNavbarScrollState } = globalThis.App;

  // Scrolling down past 64px hides header
  let lastY = updateNavbarScrollState({ header, mobileMenu, currentY: 120, lastY: 20, activeElement: null });
  assert.equal(lastY, 120);
  assert.equal(header.classList.contains("ec-navbar-hidden"), true);

  // Small jitter (< 8px) keeps state and preserves lastY so gradual scroll accumulates
  lastY = updateNavbarScrollState({ header, mobileMenu, currentY: 115, lastY, activeElement: null });
  assert.equal(lastY, 120);
  assert.equal(header.classList.contains("ec-navbar-hidden"), true);

  // Scrolling up >= 8px reveals header immediately
  lastY = updateNavbarScrollState({ header, mobileMenu, currentY: 108, lastY, activeElement: null });
  assert.equal(lastY, 108);
  assert.equal(header.classList.contains("ec-navbar-hidden"), false);

  // Open mobile menu prevents hiding on downward scroll
  mobileMenu.classList.remove("hidden");
  lastY = updateNavbarScrollState({ header, mobileMenu, currentY: 220, lastY, activeElement: null });
  assert.equal(header.classList.contains("ec-navbar-hidden"), false);
  mobileMenu.classList.add("hidden");

  // Active keyboard focus inside header prevents hiding
  focusedInside = {};
  lastY = updateNavbarScrollState({ header, mobileMenu, currentY: 320, lastY, activeElement: focusedInside });
  assert.equal(header.classList.contains("ec-navbar-hidden"), false);
  focusedInside = null;

  // Returning near top (<= 64px) always reveals header
  header.classList.add("ec-navbar-hidden");
  lastY = updateNavbarScrollState({ header, mobileMenu, currentY: 40, lastY: 200, activeElement: null });
  assert.equal(lastY, 40);
  assert.equal(header.classList.contains("ec-navbar-hidden"), false);
});

test("navbar renders About link, places mobile drawer outside header, and compiles hide-on-scroll styles", () => {
  const indexHtml = fs.readFileSync(path.join(SITE, "index.html"), "utf8");
  const blogsHtml = fs.readFileSync(path.join(SITE, "blogs", "index.html"), "utf8");
  const css = fs.readFileSync(path.join(SITE, "assets", "css", "tailwind.css"), "utf8");
  const bundleJs = fs.readFileSync(path.join(SITE, "js", "bundle.js"), "utf8");

  assert.match(indexHtml, /<header[^>]*id="site-header"[^>]*class="[^"]*\bec-navbar\b/);
  assert.match(indexHtml, /<a href="\/" class="ec-nav-link"\s+aria-current="page">About<\/a>/);
  assert.match(blogsHtml, /<a href="\/" class="ec-nav-link"\s*>About<\/a>/);
  assert.ok(!indexHtml.includes(">Home</a>"), "Mobile drawer should show About instead of Home");

  const headerEnd = indexHtml.indexOf("</header>");
  const mobileDrawerPos = indexHtml.indexOf('id="mobile-nav-menu"');
  assert.ok(headerEnd > 0 && mobileDrawerPos > headerEnd, "#mobile-nav-menu must be outside <header>");

  assert.ok(css.includes(".ec-navbar-hidden"), "Missing .ec-navbar-hidden in compiled CSS");
  assert.match(bundleJs, /initSmartNavbar/);
});

test("mobile carousel helpers resolve nearest slide center and sliding dot window", () => {
  delete require.cache[require.resolve(path.join(SITE, "js", "bundle.js"))];
  require(path.join(SITE, "js", "bundle.js"));
  assert.equal(typeof globalThis.App?.computeCarouselIndex, "function");
  assert.equal(typeof globalThis.App?.computeCarouselDotWindow, "function");

  const { computeCarouselIndex, computeCarouselDotWindow } = globalThis.App;
  assert.equal(computeCarouselIndex(160, []), 0);

  const centers = [160, 480, 800, 1120];
  assert.equal(computeCarouselIndex(0, centers), 0);
  assert.equal(computeCarouselIndex(310, centers), 0);
  assert.equal(computeCarouselIndex(330, centers), 1);
  assert.equal(computeCarouselIndex(790, centers), 2);
  assert.equal(computeCarouselIndex(1500, centers), 3);

  assert.deepEqual(computeCarouselDotWindow(0, 3, 7), { start: 0, end: 2 });
  assert.deepEqual(computeCarouselDotWindow(0, 20, 7), { start: 0, end: 6 });
  assert.deepEqual(computeCarouselDotWindow(5, 20, 7), { start: 2, end: 8 });
  assert.deepEqual(computeCarouselDotWindow(19, 20, 7), { start: 13, end: 19 });
});

test("gallery page renders frameless rounded mobile carousel with centered dots only", () => {
  const galleryHtml = fs.readFileSync(path.join(SITE, "gallery", "index.html"), "utf8");
  const css = fs.readFileSync(path.join(SITE, "assets", "css", "tailwind.css"), "utf8");
  const bundleJs = fs.readFileSync(path.join(SITE, "js", "bundle.js"), "utf8");

  assert.ok(galleryHtml.includes("data-carousel"), "Missing data-carousel wrapper");
  assert.ok(galleryHtml.includes("data-carousel-track"), "Missing data-carousel-track");
  assert.ok(galleryHtml.includes("ec-mobile-carousel-track"), "Missing ec-mobile-carousel-track class");
  assert.ok(galleryHtml.includes("ec-gallery-masonry"), "Desktop ec-gallery-masonry class must be preserved");
  assert.ok(!galleryHtml.includes("ec-gallery-stage"), "Frameless gallery must not render ec-gallery-stage");
  assert.ok(!/<figure[^>]*\bec-card\b/.test(galleryHtml), "Gallery figure must not have ec-card border");
  assert.ok(!/<figure[^>]*\bp-2\b/.test(galleryHtml), "Gallery figure must not have p-2 inner gap");
  assert.ok(/<img[^>]*width="720"[^>]*height="\d+"[^>]*class="[^"]*\brounded-2xl\b/.test(galleryHtml), "Gallery img must have intrinsic dimensions and rounded-2xl corners");

  const slideCount = (galleryHtml.match(/data-carousel-slide/g) || []).length;
  assert.equal(slideCount, 20, "Expected 20 gallery carousel slides");

  const portraitCount = (galleryHtml.match(/data-orientation="portrait"/g) || []).length;
  const landscapeCount = (galleryHtml.match(/data-orientation="landscape"/g) || []).length;
  assert.equal(portraitCount, 14, "Expected 14 portrait gallery slides");
  assert.equal(landscapeCount, 6, "Expected 6 landscape gallery slides");
  assert.ok(/data-orientation="landscape"\s+style="--slide-bg:\s*url\('\/assets\/images\/gallery\/[^']+\.webp'\)"/.test(galleryHtml), "Landscape slides must set --slide-bg CSS variable");

  assert.ok(!galleryHtml.includes("1 / 20"), "Numeric 1 / 20 counter must not appear on page");
  assert.ok(!galleryHtml.includes("data-carousel-status"), "data-carousel-status counter must be removed");
  assert.ok(!galleryHtml.includes("data-carousel-prev"), "Prev arrow button must be removed");
  assert.ok(!galleryHtml.includes("data-carousel-next"), "Next arrow button must be removed");

  const dotCount = (galleryHtml.match(/data-carousel-dot="/g) || []).length;
  assert.equal(dotCount, 20, "Expected 20 pagination dot buttons");

  assert.ok(css.includes(".ec-mobile-carousel-track"), "Missing .ec-mobile-carousel-track in CSS");
  assert.ok(css.includes(".ec-carousel-dot"), "Missing .ec-carousel-dot styles in CSS");
  assert.ok(css.includes('[data-orientation="landscape"]::before'), "Missing landscape blurred backdrop pseudo-element in CSS");
  assert.ok(css.includes("blur("), "Missing blur filter on landscape backdrop in CSS");
  assert.ok(!css.includes(".ec-gallery-stage"), "Unused .ec-gallery-stage frame rule should be removed");
  assert.ok(bundleJs.includes("initMobileCarousels"), "Missing initMobileCarousels in bundle.js");
});



