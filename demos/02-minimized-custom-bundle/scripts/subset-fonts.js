'use strict';
const fs   = require('fs');
const path = require('path');
const util = require('util');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const config = require(path.join(PROJECT_ROOT, 'build.config.cjs'));

const FONT_DIR = path.resolve(PROJECT_ROOT, config.fontDir);
const fonts    = config.textFonts.map(f => ({
    from: path.resolve(PROJECT_ROOT, f.from),
    to:   f.to,
}));
const ranges = config.textFontGlyphs;

async function main() {
    if (fonts.length === 0) {
        console.warn('  no fonts configured – skipping');
        return;
    }

    for (const { from } of fonts) {
        if (!fs.existsSync(from)) {
            console.error(`  missing: ${path.relative(PROJECT_ROOT, from)}`);
            process.exit(1);
        }
    }

    const subsetText = ranges
        .flatMap(([lo, hi]) => {
            const chars = [];
            for (let cp = lo; cp <= hi; cp++) chars.push(String.fromCodePoint(cp));
            return chars;
        })
        .join('');

    const subsetFont = require('subset-font');

    fs.mkdirSync(FONT_DIR, { recursive: true });

    const padTo = Math.max(0, ...fonts.map(f => f.to.length));

    for (const { from, to } of fonts) {
        const outPath = path.join(FONT_DIR, to);
        const srcBuffer    = fs.readFileSync(from);
        const subsetBuffer = await subsetFont(srcBuffer, subsetText, { targetFormat: 'woff2' });
        fs.writeFileSync(outPath, subsetBuffer);

        const srcSize = fs.statSync(from).size;
        const outSize = fs.statSync(outPath).size;
        const pct     = (outSize / srcSize) * 100;
        console.log(util.format(
            '  %s %s KB (%s%% of %s KB source)',
            to.padEnd(padTo, ' '),
            (outSize / 1024).toFixed(1).padStart(5, ' '),
            pct.toFixed(1).padStart(4, ' '),
            (srcSize / 1024).toFixed(1).padStart(5, ' ')
        ));
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
