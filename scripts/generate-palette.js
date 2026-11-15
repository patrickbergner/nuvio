'use strict';
/**
 * scripts/generate-palette.js
 *
 * Generates a harmonious Nuvio color palette using color theory and outputs
 * a ready-to-paste SCSS $semantic-color-additions block plus navbar CSS variables.
 *
 * Usage:
 *   node scripts/generate-palette.js [--seed=N] [--harmony=TYPE] [--write]
 *
 * Options:
 *   --seed=N        Reproducible palette (default: random)
 *   --harmony=TYPE  triadic | split-comp | analogous | complementary (default: random)
 *   --write         Also write SCSS to generated-palette.scss in project root
 */

const fs   = require('fs');
const path = require('path');

// ── Argument Parsing ─────────────────────────────────────────────────────────
const args = {};
for (const arg of process.argv.slice(2)) {
  if (!arg.startsWith('--')) continue;
  const eq = arg.indexOf('=');
  const k  = eq === -1 ? arg.slice(2) : arg.slice(2, eq);
  const v  = eq === -1 ? true         : arg.slice(eq + 1);
  args[k] = v;
}

// ── Seeded PRNG (Mulberry32) ─────────────────────────────────────────────────
function mulberry32(seed) {
  seed = seed >>> 0;
  return function rand() {
    seed = (seed + 0x6D2B79F5) >>> 0;
    let z = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Color Math ───────────────────────────────────────────────────────────────
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => Math.round((l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))) * 255);
  return [Math.max(0, Math.min(255, f(0))),
          Math.max(0, Math.min(255, f(8))),
          Math.max(0, Math.min(255, f(4)))];
}

function toHex(r, g, b) {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

function hslHex(h, s, l) {
  return toHex(...hslToRgb(h, s, l));
}

function wcagLum(r, g, b) {
  return [r, g, b].reduce((sum, v, i) => {
    v /= 255;
    v = v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    return sum + v * [0.2126, 0.7152, 0.0722][i];
  }, 0);
}

function contrastRatio(l1, l2) {
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// Pick #fff or #000 – whichever achieves higher WCAG contrast on the given fill.
function bestText(h, s, l) {
  const lum  = wcagLum(...hslToRgb(h, s, l));
  const wc   = contrastRatio(1.0, lum);   // contrast with white
  const bc   = contrastRatio(0.0, lum);   // contrast with black
  return wc >= bc ? '#fff' : '#000';
}

function angDist(a, b) {
  const d = Math.abs(((a - b) % 360 + 360) % 360);
  return d > 180 ? 360 - d : d;
}

// ── Harmony Definitions ──────────────────────────────────────────────────────
// Each entry lists hue offsets from the primary hue.
const HARMONIES = {
  triadic:       [0, 120, 240],
  'split-comp':  [0, 150, 210],
  analogous:     [0, 30,  60, 330],
  complementary: [0, 180],
};

// Psychological ideal hue centroids per semantic role.
// These are used to assign harmony hue points to roles by best angular fit.
// When no harmony hue is close, the role's saturation/lightness ordering alone
// carries the semantic meaning (see ROLE_RANGES below).
const ROLE_IDEAL = {
  danger:  355,   // red – alarm, urgency
  warning: 45,    // amber – caution, attention
  success: 145,   // green – positive, go
  info:    210,   // blue – informational, neutral
};

// ── Saturation / Lightness Ranges ────────────────────────────────────────────
// These ranges encode a psychologically coherent intensity ordering:
//   danger  → deep, rich, alarming
//   warning → high-energy, bright (needs dark text due to lightness)
//   success → grounded, confident
//   info    → clear, neutral
//   primary → vivid brand anchor
// The ordering holds regardless of hue, so even unconventional hue assignments
// still read semantically thanks to these constraints.
const ROLE_RANGES = {
  primary: { s: [80,  96],  l: [46, 56] },
  danger:  { s: [68,  82],  l: [47, 56] },
  warning: { s: [85, 100],  l: [48, 55] },
  success: { s: [52,  70],  l: [28, 42] },
  info:    { s: [70,  90],  l: [44, 54] },
};

function rr(rand, [lo, hi]) { return lo + rand() * (hi - lo); }

// ── Palette Generation ───────────────────────────────────────────────────────
function generatePalette(seed, harmonyKey) {
  const rand = mulberry32(seed);

  // Primary hue: fully random.
  const ph = Math.floor(rand() * 360);

  // Harmony hue pool derived from primary.
  const hues = HARMONIES[harmonyKey].map(o => ((ph + o) % 360 + 360) % 360);

  // Secondary hue: the non-primary harmony hue with the greatest angular distance
  // from primary (maximizes visual separation).
  let secHue = hues[1] !== undefined ? hues[1] : (ph + 180) % 360;
  let maxD = 0;
  for (const h of hues.slice(1)) {
    const d = angDist(h, ph);
    if (d > maxD) { maxD = d; secHue = h; }
  }

  // Assign a harmony hue to each semantic role: best angular fit + small jitter.
  function pickHue(idealHue) {
    let best = hues[0], bestD = Infinity;
    for (const h of hues) {
      const d = angDist(h, idealHue);
      if (d < bestD) { bestD = d; best = h; }
    }
    // ±11° jitter prevents a mechanical, "too perfect" look.
    return ((best + (rand() - 0.5) * 22 + 360) % 360);
  }

  // Build a rounded color entry { h, s, l }.
  function entry(h, ranges) {
    return {
      h: Math.round(h),
      s: +rr(rand, ranges.s).toFixed(1),
      l: +rr(rand, ranges.l).toFixed(1),
    };
  }

  // Primary
  const primary = entry(ph, ROLE_RANGES.primary);

  // Secondary: asymmetric light/dark values (same hue, muted saturation).
  const secondary = {
    light: { h: Math.round(secHue), s: +rr(rand, [9,  15]).toFixed(1), l: +rr(rand, [82, 91]).toFixed(1) },
    dark:  { h: Math.round(secHue), s: +rr(rand, [8,  13]).toFixed(1), l: +rr(rand, [35, 45]).toFixed(1) },
  };

  // Semantic roles
  const info    = entry(pickHue(ROLE_IDEAL.info),    ROLE_RANGES.info);
  const success = entry(pickHue(ROLE_IDEAL.success), ROLE_RANGES.success);
  const warning = entry(pickHue(ROLE_IDEAL.warning), ROLE_RANGES.warning);
  const danger  = entry(pickHue(ROLE_IDEAL.danger),  ROLE_RANGES.danger);

  // Navbar light: rich, saturated bar using the primary hue.
  const nbLBgS  = rr(rand, [75, 90]);
  const nbLBgL  = rr(rand, [34, 46]);
  const nbLHvL  = nbLBgL + rr(rand, [5, 8]);
  const nbLBg   = hslHex(ph, nbLBgS, nbLBgL);
  const navbarLight = {
    bg:    nbLBg,
    text:  toHex(...hslToRgb(ph, rr(rand, [10, 20]), bestText(ph, nbLBgS, nbLBgL) === '#fff' ? rr(rand, [90, 97]) : rr(rand, [8, 18]))),
    hover: hslHex(ph, nbLBgS, nbLHvL),
  };

  // Navbar dark: deep, tinted-dark bar using the primary hue.
  const nbDBgS  = rr(rand, [15, 25]);
  const nbDBgL  = rr(rand, [10, 16]);
  const nbDHvL  = nbDBgL + rr(rand, [10, 13]);
  const navbarDark = {
    bg:    hslHex(ph, nbDBgS, nbDBgL),
    text:  hslHex(ph, rr(rand, [8, 13]), rr(rand, [88, 94])),
    hover: hslHex(ph, nbDBgS, nbDHvL),
  };

  return {
    seed,
    harmony: harmonyKey,
    primaryHue: ph,
    colors: { primary, secondary, info, success, warning, danger },
    navbar: { light: navbarLight, dark: navbarDark },
  };
}

// ── Palette Name ─────────────────────────────────────────────────────────────
function paletteName(hue, harmony) {
  // Sorted descending; find first threshold that the hue meets or exceeds.
  const HUE_NAMES = [
    [345, 'Crimson'], [315, 'Magenta'], [285, 'Violet'],  [255, 'Indigo'],
    [225, 'Azure'],   [195, 'Cyan'],    [165, 'Jade'],    [135, 'Emerald'],
    [105, 'Lime'],    [75,  'Gold'],    [45,  'Amber'],   [20,  'Coral'],
    [10,  'Vermilion'],[0,  'Ruby'],
  ];
  const HARMONY_LABELS = {
    triadic: 'Triad', 'split-comp': 'Split',
    analogous: 'Gradient', complementary: 'Contrast',
  };
  const hueName = (HUE_NAMES.find(([t]) => hue >= t) ?? [0, 'Scarlet'])[1];
  return `${hueName} ${HARMONY_LABELS[harmony] ?? harmony}`;
}

// ── SCSS Block ───────────────────────────────────────────────────────────────
function hslStr({ h, s, l }) { return `hsl(${h}, ${s}%, ${l}%)`; }

function scssBlock(palette, name) {
  const { seed, harmony, colors: c, navbar } = palette;
  const { primary, secondary, info, success, warning, danger } = c;

  function row(label, lightEntry, darkEntry) {
    const tl  = bestText(lightEntry.h, lightEntry.s, lightEntry.l);
    const td  = bestText(darkEntry.h,  darkEntry.s,  darkEntry.l);
    const pad = ' '.repeat(Math.max(1, 12 - label.length));
    return `    "${label}":${pad}(light: ${hslStr(lightEntry)}, dark: ${hslStr(darkEntry)}, text-light: ${tl},  text-dark: ${td}),`;
  }

  return [
    `// Nuvio palette – "${name}" | seed: ${seed} | harmony: ${harmony}`,
    `// Re-generate: npm run palette -- --seed=${seed} --harmony=${harmony}`,
    `//`,
    `// Paste into your entry-point file (e.g. src/main-full-auto.scss):`,
    ``,
    `@use "nuvio/src/config" with (`,
    `  $semantic-color-additions: (`,
    row('primary',   primary,          primary),
    row('secondary', secondary.light,  secondary.dark),
    row('info',      info,             info),
    row('success',   success,          success),
    row('warning',   warning,          warning),
    row('danger',    danger,           danger),
    `  )`,
    `);`,
    ``,
    `/* Navbar – paste into your CSS/SCSS after importing nuvio */`,
    `:root {`,
    `  --nv-navbar-bg: ${navbar.light.bg};`,
    `  --nv-navbar-text: ${navbar.light.text};`,
    `  --nv-navbar-hover: ${navbar.light.hover};`,
    `}`,
    ``,
    `@media (prefers-color-scheme: dark) {`,
    `  :root {`,
    `    --nv-navbar-bg: ${navbar.dark.bg};`,
    `    --nv-navbar-text: ${navbar.dark.text};`,
    `    --nv-navbar-hover: ${navbar.dark.hover};`,
    `  }`,
    `}`,
  ].join('\n');
}

// ── Terminal Display ─────────────────────────────────────────────────────────
const RESET = '\x1b[0m';
const BOX_W = 58;   // interior width (between ║ delimiters, including spaces)

function bgRgb(r, g, b) { return `\x1b[48;2;${r};${g};${b}m`; }

function swatch(hex) {
  const [r, g, b] = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map(x => parseInt(x, 16));
  return bgRgb(r, g, b) + '   ' + RESET;
}

function visLen(s) { return s.replace(/\x1b\[[^m]*m/g, '').length; }

function boxRow(content) {
  const inner = content + ' '.repeat(Math.max(0, BOX_W - visLen(content)));
  return `║${inner}║`;
}

function sectionLine(label) {
  const left = `╠══ ${label} `;
  const fill = '═'.repeat(Math.max(0, BOX_W + 2 - left.length - 1));
  return `${left}${fill}╣`;
}

function printPalette(palette, name) {
  const { seed, harmony, colors: c, navbar } = palette;
  const { primary, secondary, info, success, warning, danger } = c;
  const hline = `╠${'═'.repeat(BOX_W)}╣`;

  function colorRow(label, entry) {
    const hex = hslHex(entry.h, entry.s, entry.l);
    const sw  = swatch(hex);
    const lbl = label.padEnd(11);
    return boxRow(` ${sw} ${lbl}  ${hslStr(entry)}`);
  }

  function navRow(icon, nb) {
    const sw = swatch(nb.bg) + swatch(nb.text) + swatch(nb.hover);
    return boxRow(` ${sw} ${icon} bg ${nb.bg}  text ${nb.text}  hover ${nb.hover}`);
  }

  console.log(`╔${'═'.repeat(BOX_W)}╗`);
  console.log(boxRow(`  Nuvio Palette – "${name}"`));
  console.log(boxRow(`  Seed: ${seed}  |  Harmony: ${harmony}`));
  console.log(hline);
  console.log(colorRow('primary', primary));

  // Secondary: show both light and dark swatches side-by-side.
  {
    const hL = hslHex(secondary.light.h, secondary.light.s, secondary.light.l);
    const hD = hslHex(secondary.dark.h,  secondary.dark.s,  secondary.dark.l);
    const sw = swatch(hL) + swatch(hD);
    console.log(boxRow(` ${sw} secondary    ${hslStr(secondary.light)} / ☾dark`));
  }

  console.log(colorRow('info',    info));
  console.log(colorRow('success', success));
  console.log(colorRow('warning', warning));
  console.log(colorRow('danger',  danger));
  console.log(sectionLine('Navbar'));
  console.log(navRow('☀ light', navbar.light));
  console.log(navRow('☾ dark ', navbar.dark));
  console.log(`╚${'═'.repeat(BOX_W)}╝`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
const HARMONY_KEYS = Object.keys(HARMONIES);

const seed = args.seed
  ? (parseInt(args.seed, 10) >>> 0)
  : (Math.random() * 0xFFFFFFFF | 0);

const harmony = HARMONY_KEYS.includes(args.harmony)
  ? args.harmony
  : HARMONY_KEYS[Math.floor(Math.random() * HARMONY_KEYS.length)];

const palette = generatePalette(seed, harmony);
const name    = paletteName(palette.primaryHue, harmony);
const scss    = scssBlock(palette, name);

printPalette(palette, name);
process.stdout.write('\n');
process.stdout.write(scss + '\n');

if (args.write) {
  const outPath = path.resolve(__dirname, '..', 'generated-palette.scss');
  fs.writeFileSync(outPath, scss + '\n');
  process.stdout.write(`\nWritten to: ${outPath}\n`);
}
