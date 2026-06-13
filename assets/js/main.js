/* Md Shabbir Hossain — Portfolio interactions
   GSAP + ScrollTrigger driven reveals, custom cursor, magnetic buttons. */

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

document.getElementById("year").textContent = new Date().getFullYear();

/* Hide hero title words up-front (while the loader covers the screen) so the
   intro reveal has a clean starting state. CSS leaves them visible as a
   no-JS / reduced-motion fallback. */
if (gsap && !prefersReduced) {
  gsap.set(".hero__title .word", { yPercent: 110 });
}

/* ---------------- Preloader ---------------- */
function runLoader(onDone) {
  const loader = document.getElementById("loader");
  const bar = document.getElementById("loaderBar");
  const pct = document.getElementById("loaderPct");

  if (prefersReduced || !gsap) {
    loader.style.display = "none";
    onDone();
    return;
  }

  const state = { v: 0 };
  gsap.to(state, {
    v: 100,
    duration: 1.1,
    ease: "power2.inOut",
    onUpdate() {
      const val = Math.round(state.v);
      bar.style.width = val + "%";
      pct.textContent = val + "%";
    },
    onComplete() {
      gsap.to(loader, {
        yPercent: -100,
        duration: 0.9,
        ease: "power4.inOut",
        onComplete() {
          loader.style.display = "none";
          onDone();
        },
      });
    },
  });
}

/* ---------------- Hero intro ---------------- */
function heroIntro() {
  if (prefersReduced || !gsap) {
    gsap?.set(".hero__title .word, .reveal-up", { clearProps: "all" });
    return;
  }
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
  tl.to(".hero__title .word", {
    yPercent: 0,
    duration: 1.1,
    stagger: 0.12,
  })
    .to(".hero .reveal-up", {
      y: 0,
      opacity: 1,
      duration: 0.9,
      stagger: 0.08,
    }, "-=0.7");
}

/* ---------------- Scroll reveals ---------------- */
function scrollReveals() {
  if (!gsap || !ScrollTrigger) {
    document.querySelectorAll(".reveal-up").forEach((el) => {
      el.style.opacity = 1; el.style.transform = "none";
    });
    return;
  }

  gsap.utils.toArray(".reveal-up").forEach((el) => {
    if (el.closest(".hero")) return; // handled by intro
    gsap.to(el, {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  // Word-by-word reveal for "reveal-lines" headings.
  gsap.utils.toArray(".reveal-lines").forEach((el) => {
    const words = el.querySelectorAll(".reveal-word");
    // Footer/last-section headings can't complete a scrub (nothing scrolls
    // below them), so reveal those once on enter instead.
    if (el.closest(".contact")) {
      gsap.to(words, {
        opacity: 1,
        stagger: 0.04,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
      return;
    }
    gsap.to(words, {
      opacity: 1,
      stagger: 0.03,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        end: "bottom 60%",
        scrub: true,
      },
    });
  });

  // Timeline items
  gsap.utils.toArray(".tl-item").forEach((el) => {
    gsap.from(el, {
      y: 50,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  // Section titles subtle parallax index
  gsap.utils.toArray(".section-index").forEach((el) => {
    gsap.from(el, {
      x: -20,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
    });
  });
}

/* Split target headings into words for the line reveal */
function splitWords() {
  document.querySelectorAll(".reveal-lines").forEach((el) => {
    const walk = (node) => {
      const children = Array.from(node.childNodes);
      children.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (part.trim() === "") {
              frag.appendChild(document.createTextNode(part));
            } else {
              const span = document.createElement("span");
              span.className = "reveal-word";
              span.textContent = part;
              frag.appendChild(span);
            }
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };
    walk(el);
  });
}

/* ---------------- Marquee ---------------- */
function marquee() {
  if (prefersReduced || !gsap) return;
  const track = document.getElementById("marqueeTrack");
  if (!track) return;
  const first = track.querySelector("span");
  const width = first.getBoundingClientRect().width;
  gsap.to(track, {
    x: -width,
    duration: 22,
    ease: "none",
    repeat: -1,
  });
}

/* ---------------- Custom cursor + magnetic ---------------- */
function cursor() {
  if (isTouch || prefersReduced || !gsap) return;
  const ring = document.getElementById("cursor");
  const dot = document.getElementById("cursorDot");

  const xS = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
  const yS = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
  const xD = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
  const yD = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });

  window.addEventListener("pointermove", (e) => {
    xS(e.clientX); yS(e.clientY);
    xD(e.clientX); yD(e.clientY);
  });

  document.querySelectorAll('[data-cursor="hover"]').forEach((el) => {
    el.addEventListener("pointerenter", () => ring.classList.add("is-hover"));
    el.addEventListener("pointerleave", () => ring.classList.remove("is-hover"));
  });

  // Magnetic buttons
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: mx * 0.3, y: my * 0.4, duration: 0.6, ease: "power3" });
    });
    el.addEventListener("pointerleave", () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
    });
  });
}

/* ---------------- Skill card spotlight ---------------- */
function spotlight() {
  document.querySelectorAll(".skill-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });
}

/* ---------------- Nav behavior ---------------- */
function nav() {
  const navEl = document.getElementById("nav");
  const burger = document.getElementById("navBurger");
  const links = document.getElementById("navLinks");
  let lastY = 0;

  const onScroll = () => {
    const y = window.scrollY;
    navEl.classList.toggle("is-scrolled", y > 60);
    if (y > lastY && y > 400 && !links.classList.contains("is-open")) {
      navEl.classList.add("is-hidden");
    } else {
      navEl.classList.remove("is-hidden");
    }
    lastY = y;

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? y / max : 0;
    document.getElementById("scrollProgress").style.transform = `scaleX(${p})`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  const closeMenu = () => {
    links.classList.remove("is-open");
    burger.classList.remove("is-open");
    navEl.classList.remove("is-menu-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-locked");
  };

  burger.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    navEl.classList.toggle("is-menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("is-locked", open);
  });

  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
}

/* ---------------- Boot ---------------- */
function boot() {
  splitWords();
  nav();
  cursor();
  spotlight();
  scrollReveals();
  marquee();
  ScrollTrigger?.refresh();
}

document.addEventListener("DOMContentLoaded", () => {
  runLoader(() => {
    heroIntro();
  });
  boot();
  // Recalculate after fonts/layout settle
  window.addEventListener("load", () => ScrollTrigger?.refresh());
});
