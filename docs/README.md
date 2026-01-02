# Custom Views Library Documentation

This directory contains the comprehensive documentation and live demo for the Custom Views library.

## Quick Start

### For Development
1. Install MarkBind: `npm install -g markbind-cli`
2. Navigate to docs directory: `cd docs`
3. Start development server: `markbind serve`
4. Open http://localhost:8080

### For Production Build
1. Build the site: `markbind build`
2. Deploy the `_site` directory

## Interactive Demo

The documentation includes a fully functional demo that demonstrates:


- Profile and state management
- URL parameter handling
- Persistence across sessions
- Widget-based user interaction

Use the "Custom Views" settings icon in the middle-left corner to interact with the demo.


## Development Notes

- The site uses MarkBind for static site generation
- The Custom Views library is loaded from unpkg CDN
- Plugin configuration is in `_markbind/plugins/customviews.js`
- `baseUrl: '/customviews'` is configured for GitHub Pages deployment
- Documentation pages demonstrate the library in action


