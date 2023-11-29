module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("style.css");

    return {
      markdownTemplateEngine: "njk",
      htmlTemplateEngine: "njk",
      templateFormats: ["html", "liquid", "njk"],
      dir: {
        input: 'src',
        output: '_site'  // This is the default value anyhow
      }
    };
  };