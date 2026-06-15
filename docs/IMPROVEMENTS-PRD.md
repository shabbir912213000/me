# Portfolio Site Improvements — PRD

**Project:** Md Shabbir Hossain — personal portfolio (`/me` on GitHub Pages)  
**Document type:** Product Requirements Document (implementation backlog)  
**Last updated:** June 2026  
**Live URL:** https://shabbir912213000.github.io/me/

---

## 1. Executive summary

The portfolio is a polished, zero-build static site (HTML + CSS + vanilla JS, GSAP, Three.js) deployed via GitHub Actions. Core visuals, motion design, and responsive layout are strong. This document captures **incremental improvements** identified during a site review, ordered by impact, with enough implementation detail to pick up any item independently.

Each improvement is scoped to fit the existing architecture: no framework migration, minimal new dependencies, relative asset paths for GitHub Pages subpath hosting.

---

## 2. Current state (baseline)

| Area | What exists today |
|------|-------------------|
| **Stack** | `index.html`, `assets/css/styles.css`, `assets/js/main.js`, `assets/js/scene.js` |
| **Animation** | GSAP + ScrollTrigger (CDN), custom cursor, magnetic buttons, scroll reveals |
| **3D** | Three.js particle field via import map; paused when tab hidden |
| **A11y partial** | Semantic HTML, `aria-label`s, `prefers-reduced-motion` CSS block, touch cursor hidden |
| **SEO partial** | Title, description, basic Open Graph; no share image, canonical, or JSON-LD |
| **Contact** | Email, GitHub, CV download — no LinkedIn |
| **Content** | Hero, About, Skills, Experience (`#work`), Education, Contact — **no Projects section** |
| **Deploy** | `.github/workflows/deploy.yml` → GitHub Pages |

---

## 3. Priority matrix

| Priority | ID | Improvement | Effort | Impact |
|----------|-----|-------------|--------|--------|
| P0 | IMP-01 | Projects / selected work section | Large | High |
| P0 | IMP-02 | Open Graph + Twitter share image | Small | High |
| P0 | IMP-03 | JSON-LD Person schema | Small | Medium |
| P0 | IMP-04 | LinkedIn in contact + nav | Trivial | Medium |
| P1 | IMP-05 | Focus-visible styles | Small | High (a11y) |
| P1 | IMP-06 | Skip link + scroll-padding | Small | High (a11y) |
| P1 | IMP-07 | Mobile menu keyboard support | Small | Medium |
| P1 | IMP-08 | Active nav section highlighting | Medium | Medium |
| P2 | IMP-09 | Hero image optimization (WebP/AVIF) | Small | Medium |
| P2 | IMP-10 | Font loading optimization | Medium | Medium |
| P2 | IMP-11 | CDN Subresource Integrity (SRI) | Small | Low–Medium |
| P2 | IMP-12 | Preloader skip on repeat visits | Small | Low |
| P3 | IMP-13 | Hide native cursor on desktop | Trivial | Low |
| P3 | IMP-14 | Availability beacon actions | Small | Low |
| P3 | IMP-15 | Email spam mitigation | Medium | Low |
| P3 | IMP-16 | Clock update interval | Trivial | Trivial |
| P4 | IMP-17 | `sitemap.xml` + `robots.txt` | Small | Low |
| P4 | IMP-18 | Privacy-friendly analytics | Small | Optional |
| P4 | IMP-19 | Web app manifest (PWA-lite) | Small | Optional |
| P4 | IMP-20 | Print stylesheet | Small | Optional |
| P4 | IMP-21 | Quantified highlights / testimonials | Content | Medium |

**Suggested implementation order:** IMP-04 → IMP-02 → IMP-03 → IMP-05 → IMP-06 → IMP-01 → IMP-08 → remaining P2–P4 as needed.

---

## 4. Improvement specifications

---

### IMP-01 — Projects / selected work section

#### Problem
The hero CTA “View my work” scrolls to `#work`, which is the **employment timeline**, not demonstrable output. Recruiters and hiring managers expect 2–4 concrete case studies or project cards.

#### Goals
- Add a dedicated section between Skills and Experience (or after Experience).
- Give “View my work” a destination that shows **what you built**, not just where you worked.
- Match existing visual language (section index, `reveal-up`, glass/surface cards).

#### Acceptance criteria
- [ ] New section `#projects` with heading and 2–4 project cards.
- [ ] Each card includes: title, one-line summary, tech stack chips, optional link (GitHub, live demo, or “private — NDA”).
- [ ] Hero primary CTA `href="#projects"` (update `index.html`).
- [ ] Nav link “Projects” added before or after “Experience”.
- [ ] Section index renumbered if inserting before Experience (e.g. `03 — Projects`, Experience becomes `04`, etc.).
- [ ] Cards animate in with existing `reveal-up` / ScrollTrigger pattern in `main.js`.
- [ ] Responsive: 1 column mobile, 2 columns tablet+.

#### Implementation approach

**1. HTML** — add after `#skills`:

```html
<section class="projects" id="projects">
  <span class="section-index">03 — Selected work</span>
  <h2 class="section-title reveal-up">Things I've shipped</h2>
  <div class="projects__grid">
    <article class="project-card reveal-up" data-cursor="hover">
      <span class="project-card__tag">Backend · Azure</span>
      <h3>Durable outbox event relay</h3>
      <p>Retry pipeline publishing domain events to Azure Service Bus …</p>
      <ul class="project-card__stack">
        <li>.NET Core</li><li>Service Bus</li><li>SQL Server</li>
      </ul>
      <a href="#" class="project-card__link">Case study ↗</a>
    </article>
    <!-- repeat -->
  </div>
</section>
```

**2. CSS** — in `assets/css/styles.css`:
- Mirror `.skill-card` / `.edu-card` patterns: border, `var(--surface)`, hover lift, gradient hover line optional.
- Grid: `grid-template-columns: repeat(2, 1fr)` desktop; `1fr` below 880px.
- Reuse `.chip` styling for stack tags or smaller variant.

**3. JS** — no new logic required if cards use `.reveal-up`; existing `scrollReveals()` picks them up.

**4. Content** — draft copy from CV bullets (admin module, legacy Ionic upgrade, eCOA Schedule Designer, RPA bots). Prefer **outcome metrics** where possible (“unblocked Play Store releases”, “eliminated X hours/week manual work”).

#### Files to touch
- `index.html` — section markup, nav links, hero CTA, section index numbers
- `assets/css/styles.css` — `.projects`, `.project-card` blocks
- `README.md` — project structure / section list

#### Dependencies
None.

#### Estimated effort
4–8 hours (mostly content writing and visual polish).

---

### IMP-02 — Open Graph + Twitter share metadata

#### Problem
`twitter:card` is set to `summary_large_image` but no image URL is provided. Links shared on LinkedIn, Slack, or Twitter render without a preview image.

#### Goals
- Rich link previews with branded 1200×630 image.
- Canonical URL and complete OG tags.

#### Acceptance criteria
- [ ] `og:image` points to absolute URL (required for crawlers).
- [ ] `og:url`, `og:image:width`, `og:image:height`, `og:image:alt` present.
- [ ] `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` present.
- [ ] `<link rel="canonical">` in `<head>`.
- [ ] Image file committed at `assets/img/og-share.jpg` (or `.png`).

#### Implementation approach

**1. Create share image** (1200×630 px):
- Dark background matching `--bg: #06060a`
- Name, title (“Software Engineer & Tech Lead”), gradient accent
- Optional: small monogram or portrait crop
- Export as JPEG (~150–250 KB) or PNG

**2. Add to `<head>` in `index.html`:**

```html
<link rel="canonical" href="https://shabbir912213000.github.io/me/" />
<meta property="og:url" content="https://shabbir912213000.github.io/me/" />
<meta property="og:image" content="https://shabbir912213000.github.io/me/assets/img/og-share.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Md Shabbir Hossain — Software Engineer & Technical Lead" />
<meta name="twitter:title" content="Md Shabbir Hossain — Software Engineer" />
<meta name="twitter:description" content="…" />
<meta name="twitter:image" content="https://shabbir912213000.github.io/me/assets/img/og-share.jpg" />
```

**Important:** OG image URLs must be **absolute** (include `https://…`), not relative paths.

**3. Validate** with [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) and [Twitter Card Validator](https://cards-dev.twitter.com/validator) after deploy.

#### Files to touch
- `index.html`
- `assets/img/og-share.jpg` (new)
- `README.md` — note OG asset in img folder

#### Dependencies
None.

#### Estimated effort
1–2 hours.

---

### IMP-03 — JSON-LD structured data (Person schema)

#### Problem
Search engines lack structured signals about who you are, your role, and social profiles.

#### Goals
- Enable rich search results eligibility (knowledge panel adjacency, sitelinks).
- Explicitly declare `sameAs` for GitHub and LinkedIn.

#### Acceptance criteria
- [ ] Valid JSON-LD `Person` (or `ProfilePage` wrapping `Person`) in `<head>` or before `</body>`.
- [ ] Includes: `name`, `jobTitle`, `email`, `address` (locality/country), `sameAs`, `url`, `image`.
- [ ] Passes [Google Rich Results Test](https://search.google.com/test/rich-results).

#### Implementation approach

Add before `</body>` in `index.html`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Md Shabbir Hossain",
  "jobTitle": "Software Engineer & Technical Lead",
  "url": "https://shabbir912213000.github.io/me/",
  "image": "https://shabbir912213000.github.io/me/assets/img/me.jpg",
  "email": "mailto:shabbir912213000@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Dhaka",
    "addressCountry": "BD"
  },
  "sameAs": [
    "https://github.com/shabbir912213000",
    "https://www.linkedin.com/in/YOUR-LINKEDIN-SLUG"
  ],
  "knowsAbout": [".NET", "React", "Angular", "Microservices", "Azure"]
}
</script>
```

Update `sameAs` after IMP-04 (LinkedIn URL).

#### Files to touch
- `index.html`

#### Dependencies
IMP-04 recommended (LinkedIn URL for `sameAs`).

#### Estimated effort
30 minutes.

---

### IMP-04 — LinkedIn link

#### Problem
Contact footer lists CV, GitHub, and Email but not LinkedIn — a common first click for recruiters.

#### Goals
- Add LinkedIn alongside existing contact links.
- Optionally add to nav if desired (keep nav uncluttered — footer may suffice).

#### Acceptance criteria
- [ ] LinkedIn link in `.contact__links` with `target="_blank"` and `rel="noopener noreferrer"`.
- [ ] JSON-LD `sameAs` updated (IMP-03).
- [ ] Link uses consistent `↗` suffix pattern.

#### Implementation approach

In `index.html` `.contact__links`:

```html
<a href="https://www.linkedin.com/in/YOUR-SLUG" target="_blank" rel="noopener noreferrer" data-cursor="hover">
  LinkedIn ↗
</a>
```

#### Files to touch
- `index.html`
- `docs/IMPROVEMENTS-PRD.md` — no change needed

#### Dependencies
None.

#### Estimated effort
15 minutes.

---

### IMP-05 — Focus-visible styles

#### Problem
No `:focus-visible` rules exist. Keyboard users cannot see which element is focused when tabbing through nav, buttons, and links.

#### Goals
- Visible, on-brand focus ring for all interactive elements.
- No focus ring on mouse click (use `:focus-visible`, not `:focus` alone).

#### Acceptance criteria
- [ ] Links, buttons, `.btn`, nav items, project cards (if linked), contact mail show clear focus indicator.
- [ ] Focus ring meets WCAG 2.2 contrast guidelines (3:1 against adjacent colors).
- [ ] `:focus:not(:focus-visible) { outline: none; }` optional cleanup for mouse users.

#### Implementation approach

Add to `assets/css/styles.css` (after base `a` styles):

```css
:focus { outline: none; }

:focus-visible {
  outline: 2px solid var(--accent-2);
  outline-offset: 3px;
}

.btn:focus-visible,
.nav__links a:focus-visible,
.contact__mail:focus-visible {
  outline-offset: 4px;
}
```

For elements with `overflow: hidden` (`.btn--primary`), verify the ring is not clipped; increase `outline-offset` or use `box-shadow` fallback:

```css
.btn:focus-visible {
  box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent-2);
}
```

#### Files to touch
- `assets/css/styles.css`

#### Dependencies
None.

#### Estimated effort
30–45 minutes (including keyboard test pass).

---

### IMP-06 — Skip link + scroll-padding for fixed nav

#### Problem
No skip navigation for screen readers. Anchor links (`#about`, `#work`, etc.) scroll content under the fixed navbar.

#### Goals
- Skip link appears on first Tab focus.
- Section headings visible below nav when navigating via in-page links.

#### Acceptance criteria
- [ ] “Skip to main content” link as first focusable element in `<body>`.
- [ ] Link targets `#smooth-content` (existing `<main>` id) or add `id="main"`.
- [ ] `scroll-padding-top` on `html` accounts for nav height (~4.5–5rem).
- [ ] Skip link hidden until focused (visually hidden pattern).

#### Implementation approach

**1. HTML** — first child of `<body>`:

```html
<a class="skip-link" href="#smooth-content">Skip to main content</a>
```

**2. CSS:**

```css
html {
  scroll-padding-top: 5rem;
}

.skip-link {
  position: fixed;
  top: 0;
  left: var(--gutter);
  z-index: 500;
  padding: 0.75rem 1.25rem;
  background: var(--text);
  color: var(--bg);
  font-weight: 600;
  transform: translateY(-120%);
  transition: transform 0.2s var(--ease);
}
.skip-link:focus-visible {
  transform: translateY(0.5rem);
}
```

**3. Note:** `scroll-behavior: smooth` on `html` already exists; reduced-motion block sets it to `auto` — correct.

#### Files to touch
- `index.html`
- `assets/css/styles.css`

#### Dependencies
IMP-05 (skip link needs focus-visible styling).

#### Estimated effort
30 minutes.

---

### IMP-07 — Mobile menu keyboard support

#### Problem
Burger menu toggles `aria-expanded` but lacks Escape-to-close and focus management. Keyboard users can get disoriented when menu opens.

#### Goals
- Escape closes menu.
- Focus moves to first link (or close button) on open; returns to burger on close.
- Optional: trap focus inside menu while open.

#### Acceptance criteria
- [ ] `Escape` key closes open menu.
- [ ] `aria-expanded` stays in sync.
- [ ] `body.is-locked` removed on close.
- [ ] Focus restored to `#navBurger` after close.

#### Implementation approach

Extend `nav()` in `assets/js/main.js`:

```javascript
const focusableSelector =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function openMenu() {
  links.classList.add("is-open");
  burger.classList.add("is-open");
  navEl.classList.add("is-menu-open");
  burger.setAttribute("aria-expanded", "true");
  document.body.classList.add("is-locked");
  closeBtn.focus();
}

function closeMenu() {
  links.classList.remove("is-open");
  burger.classList.remove("is-open");
  navEl.classList.remove("is-menu-open");
  burger.setAttribute("aria-expanded", "false");
  document.body.classList.remove("is-locked");
  burger.focus();
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && links.classList.contains("is-open")) {
    closeMenu();
  }
});
```

**Focus trap (optional, ~20 lines):** on `Tab` while menu open, if focus leaves last focusable, wrap to first.

Refactor burger click handler to call `openMenu()` / `closeMenu()` instead of inline toggle.

#### Files to touch
- `assets/js/main.js`

#### Dependencies
IMP-05 (close button needs visible focus).

#### Estimated effort
1–2 hours.

---

### IMP-08 — Active nav section highlighting

#### Problem
Nav links do not indicate which section the user is currently viewing.

#### Goals
- Highlight active nav link as user scrolls.
- Set `aria-current="true"` on active link for assistive tech.

#### Acceptance criteria
- [ ] One nav link visually active at a time (desktop nav links only — not CV download).
- [ ] Active state clears when section is < ~30% visible.
- [ ] Works with existing hide-on-scroll-down nav behavior.
- [ ] No jank on fast scroll (debounce or `rootMargin` tuning).

#### Implementation approach

**1. CSS** — active link style:

```css
.nav__links a.is-active {
  color: var(--accent-2);
}
.nav__links a.is-active::after {
  transform: scaleX(1);
  transform-origin: 0 50%;
}
```

**2. JS** — in `main.js`, new `navActiveSection()`:

```javascript
function navActiveSection() {
  const sections = ["home", "about", "skills", "work", "education", "contact"];
  const links = document.querySelectorAll('.nav__links a[href^="#"]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach((a) => {
          const match = a.getAttribute("href") === `#${id}`;
          a.classList.toggle("is-active", match);
          if (match) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}
```

Call from `boot()`. Add `#projects` when IMP-01 ships.

**Alternative:** ScrollTrigger-based `pin` + `onEnter/onLeaveBack` — heavier; Intersection Observer is sufficient.

#### Files to touch
- `assets/js/main.js`
- `assets/css/styles.css`

#### Dependencies
IMP-01 if Projects nav link added.

#### Estimated effort
1–2 hours.

---

### IMP-09 — Hero image optimization

#### Problem
Hero portrait is a single 145 KB JPEG. Modern formats and priority hints can improve LCP.

#### Goals
- Serve WebP/AVIF to supporting browsers.
- Mark LCP image with `fetchpriority="high"`.

#### Acceptance criteria
- [ ] `<picture>` element with WebP (and optional AVIF) sources + JPEG fallback.
- [ ] `fetchpriority="high"` on hero img (not lazy-loaded).
- [ ] Visual quality unchanged at desktop/mobile.
- [ ] File size reduction ≥ 30% for modern formats.

#### Implementation approach

**1. Generate derivatives** (one-time, local):

```bash
# examples using cwebp / avifenc or squoosh CLI
cwebp -q 82 assets/img/me.jpg -o assets/img/me.webp
```

**2. HTML:**

```html
<picture>
  <source srcset="./assets/img/me.avif" type="image/avif" />
  <source srcset="./assets/img/me.webp" type="image/webp" />
  <img
    src="./assets/img/me.jpg"
    alt="Portrait of Md Shabbir Hossain"
    width="440"
    height="440"
    fetchpriority="high"
    decoding="async"
  />
</picture>
```

Keep `width`/`height` to prevent layout shift.

#### Files to touch
- `index.html`
- `assets/img/me.webp`, `assets/img/me.avif` (new)
- `README.md` — document image assets

#### Dependencies
None.

#### Estimated effort
45 minutes.

---

### IMP-10 — Font loading optimization

#### Problem
Three Google Font families load with multiple weights (render-blocking request chain).

#### Goals
- Reduce FOIT/FOUT and bytes transferred.
- Keep visual design intact.

#### Acceptance criteria
- [ ] Only weights actually used in CSS are loaded.
- [ ] Primary heading font preloaded or self-hosted.
- [ ] Handlee (single use in tagline) — consider keeping or swapping to system cursive fallback.

#### Implementation approach

**Option A — Trim Google Fonts URL (minimal change):**

Audit `styles.css` for used weights:
- Space Grotesk: 600, 700 (nav logo 700, headings 600) — drop 400, 500 if unused
- Inter: 400, 500, 600 — verify usage
- Handlee: 400 only

Update `<link href="…">` in `index.html`.

**Option B — Self-host (better performance, no Google dependency):**

1. Download woff2 files from [google-webfonts-helper](https://gwfh.mranftl.com/fonts).
2. Place in `assets/fonts/`.
3. Add `@font-face` blocks at top of `styles.css`.
4. Remove Google Fonts `<link>`.
5. Add `<link rel="preload" href="./assets/fonts/space-grotesk-700.woff2" as="font" type="font/woff2" crossorigin>` for LCP text.

#### Files to touch
- `index.html`
- `assets/css/styles.css`
- `assets/fonts/*` (if self-hosting)
- `README.md`

#### Dependencies
None.

#### Estimated effort
1–3 hours depending on option.

---

### IMP-11 — CDN Subresource Integrity (SRI)

#### Problem
GSAP scripts load from jsDelivr without integrity verification.

#### Goals
- Tamper-evident CDN loads for GSAP (and optionally Three.js import map URL).

#### Acceptance criteria
- [ ] `integrity` and `crossorigin="anonymous"` on GSAP script tags.
- [ ] Site still loads if hashes match pinned version (`3.12.5`).
- [ ] Document pinned versions in README.

#### Implementation approach

**1. Get hashes** from jsDelivr:

```
https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js
https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js
```

Use [srihash.org](https://www.srihash.org/) or:

```bash
curl -s URL | openssl dgst -sha384 -binary | openssl base64 -A
```

**2. Update `index.html`:**

```html
<script
  src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"
  integrity="sha384-…"
  crossorigin="anonymous"
></script>
```

**Note:** Three.js via ES module import map does not support SRI on the import map entry easily; pinning version in import map (`three@0.160.0`) is the practical mitigation. Consider vendoring `three.module.js` locally for full SRI control.

#### Files to touch
- `index.html`
- `README.md` — pinned CDN versions

#### Dependencies
None.

#### Estimated effort
30 minutes.

---

### IMP-12 — Preloader skip on repeat visits

#### Problem
The GSAP preloader runs ~1.1s on every visit, including return visits when assets are cached.

#### Goals
- Skip artificial loader delay when user has seen it this session (or ever).

#### Acceptance criteria
- [ ] First visit in session: loader runs as today.
- [ ] Subsequent page loads in same session: loader skipped, hero intro still runs (or skip intro too — configurable).
- [ ] Respects reduced motion (already skips loader).

#### Implementation approach

In `runLoader()` in `main.js`:

```javascript
const LOADER_KEY = "portfolio-loader-seen";

function runLoader(onDone) {
  if (sessionStorage.getItem(LOADER_KEY)) {
    document.getElementById("loader").style.display = "none";
    onDone();
    return;
  }
  // existing animation…
  onComplete: () => {
    sessionStorage.setItem(LOADER_KEY, "1");
    // …
  }
}
```

Use `sessionStorage` (per tab session) rather than `localStorage` if you still want the intro on new sessions.

#### Files to touch
- `assets/js/main.js`

#### Dependencies
None.

#### Estimated effort
20 minutes.

---

### IMP-13 — Hide native cursor on desktop

#### Problem
Custom cursor ring and system cursor both appear on pointer devices.

#### Goals
- Only custom cursor visible where it is enabled.

#### Acceptance criteria
- [ ] `cursor: none` on `body` for `(hover: hover) and (pointer: fine)`.
- [ ] Reduced-motion and touch rules unchanged (custom cursor already hidden there).

#### Implementation approach

```css
@media (hover: hover) and (pointer: fine) {
  body:not(.reduce-motion) {
    cursor: none;
  }
  body:not(.reduce-motion) a,
  body:not(.reduce-motion) button {
    cursor: none;
  }
}
```

If manual reduced-motion toggle is added later, align with `.reduce-motion` class on `html`.

#### Files to touch
- `assets/css/styles.css`

#### Dependencies
None.

#### Estimated effort
10 minutes.

---

### IMP-14 — Availability beacon actions

#### Problem
“Available for new opportunities” is static text with no action.

#### Goals
- Make beacon clickable or link to contact/scheduling.

#### Acceptance criteria
- [ ] Clicking beacon scrolls to `#contact` OR opens Calendly/external scheduling URL.
- [ ] Keyboard accessible if interactive (`<a>` or `<button>`).
- [ ] Visual affordance on hover (subtle scale or border brighten).

#### Implementation approach

**Option A — scroll to contact:**

```html
<a href="#contact" class="status-beacon" data-cursor="hover">
  …
</a>
```

**Option B — external scheduling:**

```html
<a href="https://calendly.com/…" class="status-beacon" target="_blank" rel="noopener noreferrer">
```

Add `cursor: pointer` and hover border transition in CSS.

When not available, swap text via HTML edit or a `data-status="closed"` attribute + JS.

#### Files to touch
- `index.html`
- `assets/css/styles.css`

#### Dependencies
IMP-05 if made interactive.

#### Estimated effort
20 minutes.

---

### IMP-15 — Email spam mitigation

#### Problem
Email address is plain text in HTML — easily harvested by bots.

#### Goals
- Reduce scraper harvest without breaking mailto for real users.

#### Acceptance criteria
- [ ] Email still reachable in one click for humans.
- [ ] Not plain `mailto:full@address` in static HTML (or obfuscated).
- [ ] Contact form alternative OR JS obfuscation OR Cloudflare email decode.

#### Implementation approach

**Option A — Contact form (recommended for public sites):**

Use [Formspree](https://formspree.io/) or similar:
- Add minimal form in `#contact` (name, message, submit).
- Keep styled like existing `.btn` components.
- No backend required.

**Option B — JS obfuscation (lightweight):**

```javascript
const u = "shabbir912213000";
const d = "gmail.com";
const mailLink = document.querySelector(".contact__mail");
mailLink.href = `mailto:${u}@${d}`;
mailLink.textContent = `${u}@${d}`;
```

Render placeholder in HTML: `data-mail-user` / `data-mail-domain` attributes.

**Option C — `mailto:` with encoded entities** — weak protection, not recommended alone.

#### Files to touch
- `index.html`
- `assets/js/main.js` (Option B)
- `assets/css/styles.css` (Option A form styles)

#### Dependencies
None.

#### Estimated effort
1–3 hours (form) or 30 minutes (obfuscation).

---

### IMP-16 — Clock update interval

#### Problem
BST clock in nav updates every 15 seconds — unnecessarily frequent for a minutes display.

#### Goals
- Update once per minute, aligned to minute boundary.

#### Implementation approach

Replace `setInterval(update, 1000 * 15)` in `clock()` with:

```javascript
function schedule() {
  update();
  const now = new Date();
  const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
  setTimeout(() => {
    update();
    setInterval(update, 60_000);
  }, msToNextMinute);
}
schedule();
```

#### Files to touch
- `assets/js/main.js`

#### Dependencies
None.

#### Estimated effort
10 minutes.

---

### IMP-17 — `sitemap.xml` + `robots.txt`

#### Problem
No crawler hints for single-page site.

#### Goals
- Help search engines discover and index the canonical URL.

#### Acceptance criteria
- [ ] `robots.txt` at site root allows all, points to sitemap.
- [ ] `sitemap.xml` lists canonical page URL with `lastmod`.

#### Implementation approach

**`robots.txt`** (repo root):

```
User-agent: *
Allow: /

Sitemap: https://shabbir912213000.github.io/me/sitemap.xml
```

**`sitemap.xml`**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://shabbir912213000.github.io/me/</loc>
    <lastmod>2026-06-16</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

Update `lastmod` when content changes. GitHub Pages serves both from repo root automatically.

#### Files to touch
- `robots.txt` (new)
- `sitemap.xml` (new)

#### Dependencies
IMP-02 (canonical URL consistency).

#### Estimated effort
20 minutes.

---

### IMP-18 — Privacy-friendly analytics

#### Problem
No visibility into traffic or referrers.

#### Goals
- Lightweight, cookie-less analytics (GDPR-friendly).

#### Implementation approach

**Plausible** or **Fathom** — single script tag:

```html
<script defer data-domain="shabbir912213000.github.io" src="https://plausible.io/js/script.js"></script>
```

Configure custom domain if using a personal domain later.

#### Files to touch
- `index.html`
- `README.md` — note analytics choice

#### Dependencies
Account on analytics provider.

#### Estimated effort
30 minutes.

---

### IMP-19 — Web app manifest (PWA-lite)

#### Problem
No “Add to Home Screen” metadata on mobile.

#### Goals
- Basic manifest with name, theme color, icons.

#### Implementation approach

**`manifest.webmanifest`:**

```json
{
  "name": "Md Shabbir Hossain",
  "short_name": "Shabbir",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#06060a",
  "theme_color": "#06060a",
  "icons": [
    { "src": "./assets/img/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "./assets/img/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Link in `<head>`:

```html
<link rel="manifest" href="./manifest.webmanifest" />
```

Generate icons from monogram or portrait. Service worker optional — skip unless offline support is needed.

#### Files to touch
- `manifest.webmanifest` (new)
- `assets/img/icon-*.png` (new)
- `index.html`

#### Dependencies
None.

#### Estimated effort
1 hour.

---

### IMP-20 — Print stylesheet

#### Problem
Printing the page wastes ink on dark background and animations.

#### Goals
- Clean, readable print output (CV-style summary).

#### Implementation approach

```css
@media print {
  #bg-canvas,
  .loader,
  .cursor,
  .cursor-dot,
  .scroll-progress,
  .nav,
  .ribbon,
  .hero__scroll,
  .status-beacon { display: none !important; }

  body {
    background: #fff;
    color: #000;
    font-size: 11pt;
  }

  a[href]::after {
    content: " (" attr(href) ")";
    font-size: 9pt;
  }

  section { page-break-inside: avoid; }
}
```

#### Files to touch
- `assets/css/styles.css`

#### Dependencies
None.

#### Estimated effort
1–2 hours.

---

### IMP-21 — Quantified highlights / testimonials

#### Problem
Experience bullets describe work but rarely quantify impact. No third-party validation.

#### Goals
- Add 2–3 metric callouts (hero meta or dedicated strip).
- Optional: short quote from colleague/manager if available.

#### Implementation approach

**Metrics strip** — extend `.hero__meta` or add `.highlights` row:

```html
<div class="highlights reveal-up">
  <div><strong>6+</strong><span>Years shipping production software</span></div>
  <div><strong>Play Store</strong><span>Compliance unblocked</span></div>
</div>
```

**Testimonials** — single quote card in About or before Contact:

```html
<blockquote class="testimonial reveal-up">
  <p>"…"</p>
  <cite>— Name, Title at Company</cite>
</blockquote>
```

Content-only; no JS changes required.

#### Files to touch
- `index.html`
- `assets/css/styles.css`

#### Dependencies
None (content approval needed).

#### Estimated effort
2–4 hours (content gathering).

---

## 5. Cross-cutting implementation notes

### 5.1 Section numbering convention

When adding IMP-01 (Projects), update all `section-index` labels:

| Section | Current | After Projects |
|---------|---------|----------------|
| About | 01 | 01 |
| Skills | 02 | 02 |
| Projects | — | 03 |
| Experience | 03 | 04 |
| Education | 04 | 05 |
| Contact | 05 | 06 |

### 5.2 Reduced motion

The site already handles `prefers-reduced-motion` in CSS (`assets/css/styles.css` ~line 1177) and JS (`main.js`, `scene.js`). Optional manual preview toggle can be re-added separately; it is not required for any item in this PRD.

### 5.3 Documentation sync

Per project convention, update `README.md` when you change:
- New files or folders
- Setup/run instructions
- Asset inventory
- Deploy or CDN pin versions

### 5.4 Testing checklist (run after each IMP)

- [ ] Desktop Chrome / Safari / Firefox
- [ ] Mobile viewport (880px and 540px breakpoints)
- [ ] Keyboard-only navigation (Tab, Shift+Tab, Enter, Escape)
- [ ] `prefers-reduced-motion: reduce` in OS or DevTools emulation
- [ ] GitHub Pages deploy — relative paths still work under `/me/`
- [ ] Lighthouse: Performance, Accessibility, SEO

---

## 6. File reference map

```
.
├── index.html                 # Markup, meta, JSON-LD, sections
├── robots.txt                 # IMP-17
├── sitemap.xml                # IMP-17
├── manifest.webmanifest       # IMP-19
├── assets/
│   ├── css/styles.css         # All styles + print + focus + skip link
│   ├── js/main.js             # GSAP, nav, cursor, clock, a11y JS
│   ├── js/scene.js            # Three.js background
│   ├── img/
│   │   ├── me.jpg             # Hero portrait
│   │   ├── me.webp / me.avif  # IMP-09
│   │   └── og-share.jpg       # IMP-02
│   └── fonts/                 # IMP-10 (if self-hosting)
├── docs/
│   └── IMPROVEMENTS-PRD.md    # This document
└── README.md
```

---

## 7. Out of scope (for now)

- Framework migration (React, Astro, etc.)
- Backend / CMS
- Blog or CMS-driven content
- Multi-page routing
- Service worker / full offline PWA
- Removing unused assets (handled manually by owner)

---

## 8. Revision history

| Date | Change |
|------|--------|
| 2026-06-16 | Initial PRD from site review |
