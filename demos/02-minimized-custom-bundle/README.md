# Minimized Custom Bundle

A self-contained starter that shows how a real consumer would integrate Nuvio:
pick a subset of modules, self-host fonts, subset them aggressively, and
minify the shipped CSS. It ships **no JavaScript at all** – the navbar menu and
the theme switch are both native browser features.

## What This Demo Ships

- **Nuvio** &mdash; base component set plus navbar and a small forms subset
  (`controls`, `input`, `button`), configured in `auto` theme mode with a
  custom semantic color and a 12-column grid.
- **Source Sans 3** &mdash; self-hosted via [`@fontsource/source-sans-3`][fs].
  The static `latin` 400 and 700 `.woff2` files are subsetted at build time to
  Western European glyphs, hand-picked typographic punctuation (dashes, smart
  quotes, guillemets, ellipsis, spaces, …), and the Bitcoin symbol. Two static
  `.woff2` files ship: regular and bold.
- **Lucide icons** &mdash; loaded from [`lucide-static`][ls] and **subsetted**
  at build time to the glyphs actually referenced in `index.html`.

[fs]: https://fontsource.org/fonts/source-sans-3
[ls]: https://www.npmjs.com/package/lucide-static

Every shipped artifact lands at the root of `dist/`, no sub-directories, no
`.min.` suffixes &mdash; the minified form is the *only* form that ships:

```
dist/app.{hash}.css                    minified CSS (app + subsetted icons + fonts)
dist/lucide-icons.{hash}.woff2         subsetted Lucide font
dist/source-sans-3-400.{hash}.woff2    subsetted Source Sans 3, regular
dist/source-sans-3-700.{hash}.woff2    subsetted Source Sans 3, bold
```

`{hash}` is the leading hex digits of each file's SHA-256 (length configurable
via `hashing.hashLength` in `build.config.cjs`; default 5). Font filenames are
hashed first and spliced into `dist/app.css` before `app.css` itself is
hashed, so the CSS hash covers font changes too. `index.html` is rewritten to
reference the hashed `app.{hash}.css`, giving browsers a fresh cache key
after every rebuild.

## Install

```bash
npm install
```

This demo depends on the parent Nuvio checkout via a relative path
(`"nuvio": "file:../.."` in `package.json`). In a real consumer project you
would install the published package instead:

```jsonc
// package.json
{
    "dependencies": {
        "nuvio": "^1"
    }
}
```

Everything else in the build pipeline works identically.

## Build

```bash
npm run build       # full build: fonts + icons + CSS + hash
```

Individual steps (each is a normal npm script):

```bash
npm run build:fonts        # subset Source Sans 3 latin 400 + 700 → dist/source-sans-3-{400,700}.woff2
npm run build:icons        # scan inputs, subset Lucide → dist/lucide-icons.woff2 + src/_icons-generated.scss
npm run build:css          # sass → purgecss + cssnano → rename --nv-* → --a/b/c/… → remove tmp/icons
npm run build:hash         # hash fonts, splice into app.css, hash app.css, rewrite index.html
```

`build:css` is itself a composite wiring up atomic sub-steps (`*:icons`,
`*:sass`, `*:postcss`, `*:shorten`, `*:report`, `*:clean`). The intermediate
`dist/app.tmp.css` and the generated `src/_icons-generated.scss` are removed at
the end &mdash; the source tree stays clean between builds.

For ad-hoc testing the icon subsetter still accepts a CLI override that
bypasses `iconFont.scanFiles`:

```bash
node scripts/subset-icons.js index.html some/other/page.html
```

## Configuration

All build knobs live in **[`build.config.cjs`](./build.config.cjs)** &mdash;
this is the single source of truth. The five scripts in `scripts/*.js` and
`postcss.config.cjs` are the reference copies: every project built on this
pipeline carries them byte-identical (diff its `scripts/*.js` against
`demos/02-minimized-custom-bundle/scripts/*.js`), so an improvement made in one
project lands here first and is then copied out. They carry **no fallback
defaults**: every value they need must be declared in `build.config.cjs`.

Top-level sections:

| Section | What it controls |
|---|---|
| `outputDir`, `fontDir` | where the compiled CSS and woff2 files land (paths relative to this file) |
| `hashing` | `hashLength`, manifest `type`/`path` (`html-rewrite` for this demo; also supports `php-constants-file` and `json`). For `html-rewrite`, `path` may be a list of pages; the other two write `path[0]` |
| `assets` | list of hashable bundle entries &mdash; `[{ name: 'app.css' }]` |
| `textFonts` | sources and outputs for `subset-fonts.js` |
| `textFontGlyphs` | Unicode ranges to keep in the subsetted text fonts |
| `iconFont` | output naming + SCSS URL + scan-file globs for `subset-icons.js` (Lucide is the hardcoded source) |
| `treeShaking` | PurgeCSS `content` + `safelist` (consumed by `postcss.config.cjs`) |

## Pipeline

```
                 scripts/subset-icons.js
                 ├── reads  iconFont.scanFiles (globs expanded) + node_modules/lucide-static/font/
                 ├── writes dist/lucide-icons.woff2
                 └── writes src/_icons-generated.scss  ─┐
                                                        │
                                                        ▼
  src/app.scss   ──►  sass (expanded)  ──►  dist/app.tmp.css
                                                        │
                                                        ▼
  postcss.config.cjs  (purgecss + cssnano)  ──►  dist/app.css
                                                        │
                                                        ▼
  scripts/shorten-vars.js  (--nv-foo → --a)  ──►  dist/app.css
                                                        │
                                                        ▼
  build:css:clean   removes dist/app.tmp.css + src/_icons-generated.scss
                                                        │
                                                        ▼
  scripts/hash-assets.js:
  ├── 1. hash + rename fonts  ──►  dist/lucide-icons.{hash}.woff2
  │                                dist/source-sans-3-{400,700}.{hash}.woff2
  │                                                    │
  │                                                    ▼
  ├── 2. splice hashed names into dist/app.css
  │                                                    │
  │                                                    ▼
  ├── 3. hash + rename  ──►  dist/app.{hash}.css
  ├── 4. remove stale hashed files from previous builds
  └── 5. rewrite <link> in index.html
```

`scripts/shorten-vars.js` is the same pattern as the root repo's
`scripts/purge-vars.js`: a small focused Node utility, no extra dependencies.
PurgeCSS's `variables: true` option already drops *unused* `--nv-*`
declarations, so the shorten step only has to rename the survivors.

## No JavaScript

There is no script in this demo, and no JS step in its pipeline &mdash; the two
interactive pieces on the page are browser features:

- the burger carries `popovertarget` and the menu carries `popover`, so the
  browser owns opening, closing, <kbd>Esc</kbd> and light dismissal;
- the theme switch is a radio group whose `.theme-light` / `.theme-dark`
  classes are matched by Nuvio's `html:has(…:checked)` selectors in `auto`
  mode, with a third unclassed radio for "follow the system".

The one thing this costs: the theme choice does not survive a page load, which
would need `localStorage` and therefore a script.
