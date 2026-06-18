# SanFlorence Digital — Studio Website

The public studio website for **SanFlorence Digital LLC**, an iOS studio in the San Francisco Bay Area. It showcases released apps (Mes, Home Wedding Decor AI) over a bold, animated red→black backdrop, and serves as the App Store destination for Terms, Privacy, FAQ, and support. Signature elements: a giant cursor-reactive "SanFlorence" wordmark, a liquid/chromatic WebGL hover on the hero text, and an auto-scrolling app marquee.

## Live URL

https://gaziyeasinarifin.github.io/sanflorence/ — (or a custom domain once configured)

## Tech

Pure static **HTML / CSS / JS** — no framework or build tool; only Google Fonts (Outfit) from the CDN. Pages: `index.html`, `faq.html`, `terms.html`, `privacy.html`. Shared chrome (nav, full-screen mobile menu, footer, glass reading-page layout) lives in `assets/site.css` + `assets/site.js`; the homepage keeps its WebGL effects inline. A full-screen mobile menu appears at ≤768px, and all animations honor `prefers-reduced-motion`.

## Local development

Just open `index.html` in a browser. For a local server (so relative asset paths resolve identically to production):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy (GitHub Pages)

In the repository: **Settings → Pages → Source: Deploy from a branch → `main` → `/ (root)`**. The site publishes at the Live URL above. Vercel static hosting works too — point it at the repo root with no build command.

## Before going live — replace placeholders

- [x] Real App Store links wired in `index.html` (Mes, Home Wedding Decor AI)
- [ ] Real app icons in `assets/icons/` (`mes-icon.png`, `diydecor-icon.png`, 1024×1024) and swap the gradient placeholders for `<img>` tags (see the card icon glyphs)
- [ ] Custom domain in this README and in repo settings, if used
- [ ] Add the Terms and Privacy URLs to App Store Connect for each app

## License

All rights reserved © 2026 SanFlorence Digital LLC.
