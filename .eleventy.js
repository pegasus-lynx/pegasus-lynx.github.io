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

  eleventyConfig.addCollection("visibleTags", (collectionApi) => {
    const tagMap = new Map();
    const visibleItems = collectionApi
      .getAll()
      .filter(
        (item) =>
          item.data.show !== false &&
          Array.isArray(item.data.tags) &&
          (item.data.tags.includes("Blog") || item.data.tags.includes("Project"))
      );

    for (const item of visibleItems) {
      for (const tag of item.data.tags) {
        if (META_TAGS.has(tag)) continue;
        if (!tagMap.has(tag)) tagMap.set(tag, []);
        tagMap.get(tag).push(item);
      }
    }

    return Array.from(tagMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, items]) => ({
        name,
        items: items.sort(
          (a, b) =>
            parseDdMmYyyy(b.data.publishdate || b.data.startdate) -
            parseDdMmYyyy(a.data.publishdate || a.data.startdate)
        ),
      }));
  });

  eleventyConfig.addFilter("postDate", (date) => {
    if (!date) return "";
    const dt = DateTime.fromFormat(String(date).trim(), "dd-MM-yyyy");
    return dt.isValid ? dt.toLocaleString(DateTime.DATE_MED) : String(date);
  });

  eleventyConfig.addFilter("postMonth", (date) => {
    if (!date) return "";
    if (String(date).trim() === "Present") return "Present";
    const dt = DateTime.fromFormat(String(date).trim(), "dd-MM-yyyy");
    return dt.isValid ? dt.toFormat("LLL yyyy") : String(date);
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