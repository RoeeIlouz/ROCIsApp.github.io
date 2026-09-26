---
ontology: true
type: architecture
domain: rocisapps-website
summary: Structure, theming and security model of the rocisapps.com static site on GitHub Pages
tags: [website, github-pages, csp, security, theming]
related: [FEATURES, SUMMARY]
relatedTo: [rocisapps-website, rocis-tasks, rocis-schedule]
status: active
---

# ROCIsApp.github.io - Architecture

## System Overview
- **Domain**: https://rocisapps.com
- **Tech Stack**: Semantic HTML5, vanilla CSS (design tokens per theme), vanilla ES2020 JavaScript. No build step.
- **Hosting**: GitHub Pages (custom CNAME `rocisapps.com`, HTTPS enforced). `.nojekyll` makes Pages serve files as-is, including `/.well-known/`.

## Files
| File | Role |
|------|------|
| `index.html`, `about.html`, `contact.html`, `privacy.html`, `terms.html`, `404.html` | Pages. They share the same `<head>`, nav and footer, so keep them in sync when editing. |
| `style.css` | All styles. Tokens at the top: `:root` / `[data-theme="light"]`, `[data-theme="dark"]`, `[data-theme="amoled"]`. |
| `theme-init.js` | Loaded synchronously in `<head>`. Applies the saved theme before first paint (no flash). Whitelists the value. |
| `analytics.js` | GA4 config (`G-3TJ6TLY6Y8`), Google signals and ad personalisation off. |
| `script.js` | Theme toggle, mobile nav, app simulator, live demo parser, screenshot tabs and `<dialog>` lightbox, copy-email. |
| `fonts/` | Self-hosted Neuton and Outfit (SIL OFL). No Google Fonts requests. |
| `Assets/web/` | Optimised WebP screenshots (480w thumbs, 1080w full), icons, favicons, `og-cover.jpg` (1200x630). Originals stay in `Assets/`. |
| `.well-known/security.txt` | RFC 9116 security contact. Renew `Expires` yearly. |

## Security model
GitHub Pages can't set response headers, so the policy is delivered as `<meta>` tags on every page:

- **Content-Security-Policy**: `default-src 'self'`. Scripts come only from self and `www.googletagmanager.com`. Styles and fonts come only from self. Images come from self, `data:`, Product Hunt and GA. `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`, `frame-src 'none'` and `upgrade-insecure-requests` are set.
- **Rules that keep the CSP intact**: no inline `<script>` (JSON-LD data blocks are fine), no `onclick=` handlers and no `style=""` attributes. Put behaviour in `script.js` and styling in `style.css`. Setting `el.style.*` from JS is allowed.
- **DOM safety**: dynamic text is written with `textContent` and `createElement`, never `innerHTML`.
- **Referrer policy**: `strict-origin-when-cross-origin`. The Product Hunt badge uses `referrerpolicy="no-referrer"`.
- **Headers a meta tag can't set**: `frame-ancestors`, `X-Frame-Options`, HSTS preload and `Permissions-Policy` need a proxy such as Cloudflare in front of Pages.

## Theming
There are three themes: Light, Dark (the default) and AMOLED. The choice is stored in `localStorage.theme` and set as `data-theme` on `<html>`. Every text and fill token pair meets WCAG AA in each theme. Use the `--*-ink` tokens for text and the `--*-fill` / `--*-on` tokens for filled buttons. `.is-schedule` switches a section's accent (`--acc-*`) to ROCIs Schedule teal.

## Legal pages
`privacy.html` is referenced by the Google OAuth consent screen. Its wording and the anchors `#schedule` and `#google-user-data` must not change without a matching update in Google Cloud Console.
