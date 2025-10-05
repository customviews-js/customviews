/**
 * Styles for tab groups and tab navigation
 */

export const TAB_STYLES = `
/* Tab navigation styles - Bootstrap-style tabs matching MarkBind */
.cv-tabs-nav {
  display: flex;
  flex-wrap: wrap;
  padding-left: 0;
  margin-bottom: 1rem;
  list-style: none;
  border-bottom: 1px solid #dee2e6;
}

.cv-tabs-nav .nav-item {
  margin-bottom: -1px;
  list-style: none;
  display: inline-block;
}

.cv-tabs-nav .nav-link {
  display: block;
  padding: 0.5rem 1rem;
  color: #495057;
  text-decoration: none;
  background-color: transparent;
  border: 1px solid transparent;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
  cursor: pointer;
}

.cv-tabs-nav .nav-link:hover,
.cv-tabs-nav .nav-link:focus {
  border-color: #e9ecef #e9ecef #dee2e6;
  isolation: isolate;
}

.cv-tabs-nav .nav-link.active {
  color: #495057;
  background-color: #fff;
  border-color: #dee2e6 #dee2e6 #fff;
}

.cv-tabs-nav .nav-link:focus {
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Legacy button-based nav (deprecated, kept for compatibility) */
.cv-tabs-nav-item {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  color: #6c757d;
  transition: color 150ms ease, border-color 150ms ease;
}

.cv-tabs-nav-item:hover {
  color: #495057;
  border-bottom-color: #dee2e6;
}

.cv-tabs-nav-item.active {
  color: #007bff;
  border-bottom-color: #007bff;
  font-weight: 500;
}

.cv-tabs-nav-item:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Tab panel base styles */
cv-tab {
  display: block;
}

/* Override visibility for tab panels - use display instead of collapse animation */
cv-tab.cv-hidden {
  display: none !important;
}

cv-tab.cv-visible {
  display: block !important;
}

cv-tabgroup {
  display: block;
  margin-bottom: 1.5rem;
}

/* Bottom border line for tab groups */
.cv-tabgroup-bottom-border {
  border-bottom: 1px solid #dee2e6;
  margin-top: 1rem;
}

/* Tab content wrapper */
.cv-tab-content {
  padding: 1rem 0;
}
`;
