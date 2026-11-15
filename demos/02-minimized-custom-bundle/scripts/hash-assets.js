'use strict';
const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');
const util   = require('util');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const config = require(path.join(PROJECT_ROOT, 'build.config.cjs'));

const HASH_LENGTH = config.hashing.hashLength;
const OUTPUT_DIR  = path.resolve(PROJECT_ROOT, config.outputDir);
const FONT_DIR    = path.resolve(PROJECT_ROOT, config.fontDir);
// hashing.path accepts a single file or a list of them. Every entry of an
// html-rewrite list gets the same substitutions; a page that references only
// some of the assets simply yields no match for the others.
const MANIFESTS   = [].concat(config.hashing.path).map(p => path.resolve(PROJECT_ROOT, p));

// All woff2 outputs land in FONT_DIR – text fonts via subset-fonts.js
// (config.textFonts), icon font via subset-icons.js (config.iconFont.outName).
// Both kinds get hashed here so the CSS that references them can be rewritten
// in one pass.
const FONT_NAMES = [
    ...config.textFonts.map(f => f.to),
    config.iconFont.outName,
];
const ASSET_NAMES = config.assets.map(a => a.name);

// Matches any previously-hashed output: stem.{HASH_LENGTH hex chars}.ext
const STALE_RE = new RegExp(`^.+\\.[0-9a-f]{${HASH_LENGTH}}\\.(css|js|woff2)$`);

function shortHash(buf) {
    return crypto.createHash('sha256').update(buf).digest('hex').slice(0, HASH_LENGTH);
}

function splitName(name) {
    const dot = name.lastIndexOf('.');
    return { base: name.slice(0, dot), ext: name.slice(dot) };
}

function relRoot(p) {
    return path.relative(PROJECT_ROOT, p);
}

function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hashedRe(base, ext) {
    return new RegExp(
        escapeRe(base) + `(?:\\.[0-9a-f]{${HASH_LENGTH}})?` + escapeRe(ext),
        'g'
    );
}

// Locate a previously-hashed output for the given source name. Used to
// carry the existing hash forward when only a subset of assets was rebuilt
// (e.g. `npm run build:css && npm run build:hash` – text fonts and JS
// were not regenerated and only exist on disk in their hashed form).
function findExistingHashed(dir, name) {
    const { base, ext } = splitName(name);
    const re = new RegExp(`^${escapeRe(base)}\\.[0-9a-f]{${HASH_LENGTH}}${escapeRe(ext)}$`);
    for (const f of fs.readdirSync(dir)) {
        if (re.test(f)) return f;
    }
    return null;
}

const mapping = {};
const padTo   = Math.max(0, ...FONT_NAMES.concat(ASSET_NAMES).map(n => n.length));

// ── 1. Hash Font Files and Rename Them ─────────────────────────
// Fonts must be hashed first so their new names can be baked into
// the CSS asset before that asset itself is hashed.
for (const name of FONT_NAMES) {
    const src = path.join(FONT_DIR, name);
    if (fs.existsSync(src)) {
        const { base, ext } = splitName(name);
        const hashed = `${base}.${shortHash(fs.readFileSync(src))}${ext}`;
        fs.renameSync(src, path.join(FONT_DIR, hashed));
        mapping[name] = hashed;
        console.log(util.format('  %s → %s', name.padEnd(padTo, ' '), hashed));
    } else {
        const existing = findExistingHashed(FONT_DIR, name);
        if (!existing) {
            console.error(`  missing: ${relRoot(src)} – run the full build first`);
            process.exit(1);
        }
        mapping[name] = existing;
        console.log(util.format('  %s = %s (kept)', name.padEnd(padTo, ' '), existing));
    }
}

// ── 2. Rewrite Font Filename References Inside the Compiled CSS ───
// Identifies the .css entry in config.assets and substitutes every
// font name (with or without any pre-existing hash) for its new hashed
// form. Leading "./" / quotes / surrounding whitespace are preserved.
const cssAsset = ASSET_NAMES.find(n => n.endsWith('.css'));
if (cssAsset && Object.keys(mapping).length > 0) {
    const cssPath = path.join(OUTPUT_DIR, cssAsset);
    // Only rewrite when the unhashed CSS was just produced. If it doesn't exist,
    // CSS wasn't rebuilt this pass – the existing hashed CSS already references
    // the existing hashed fonts, so the rewrite would be a no-op anyway.
    if (fs.existsSync(cssPath)) {
        let css = fs.readFileSync(cssPath, 'utf8');
        for (const [from, to] of Object.entries(mapping)) {
            const { base, ext } = splitName(from);
            css = css.replace(hashedRe(base, ext), to);
        }
        fs.writeFileSync(cssPath, css);
    }
}

// ── 3. Hash the Assets (CSS + JS) ───────────────────────────────
// CSS goes after step 2 so its hash reflects the rewritten font refs.
for (const name of ASSET_NAMES) {
    const src = path.join(OUTPUT_DIR, name);
    if (fs.existsSync(src)) {
        const { base, ext } = splitName(name);
        const hashed = `${base}.${shortHash(fs.readFileSync(src))}${ext}`;
        fs.renameSync(src, path.join(OUTPUT_DIR, hashed));
        mapping[name] = hashed;
        console.log(util.format('  %s → %s', name.padEnd(padTo, ' '), hashed));
    } else {
        const existing = findExistingHashed(OUTPUT_DIR, name);
        if (!existing) {
            console.error(`  missing: ${relRoot(src)} – run the full build first`);
            process.exit(1);
        }
        mapping[name] = existing;
        console.log(util.format('  %s = %s (kept)', name.padEnd(padTo, ' '), existing));
    }
}

// ── 4. Remove Stale Hashed Files from Previous Builds ───────────
// Scans every distinct configured output directory.
const dirs    = [...new Set([OUTPUT_DIR, FONT_DIR])];
const current = new Set(Object.values(mapping));
for (const dir of dirs) {
    for (const f of fs.readdirSync(dir)) {
        if (STALE_RE.test(f) && !current.has(f)) {
            fs.unlinkSync(path.join(dir, f));
            console.log(`  removed stale: ${relRoot(path.join(dir, f))}`);
        }
    }
}

// ── 5. Emit the Manifest in Its Configured Form ─────────────────
const hashing = config.hashing;
if (hashing.type === 'html-rewrite') {
    const urlPrefix = hashing.urlPrefix;
    for (const manifest of MANIFESTS) {
        let html = fs.readFileSync(manifest, 'utf8');
        for (const name of ASSET_NAMES) {
            const { base, ext } = splitName(name);
            const re = new RegExp(
                escapeRe(urlPrefix) + escapeRe(base) + `(?:\\.[0-9a-f]{${HASH_LENGTH}})?` + escapeRe(ext),
                'g'
            );
            html = html.replace(re, `${urlPrefix}${mapping[name]}`);
        }
        fs.writeFileSync(manifest, html);
        console.log(`  ${relRoot(manifest)} updated`);
    }
} else if (hashing.type === 'php-constants-file') {
    const constantPrefix = hashing.constantPrefix;
    // Constant name is <prefix><BASE_UPPER_UNDERSCORES>_<EXT_UPPER>, so
    // app.css and app.js coexist as ASSET_HASH_APP_CSS / ASSET_HASH_APP_JS.
    const constNames = ASSET_NAMES.map(n => {
        const { base, ext } = splitName(n);
        return `${constantPrefix}${base.toUpperCase().replace(/-/g, '_')}_${ext.slice(1).toUpperCase()}`;
    });
    const padW = Math.max(0, ...constNames.map(n => n.length));
    const lines = [
        '<?php',
        `// GENERATED by scripts/hash-assets.js – do not edit.`,
    ];
    ASSET_NAMES.forEach((name, i) => {
        const { base, ext } = splitName(name);
        const hashRe = new RegExp(`\\.([0-9a-f]{${HASH_LENGTH}})${escapeRe(ext)}$`);
        const hashOnly = mapping[name].match(hashRe)[1];
        lines.push(`const ${constNames[i].padEnd(padW, ' ')} = "${hashOnly}";`);
    });
    // Single-file manifest kinds ignore any extra entries in hashing.path.
    fs.writeFileSync(MANIFESTS[0], lines.join('\n') + '\n');
    console.log(`  ${relRoot(MANIFESTS[0])} updated`);
} else if (hashing.type === 'json') {
    fs.writeFileSync(MANIFESTS[0], JSON.stringify(mapping, null, 2) + '\n');
    console.log(`  ${relRoot(MANIFESTS[0])} updated`);
} else {
    console.error(`  unknown hashing.type: ${hashing.type}`);
    process.exit(1);
}
