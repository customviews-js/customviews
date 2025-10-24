/**
 * CustomViews Plugin for MarkBind
 * Injects the CustomViews auto-init script into every page.
 * Configuration is loaded from /customviews.config.json
 */
// '<script src="../../../dist/custom-views.min.js" data-base-url="/customviews"></script>'
function getScripts() {
  return [
    '<script src="https://unpkg.com/@customviews-js/customviews"></script>'
  ];
};

module.exports = { getScripts };