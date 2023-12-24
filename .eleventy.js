const eleventyGoogleFonts = require("eleventy-google-fonts");
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const { DateTime } = require("luxon");

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

  eleventyConfig.addWatchTarget("src/assets/js/");
  eleventyConfig.addPassthroughCopy("src/assets/images/");
  eleventyConfig.addPlugin(eleventyGoogleFonts);

  eleventyConfig.addCollection("gallery", () => {
    const galleryPath = path.resolve(__dirname, "./src/assets/images/gallery");
    const files = fs.readdirSync(galleryPath);

    return files.map((file) => {
      return {
        name: file.split(".")[0],
        src: `/assets/images/gallery/${file}`,
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

  return {
    passthroughFileCopy: true,
    markdownTemplateEngine: "njk",
    dir: {
      input: 'src',
      output: '_site'  // This is the default value anyhow
    }
  };
};