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

  // Turn any YouTube/Vimeo URL an editor pastes into a clean embed URL.
  // Any other URL passes through unchanged.
  eleventyConfig.addFilter("videoEmbedUrl", (url) => {
    if (!url) return "";
    let m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
    m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return `https://player.vimeo.com/video/${m[1]}`;
    return url;
  });

  // True when the URL points at a video file we should render with <video>.
  eleventyConfig.addFilter("isVideoFile", (url) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url || ""));

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
