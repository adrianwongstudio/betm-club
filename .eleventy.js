module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/images");

  eleventyConfig.addCollection("posts", (collection) =>
    collection.getFilteredByGlob("src/posts/*.md").reverse()
  );

  eleventyConfig.addShortcode("year", () => new Date().getFullYear());

  eleventyConfig.addFilter("formatDate", (value) => {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  });

  eleventyConfig.addFilter("limit", (arr, n) => (Array.isArray(arr) ? arr.slice(0, n) : []));

  // Convert newlines in a plain-text field into <br> tags. Editors can add a
  // line break just by pressing Enter in a text field in PagesCMS.
  const escapeHtml = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  eleventyConfig.addFilter("nl2br", (value) => {
    if (value == null) return "";
    return escapeHtml(value).replace(/\r?\n/g, "<br>");
  });

  eleventyConfig.setServerPassthroughCopyBehavior("copy");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
