'use strict';

// ── Configuration for the Unified Build Scripts in scripts/*.js ──

module.exports = {

    // ── Output Layout ────────────────────────────────────────────
    outputDir: 'dist',
    fontDir: 'dist',


    // ── Asset Hashing ────────────────────────────────────────────
    assets: [
        { name: 'app.css' },
    ],

    hashing: {
        hashLength: 5,
        type: 'html-rewrite',
        path: 'index.html',
        urlPrefix: './dist/',
    },


    // ── Text Fonts to Subset ─────────────────────────────────────
    textFonts: [
        { from: 'node_modules/@fontsource/source-sans-3/files/source-sans-3-latin-400-normal.woff2', to: 'source-sans-3-400.woff2' },
        { from: 'node_modules/@fontsource/source-sans-3/files/source-sans-3-latin-700-normal.woff2', to: 'source-sans-3-700.woff2' },
    ],

    textFontGlyphs: [
        [0x0020, 0x007e], // U+0020-007E  Basic Latin (printable ASCII)
        [0x00a0, 0x00ff], // U+00A0-00FF  Latin-1 Supplement (á, é, ñ, ü, ß, ¿, ¡, ¢, £, ¤, ¥, …)
        [0x0152, 0x0153], // U+0152-0153  Œ/œ (French)
        [0x0160, 0x0161], // U+0160-0161  Š/š
        [0x0178, 0x0178], // U+0178       Ÿ
        [0x017d, 0x017e], // U+017D-017E  Ž/ž
        [0x2000, 0x200B], // U+2000-200B  Typographic spaces (en/em/thin/hair space, zero-width space, …)
        [0x2010, 0x2015], // U+2010-2015  Hyphens & dashes (hyphen, non-breaking hyphen, en dash, em dash, …)
        [0x2018, 0x2026], // U+2018-2026  Quotation marks & ellipsis (' ' " " „ • … and daggers/bullets)
        [0x202F, 0x203D], // U+202F-203D  Narrow NBSP, per-mille, primes, guillemets (‹ ›), interrobang (‽)
        [0x2047, 0x2049], // U+2047-2049  Combined punctuation (?? ?! !?)
        [0x205B, 0x205E], // U+205B-205E  Miscellaneous marks (tricolon, vertical four dots, …)
        [0x20BF, 0x20BF], // U+20BF       ₿ (Bitcoin)
        [0x2122, 0x2122], // U+2122       ™ (Trademark)
    ],


    // ── Icon Font (Lucide) ───────────────────────────────────────
    iconFont: {
        outName: 'lucide-icons.woff2',
        urlInGeneratedScss: './lucide-icons.woff2',
        scanFiles: ['index.html'], // may contain glob patterns (*, ?)
        generatedScssPath: 'src/_icons-generated.scss',
    },


    // ── CSS Tree Shaking and Minification ────────────────────────
    treeShaking: {
        content: ['./index.html'],
        safelist: {
            // is-light / is-dark are kept for consumers that force a theme from
            // markup; the theme switch on this page relies on .theme-light /
            // .theme-dark, which PurgeCSS finds in index.html on its own.
            standard: [/^icon-/, 'is-light', 'is-dark'],
        },
    },

};
