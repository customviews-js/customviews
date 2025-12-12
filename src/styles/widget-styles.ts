/**
 * Widget styles for CustomViews
 * Extracted from widget.ts for better maintainability
 * 
 * Note: Styles are kept as a TypeScript string for compatibility with the build system.
 * This approach ensures the styles are properly bundled and don't require separate CSS file handling.
 */

export const WIDGET_STYLES = `
/* Rounded rectangle widget icon styles */
.cv-widget-icon {
  position: fixed;
  /* Slightly transparent by default so the widget is subtle at the page edge */
  background: rgba(255, 255, 255, 0.92);
  color: rgba(0, 0, 0, 0.9);
  opacity: 0.6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9998;
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.cv-widget-icon:hover {
  /* Become fully opaque on hover to improve readability */
  background: rgba(255, 255, 255, 1);
  color: rgba(0, 0, 0, 1);
  opacity: 1;
}

/* Top-right: rounded end on left, sticks out leftward on hover */
.cv-widget-top-right {
  top: 20px;
  right: 0;
  border-radius: 18px 0 0 18px;
  padding-left: 8px;
  justify-content: flex-start;
}

/* Top-left: rounded end on right, sticks out rightward on hover */
.cv-widget-top-left {
  top: 20px;
  left: 0;
  border-radius: 0 18px 18px 0;
  padding-right: 8px;
  justify-content: flex-end;
}

/* Bottom-right: rounded end on left, sticks out leftward on hover */
.cv-widget-bottom-right {
  bottom: 20px;
  right: 0;
  border-radius: 18px 0 0 18px;
  padding-left: 8px;
  justify-content: flex-start;
}

/* Bottom-left: rounded end on right, sticks out rightward on hover */
.cv-widget-bottom-left {
  bottom: 20px;
  left: 0;
  border-radius: 0 18px 18px 0;
  padding-right: 8px;
  justify-content: flex-end;
}

/* Middle-left: rounded end on right, sticks out rightward on hover */
.cv-widget-middle-left {
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  border-radius: 0 18px 18px 0;
  padding-right: 8px;
  justify-content: flex-end;
}

/* Middle-right: rounded end on left, sticks out leftward on hover */
.cv-widget-middle-right {
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  border-radius: 18px 0 0 18px;
  padding-left: 8px;
  justify-content: flex-start;
}

.cv-widget-top-right,
.cv-widget-middle-right,
.cv-widget-bottom-right,
.cv-widget-top-left,
.cv-widget-middle-left,
.cv-widget-bottom-left {
  height: 36px;
  width: 36px;
}

.cv-widget-middle-right:hover,
.cv-widget-top-right:hover,
.cv-widget-bottom-right:hover,
.cv-widget-top-left:hover,
.cv-widget-middle-left:hover,
.cv-widget-bottom-left:hover {
  width: 55px;
}

/* Modal content styles */
.cv-widget-section {
  margin-bottom: 16px;
}

.cv-widget-section:last-child {
  margin-bottom: 0;
}

.cv-widget-section label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #555;
}

.cv-widget-profile-select,
.cv-widget-state-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 14px;
}

.cv-widget-profile-select:focus,
.cv-widget-state-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.cv-widget-profile-select:disabled,
.cv-widget-state-select:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.cv-widget-current {
  margin: 16px 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.cv-widget-current label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
  margin-bottom: 4px;
}

.cv-widget-current-view {
  font-weight: 500;
  color: #333;
}

.cv-widget-reset {
  width: 100%;
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.cv-widget-reset:hover {
  background: #c82333;
}

.cv-widget-reset:active {
  background: #bd2130;
}

/* Responsive design for mobile */
@media (max-width: 768px) {
  .cv-widget-top-right,
  .cv-widget-top-left {
    top: 10px;
  }

  .cv-widget-bottom-right,
  .cv-widget-bottom-left {
    bottom: 10px;
  }

  /* All widgets stay flush with screen edges */
  .cv-widget-top-right,
  .cv-widget-bottom-right,
  .cv-widget-middle-right {
    right: 0;
  }

  .cv-widget-top-left,
  .cv-widget-bottom-left,
  .cv-widget-middle-left {
    left: 0;
  }

  /* Slightly smaller on mobile */
  .cv-widget-icon {
    width: 60px;
    height: 32px;
  }

  .cv-widget-icon:hover {
    width: 75px;
  }
}

/* Modal styles */
.cv-widget-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10002;
  animation: fadeIn 0.2s ease;
}

.cv-widget-modal-overlay.cv-hidden {
  display: none;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.cv-widget-modal {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 32rem;
  width: 90vw;
  max-height: 80vh;
  animation: slideIn 0.2s ease;
  display: flex;
  flex-direction: column;
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to { 
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.cv-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.cv-modal-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cv-modal-icon {
  position: relative;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
}

.cv-modal-icon-svg {
  width: 100%;
  height: 100%;
  opacity: 1;
}

.cv-modal-title {
  font-size: 1.125rem;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.9);
  margin: 0;
}

.cv-modal-close {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: transparent;
  border: none;
  color: rgba(0, 0, 0, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
}

.cv-modal-close:hover {
  background: rgba(62, 132, 244, 0.1);
  color: #3e84f4;
}

.cv-modal-close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.cv-modal-main {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  max-height: calc(80vh - 8rem);
}

.cv-modal-description {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.8);
  margin: 0;
  line-height: 1.4;
}

.cv-content-section,
.cv-tab-groups-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cv-section-heading {
  font-size: 1rem;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.9);
  margin: 0;
}

.cv-widget-modal-actions {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.cv-widget-restore {
  width: 100%;
  padding: 10px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.cv-widget-restore:hover {
  background: #218838;
}

.cv-widget-create-state {
  width: 100%;
  padding: 10px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
}

.cv-widget-create-state:hover {
  background: #0056b3;
}

.cv-widget-theme-dark .cv-widget-modal {
  background: #101722;
  color: #e2e8f0;
}

.cv-widget-theme-dark .cv-modal-header {
  border-color: rgba(255, 255, 255, 0.1);
}

.cv-widget-theme-dark .cv-modal-title {
  color: #e2e8f0;
}

.cv-widget-theme-dark .cv-modal-close {
  color: rgba(255, 255, 255, 0.6);
}

.cv-widget-theme-dark .cv-modal-close:hover {
  background: rgba(62, 132, 244, 0.2);
  color: #3e84f4;
}

.cv-widget-theme-dark .cv-modal-description {
  color: rgba(255, 255, 255, 0.8);
}

.cv-widget-theme-dark .cv-section-heading {
  color: #e2e8f0;
}

.cv-widget-theme-dark .cv-toggles-container
.cv-widget-theme-dark .cv-tabgroups-container {
  border-color: rgba(255, 255, 255, 0.1);
}

.cv-widget-theme-dark .cv-toggle-card,
.cv-widget-theme-dark .cv-tabgroup-card {
  background: #101722;
  border-color: rgba(255, 255, 255, 0.1);
}

.cv-widget-theme-dark .cv-toggle-title,
.cv-widget-theme-dark .cv-tabgroup-title {
  color: #e2e8f0;
}

.cv-widget-theme-dark .cv-toggle-description,
.cv-widget-theme-dark .cv-tabgroup-description {
  color: rgba(255, 255, 255, 0.6);
}

.cv-widget-theme-dark .cv-toggle-slider {
  background: rgba(255, 255, 255, 0.2);
}

.cv-widget-theme-dark .cv-tab-group-description {
  color: rgba(255, 255, 255, 0.8);
}

.cv-widget-theme-dark .cv-tabgroup-select {
  background: #101722;
  border-color: rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
}

.cv-widget-theme-dark .cv-modal-footer {
  border-color: rgba(255, 255, 255, 0.1);
  background: #101722;
}

.cv-widget-theme-dark .cv-reset-btn {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.1);
}

.cv-widget-theme-dark .cv-reset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Custom state creator styles */
.cv-custom-state-modal {
  max-width: 500px;
}

.cv-custom-state-form .cv-section-header {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 5px;
}

.cv-custom-state-form p {
  font-size: 15px;
  line-height: 1.6;
  color: #555;
  margin-bottom: 24px;
  text-align: justify;
}

.cv-custom-state-section {
  margin-bottom: 16px;
}

.cv-custom-state-section label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #555;
}

.cv-custom-state-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 14px;
}

.cv-custom-state-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

/* Toggles Container */
.cv-toggles-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.cv-toggle-card,
.cv-tabgroup-card {
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.cv-toggle-card:last-child {
  border-bottom: none;
}

.cv-toggle-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
}

.cv-toggle-title {
  font-weight: 500;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.9);
  margin: 0 0 0.125rem 0;
}

.cv-toggle-description {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}

.cv-toggle-label{
  position: relative;
  display: inline-block;
  width: 2.75rem;
  height: 1.5rem;
  cursor: pointer;
}

.cv-toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.cv-toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 9999px;
  transition: background-color 0.2s ease;
}

.cv-toggle-slider:before {
  position: absolute;
  content: "";
  height: 1rem;
  width: 1rem;
  left: 0.25rem;
  bottom: 0.25rem;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.cv-toggle-input:checked + .cv-toggle-slider {
  background: #3e84f4;
}

.cv-toggle-input:checked + .cv-toggle-slider:before {
  transform: translateX(1.25rem);
}

/* Dark theme toggle switch styles */
.cv-widget-theme-dark .cv-toggle-switch {
  background: #4a5568;
}

.cv-widget-theme-dark .cv-toggle-switch:hover {
  background: #5a6578;
}

.cv-widget-theme-dark .cv-toggle-switch.cv-toggle-active {
  background: #63b3ed;
}

.cv-widget-theme-dark .cv-toggle-switch.cv-toggle-active:hover {
  background: #4299e1;
}

/* Tab Groups Container */
.cv-tab-groups-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
}

/* Tab Group Card - Header (Navigation Headers toggle) */
.cv-tabgroup-card.cv-tabgroup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-bottom: 0px;
}

.cv-tabgroup-card.cv-tabgroup-header .cv-tabgroup-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 1rem;
}

/* Navigation toggle icon container */
.cv-nav-toggle-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cv-nav-icon {
  width: 2rem;
  height: 2rem;
  color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: color 0.2s ease;
}

/* Logo box - centered grey box on its own row */
.cv-tabgroup-logo-box {
  width: 3.5rem;
  height: 3.5rem;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: 0.5rem;
}

/* Title container for title alignment (without icon) */
.cv-tabgroup-title-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Hover state for icon - apply to the entire tabgroup-row */
.cv-tabgroup-card.cv-tabgroup-header:hover .cv-nav-icon {
  color: #3e84f4;
}

.cv-widget-theme-dark .cv-nav-icon {
  color: rgba(255, 255, 255, 0.8);
}

.cv-widget-theme-dark .cv-tabgroup-card.cv-tabgroup-header:hover .cv-nav-icon {
  color: #60a5fa;
}

/* Tab Group Card - Items */
.cv-tabgroup-card.cv-tabgroup-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.cv-tabgroup-card.cv-tabgroup-item:last-child {
  border-bottom: none;
}

/* Tab Group Info */
.cv-tabgroup-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cv-tabgroup-title {
  font-weight: 500;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.9);
  margin: 0 0 0 0;
}

.cv-tabgroup-description {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
  line-height: 1.3;
}

/* Tab Group Label (for select dropdowns) */
.cv-tabgroup-label {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.8);
  margin: 0;
  line-height: 1.4;
  font-weight: 500;
  display: block;
  cursor: pointer;
}

/* Tab Group Select */
.cv-tabgroup-select {
  width: 100%;
  border-radius: 0.5rem;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.15);
  color: rgba(0, 0, 0, 0.9);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.cv-tabgroup-select:hover {
  border-color: rgba(0, 0, 0, 0.25);
}

.cv-tabgroup-select:focus {
  outline: none;
  border-color: #3e84f4;
  box-shadow: 0 0 0 2px rgba(62, 132, 244, 0.2);
}

/* Modern Toggle Switch */
.cv-toggle-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 44px;
  height: 24px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 9999px;
  padding: 2px;
  box-sizing: border-box;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: none;
}

.cv-toggle-switch input {
  display: none;
}

.cv-toggle-switch .cv-switch-bg {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
  pointer-events: none;
}

.cv-toggle-switch .cv-switch-knob {
  position: relative;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s ease;
  z-index: 1;
}

.cv-toggle-switch input:checked + .cv-switch-bg {
  background: #3e84f4;
}

.cv-toggle-switch input:checked ~ .cv-switch-knob {
  transform: translateX(20px);
}

/* Dark Theme - Tab Groups */
.cv-widget-theme-dark .cv-tabgroup-card.cv-tabgroup-header {
  background: #101722;
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.cv-widget-theme-dark .cv-tabgroup-card.cv-tabgroup-item {
  background: #101722;
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.cv-widget-theme-dark .cv-tabgroup-title {
  color: #e2e8f0;
}

.cv-widget-theme-dark .cv-tabgroup-description {
  color: rgba(255, 255, 255, 0.6);
}

.cv-widget-theme-dark .cv-tabgroup-label {
  color: rgba(255, 255, 255, 0.8);
}

.cv-widget-theme-dark .cv-tab-groups-list {
  border-color: rgba(255, 255, 255, 0.1);
}

.cv-widget-theme-dark .cv-tabgroup-select {
  background: #101722;
  border-color: rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
}

.cv-widget-theme-dark .cv-tabgroup-select:hover {
  border-color: rgba(255, 255, 255, 0.25);
}

.cv-widget-theme-dark .cv-tabgroup-select:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}

/* Dark Theme - Toggle Switch */
.cv-widget-theme-dark .cv-toggle-switch .cv-switch-bg {
  background: rgba(255, 255, 255, 0.1);
}

.cv-widget-theme-dark .cv-toggle-switch .cv-switch-knob {
  background: #e2e8f0;
}

.cv-widget-theme-dark .cv-toggle-switch input:checked + .cv-switch-bg {
  background: #63b3ed;
}

.cv-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.cv-reset-btn,
.cv-share-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.cv-reset-btn {
  color: rgba(0, 0, 0, 0.9);
  background: rgba(0, 0, 0, 0.1);
}

.cv-reset-btn:hover {
  background: rgba(0, 0, 0, 0.2);
}

.cv-share-btn {
  color: white;
  background: #3e84f4;
}

.cv-share-btn:hover {
  background: rgba(62, 132, 244, 0.9);
}

.cv-btn-icon {
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

/* Dark theme custom state styles */
/* Welcome modal styles */
.cv-welcome-modal {
  max-width: 32rem;
  width: 90vw;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideIn 0.2s ease;
  display: flex;
  flex-direction: column;
}

.cv-modal-main {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  max-height: calc(80vh - 8rem);
}

.cv-welcome-message {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.8);
  margin: 0;
  line-height: 1.4;
  text-align: center;
}

.cv-welcome-message a {
  color: #3e84f4;
  text-align: justify;
  text-decoration: none;
}

.cv-welcome-message a:hover {
  text-decoration: underline;
}

.cv-welcome-widget-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.cv-welcome-widget-icon {
  width: 2rem;
  height: 2rem;
  background: rgba(62, 132, 244, 0.1);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: cv-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  color: #3e84f4;
}

.cv-welcome-widget-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
  margin: 0;
}

.cv-welcome-got-it {
  width: 100%;
  background: #3e84f4;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s ease;
  outline: none;
}

.cv-welcome-got-it:hover {
  background: rgba(62, 132, 244, 0.9);
}

.cv-welcome-got-it:focus {
  box-shadow: 0 0 0 2px rgba(62, 132, 244, 0.5);
}

/* Animations */
@keyframes cv-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Dark theme welcome modal styles */
.cv-widget-theme-dark .cv-welcome-modal {
  background: #101722;
}

.cv-widget-theme-dark .cv-welcome-message {
  color: rgba(255, 255, 255, 0.8);
}

.cv-widget-theme-dark .cv-welcome-message a {
  color: #60a5fa;
}

.cv-widget-theme-dark .cv-welcome-widget-preview {
  background: rgba(255, 255, 255, 0.1);
}

.cv-widget-theme-dark .cv-welcome-widget-label {
  color: #e2e8f0;
}

/* Dark theme logo box */
.cv-widget-theme-dark .cv-tabgroup-logo-box {
  background: rgba(255, 255, 255, 0.1);
}

/* Spinning animation for reset button icon */
@keyframes cv-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

.cv-spinning {
  animation: cv-spin 0.6s ease-in-out;
}

/* Hide widget icon in print view */
@media print {
  .cv-widget-icon {
    display: none !important;
  }
}
/* Widget Modal Tabs */
.cv-modal-tabs {
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.cv-modal-tab {
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cv-modal-tab:hover {
  color: rgba(0, 0, 0, 0.9);
}

.cv-modal-tab.active {
  color: #3e84f4;
  border-bottom-color: #3e84f4;
}

.cv-tab-content {
  display: none;
  animation: fadeIn 0.3s ease;
}

.cv-tab-content.active {
  display: block;
}

/* Share Tab Content */
.cv-share-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
  align-items: center;
  text-align: center;
}

.cv-share-instruction {
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 1rem;
}

.cv-share-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 12px 16px;
  background: white;
  color: #333;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cv-share-action-btn:hover {
  background: #f8f9fa;
  border-color: rgba(0, 0, 0, 0.25);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.cv-share-action-btn.primary {
  background: #3e84f4;
  color: white;
  border-color: #3e84f4;
}

.cv-share-action-btn.primary:hover {
  background: #2b74e6;
  border-color: #2b74e6;
}

.cv-done-btn {
  padding: 0.375rem 1rem;
  background: #3e84f4;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cv-done-btn:hover {
  background: #2b74e6;
}

/* Dark Theme Adjustments */
.cv-widget-theme-dark .cv-modal-tabs {
  border-color: rgba(255, 255, 255, 0.1);
}

.cv-widget-theme-dark .cv-modal-tab {
  color: rgba(255, 255, 255, 0.6);
}

.cv-widget-theme-dark .cv-modal-tab:hover {
  color: rgba(255, 255, 255, 0.9);
}

.cv-widget-theme-dark .cv-modal-tab.active {
  color: #60a5fa;
  border-bottom-color: #60a5fa;
}

.cv-widget-theme-dark .cv-share-instruction {
  color: rgba(255, 255, 255, 0.7);
}

.cv-widget-theme-dark .cv-share-action-btn {
  background: #1a202c;
  color: white;
  border-color: rgba(255, 255, 255, 0.15);
}

.cv-widget-theme-dark .cv-share-action-btn:hover {
  background: #2d3748;
}

.cv-widget-theme-dark .cv-share-action-btn.primary {
  background: #3e84f4;
  border-color: #3e84f4;
}

.cv-widget-theme-dark .cv-share-action-btn.primary:hover {
  background: #2b74e6;
}
`;

/**
 * Inject widget styles into the document head
 */
export function injectWidgetStyles(): void {
  // Check if styles are already injected
  if (document.querySelector('#cv-widget-styles')) return;

  const style = document.createElement('style');
  style.id = 'cv-widget-styles';
  style.textContent = WIDGET_STYLES;
  document.head.appendChild(style);
}
