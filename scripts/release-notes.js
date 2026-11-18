'use strict';
/**
 * Writes the notes for a GitHub release: install snippets carrying the SRI
 * hashes of the minified bundles, for the version in package.json.
 * release.yml passes the result to `gh release create`, which appends
 * GitHub's generated notes below it.
 *
 * Usage:
 *   node scripts/release-notes.js              # print, to preview before tagging
 *   node scripts/release-notes.js notes.md     # write to a file
 *
 * The hashes hold for exact-version CDN URLs only: jsDelivr and unpkg serve the
 * npm tarball's bytes unchanged, but a range like @1 moves with each release.
 */

const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');

const ROOT     = path.resolve(__dirname, '..');
const DIST     = path.join(ROOT, 'dist');
const OUT_FILE = process.argv[2];
const pkg      = require(path.join(ROOT, 'package.json'));
const CDN      = `https://cdn.jsdelivr.net/npm/${pkg.name}@${pkg.version}/dist`;

// ── Helpers ─────────────────────────────────────────────────────────────────
function sri(file) {
    const digest = crypto.createHash('sha384').update(fs.readFileSync(file)).digest('base64');
    return `sha384-${digest}`;
}

// ── Notes ───────────────────────────────────────────────────────────────────
const minified = fs.readdirSync(DIST)
    .filter(f => f.endsWith('.min.css'))
    .sort((a, b) => (a === 'nuvio.min.css' ? -1 : b === 'nuvio.min.css' ? 1 : a.localeCompare(b)));

if (!minified.includes('nuvio.min.css')) {
    process.stderr.write('error: dist/nuvio.min.css not found – run npm run build first\n');
    process.exit(1);
}

const notes = [
    '## Install',
    '',
    '```bash',
    `npm install ${pkg.name}@${pkg.version}`,
    '```',
    '',
    '```html',
    `<link rel="stylesheet" href="${CDN}/nuvio.min.css" integrity="${sri(path.join(DIST, 'nuvio.min.css'))}" crossorigin="anonymous" />`,
    '```',
    '',
    '<details>',
    '<summary>SRI hashes of all minified bundles</summary>',
    '',
    '| File | `integrity` |',
    '|---|---|',
    ...minified.map(f => `| \`${f}\` | \`${sri(path.join(DIST, f))}\` |`),
    '',
    '</details>',
    '',
].join('\n');

if (OUT_FILE) fs.writeFileSync(OUT_FILE, notes);
else process.stdout.write(notes);
