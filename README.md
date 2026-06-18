# SanFlorence Digital — Studio Website

The public studio website for **SanFlorence Digital LLC**, a one-person iOS studio in the San Francisco Bay Area. It showcases released apps (Mes, DIY Decor AI) with a bold, editorial, typographic-first design, and serves as the required Terms of Use and Privacy Policy destination for App Store listings. The signature element is a massive "SanFlorence" wordmark at the foot of the home page that distorts in real time based on cursor proximity using per-letter SVG `feTurbulence` displacement filters.

## Live URL

https://gaziyeasinarifin.github.io/sanflorence/ — (or a custom domain once configured)

## Tech

Pure static **HTML / CSS / JS** — no framework, no build tool, no dependencies beyond Google Fonts (Instrument Serif + Inter) loaded from the CDN. Three pages: `index.html`, `terms.html`, `privacy.html`. Dark/light mode respects `prefers-color-scheme`, with a manual toggle persisted to `localStorage`. All animations honor `prefers-reduced-motion`.

## Local development

Just open `index.html` in a browser. For a local server (so relative asset paths resolve identically to production):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy (GitHub Pages)

In the repository: **Settings → Pages → Source: Deploy from a branch → `main` → `/ (root)`**. The site publishes at the Live URL above. Vercel static hosting works too — point it at the repo root with no build command.

## Before going live — replace placeholders

- [ ] `[MES_APP_ID]` in `index.html` — real Mes App Store ID
- [ ] `[DIYDECOR_APP_ID]` in `index.html` — real DIY Decor AI App Store ID
- [ ] Real app icons in `assets/icons/` (`mes-icon.png`, `diydecor-icon.png`, 1024×1024) and swap the gradient placeholders for `<img>` tags (see the `TODO` comments on the cards)
- [ ] Custom domain in this README and in repo settings, if used
- [ ] Add the Terms and Privacy URLs to App Store Connect for each app

## License

All rights reserved © 2026 SanFlorence Digital LLC.
