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

test("info.json social icons contain valid space-separated CSS classes", () => {
  const info = JSON.parse(
    fs.readFileSync(path.join(ROOT, "src", "_data", "info.json"), "utf8")
  );
  for (const social of info.socials) {
    assert.ok(!social.icon.includes(","), `Invalid comma in icon class: ${social.icon}`);
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

test("compiled CSS registers Fraunces, Plus Jakarta Sans, and JetBrains Mono font families", () => {
  const css = fs.readFileSync(
    path.join(SITE, "assets", "css", "tailwind.css"),
    "utf8"
  );
  assert.match(css, /Fraunces/);
  assert.match(css, /Plus Jakarta Sans/);
  assert.match(css, /JetBrains Mono/);
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
  assert.ok(blogHtml.includes("← All Essays"), "Missing back link");
  assert.ok(!blogHtml.includes("text-justify"), "Blog prose must not use text-justify");
});

test("project reader renders case study metadata, blockquotes, figures, and guarded source links", () => {
  const projectHtml = fs.readFileSync(
    path.join(SITE, "project", "mwe-bpe", "index.html"),
    "utf8"
  );
  assert.ok(projectHtml.includes('id="article-prose"'), "Missing #article-prose");
  assert.ok(projectHtml.includes("← All Projects"), "Missing back link");
  assert.ok(projectHtml.includes("https://github.com/pegasus-lynx/mwe-bpe"), "Missing source code link");
  assert.ok(projectHtml.includes("<blockquote>"), "Missing rendered blockquote");
  assert.ok(projectHtml.includes("/assets/images/mwe-bpe-score-table.webp"), "Missing figure image");
  assert.ok(!projectHtml.includes("text-justify"), "Project prose must not use text-justify");

  const draftHtml = fs.readFileSync(
    path.join(SITE, "project", "cross-lingual-rdf-extraction", "index.html"),
    "utf8"
  );
  assert.ok(!draftHtml.includes("Source Code ↗"), "Draft with sourcecode:# must omit Source Code button");
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




