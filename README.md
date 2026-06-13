# Md Shabbir Hossain — Portfolio

A modern, animated landing page for my software engineering portfolio. Built as a
zero-build static site so it can be hosted for free on **GitHub Pages**.

🔗 **Live:** https://shabbir912213000.github.io/me/

## Highlights

- **WebGL hero** — an interactive, mouse- & scroll-reactive particle field built with [Three.js](https://threejs.org/) and custom GLSL shaders.
- **Scroll choreography** — reveals, parallax, magnetic buttons, and a marquee powered by [GSAP](https://gsap.com/) + ScrollTrigger.
- **Custom cursor** & spotlight cards on pointer devices.
- **Fully responsive** with a mobile menu, and a graceful `prefers-reduced-motion` fallback (WebGL + animations disabled).
- **Accessible & fast** — semantic markup, system fonts fallback, capped pixel ratio, paused rendering when the tab is hidden.

## Tech

| Area        | Choice                                  |
| ----------- | --------------------------------------- |
| Animation   | GSAP 3 + ScrollTrigger (CDN)            |
| 3D / WebGL  | Three.js 0.160 (ESM via import map)     |
| Styling     | Hand-written CSS (custom properties)    |
| Build       | None — pure static files                |
| Hosting     | GitHub Pages via GitHub Actions         |

## Project structure

```
.
├── index.html              # Markup + CDN/import-map wiring
├── assets/
│   ├── css/styles.css      # All styles
│   ├── img/
│   │   ├── me.jpg          # Optimized portrait
│   │   ├── wavy-mask.svg   # Filled wavy shape (mask for the rotating hero reveal)
│   │   └── wavy-frame.svg  # Wavy outline used as the rotating hero ring
│   └── js/
│       ├── main.js         # GSAP interactions, cursor, nav, reveals
│       └── scene.js        # Three.js particle background
├── scripts/
│   └── regenerate-wavy-mask.mjs  # Rebuild hero wavy mask + ring SVGs
├── .github/workflows/deploy.yml  # Pages deployment
└── .nojekyll               # Disable Jekyll processing on Pages
```

### Logo & portrait treatment

- **Nav monogram** — an inline `SH` SVG whose two strokes draw in sequence (`S`
  first, then `H`), hold, fade out, and loop forever (pure CSS via
  `stroke-dasharray`/`stroke-dashoffset`). A `prefers-reduced-motion` fallback
  shows the monogram fully drawn and static.
- **Hero portrait** — the image fills the maximum area while a wavy window
  (`wavy-mask.svg`) rotates over it and the photo counter-rotates to stay upright,
  so the spinning wavy shape *reveals* the picture rather than statically clipping
  it. A gradient `wavy-frame.svg` ring traces the exact same outline. On mobile
  the portrait moves beside the title with its left edge feathered into the
  background. Both SVGs hold a **pre-baked static path** — CSS masks run in a
  script-free mode, so the shape is generated offline and written into the files.

  **To change the wavy shape:**
  1. Open `scripts/regenerate-wavy-mask.mjs` and edit the `config` object at the
     top (`apexCount`, `outerRadius`, `innerRadius`, `apexRoundness`,
     `valleyRoundness`, `rotation`, etc.).
  2. Regenerate both SVGs:
     ```bash
     node scripts/regenerate-wavy-mask.mjs
     ```
  3. Refresh the site locally to preview the hero portrait.

## Run locally

No build step required. Serve the folder with any static server (a server is needed
because the page uses ES modules):

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploying to GitHub Pages

Deployment is automated. On every push to `main`, the workflow at
`.github/workflows/deploy.yml` publishes the repository root to GitHub Pages.

One-time setup in the repository: **Settings → Pages → Build and deployment →
Source → “GitHub Actions”.**

Because all asset paths are relative (`./assets/...`), the site works correctly when
served from the `/me/` project subpath.
