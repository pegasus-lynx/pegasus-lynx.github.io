const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const markdownIt = require("markdown-it");
const { DateTime } = require("luxon");
const Image = require("@11ty/eleventy-img");
const { renderIcon } = require("./src/_data/icons.js");

const stringifyAttributes = (attributeMap) =>
  Object.entries(attributeMap)
    .filter(([, value]) => typeof value !== "undefined")
    .map(([attribute, value]) => `${attribute}="${value}"`)
    .join(" ");

function slugifyHeading(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[`*_~]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseDdMmYyyy(value) {
  if (!value || String(value).trim() === "Present") {
    return DateTime.now().toMillis();
  }
  const dt = DateTime.fromFormat(String(value).trim(), "dd-MM-yyyy");
  return dt.isValid ? dt.toMillis() : 0;
}

function formatPostDate(date) {
  if (!date) return "";
  const dt = DateTime.fromFormat(String(date).trim(), "dd-MM-yyyy");
  return dt.isValid ? dt.toLocaleString(DateTime.DATE_MED) : String(date);
}

function formatPostMonth(date) {
  if (!date) return "";
  if (String(date).trim() === "Present") return "Present";
  const dt = DateTime.fromFormat(String(date).trim(), "dd-MM-yyyy");
  return dt.isValid ? dt.toFormat("LLL yyyy") : String(date);
}

function stripHtmlToText(html) {
  if (!html) return "";
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&lt;|&gt;|[<>]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const META_TAGS = new Set(["all", "Blog", "Project", "gallery"]);

module.exports = function (eleventyConfig) {
  eleventyConfig.ignores.add("src/**/v1/**");

  eleventyConfig.on("eleventy.before", async ({ runMode }) => {
    if (runMode === "build") {
      fs.rmSync(path.resolve(__dirname, "_site"), { recursive: true, force: true });
    }
    await esbuild.build({
      entryPoints: ["src/assets/js/index.js"],
      bundle: true,
      outfile: "_site/js/bundle.js",
      sourcemap: true,
      target: ["es2020"],
    });
  });

  const md = markdownIt({ html: true, linkify: true, typographer: true });
  const defaultHeadingOpen =
    md.renderer.rules.heading_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.heading_open = function (tokens, idx, options, env, self) {
    const inlineToken = tokens[idx + 1];
    if (inlineToken && inlineToken.type === "inline" && inlineToken.content) {
      env._headingSlugs = env._headingSlugs || {};
      const base = slugifyHeading(inlineToken.content) || "section";
      const count = env._headingSlugs[base] || 0;
      env._headingSlugs[base] = count + 1;
      const slug = count === 0 ? base : `${base}-${count}`;
      tokens[idx].attrSet("id", slug);
    }
    return defaultHeadingOpen(tokens, idx, options, env, self);
  };
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addWatchTarget("src/assets/js/");

  eleventyConfig.addPassthroughCopy({ "src/assets/images/*.webp": "assets/images/" });
  eleventyConfig.addPassthroughCopy("src/assets/images/favicons/");
  eleventyConfig.addPassthroughCopy("CNAME");

  eleventyConfig.addCollection("gallery", async () => {
    const galleryPath = path.resolve(__dirname, "./src/assets/images/gallery");
    const files = fs.readdirSync(galleryPath).sort();
    return Promise.all(
      files.map(async (file) => {
        const src = `./src/assets/images/gallery/${file}`;
        const alt = file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        const metadata = await Image(src, {
          widths: [720],
          formats: ["webp"],
          urlPath: "/assets/images/gallery",
          outputDir: "./_site/assets/images/gallery/",
          filenameFormat: function (id, imgSrc, width, format) {
            const extension = path.extname(imgSrc);
            const name = path.basename(imgSrc, extension);
            return `${name}-${width}w.${format}`;
          },
        });
        const output = metadata.webp[0];
        return {
          src,
          url: output.url,
          width: output.width,
          height: output.height,
          orientation: output.width > output.height ? "landscape" : "portrait",
          alt,
        };
      })
    );
  });

  eleventyConfig.addCollection("blogsSorted", (collectionApi) =>
    collectionApi
      .getFilteredByTag("Blog")
      .filter((item) => item.data.show !== false)
      .sort((a, b) => parseDdMmYyyy(b.data.publishdate) - parseDdMmYyyy(a.data.publishdate))
  );

  eleventyConfig.addCollection("projectsSorted", (collectionApi) =>
    collectionApi
      .getFilteredByTag("Project")
      .filter((item) => item.data.show !== false)
      .sort((a, b) => parseDdMmYyyy(b.data.startdate) - parseDdMmYyyy(a.data.startdate))
  );

  const collectVisibleTags = (items) => {
    const tagMap = new Map();
    for (const item of items) {
      if (!Array.isArray(item.data.tags)) continue;
      for (const tag of item.data.tags) {
        if (META_TAGS.has(tag)) continue;
        if (!tagMap.has(tag)) tagMap.set(tag, []);
        tagMap.get(tag).push(item);
      }
    }

    return Array.from(tagMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, tagItems]) => ({
        name,
        items: tagItems.sort(
          (a, b) =>
            parseDdMmYyyy(b.data.publishdate || b.data.startdate) -
            parseDdMmYyyy(a.data.publishdate || a.data.startdate)
        ),
      }));
  };

  eleventyConfig.addCollection("visibleTags", (collectionApi) =>
    collectVisibleTags(
      collectionApi
        .getAll()
        .filter(
          (item) =>
            item.data.show !== false &&
            Array.isArray(item.data.tags) &&
            (item.data.tags.includes("Blog") || item.data.tags.includes("Project"))
        )
    )
  );

  eleventyConfig.addCollection("projectTags", (collectionApi) =>
    collectVisibleTags(
      collectionApi
        .getFilteredByTag("Project")
        .filter((item) => item.data.show !== false)
    )
  );

  eleventyConfig.addCollection("blogTags", (collectionApi) =>
    collectVisibleTags(
      collectionApi
        .getFilteredByTag("Blog")
        .filter((item) => item.data.show !== false)
    )
  );

  eleventyConfig.addFilter("postDate", formatPostDate);

  eleventyConfig.addFilter("postMonth", formatPostMonth);

  eleventyConfig.addFilter("mdInline", (value) => {
    if (!value) return "";
    const html = md.renderInline(String(value));
    return html.replace(/<a\s+href="([^"]+)"([^>]*)>/g, (match, href, rest) => {
      const isExternal = /^https?:\/\//i.test(href);
      const extAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${href}"${rest}${extAttrs} class="ec-inline-link">`;
    });
  });

  eleventyConfig.addFilter("buildSearchIndexJson", (collections) => {
    const slugify = eleventyConfig.getFilter("slugify");
    const extractPlainText = (item) => {
      const rawSource = fs.readFileSync(item.inputPath, "utf8");
      const bodySource = rawSource
        .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "")
        .replace(/\{#[\s\S]*?#\}/g, " ")
        .replace(/\{%[\s\S]*?%\}/g, " ")
        .replace(/\{\{[\s\S]*?\}\}/g, " ");
      return stripHtmlToText(md.render(bodySource, {}));
    };

    const mapVisibleTags = (rawTags) =>
      (Array.isArray(rawTags) ? rawTags : [])
        .filter((t) => !META_TAGS.has(t))
        .map((name) => ({ name, slug: slugify(name) }));

    const projectItems = (collections.projectsSorted || []).map((item) => ({
      title: item.data.title || "",
      url: item.url,
      type: "project",
      dateLabel: `${formatPostMonth(item.data.startdate)} — ${formatPostMonth(item.data.enddate)}`,
      sortTimestamp: parseDdMmYyyy(item.data.startdate),
      description: item.data.description || "",
      tags: mapVisibleTags(item.data.tags),
      content: extractPlainText(item),
    }));

    const blogItems = (collections.blogsSorted || []).map((item) => {
      const pubLabel = formatPostDate(item.data.publishdate);
      const externalUrl = item.data.external_url ? String(item.data.external_url) : "";
      const externalSite = item.data.external_site ? String(item.data.external_site) : "";
      const metaParts = [pubLabel];
      if (item.data.readingtime) metaParts.push(`${item.data.readingtime} read`);
      if (externalSite) metaParts.push(externalSite);
      return {
        title: item.data.title || "",
        url: externalUrl || item.url,
        type: "blog",
        external: Boolean(externalUrl),
        externalSite,
        dateLabel: metaParts.filter(Boolean).join(" · "),
        sortTimestamp: parseDdMmYyyy(item.data.publishdate),
        description: item.data.description || "",
        tags: mapVisibleTags(item.data.tags),
        content: extractPlainText(item),
      };
    });

    const items = [...projectItems, ...blogItems].sort(
      (a, b) => b.sortTimestamp - a.sortTimestamp
    );

    const tags = (collections.visibleTags || []).map((tagObj) => ({
      name: tagObj.name,
      slug: slugify(tagObj.name),
      count: tagObj.items.length,
    }));

    return JSON.stringify({ items, tags });
  });

  eleventyConfig.addShortcode("icon", (name, className = "w-4 h-4") =>
    renderIcon(name, className)
  );

  eleventyConfig.addShortcode("image", async function (src, alt, widths, classname = "") {
    const metadata = await Image(src, {
      widths: [...widths],
      formats: ["webp"],
      urlPath: "/assets/images/gallery",
      outputDir: "./_site/assets/images/gallery/",
      filenameFormat: function (id, imgSrc, width, format) {
        const extension = path.extname(imgSrc);
        const name = path.basename(imgSrc, extension);
        return `${name}-${width}w.${format}`;
      },
    });

    const output = metadata.webp[0];
    const imgAttributes = stringifyAttributes({
      src: output.url,
      width: output.width,
      height: output.height,
      alt: alt || "",
      loading: "lazy",
      decoding: "async",
      class: classname,
    });

    return `<img ${imgAttributes}>`;
  });

  return {
    passthroughFileCopy: true,
    markdownTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "_site",
    },
  };
};