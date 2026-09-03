# ROCIsApp.github.io - Architecture

## System Overview
- **Domain**: https://rocisapps.com
- **Tech Stack**: Semantic HTML5, Vanilla CSS3 (Glassmorphism & Theme Variables), Vanilla ES6 JavaScript
- **Hosting**: GitHub Pages (Custom CNAME `rocisapps.com`, HTTPS enforced)

## Key Components
1. **Three-Way Theme Engine**: Toggle cycle between `Light`, `Dark` (Obsidian), and `AMOLED` (Pitch black). State persisted in `localStorage`.
2. **Interactive Mockup Simulator**: Real-time simulated Flutter app preview embedded on `index.html`, dynamically restyled when the theme changes.
3. **Multi-Page Layout**: `index.html`, `about.html`, `contact.html`, `privacy.html`, `terms.html`.
4. **SEO & Structured Data**: Schema.org JSON-LD organization metadata, Google Analytics 4 (`G-3TJ6TLY6Y8`), `sitemap.xml`, `robots.txt`.
