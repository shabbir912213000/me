#!/usr/bin/env node
/**
 * Regenerate the hero portrait wavy mask + ring SVGs.
 *
 * 1. Edit the config object below.
 * 2. Run: node scripts/regenerate-wavy-mask.mjs
 *
 * Writes:
 *   assets/img/wavy-mask.svg  — filled shape (CSS mask for the photo window)
 *   assets/img/wavy-frame.svg — outline stroke (CSS mask for the gradient ring)
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const config = {
  apexCount: 16,
  centerX: 128,
  centerY: 128,
  outerRadius: 112,
  innerRadius: 95,
  // 0 = sharp point, 1 = very rounded
  apexRoundness: 1.5,
  // 0 = sharp valley, 1 = very rounded valley
  valleyRoundness: 0.55,
  rotation: -90,
};

function polarPoint(cx, cy, radius, angleDeg) {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  };
}

function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function pointBetween(a, b, amount) {
  return {
    x: a.x + (b.x - a.x) * amount,
    y: a.y + (b.y - a.y) * amount,
  };
}

function roundVertex(previous, current, next, roundness) {
  const previousDistance = distance(previous, current);
  const nextDistance = distance(current, next);
  const maxCut = Math.min(previousDistance, nextDistance) * 0.48;
  const cut = maxCut * roundness;

  return {
    start: pointBetween(current, previous, cut / previousDistance),
    control: current,
    end: pointBetween(current, next, cut / nextDistance),
  };
}

function buildBadge({
  apexCount,
  centerX,
  centerY,
  outerRadius,
  innerRadius,
  apexRoundness,
  valleyRoundness,
  rotation,
}) {
  const totalPoints = apexCount * 2;
  const angleStep = 360 / totalPoints;
  const points = [];

  for (let i = 0; i < totalPoints; i++) {
    const isApex = i % 2 === 0;
    const radius = isApex ? outerRadius : innerRadius;
    const angle = rotation + i * angleStep;

    points.push({
      ...polarPoint(centerX, centerY, radius, angle),
      isApex,
    });
  }

  const rounded = points.map((current, i) => {
    const previous = points[(i - 1 + totalPoints) % totalPoints];
    const next = points[(i + 1) % totalPoints];
    const roundness = current.isApex ? apexRoundness : valleyRoundness;

    return roundVertex(previous, current, next, roundness);
  });

  let d = `M ${rounded[0].end.x.toFixed(3)} ${rounded[0].end.y.toFixed(3)}`;

  for (let i = 1; i < totalPoints; i++) {
    const corner = rounded[i];
    d += ` L ${corner.start.x.toFixed(3)} ${corner.start.y.toFixed(3)}`;
    d += ` Q ${corner.control.x.toFixed(3)} ${corner.control.y.toFixed(3)} ${corner.end.x.toFixed(3)} ${corner.end.y.toFixed(3)}`;
  }

  const first = rounded[0];
  d += ` L ${first.start.x.toFixed(3)} ${first.start.y.toFixed(3)}`;
  d += ` Q ${first.control.x.toFixed(3)} ${first.control.y.toFixed(3)} ${first.end.x.toFixed(3)} ${first.end.y.toFixed(3)}`;
  d += " Z";

  return d;
}

function formatConfigComment() {
  const lines = [
    "    config = {",
    `      apexCount: ${config.apexCount}, centerX: ${config.centerX}, centerY: ${config.centerY},`,
    `      outerRadius: ${config.outerRadius}, innerRadius: ${config.innerRadius},`,
    `      apexRoundness: ${config.apexRoundness}, valleyRoundness: ${config.valleyRoundness}, rotation: ${config.rotation}`,
    "    }",
  ];
  return lines.join("\n");
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const imgDir = join(root, "assets", "img");
const pathD = buildBadge(config);

const maskSvg = `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <!--
    Static wavy-mask used as a CSS mask in .hero__avatar-reveal.
    SVGs referenced from CSS mask:/background: run in a restricted, script-free
    mode, so the path below is pre-baked. To re-shape it, edit the config in
    scripts/regenerate-wavy-mask.mjs and run:
      node scripts/regenerate-wavy-mask.mjs

${formatConfigComment()}
  -->
  <path id="badge" fill="#000000" d="${pathD}"/>
</svg>
`;

const frameSvg = `<svg width="800" height="800" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <!--
    Gradient ring for the hero portrait. Traces the exact same outline as
    wavy-mask.svg. Regenerate both files with:
      node scripts/regenerate-wavy-mask.mjs
  -->
  <path
    d="${pathD}"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
`;

writeFileSync(join(imgDir, "wavy-mask.svg"), maskSvg, "utf8");
writeFileSync(join(imgDir, "wavy-frame.svg"), frameSvg, "utf8");

console.log("Wrote assets/img/wavy-mask.svg");
console.log("Wrote assets/img/wavy-frame.svg");
