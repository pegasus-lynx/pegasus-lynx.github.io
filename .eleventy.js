const eleventyGoogleFonts = require("eleventy-google-fonts");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("style.css");
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