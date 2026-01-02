/**
 * CustomViews Plugin for MarkBind
 * Injects the CustomViews auto-init script into every page.
 * Configuration is loaded from websiteBaseUrl/customviews.config.json
 */

// Local Development: ESM Modules, relative directory
// Markbind Deployment: Use unpkg CDN
function getScripts() {
  return [
    '<script src="../../../dist/custom-views.min.js" data-base-url="/customviews"></script>',
    // '<script src="https://unpkg.com/@customviews-js/customviews" data-base-url="/customviews"></script>'
    // '<script src="https://unpkg.com/@customviews-js/customviews@beta" data-base-url="/customviews"></script>'
  ];
};

// CJS: module.exports = { getScripts };
export { getScripts };