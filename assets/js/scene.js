import * as THREE from "three";

/* Animated WebGL particle field — brand-colored, mouse + scroll reactive.
   Designed to be lightweight: capped pixel ratio, reduced density on mobile,
   paused when the tab is hidden or reduced-motion is requested. */

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.getElementById("bg-canvas");

function initScene() {
  if (!canvas || prefersReduced) return;

  const isMobile = window.innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 14);

  /* ---- Particle grid forming a flowing wave plane ---- */
  const COLS = isMobile ? 90 : 160;
  const ROWS = isMobile ? 60 : 100;
  const GAP = 0.28;
  const count = COLS * ROWS;

  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  let i = 0;
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      positions[i * 3] = (x - COLS / 2) * GAP;
      positions[i * 3 + 1] = (y - ROWS / 2) * GAP;
      positions[i * 3 + 2] = 0;
      seeds[i] = Math.random();
      i++;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uScroll: { value: 0 },
    uSize: { value: isMobile ? 1.8 : 2.3 },
    uColorA: { value: new THREE.Color("#7c5cff") },
    uColorB: { value: new THREE.Color("#22d3ee") },
    uPixelRatio: { value: renderer.getPixelRatio() },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uScroll;
      uniform float uSize;
      uniform float uPixelRatio;
      attribute float aSeed;
      varying float vElevation;
      varying float vDist;
      varying float vSeed;

      void main() {
        vec3 pos = position;
        // Calmer, slower-breathing swell — lower amplitude for a subtle field.
        float wave = sin(pos.x * 0.28 + uTime * 0.32) * cos(pos.y * 0.28 + uTime * 0.26);
        float wave2 = sin((pos.x + pos.y) * 0.18 + uTime * 0.45);
        float elevation = wave * 0.45 + wave2 * 0.32;

        // gentle mouse swell (a soft lift, not a sharp ripple)
        vec2 m = uMouse * 8.0;
        float d = distance(pos.xy, m);
        elevation += smoothstep(6.0, 0.0, d) * 0.7 * sin(d * 0.8 - uTime * 1.4);

        pos.z = elevation - uScroll * 2.2;
        vElevation = elevation;
        vDist = d;
        vSeed = aSeed;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        // Subtle twinkle so the field feels alive without being busy.
        float twinkle = 0.75 + 0.25 * sin(uTime * 0.8 + aSeed * 6.2831);
        float size = uSize * (0.55 + aSeed * 0.7) * twinkle;
        gl_PointSize = size * uPixelRatio * (12.0 / -mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying float vElevation;
      varying float vDist;
      varying float vSeed;

      void main() {
        float dd = distance(gl_PointCoord, vec2(0.5));
        if (dd > 0.5) discard;
        // Soft feathered dot for a quieter, more atmospheric look.
        float alpha = smoothstep(0.5, 0.05, dd);
        vec3 color = mix(uColorA, uColorB, clamp(vElevation * 0.5 + 0.5, 0.0, 1.0));
        float glow = smoothstep(5.0, 0.0, vDist);
        color = mix(color, vec3(1.0), glow * 0.35);
        float base = 0.10 + vSeed * 0.06;
        gl_FragColor = vec4(color, alpha * (base + glow * 0.28));
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  points.rotation.x = -Math.PI * 0.32;
  scene.add(points);

  /* ---- Interaction ---- */
  const mouse = new THREE.Vector2(0, 0);
  const targetMouse = new THREE.Vector2(0, 0);

  window.addEventListener("pointermove", (e) => {
    targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });

  let scrollProgress = 0;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? window.scrollY / max : 0;
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Resize ---- */
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    uniforms.uPixelRatio.value = renderer.getPixelRatio();
  }
  window.addEventListener("resize", resize, { passive: true });

  /* ---- Loop ---- */
  const clock = new THREE.Clock();
  let visible = true;
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; });

  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;

    const t = clock.getElapsedTime();
    mouse.lerp(targetMouse, 0.06);
    uniforms.uTime.value = t;
    uniforms.uMouse.value.copy(mouse);
    uniforms.uScroll.value += (scrollProgress - uniforms.uScroll.value) * 0.05;

    points.rotation.z = mouse.x * 0.06;
    camera.position.x += (mouse.x * 0.9 - camera.position.x) * 0.03;
    camera.position.y += (mouse.y * 0.6 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  tick();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initScene);
} else {
  initScene();
}
