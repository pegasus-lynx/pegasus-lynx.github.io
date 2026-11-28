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
    "search",
    "chevron-down",
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
  assert.ok(html.includes("/project/rec-calls/"));
  assert.ok(html.includes("/project/mwe-bpe/"));
  assert.ok(html.includes("/blog/journey-with-11ty-and-tailwind/"));
  assert.ok(
    html.includes("https://devblogs.microsoft.com/dotnet/wpf-file-dialog-improvements-in-dotnet-8/")
  );
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

test("blogs, projects, gallery, and search pages render cleanly and omit static tag pages", () => {
  for (const route of ["blogs", "projects", "gallery", "search"]) {
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
    fs.existsSync(path.join(SITE, "tags")),
    false,
    "Static /tags/*/ directory must not be generated"
  );
  assert.equal(
    fs.existsSync(path.join(SITE, "search.json")),
    true,
    "Expected /search.json build-time index"
  );
});

test("every internal href and img src in visible _site pages resolves on disk", () => {
  const htmlFiles = walkHtmlFiles(SITE).filter(
    (f) => !f.includes(`${path.sep}cross-lingual-rdf-extraction${path.sep}`)
  );
  assert.ok(
    htmlFiles.length >= 12 && htmlFiles.length <= 20,
    `Expected 12..20 HTML pages after dropping tag pages, found ${htmlFiles.length}`
  );

  const attrRegex = /\b(?:href|src)="(\/[^"#?]*)"/g;
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    assert.ok(
      !/href="\/tags\//.test(html),
      `Legacy /tags/ link found in ${path.relative(SITE, file)}`
    );
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

test("home featured projects renders reusable mobile carousel with 4 slides and non-windowed dots while preserving desktop stack", () => {
  const indexHtml = fs.readFileSync(path.join(SITE, "index.html"), "utf8");
  const projectsStart = indexHtml.indexOf('id="projects"');
  const writingStart = indexHtml.indexOf('id="writing"');
  assert.ok(projectsStart > 0 && writingStart > projectsStart, "Missing #projects or #writing section on home page");

  const projectsSection = indexHtml.slice(projectsStart, writingStart);
  assert.ok(projectsSection.includes("data-carousel"), "Featured projects missing data-carousel wrapper");
  assert.ok(projectsSection.includes("data-carousel-track"), "Featured projects missing data-carousel-track");
  assert.ok(projectsSection.includes("ec-mobile-carousel-track"), "Featured projects missing ec-mobile-carousel-track");
  assert.ok(projectsSection.includes("sm:space-y-5"), "Desktop sm:space-y-5 stack spacing must be preserved");
  assert.ok(!/\bclass="[^"]*(?<!sm:)space-y-5\b/.test(projectsSection), "Unprefixed space-y-5 must not apply on mobile carousel track");
  assert.ok(projectsSection.includes("sm:flex-row"), "Desktop sm:flex-row horizontal card layout must be preserved");

  const slideCount = (projectsSection.match(/data-carousel-slide/g) || []).length;
  assert.equal(slideCount, 4, "Expected 4 featured project carousel slides");

  const dotCount = (projectsSection.match(/data-carousel-dot="/g) || []).length;
  assert.equal(dotCount, 4, "Expected 4 pagination dots for featured projects");
  assert.ok(!projectsSection.includes("is-windowed"), "4-dot pagination must not use 7-dot windowed clipping");
});

test("card tag overflow helper caps wrapped tags at 2 lines and fits +N token on line 2", () => {
  delete require.cache[require.resolve(path.join(SITE, "js", "bundle.js"))];
  require(path.join(SITE, "js", "bundle.js"));
  assert.equal(typeof globalThis.App?.countChipLines, "function");
  assert.equal(typeof globalThis.App?.fitTagList, "function");

  const { countChipLines, fitTagList } = globalThis.App;
  assert.equal(countChipLines([]), 0);
  assert.equal(countChipLines([0, 0, 28, 28]), 2);
  assert.equal(countChipLines([0, 28, 56]), 3);

  function createFlexMock(containerWidth, specs, gap = 6, rowHeight = 28) {
    let width = containerWidth;
    const makeNode = (label, baseWidth) => {
      const attrs = {};
      return {
        textContent: label,
        hidden: false,
        title: "",
        _width: baseWidth,
        setAttribute(k, v) {
          attrs[k] = v;
        },
        getAttribute(k) {
          return attrs[k];
        },
        removeAttribute(k) {
          delete attrs[k];
        },
        get offsetTop() {
          layout();
          return this._top || 0;
        },
      };
    };

    const items = specs.map(([label, w]) => makeNode(label, w));
    const moreChip = makeNode("", 38);
    moreChip.hidden = true;

    function layout() {
      let x = 0;
      let y = 0;
      const visible = [
        ...items.filter((el) => !el.hidden),
        ...(moreChip.hidden ? [] : [{ el: moreChip, w: 24 + moreChip.textContent.length * 7 }]),
      ];
      for (const entry of visible) {
        const node = entry.el || entry;
        const w = entry.w ?? node._width;
        if (x > 0 && x + gap + w > width) {
          x = 0;
          y += rowHeight;
        }
        node._top = y;
        x = x === 0 ? w : x + gap + w;
      }
    }

    return {
      items,
      moreChip,
      setWidth(nextWidth) {
        width = nextWidth;
      },
      container: {
        get clientWidth() {
          return width;
        },
        querySelectorAll(sel) {
          return sel === "[data-tag-item]" ? items : [];
        },
        querySelector(sel) {
          return sel === "[data-tag-more]" ? moreChip : null;
        },
      },
    };
  }

  // Case 1: mwe-bpe tags on 294px mobile card -> 3 tags fit on lines 1-2 + "+3" fits on line 2
  const mwe = createFlexMock(294, [
    ["Python", 62],
    ["NLP", 42],
    ["Multi-Word Expressions", 195],
    ["Byte-Pair Encoding", 165],
    ["PyTorch", 72],
    ["Transformers", 104],
  ]);
  const resMobile = fitTagList(mwe.container, 2);
  assert.deepEqual(resMobile, { visibleCount: 3, hiddenCount: 3 });
  assert.equal(mwe.moreChip.hidden, false);
  assert.equal(mwe.moreChip.textContent, "+3");
  assert.equal(mwe.moreChip.title, "Byte-Pair Encoding, PyTorch, Transformers");
  assert.equal(mwe.items[2].hidden, false);
  assert.equal(mwe.items[3].hidden, true);

  // Case 2: Widening container to 640px desktop restores all 6 tags and hides +N
  mwe.setWidth(640);
  const resDesktop = fitTagList(mwe.container, 2);
  assert.deepEqual(resDesktop, { visibleCount: 6, hiddenCount: 0 });
  assert.equal(mwe.moreChip.hidden, true);
  assert.ok(mwe.items.every((el) => el.hidden === false));

  // Case 3: Line 2 is nearly full (180px of 200px), so "+1" (38px) cannot fit alongside item[1];
  // fitTagList must hide item[1] too and render "+2" on line 2 instead of spilling "+1" onto line 3.
  const tight = createFlexMock(200, [
    ["Python", 150],
    ["Computer Graphics", 180],
    ["OpenGL", 75],
  ]);
  const resTight = fitTagList(tight.container, 2);
  assert.deepEqual(resTight, { visibleCount: 1, hiddenCount: 2 });
  assert.equal(tight.moreChip.hidden, false);
  assert.equal(tight.moreChip.textContent, "+2");
  assert.equal(tight.items[0].hidden, false);
  assert.equal(tight.items[1].hidden, true);
  assert.equal(tight.items[2].hidden, true);
  assert.ok(countChipLines([tight.items[0].offsetTop, tight.moreChip.offsetTop]) <= 2);
});

test("all project and essay cards render data-tag-list with hidden +N chip while skills and topic filters do not", () => {
  const indexHtml = fs.readFileSync(path.join(SITE, "index.html"), "utf8");
  const projectsHtml = fs.readFileSync(path.join(SITE, "projects", "index.html"), "utf8");
  const blogsHtml = fs.readFileSync(path.join(SITE, "blogs", "index.html"), "utf8");
  const css = fs.readFileSync(path.join(SITE, "assets", "css", "tailwind.css"), "utf8");

  const skillsSection = indexHtml.slice(indexHtml.indexOf('id="skills"'), indexHtml.indexOf('id="writing"'));
  assert.ok(!skillsSection.includes("data-tag-list"), "Skills section must not truncate skill chips");

  const homeProjects = indexHtml.slice(indexHtml.indexOf('id="projects"'), indexHtml.indexOf('id="skills"'));
  const homeWriting = indexHtml.slice(indexHtml.indexOf('id="writing"'));
  assert.equal((homeProjects.match(/data-tag-list/g) || []).length, 4, "Expected 4 data-tag-list in Home Featured Projects");
  assert.equal((homeProjects.match(/data-tag-more/g) || []).length, 4, "Expected 4 data-tag-more in Home Featured Projects");
  assert.ok((homeWriting.match(/data-tag-list/g) || []).length >= 2, "Expected data-tag-list on Home Latest Writing cards");

  const projectArticleCount = (projectsHtml.match(/<article\b/g) || []).length;
  assert.ok(projectArticleCount >= 7, "Expected visible project cards on /projects/");
  assert.equal(
    (projectsHtml.match(/data-tag-list/g) || []).length,
    projectArticleCount,
    "Expected data-tag-list on every /projects/ card"
  );
  const blogsHeader = blogsHtml.slice(0, blogsHtml.indexOf("</header>"));
  assert.ok(!blogsHeader.includes("data-tag-list"), "Blogs page header topic filter must not truncate");
  assert.ok((blogsHtml.match(/data-tag-list/g) || []).length >= 2, "Expected data-tag-list on /blogs/ essay cards");

  assert.ok(css.includes(".ec-chip[hidden]"), "CSS must hide [hidden] .ec-chip elements");
  assert.ok(css.includes(".ec-chip-more"), "CSS must style .ec-chip-more token");
});

test("search.json indexes visible projects and essays with stripped plain text and tag counts", () => {
  const payload = JSON.parse(fs.readFileSync(path.join(SITE, "search.json"), "utf8"));
  assert.ok(Array.isArray(payload.items), "search.json must expose items array");
  assert.ok(Array.isArray(payload.tags), "search.json must expose tags array");
  assert.equal(payload.items.length, 11, "Expected 11 visible entries (8 projects + 3 essays)");

  for (const item of payload.items) {
    assert.ok(
      item.title && (item.url.startsWith("/") || item.url.startsWith("https://")),
      "Invalid title or url in search.json"
    );
    assert.ok(item.type === "project" || item.type === "blog", `Unexpected item.type ${item.type}`);
    assert.ok(typeof item.dateLabel === "string" && item.dateLabel.length > 0, "Missing dateLabel");
    assert.ok(typeof item.sortTimestamp === "number" && item.sortTimestamp > 0, "Missing sortTimestamp");
    assert.ok(typeof item.description === "string" && item.description.length > 0, "Missing description");
    assert.ok(typeof item.content === "string" && item.content.length > 20, "Missing plain-text content");
    assert.ok(!/<[a-z][\s\S]*>/i.test(item.content), `Unstripped HTML found in ${item.url} content`);
    assert.ok(!item.url.includes("cross-lingual-rdf-extraction"), "Hidden draft leaked into search.json");
    assert.ok(Array.isArray(item.tags) && item.tags.length > 0, "Missing item tags");
    for (const t of item.tags) {
      assert.ok(t.name && t.slug, "Each item tag must include name and slug");
      assert.notEqual(t.name, "Project");
      assert.notEqual(t.name, "Blog");
    }
  }

  assert.ok(!payload.tags.some((t) => t.slug === "rdf-extraction"), "Draft-only tag leaked into search.json");
  const pythonTag = payload.tags.find((t) => t.slug === "python");
  assert.ok(pythonTag && pythonTag.count >= 4, "Expected python tag count >= 4");
});

test("search helpers handle switch vs Ctrl+Click AND tag selection and ranked keyword filtering", () => {
  delete require.cache[require.resolve(path.join(SITE, "js", "bundle.js"))];
  require(path.join(SITE, "js", "bundle.js"));
  assert.equal(typeof globalThis.App?.nextSelectedTags, "function");
  assert.equal(typeof globalThis.App?.filterSearchEntries, "function");

  const { nextSelectedTags, filterSearchEntries } = globalThis.App;

  // Normal click switches single tag; clicking sole active tag clears it
  assert.deepEqual(nextSelectedTags([], "python", false), ["python"]);
  assert.deepEqual(nextSelectedTags(["python"], "nlp", false), ["nlp"]);
  assert.deepEqual(nextSelectedTags(["python"], "python", false), []);
  // Ctrl/Cmd+Click adds AND clause or removes one tag from multi-selection
  assert.deepEqual(nextSelectedTags(["python"], "nlp", true), ["python", "nlp"]);
  assert.deepEqual(nextSelectedTags(["python", "nlp"], "python", true), ["nlp"]);
  // Normal click when multiple tags are selected switches to just the clicked tag
  assert.deepEqual(nextSelectedTags(["python", "nlp"], "python", false), ["python"]);

  const sample = [
    {
      title: "BPE beyond Word Boundary",
      url: "/project/mwe-bpe/",
      type: "project",
      sortTimestamp: 200,
      description: "Subword tokenization with Byte Pair Encoding.",
      tags: [{ name: "Python", slug: "python" }, { name: "NLP", slug: "nlp" }],
      content: "Transformers and multi-word expressions in neural machine translation.",
    },
    {
      title: "Hindi CRF Analysis",
      url: "/project/hindi-crf/",
      type: "project",
      sortTimestamp: 150,
      description: "Chunking Hindi sentences.",
      tags: [{ name: "Python", slug: "python" }, { name: "NLP", slug: "nlp" }, { name: "CRF", slug: "crf" }],
      content: "Shallow parsing with Viterbi decoding and BPE comparison.",
    },
    {
      title: "Journey with 11ty and Tailwind",
      url: "/blog/11ty/",
      type: "blog",
      sortTimestamp: 300,
      description: "Building this portfolio site.",
      tags: [{ name: "11ty", slug: "11ty" }, { name: "Tailwind", slug: "tailwind" }],
      content: "Static site generation with Nunjucks templates.",
    },
  ];

  // Empty query sorts newest first
  assert.deepEqual(
    filterSearchEntries(sample, { query: "", tags: [], type: "all" }).map((x) => x.url),
    ["/blog/11ty/", "/project/mwe-bpe/", "/project/hindi-crf/"]
  );

  // Type filter
  assert.deepEqual(
    filterSearchEntries(sample, { query: "", tags: [], type: "blog" }).map((x) => x.url),
    ["/blog/11ty/"]
  );

  // Multi-tag AND filter (python + crf -> only Hindi CRF)
  assert.deepEqual(
    filterSearchEntries(sample, { query: "", tags: ["python", "crf"], type: "all" }).map((x) => x.url),
    ["/project/hindi-crf/"]
  );

  // Keyword ranking: "BPE" in title ranks above "BPE" in body even if timestamps tie/differ
  assert.deepEqual(
    filterSearchEntries(sample, { query: "bpe", tags: [], type: "all" }).map((x) => x.url),
    ["/project/mwe-bpe/", "/project/hindi-crf/"]
  );

  // Multi-token body + description query
  assert.deepEqual(
    filterSearchEntries(sample, { query: "hindi viterbi", tags: [], type: "all" }).map((x) => x.url),
    ["/project/hindi-crf/"]
  );

  // Unmatched query
  assert.deepEqual(filterSearchEntries(sample, { query: "kubernetes", tags: [], type: "all" }), []);
});

test("search page and /search/?tag= chip links render cleanly while navbar hides search button", () => {
  const searchHtml = fs.readFileSync(path.join(SITE, "search", "index.html"), "utf8");
  const indexHtml = fs.readFileSync(path.join(SITE, "index.html"), "utf8");
  const projectPageHtml = fs.readFileSync(path.join(SITE, "project", "mwe-bpe", "index.html"), "utf8");

  assert.ok(!indexHtml.includes('href="/search/"'), "Navbar must hide /search/ button");
  assert.ok(indexHtml.includes('href="/search/?tag=python"'), "Home project card tag must link to /search/?tag=python");
  assert.ok(projectPageHtml.includes('href="/search/?tag=python"'), "Article header tag chip must link to /search/?tag=python");

  assert.ok(searchHtml.includes("data-search-root"), "Missing data-search-root on /search/");
  assert.ok(searchHtml.includes("data-search-input"), "Missing data-search-input on /search/");
  assert.equal((searchHtml.match(/data-search-type="/g) || []).length, 3, "Expected 3 type filter buttons on /search/");
  assert.ok((searchHtml.match(/data-search-tag="/g) || []).length >= 20, "Expected topic filter buttons on /search/");
  assert.ok(searchHtml.includes("data-search-results"), "Missing data-search-results container");
  assert.ok(searchHtml.includes("data-search-empty"), "Missing data-search-empty state");
});

test("projects and blogs pages render two-part inline search with multi-select topic dropdown and single clear icon", () => {
  const projectsHtml = fs.readFileSync(path.join(SITE, "projects", "index.html"), "utf8");
  const blogsHtml = fs.readFileSync(path.join(SITE, "blogs", "index.html"), "utf8");
  const searchHtml = fs.readFileSync(path.join(SITE, "search", "index.html"), "utf8");
  const css = fs.readFileSync(path.join(SITE, "assets", "css", "tailwind.css"), "utf8");

  for (const html of [projectsHtml, blogsHtml]) {
    const section = html.match(/<section class="mb-8" aria-label="Filter entries">([\s\S]*?)<\/section>/)[1];
    const bar = section.match(/<div class="([^"]*)">/)[1];
    const dropdown = section.match(/<div class="([^"]*)" data-topic-dropdown>/)[1];
    const input = section.match(/<input\s+id="search-input"[\s\S]*?class="([^"]*)"/)[1];
    assert.match(bar, /\brounded-xl\b/);
    assert.match(bar, /\bborder\b/);
    assert.match(bar, /\bsm:flex-row\b/);
    assert.doesNotMatch(bar, /\bgap-/);
    assert.match(dropdown, /\bborder-t\b/);
    assert.match(dropdown, /\bsm:border-t-0\b/);
    assert.match(dropdown, /\bsm:border-l\b/);
    assert.doesNotMatch(input, /\bborder\b/);
    const topicButton = section.match(/<button\s+type="button"\s+data-topic-dropdown-btn[\s\S]*?class="([^"]*)"/)[1];
    const topicList = section.match(/<div\s+role="listbox"[\s\S]*?class="([^"]*)"/)[1];
    assert.ok(topicButton.includes("bg-[var(--bg-surface)]"), "Topics button must use the theme surface color");
    assert.match(topicList, /\bec-topic-scroll\b/);
  }
  assert.match(css, /\.ec-topic-scroll\s*\{[^}]*scrollbar-color:\s*var\(--text-muted\)\s+transparent/s);
  assert.match(css, /\.ec-topic-scroll\s*\{[^}]*scrollbar-width:\s*thin/s);

  // Native search cancel icon must be hidden in CSS so duplicate X never renders
  assert.ok(
    css.includes("::-webkit-search-cancel-button"),
    "CSS must strip native ::-webkit-search-cancel-button to prevent duplicate X"
  );

  // /search/ keeps full pill grid (not dropdown)
  assert.ok(!searchHtml.includes("data-topic-dropdown"), "/search/ must keep topic pill grid");

  // /projects/ inline two-part search + multi-select dropdown + scoped project tags
  assert.ok(projectsHtml.includes("data-inline-search-root"), "Missing data-inline-search-root on /projects/");
  assert.ok(projectsHtml.includes('data-inline-search-type="project"'), "Missing project search type on /projects/");
  assert.ok(projectsHtml.includes("data-search-input"), "Missing inline search input on /projects/");
  assert.ok(projectsHtml.includes("data-topic-dropdown"), "Missing multi-select topic dropdown on /projects/");
  assert.ok(projectsHtml.includes('aria-multiselectable="true"'), "Missing aria-multiselectable listbox on /projects/");
  assert.ok(projectsHtml.includes("data-topic-filter-input"), "Expected topic quick-filter input inside /projects/ dropdown");
  assert.ok(projectsHtml.includes("data-active-tags-row"), "Missing active selected tags row on /projects/");
  assert.ok(projectsHtml.includes('data-search-tag="python"'), "Expected python topic option on /projects/");
  assert.ok(!projectsHtml.includes('data-search-tag="book-summary"'), "Essay-only tag leaked into /projects/ topic options");
  assert.equal((projectsHtml.match(/data-inline-card="/g) || []).length, 8, "Expected 8 data-inline-card items on /projects/");
  assert.ok(projectsHtml.includes('href="/projects/?tag=python"'), "Expected /projects/ card tags to link inline to /projects/?tag=python");
  assert.ok(projectsHtml.includes("data-search-empty"), "Missing inline empty state on /projects/");

  // /blogs/ inline two-part search + multi-select dropdown + scoped blog tags
  assert.ok(blogsHtml.includes("data-inline-search-root"), "Missing data-inline-search-root on /blogs/");
  assert.ok(blogsHtml.includes('data-inline-search-type="blog"'), "Missing blog search type on /blogs/");
  assert.ok(blogsHtml.includes("data-search-input"), "Missing inline search input on /blogs/");
  assert.ok(blogsHtml.includes("data-topic-dropdown"), "Missing multi-select topic dropdown on /projects/");
  assert.ok(blogsHtml.includes('aria-multiselectable="true"'), "Missing aria-multiselectable listbox on /blogs/");
  assert.ok(!blogsHtml.includes("data-topic-filter-input"), "Small 8-tag /blogs/ dropdown should omit quick-filter input");
  assert.ok(blogsHtml.includes("data-active-tags-row"), "Missing active selected tags row on /blogs/");
  assert.ok(blogsHtml.includes('data-search-tag="11ty"'), "Expected 11ty topic option on /blogs/");
  assert.ok(blogsHtml.includes('data-search-tag="book-summary"'), "Expected book-summary topic option on /blogs/");
  assert.ok(!blogsHtml.includes('data-search-tag="pytorch"'), "Project-only tag leaked into /blogs/ topic options");
  assert.equal((blogsHtml.match(/data-inline-card="/g) || []).length, 3, "Expected 3 data-inline-card items on /blogs/");
  assert.ok(blogsHtml.includes('href="/blogs/?tag=11ty"'), "Expected /blogs/ card tags to link inline to /blogs/?tag=11ty");
  assert.ok(blogsHtml.includes("data-search-empty"), "Missing inline empty state on /blogs/");

  // Pure helper orders inline cards by relevance when query is present and restores initial order when cleared
  delete require.cache[require.resolve(path.join(SITE, "js", "bundle.js"))];
  require(path.join(SITE, "js", "bundle.js"));
  assert.equal(typeof globalThis.App?.orderInlineCardUrls, "function");
  const initialUrls = ["/project/a/", "/project/b/", "/project/c/"];
  assert.deepEqual(
    globalThis.App.orderInlineCardUrls(initialUrls, ["/project/c/", "/project/a/"], false),
    ["/project/a/", "/project/c/"]
  );
  assert.deepEqual(
    globalThis.App.orderInlineCardUrls(initialUrls, ["/project/c/", "/project/a/"], true),
    ["/project/c/", "/project/a/"]
  );
});

test("home page surfaces updated resume link, @dipeshmsft, experience OSS links, Recalls, and DevBlog", () => {
  const indexHtml = fs.readFileSync(path.join(SITE, "index.html"), "utf8");
  const blogsHtml = fs.readFileSync(path.join(SITE, "blogs", "index.html"), "utf8");

  assert.ok(
    indexHtml.includes("https://drive.google.com/file/d/1AJhn4yNdzz4UBtNhB1-xsQtmPqqfMtRN/view?usp=sharing"),
    "Missing updated Google Drive resume URL"
  );
  assert.ok(indexHtml.includes("https://github.com/dipeshmsft"), "Missing @dipeshmsft GitHub link");
  assert.ok(indexHtml.includes("https://github.com/dotnet/wpf"), "Missing dotnet/wpf link");
  assert.ok(indexHtml.includes("https://learn.microsoft.com/en-us/windows/apps/winui/"), "Missing WinUI 3 link");
  assert.ok(indexHtml.includes("https://github.com/dotnet/wpf/issues/7689"), "Missing OpenFolderDialog proposal link");
  assert.ok(indexHtml.includes("https://github.com/dotnet/wpf/issues/8932"), "Missing Fluent ThemeMode proposal link");
  assert.ok(indexHtml.includes("https://github.com/dotnet/wpf/issues/9295"), "Missing AccentColor proposal link");
  assert.ok(
    indexHtml.includes("https://www.microsoft.com/store/productId/9NDLX60WX4KQ"),
    "Missing Microsoft Store WPF Gallery link"
  );
  assert.ok(indexHtml.includes("https://github.com/pegasus-lynx/rec-calls"), "Missing Recalls source link");
  assert.equal(
    fs.existsSync(path.join(SITE, "project", "rec-calls", "index.html")),
    true,
    "Expected /project/rec-calls/ case study page"
  );
  assert.equal(
    fs.existsSync(path.join(SITE, "blog", "wpf-file-dialog-dotnet-8", "index.html")),
    false,
    "External .NET Blog entry must not emit a stub local HTML page"
  );
  assert.ok(blogsHtml.includes("Read on Microsoft .NET Blog"), "Missing external CTA on /blogs/");
  assert.ok(blogsHtml.includes("60-Second Organizer"), "Book summary must remain on /blogs/");
  assert.ok(!indexHtml.includes("60-Second Organizer"), "Book summary must be excluded from Home Latest Writing");
  assert.ok(!indexHtml.includes('id="education"'), "Education section must not be rendered");
});




