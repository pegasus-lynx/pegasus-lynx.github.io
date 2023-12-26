const eleventyGoogleFonts = require("eleventy-google-fonts");
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const { DateTime } = require("luxon");
const Image = require('@11ty/eleventy-img');


const stringifyAttributes = (attributeMap) => {
  return Object.entries(attributeMap)
    .map(([attribute, value]) => {
      if (typeof value === 'undefined') return '';
      return `${attribute}="${value}"`;
    })
    .join(' ');
};


module.exports = function (eleventyConfig) {
  
  eleventyConfig.on("eleventy.before", async () => {
    await esbuild.build({
      entryPoints: ["src/assets/js/index.js"],
      bundle: true,
      outfile: "_site/js/bundle.js",
      sourcemap: true,
      target: ["chrome58", "firefox57", "safari11", "edge16"],
    });
  });

  eleventyConfig.addPlugin(eleventyGoogleFonts);

  eleventyConfig.addWatchTarget("src/assets/js/");
  
  eleventyConfig.addPassthroughCopy({"src/assets/images/*.webp": "assets/images/"});
  eleventyConfig.addPassthroughCopy("src/assets/images/favicons/");
  eleventyConfig.addPassthroughCopy("src/assets/css/");

  eleventyConfig.addCollection("gallery", () => {
    const galleryPath = path.resolve(__dirname, "./src/assets/images/gallery");
    const files = fs.readdirSync(galleryPath);

    return files.map((file) => {
      return {
        src: `./src/assets/images/gallery/${file}`,
        alt: file,
      };
    });
  });

  eleventyConfig.addFilter("postDate", (date) => {
    console.log(date);
    return DateTime.fromFormat(date, 'dd-MM-yyyy').toLocaleString(DateTime.DATE_MED);
  });

  eleventyConfig.addFilter("postMonth", (date) => {
    if(date === 'Present') return date;
    return DateTime.fromFormat(date, 'dd-MM-yyyy').toFormat('LLL, yyyy');
  });

  eleventyConfig.addShortcode("image", async function (src, alt, widths, classname = "") {
    let metadata = await Image(src, {
      widths: [...widths],
      formats: ["webp"],
      urlPath: "/assets/images/gallery",
      outputDir: "./_site/assets/images/gallery/",
      filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src);
        const name = path.basename(src, extension);
        return `${name}-${width}w.${format}`;
      }
    });

    const imgAttributes = stringifyAttributes({
      src: metadata.webp[0].url,
      loading: 'lazy',
      decoding: 'async',
      class: classname,
    });
    
    return `<img ${imgAttributes}>`;
  });

  return {
    passthroughFileCopy: true,
    markdownTemplateEngine: "njk",
    dir: {
      input: 'src',
      output: '_site'  // This is the default value anyhow
    }
  };
};