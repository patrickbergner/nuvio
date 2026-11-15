'use strict';
const fs = require('fs');

const file = process.argv[2];
if (!file) {
    console.error('usage: shorten-vars.js <css-file>');
    process.exit(1);
}

if (process.env.SKIP_VAR_SHORTEN === '1') {
    console.log('  shorten-vars: skipping (SKIP_VAR_SHORTEN=1), keeping --nv-* names');
    process.exit(0);
}

let css = fs.readFileSync(file, 'utf8');

const names = new Set();
for (const m of css.matchAll(/--nv-([\w-]+)/g)) names.add(m[1]);

const shortOf = (n) => {
    let s = '';
    do {
        s = String.fromCharCode(97 + (n % 26)) + s;
        n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return s;
};

const map = new Map();
Array.from(names).sort().forEach((name, i) => map.set(name, shortOf(i)));

css = css.replace(/--nv-([\w-]+)/g, (_, name) => {
    const short = map.get(name);
    return short ? `--${short}` : `--nv-${name}`;
});

fs.writeFileSync(file, css);

const origBytes = Array.from(names).reduce((sum, n) => sum + `--nv-${n}`.length, 0);
const newBytes  = Array.from(names).reduce((sum, n) => sum + `--${map.get(n)}`.length, 0);
console.log(
    `  shortened: ${names.size} vars, ~${origBytes - newBytes} bytes saved per occurrence group`
);
