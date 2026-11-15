'use strict';
/**
 * scripts/purge-vars.js <css-file>
 *
 * Removes --nv-* CSS custom property declarations that are never consumed
 * via var(--nv-NAME) anywhere in the same file. Edits the file in-place.
 *
 * Works on both expanded and compressed Sass output.
 */

const fs = require('fs');

const file = process.argv[2];
if (!file) {
  process.stderr.write('Usage: node scripts/purge-vars.js <css-file>\n');
  process.exit(1);
}

let css = fs.readFileSync(file, 'utf8');

// 1. Collect every variable name consumed via var(--nv-NAME) anywhere in the file.
//    This covers both primary references and fallback values, e.g.:
//      var(--nv-surface-1)
//      var(--nv-navbar-bg, var(--nv-surface-1))
const used = new Set();
for (const [, name] of css.matchAll(/var\(--nv-([\w-]+)/g)) {
  used.add(name);
}

// 2. Drop declarations for variables that are never consumed.
//    Matches both expanded form ("  --nv-NAME: #hex;\n") and
//    compressed form ("--nv-NAME: #hex;" inside a single-line block).
css = css.replace(/[ \t]*--nv-([\w-]+)\s*:[^;]*;[ \t]*\n?/g, (match, name) =>
  used.has(name) ? match : ''
);

// 3. Remove rule blocks emptied by step 2, innermost first. Loop until stable:
//    each pass strips one nesting level, and with $css-layers enabled the
//    tokens can sit three deep (@media { @layer { :root {} } }).
const emptyBlock = /[^\s{}][^{}]*\{\s*\}/g;
for (let before = null; before !== css; ) {
  before = css;
  css = css.replace(emptyBlock, '');
}

// 4. Collapse runs of blank lines left by expanded-form removals.
css = css.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(file, css.trimEnd() + '\n');
