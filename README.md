# Md Shabbir Hossain — Portfolio

A modern, animated landing page for my software engineering portfolio. Built as a
zero-build static site so it can be hosted for free on **GitHub Pages**.

🔗 **Live:** https://shabbir912213000.github.io/me/

## Highlights

- **WebGL hero** — a subtle, mouse- & scroll-reactive particle field built with [Three.js](https://threejs.org/) and custom GLSL shaders (soft swell + gentle twinkle).
- **Scroll choreography** — reveals, parallax, magnetic buttons, and a dual-row glass **tech ribbon** powered by [GSAP](https://gsap.com/) + ScrollTrigger and CSS.
- **Liquid-glass navbar** — a frosted, refractive nav panel with a live **BST (UTC+06:00)** local-time readout and a GSAP-smoothed **scroll-progress** bar along the top edge.
- **Custom cursor** that spawns at screen-centre on load, plus spotlight cards on pointer devices.
- **Fully responsive** — on small screens the nav opens a full-screen glass menu with drifting aurora orbs and a particle grid that echo the WebGL hero, plus a dedicated close control; `prefers-reduced-motion` disables WebGL and heavy animation.
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
│   ├── cv/
│   │   └── Md-Shabbir-Hossain-CV.pdf  # Résumé PDF (replace in place to update)
│   ├── img/
│   │   ├── me.jpg          # Optimized portrait
│   │   ├── wavy-mask.svg   # Filled wavy shape (mask for the rotating hero reveal)
│   │   └── wavy-frame.svg  # Wavy outline used as the rotating hero ring
│   └── js/
│       ├── main.js         # GSAP interactions, cursor, nav, scroll progress, reveals, BST clock
│       └── scene.js        # Three.js particle background
├── scripts/
│   └── regenerate-wavy-mask.mjs  # Rebuild hero wavy mask + ring SVGs
├── .github/workflows/deploy.yml  # Pages deployment
└── .nojekyll               # Disable Jekyll processing on Pages
```

### Logo & portrait treatment

- **Nav monogram** — a single continuous, cursive `SH` signature drawn as one
  inline SVG path. A `feTurbulence` displacement filter gives it a sketchy,
  hand-inked feel. The stroke draws from one end to the other and then retraces
  back to the start, looping forever (pure CSS via `stroke-dasharray`/
  `stroke-dashoffset` with `animation-direction: alternate`). A
  `prefers-reduced-motion` fallback shows the monogram fully drawn and static.
- **Hero portrait** — the image fills the maximum area while a wavy window
  (`wavy-mask.svg`) rotates over it and the photo counter-rotates to stay upright,
  so the spinning wavy shape *reveals* the picture rather than statically clipping
  it. A gradient `wavy-frame.svg` ring traces the exact same outline. On mobile
  the hero fills the first viewport (`100svh`); the availability beacon stays
  right-aligned like desktop. The title and portrait share a compact top band,
  then a full-width gradient rule, tagline, vertically centered skills meta,
  and CTAs pinned to the bottom — pushing the tech ribbon below the fold.
  Both SVGs hold a **pre-baked
  static path** — CSS masks run in a script-free mode, so the shape is generated
  offline and written into the files.

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

## CV download

The site links to a single PDF at `assets/cv/Md-Shabbir-Hossain-CV.pdf` from the nav
and contact footer. To publish an updated résumé:

1. Export your CV as PDF.
2. Save it as `assets/cv/Md-Shabbir-Hossain-CV.pdf` (overwrite the existing file).
3. Commit and push to `main` — GitHub Pages redeploys automatically.

Keep the filename stable so the HTML links never need to change.

## Deploying to GitHub Pages

Deployment is automated. On every push to `main`, the workflow at
`.github/workflows/deploy.yml` publishes the repository root to GitHub Pages.

One-time setup in the repository: **Settings → Pages → Build and deployment →
Source → “GitHub Actions”.**

Because all asset paths are relative (`./assets/...`), the site works correctly when
served from the `/me/` project subpath.
