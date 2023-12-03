const eleventyGoogleFonts = require("eleventy-google-fonts");
const esbuild = require("esbuild");

module.exports = function(eleventyConfig) {
  // eleventyConfig.on("eleventy.before", async () => {
  //   await esbuild.build({
  //     entryPoints: ["src/assets/js/index.js"],
  //     bundle: true,
  //     outfile: "_site/js/bundle.js",
  //     sourcemap: true,
  //     target: ["chrome58", "firefox57", "safari11", "edge16"],
  //   });
  // });

  // eleventyConfig.addWatchTarget("src/assets/js/");
  eleventyConfig.addPassthroughCopy("src/assets/images/");
  eleventyConfig.addPlugin(eleventyGoogleFonts);

    return {
      passthroughFileCopy: true,
      // markdownTemplateEngine: "njk",
      // htmlTemplateEngine: "njk",
      // templateFormats: ["html", "liquid", "njk"],
      dir: {
        input: 'src',
        output: '_site'  // This is the default value anyhow
      }
    };
  };