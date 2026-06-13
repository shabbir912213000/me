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
│   └── js/
│       ├── main.js         # GSAP interactions, cursor, nav, reveals
│       └── scene.js        # Three.js particle background
├── .github/workflows/deploy.yml  # Pages deployment
└── .nojekyll               # Disable Jekyll processing on Pages
```

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
