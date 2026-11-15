'use strict';
/**
 * scripts/dist-sizes.js
 *
 * Lists all dist/*.css files with their uncompressed and gzipped sizes.
 *
 * Usage:
 *   node scripts/dist-sizes.js           # tabular output
 *   node scripts/dist-sizes.js --json    # JSON output, keyed by filename
 */

const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// ── Argument Parsing ─────────────────────────────────────────────────────────
const jsonMode = process.argv.includes('--json');

// ── File Discovery ───────────────────────────────────────────────────────────
const distDir = path.resolve(__dirname, '..', 'dist');

if (!fs.existsSync(distDir)) {
  process.stderr.write(`dist/ directory not found at ${distDir}\nRun npm run build first.\n`);
  process.exit(1);
}

const files = fs.readdirSync(distDir)
  .filter(f => f.endsWith('.css'))
  .sort();

if (files.length === 0) {
  process.stderr.write('No .css files found in dist/. Run npm run build first.\n');
  process.exit(1);
}

// ── Size Measurement ─────────────────────────────────────────────────────────
const entries = files.map(file => {
  const fullPath = path.join(distDir, file);
  const raw      = fs.readFileSync(fullPath);
  const gzipped  = zlib.gzipSync(raw, { level: zlib.constants.Z_BEST_COMPRESSION });

  return {
    file:        file,
    raw:         raw.length,
    gzip:        gzipped.length,
  };
});

// ── JSON Output ──────────────────────────────────────────────────────────────
if (jsonMode) {
  const obj = Object.fromEntries(entries.map(e => [e.file, { raw: e.raw, gzip: e.gzip }]));
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
  process.exit(0);
}

// ── Tabular Output ───────────────────────────────────────────────────────────
function fmt(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / 1024).toFixed(1) + ' KB';
}

function fmtPad(bytes, width) {
  const s = fmt(bytes);
  return s.padStart(width);
}

const COL_FILE = Math.max('File'.length, ...entries.map(e => e.file.length));
const COL_RAW  = Math.max('Uncompressed'.length, ...entries.map(e => fmt(e.raw).length));
const COL_GZIP = Math.max('Gzipped'.length, ...entries.map(e => fmt(e.gzip).length));

const SEP = ' │ ';
const TOTAL_W = COL_FILE + SEP.length + COL_RAW + SEP.length + COL_GZIP;

function row(file, raw, gzip) {
  return file.padEnd(COL_FILE) + SEP + raw.padStart(COL_RAW) + SEP + gzip.padStart(COL_GZIP);
}

const divider = '─'.repeat(TOTAL_W);

// Group: separate expanded and minified
const expanded = entries.filter(e => !e.file.endsWith('.min.css'));
const minified = entries.filter(e =>  e.file.endsWith('.min.css'));

process.stdout.write('\n');
process.stdout.write(row('File', 'Uncompressed', 'Gzipped') + '\n');
process.stdout.write(divider + '\n');

function printGroup(group) {
  group.forEach(e => {
    process.stdout.write(row(e.file, fmtPad(e.raw, COL_RAW), fmtPad(e.gzip, COL_GZIP)) + '\n');
  });
}

if (expanded.length && minified.length) {
  printGroup(expanded);
  process.stdout.write(divider + '\n');
  printGroup(minified);
} else {
  printGroup(entries);
}

// Totals
const totalRaw  = entries.reduce((s, e) => s + e.raw,  0);
const totalGzip = entries.reduce((s, e) => s + e.gzip, 0);
process.stdout.write(divider + '\n');
process.stdout.write(row(`${entries.length} files`, fmtPad(totalRaw, COL_RAW), fmtPad(totalGzip, COL_GZIP)) + '\n');
process.stdout.write('\n');
