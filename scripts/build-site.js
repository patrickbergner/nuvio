'use strict';
/**
 * Assembles the GitHub Pages site in _site/ from the built demos:
 *
 *   /                   demos/01-overview
 *   /minimized-bundle/  demos/02-minimized-custom-bundle
 *
 * Only copies, rewrites links and stamps the version, the year and the bundle
 * sizes into the overview – build first:
 *   npm run build
 *   (cd demos/02-minimized-custom-bundle && npm install && npm run build)
 *   node scripts/build-site.js
 *
 * Every link the site keeps is relative, so it works both on a custom domain
 * and under the /<repo>/ prefix of a github.io project site.
 */

const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT        = path.resolve(__dirname, '..');
const OUT         = path.join(ROOT, '_site');
const BUNDLE      = 'demos/02-minimized-custom-bundle';
const BUNDLE_PATH = 'minimized-bundle';  // where the site serves BUNDLE
const pkg         = require(path.join(ROOT, 'package.json'));

// The overview links its assets relative to where it sits in the repo. At the
// site root those paths would climb out of the site, so they are rewritten.
const OVERVIEW_REWRITES = [
    ['../../dist/nuvio.css', 'dist/nuvio.css'],
    ['../icon.svg',          'icon.svg'],
    ['../logo.svg',          'logo.svg'],
];

// The overview marks generated values as <!-- §§_NAME_§§ -->value; the site
// gets the current value in place of whatever the source carries.
const OVERVIEW_STAMPS = {
    VERSION: pkg.version,
    MAJOR:   pkg.version.split('.')[0],
    YEAR:    String(new Date().getFullYear()),
    ...sizeStamps(),
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function fail(message) {
    process.stderr.write(`error: ${message}\n`);
    process.exit(1);
}

function input(rel) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) fail(`${rel} is missing – build it first`);
    return abs;
}

// Sizes in KiB, gzipped the way scripts/dist-sizes.js measures them: SIZE_X
// and GZIP_X for every dist/x.min.css and for the bundle demo's CSS, plus the
// smallest minified bundle rounded to whole KiB.
function sizeStamps() {
    const kib    = bytes => (bytes / 1024).toFixed(1);
    const stamps = {};
    const measure = (key, rel) => {
        const raw = fs.readFileSync(input(rel));
        stamps[`SIZE_${key}`] = kib(raw.length);
        stamps[`GZIP_${key}`] = kib(zlib.gzipSync(raw, { level: zlib.constants.Z_BEST_COMPRESSION }).length);
        return raw.length;
    };

    const minified = fs.readdirSync(input('dist')).filter(f => f.endsWith('.min.css'));
    const sizes    = minified.map(f => measure(f.slice(0, -'.min.css'.length).replace(/-/g, '_').toUpperCase(), `dist/${f}`));
    stamps.SIZE_SMALLEST = String(Math.round(Math.min(...sizes) / 1024));

    const css = fs.readdirSync(input(`${BUNDLE}/dist`)).filter(f => /^app\.[0-9a-f]+\.css$/.test(f));
    if (css.length !== 1) fail(`expected one hashed app.*.css in ${BUNDLE}/dist, found ${css.length}`);
    measure('BUNDLE_DEMO', `${BUNDLE}/dist/${css[0]}`);
    return stamps;
}

function copy(rel, to) {
    const dest = path.join(OUT, to);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.cpSync(input(rel), dest, { recursive: true });
}

// Every relative href/src of a page has to land on a file inside the site.
function checkLinks(page) {
    const name = path.relative(OUT, page).split(path.sep).join('/');
    const html = fs.readFileSync(page, 'utf8');
    for (const [, ref] of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
        if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(ref)) continue;
        const target = path.resolve(path.dirname(page), ref.split(/[?#]/)[0]);
        const inside = path.relative(OUT, target);
        if (inside.startsWith('..') || path.isAbsolute(inside)) {
            fail(`${name} links ${ref}, which points outside the site`);
        }
        if (!fs.existsSync(target)) fail(`${name} links ${ref}, which the site lacks`);
    }
}

// ── Overview at the Site Root ───────────────────────────────────────────────
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let overview = fs.readFileSync(input('demos/01-overview/index.html'), 'utf8');
for (const [from, to] of OVERVIEW_REWRITES) {
    const attr = `="${from}"`;
    if (!overview.includes(attr)) {
        fail(`demos/01-overview/index.html no longer links ${from} – update OVERVIEW_REWRITES`);
    }
    overview = overview.split(attr).join(`="${to}"`);
}
for (const [name, value] of Object.entries(OVERVIEW_STAMPS)) {
    const marker = `<!-- §§_${name}_§§ -->`;
    if (!overview.includes(marker)) {
        fail(`demos/01-overview/index.html has no ${marker} – add it, or drop the stamp from OVERVIEW_STAMPS`);
    }
    overview = overview.replace(new RegExp(`(${marker})[^<]*`, 'g'), `$1${value}`);
}
fs.writeFileSync(path.join(OUT, 'index.html'), overview);
copy('dist/nuvio.css', 'dist/nuvio.css');
copy('demos/icon.svg', 'icon.svg');
copy('demos/logo.svg', 'logo.svg');

// ── Custom Bundle at a Subpath ──────────────────────────────────────────────
// Self-contained apart from ../icon.svg, which resolves to the root copy.
copy(`${BUNDLE}/index.html`, `${BUNDLE_PATH}/index.html`);
copy(`${BUNDLE}/dist`, `${BUNDLE_PATH}/dist`);

// ── Verification ────────────────────────────────────────────────────────────
checkLinks(path.join(OUT, 'index.html'));
checkLinks(path.join(OUT, BUNDLE_PATH, 'index.html'));

process.stdout.write('Site assembled in _site/\n');
