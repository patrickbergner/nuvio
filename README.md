# ☁️ Nuvio CSS Framework

*Nuvio – like "nuvola" (cloud), light foundation*

**[Live demo & component overview](https://patrickbergner.github.io/nuvio/)** · [npm](https://www.npmjs.com/package/nuvio) · [Releases](https://github.com/patrickbergner/nuvio/releases)

A small CSS framework for web applications: ready-to-use components and layout helpers on a Flexbox grid, with light and dark mode out of the box.

- **Small** – the full set is about 23 KB gzipped, the base set about 4 KB, and a purged build of only what a page uses goes much lower.
- **Light and dark built in** – follows the operating system, and can be forced with a class or switched by a plain radio group.
- **No JavaScript** – dropdowns, menus, modals and accordions run on native `popover`, `<dialog>` and `<details>`. Only the filename display of a file upload needs a few lines of script.
- **Customizable** – colors, typography, breakpoints and the selection of components are Sass variables.

## Quick Start

**From a CDN:**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nuvio@1/dist/nuvio.min.css" />
```

`@1` follows the latest 1.x release. For production, pin an exact version and add its `integrity` hash – the notes of every [release](https://github.com/patrickbergner/nuvio/releases) list them.

**From npm:**

```bash
npm install nuvio
```

Then import `nuvio/dist/nuvio.css` in your entry point (see [Framework Integration](#framework-integration)), or link it from `node_modules`.

**A first page:**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Hello Nuvio</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nuvio@1/dist/nuvio.min.css" />
</head>
<body>
  <main class="container mt-6">
    <h1 class="title is-level-1">Hello Nuvio</h1>
    <p class="subtitle is-level-3 block">Light or dark, following your system setting.</p>
    <div class="notification is-success block">It works.</div>
    <div class="row">
      <div class="col"><div class="box">One</div></div>
      <div class="col"><div class="box">Two</div></div>
    </div>
    <button class="button is-primary">Primary</button>
  </main>
</body>
</html>
```

**Spacing:** most components carry no outer margin. Add `.block` to give an element the standard vertical gap (1.5rem) below it, or use the `mb-*` / `mt-*` helpers for other distances.

**Icons:** Nuvio styles `.icon`, but ships no glyphs – bring the icon font you like. The demos use [Lucide](https://lucide.dev/), and [Tuning Icons](#tuning-icons-for-your-icon-font) adapts Nuvio to other sets.

## Bundles

Nuvio ships 16 pre-built CSS files – pick the one that fits your needs.

| File | Theme Mode | Component Set |
|------|------------|----------|
| **`nuvio.css` / `.min.css`** – *the usual choice* | **`auto`** | **Full** |
| `nuvio-prefer.css` / `.min.css` | `prefer` | Full |
| `nuvio-light.css` / `.min.css` | `light` | Full |
| `nuvio-dark.css` / `.min.css` | `dark` | Full |
| `nuvio-base.css` / `.min.css` | `auto` | Base |
| `nuvio-base-prefer.css` / `.min.css` | `prefer` | Base |
| `nuvio-base-light.css` / `.min.css` | `light` | Base |
| `nuvio-base-dark.css` / `.min.css` | `dark` | Base |

### Theme Modes

| Mode | Behavior |
|------|-----------|
| `auto` | Includes light and dark mode and follows `prefers-color-scheme`. The mode can also be forced, without any JavaScript – see [Theme Switching](#theme-switching-without-javascript). |
| `prefer` | Includes light and dark mode and follows `prefers-color-scheme`; the mode cannot be forced (saves ~7 KB uncompressed). |
| `light` / `dark` | Includes only light or only dark mode (saves ~10 KB uncompressed). |

### Component Sets

| Set | Includes | Gzipped Size |
|------|-----------|-|
| Full | All components: layout, 24-column grid, typography, elements (box, notification, tag, table, dropdown, navbar, modal, accordion, progress, placeholder, image, icon, …), and forms (input, textarea, select, button, checkbox, radio, toggle, range, file upload, segmented control, …), 9 semantic colors | ~23 KB |
| Base | Minimal subset: layout, 12-column grid, spacing, box, notification, 4 semantic colors (`link`, `success`, `warning`, `danger`). Suitable for widgets or server-rendered pages that only need basic structure. | ~4 KB |

### Theme Switching Without JavaScript

With an `auto` bundle – the default `nuvio.css` is one – there are two ways to override the system setting:

- **A class**: `<html class="is-light">` or `<html class="is-dark">` forces that mode.
- **A radio group**: a checked control with the class `theme-light` or `theme-dark` switches the whole page through `html:has(…:checked)`. An unclassed option means "follow the system":

```html
<div class="segmented is-small" role="group" aria-label="Color theme">
  <label><input type="radio" name="theme" checked> Auto</label>
  <label><input type="radio" name="theme" class="theme-light"> Light</label>
  <label><input type="radio" name="theme" class="theme-dark"> Dark</label>
</div>
```

The choice does not survive a page load; remembering it would take `localStorage`, and with it a script.

## Components & Utilities

[The overview live demo page](https://patrickbergner.github.io/nuvio/) shows every component, in light and dark mode. Its source, [demos/01-overview/index.html](demos/01-overview/index.html), doubles as the markup reference.

**Layout** – [`.container`][container], `.container.is-fluid`, `.container.is-max-[sm|md|lg|xl]`, [24-column flex grid][grid] (`.row` / `.col`, `.is-{1–24}`, `.has-offset-{1–24}`, responsive suffixes `-sm/-md/-lg/-xl`), [spacing helpers][spacing] (`mt-*`, `mb-*`, `mx-*`, `py-*`, `ms-*`, `pe-*`, …), [flexbox utilities and shorthands][flexbox] (`.row-spaced`, `.cols-leading`, …), [border, radius, overflow, position and visibility helpers][utilities].

**Elements** – [`.box`][box], [`.notification`][notification], [`.tag`][tag], [`.progress`][progress], [`.button`][button], [`.dropdown`][dropdown], [`.navbar`][navbar], [`.icon` / `.icon.is-glyph`][icon], [`.image`][image], [`.placeholder`][placeholder], [`.modal`][modal] (native `<dialog>`), [`.accordion`][accordion] (native `<details>`), [`.table`][table].

**[Forms][forms]** – `.input`, `.textarea`, `.select`, `.checkbox`, `.radio`, `.toggle`, `.range`, `.file`, `.segmented`, plus `.field` / `.control` layout.

**Typography** – [`.title`, `.subtitle`][typography], [headings][headings] (`.is-level-1` through `.is-level-6`), [rich-text wrapper][richtext] (`.content`), color helpers, interaction utilities.

Most components support semantic color modifiers (`.is-primary`, `.is-success`, `.is-danger`, …) and size modifiers (`.is-small`, `.is-medium`, `.is-large`) where applicable – `.checkbox` and `.radio` deliberately have neither, so they keep the native control rendering. Buttons additionally support `.is-outlined`, `.is-ghost`, `.is-pill`, `.is-static`, `.is-fullwidth`, `.is-loading`, `.is-hoverless`, `.is-icon-only` and `.has-icon-trailing`; `.is-light` and `.is-dark` produce tinted variants and require a semantic color alongside them.

[container]: https://patrickbergner.github.io/nuvio/#container
[grid]: https://patrickbergner.github.io/nuvio/#grid
[spacing]: https://patrickbergner.github.io/nuvio/#marginpadding
[flexbox]: https://patrickbergner.github.io/nuvio/#flexbox
[utilities]: https://patrickbergner.github.io/nuvio/#utilities
[box]: https://patrickbergner.github.io/nuvio/#boxes
[notification]: https://patrickbergner.github.io/nuvio/#notifications
[tag]: https://patrickbergner.github.io/nuvio/#tags
[progress]: https://patrickbergner.github.io/nuvio/#progress
[button]: https://patrickbergner.github.io/nuvio/#buttons
[dropdown]: https://patrickbergner.github.io/nuvio/#dropdown
[navbar]: https://patrickbergner.github.io/nuvio/#navbar
[icon]: https://patrickbergner.github.io/nuvio/#icon
[image]: https://patrickbergner.github.io/nuvio/#image
[placeholder]: https://patrickbergner.github.io/nuvio/#placeholders
[modal]: https://patrickbergner.github.io/nuvio/#modal
[accordion]: https://patrickbergner.github.io/nuvio/#accordion
[table]: https://patrickbergner.github.io/nuvio/#tables
[forms]: https://patrickbergner.github.io/nuvio/#forms
[typography]: https://patrickbergner.github.io/nuvio/#typography
[headings]: https://patrickbergner.github.io/nuvio/#headings
[richtext]: https://patrickbergner.github.io/nuvio/#richtext

**The one script:** a file input does not reveal the chosen filename to CSS, so `.file.has-name` needs a few lines of JavaScript to show it – the [file upload demo](https://patrickbergner.github.io/nuvio/#file) has them, ready to copy. Every other component is driven by the browser: `<dialog>`, `<details>`, `popover` / `popovertarget`, `:has()` and the native form-validation pseudo-classes.

## Framework Integration

Import the pre-built CSS once, in your application's entry point. The examples use the full `auto` bundle; swap the filename for any variant above.

**Vite (React, Vue, Svelte, …), Next.js and SvelteKit** – one import:

```js
import 'nuvio/dist/nuvio.css'
```

Put it in `src/main.{js,ts,jsx,tsx}` for Vite, in `app/layout.tsx` (App Router) or `pages/_app.tsx` (Pages Router) for Next.js, and in the `<script>` of `src/routes/+layout.svelte` for SvelteKit.

**Nuxt 3:**

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['nuvio/dist/nuvio.css'],
})
```

**Angular:**

```json
// angular.json → projects.<name>.architect.build.options.styles
"styles": [
  "node_modules/nuvio/dist/nuvio.css"
]
```

## Customization With Sass

For deeper control – your own colors, other breakpoints, fewer components – compile Nuvio from its Sass sources instead of using a pre-built file:

```bash
npm install nuvio sass
```

Create your own entry point:

```scss
// src/styles/nuvio.scss

@use "nuvio/src/config" with (
  $output-mode: "auto",

  // Base palette
  $light-bg:   hsl(240, 10%, 97%),
  $light-text: hsl(240, 10%, 15%),
  $dark-bg:    hsl(240, 10%, 8%),
  $dark-text:  hsl(240, 10%, 80%),

  // Brand colors – add or override individual semantic colors
  $semantic-color-additions: (
    "primary": (light: hsl(258, 75%, 55%), dark: hsl(258, 75%, 65%), text-light: #fff, text-dark: #fff),
    "link":    (light: hsl(258, 75%, 55%), dark: hsl(258, 75%, 65%), text-light: #fff, text-dark: #fff),
  ),

  // Remove colors you don't need
  $semantic-color-excludes: ("secondary", "bright", "dim"),
);

// Everything – or list single modules instead (see below)
@use "nuvio/src/includes-full";
```

Then import this file in place of the pre-built CSS. Bundlers such as Vite resolve `nuvio/…` on their own; the plain Sass CLI needs to be told where packages live:

```bash
npx sass --load-path=node_modules src/styles/nuvio.scss dist/app.css
```

**Fewer components:** instead of `includes-full`, `@use` single modules. [src/_includes-full.scss](src/_includes-full.scss) lists them all in the right order – copy it and delete what you don't need. `config/themes` must stay first: it emits the `--nv-*` custom properties every component reads.

```scss
@use "nuvio/src/config/themes";
@use "nuvio/src/base";
@use "nuvio/src/layout/container";
@use "nuvio/src/layout/grid";
@use "nuvio/src/forms/button";
// …
```

### Available Semantic Colors

Nine colors ship by default: `primary`, `secondary`, `link`, `info`, `success`, `warning`, `danger`, `bright`, `dim`. Each generates component modifier classes (`.is-primary`, `.is-danger`, …) and CSS custom properties (`--nv-fill-primary`, `--nv-ink-primary`, `--nv-tint-primary`, …).

Use `$semantic-color-additions` to add or override individual colors without rewriting the full map. Use `$semantic-color-excludes` to drop colors you don't need – excluded colors generate no tokens and no classes.

## Production Builds: the Minimized Bundle Demo

[demos/02-minimized-custom-bundle](demos/02-minimized-custom-bundle/) is a complete build pipeline for a consumer project, meant to be copied. It compiles all of Nuvio with a custom configuration and then strips everything the page does not use – [the result](https://patrickbergner.github.io/nuvio/minimized-bundle/) is a page whose entire stylesheet is about 6 KB gzipped:

| Step | Tool | What it does |
|---|---|---|
| Subset text fonts | `scripts/subset-fonts.js` | Cuts Source Sans 3 (400 and 700, from `@fontsource`) down to Western European glyphs and typographic punctuation. |
| Subset icons | `scripts/subset-icons.js` | Scans the HTML for the Lucide icons it uses and builds a font with only those glyphs, plus the matching SCSS. |
| Compile | `sass --load-path=node_modules` | Builds `src/app.scss`: Nuvio's config, `includes-full`, the generated icons and the page's own styles. |
| Tree-shake and minify | PostCSS with PurgeCSS and cssnano | Drops every selector and every `--nv-*` variable the HTML does not reference, then minifies – 173 KB down to 31 KB. |
| Shorten variables | `scripts/shorten-vars.js` | Renames the surviving `--nv-*` custom properties to `--a`, `--b`, … |
| Hash | `scripts/hash-assets.js` | Content-hashes the fonts and the CSS, and rewrites `index.html` to the hashed names. |

Every knob – font sources and glyph ranges, the files to scan, the PurgeCSS safelist, the hash length, how the hashed names reach your pages – lives in one `build.config.cjs`. The scripts are small Node utilities that take every setting from it, so they can be copied into a project unchanged. The demo's [README](demos/02-minimized-custom-bundle/README.md) walks through the pipeline in detail.

## Advanced Customization

### Pinning Colors Exactly (No Derivations)

By default Nuvio derives most theme tokens from a small set of inputs – hover and active fills are darkened from the base fill by a fixed lightness offset, surface levels are stepped down (or up) from `bg`, tints are mixed with the base text/background, and so on. The defaults are tuned to keep custom palettes feeling cohesive, but every derived value can be pinned to an exact color in light and dark mode.

Two mechanisms cooperate:

1. **Theme surfaces** (`bg`, `surface-1..4`, `surface-N-hover`, `border`, `text`, `text-muted`, `text-highlight`, `control-*`) are exposed as `!default` SCSS variables. Override any of them at the entry point and the framework emits your value verbatim – no further adjustment.

2. **Semantic-color derivatives** (`hover`, `active`, `ink`, `tint-light`, `tint-light-text`, `tint-dark`, `tint-dark-text`) accept optional override sub-maps inside each `$semantic-colors` entry. Each sub-map takes the same `(light: ..., dark: ...)` shape as the required four keys. When present, the value is emitted as-is; when absent, the framework derives it.

Partial pinning is supported – supply only the keys you want to control, the rest stay derived.

```scss
// src/styles/nuvio.scss

@use "nuvio/src/config" with (
  $output-mode: "auto",

  // Base palette – verbatim
  $light-bg:         #f7f9fc,
  $light-text:       #1b2330,
  $light-border:     #d6dee8,
  $light-text-muted: #5a6478,

  // Surface levels – verbatim, no auto-stepping
  $light-surface-1:  #eef2f7,
  $light-surface-2:  #e2e8f0,
  $light-surface-3:  #d6dee8,
  $light-surface-4:  #c8d2df,

  $dark-bg:          #0a0e16,
  $dark-text:        #cbd2dd,
  $dark-border:      #2a3142,
  $dark-text-muted:  #7a8295,
  $dark-surface-1:   #11161f,
  $dark-surface-2:   #19202c,
  $dark-surface-3:   #232b3a,
  $dark-surface-4:   #2d3648,

  // Semantic colors – every derived value pinned
  $semantic-color-additions: (
    "brand": (
      light: #2752ff, dark: #4a78ff,
      text-light: #ffffff, text-dark: #ffffff,

      hover:           (light: #2143cc, dark: #6090ff),
      active:          (light: #1932a0, dark: #80a8ff),
      ink:             (light: #1932a0, dark: #b8cfff),
      tint-light:      (light: #eef2ff, dark: #1c2438),
      tint-light-text: (light: #1932a0, dark: #b8cfff),
      tint-dark:       (light: #0a1846, dark: #0a1846),
      tint-dark-text:  (light: #eef2ff, dark: #c8d6ff),
    ),
  ),
);
```

Reference of what derives what, and which knob pins it exactly:

| `--nv-*` token | Default derivation | Pin exactly via |
|----------------|--------------------|-----------------|
| `bg` | base input | `$light-bg` / `$dark-bg` |
| `surface-1..4` | `$bg` ± `$surface-step-*` × N | `$light-surface-1..4` / `$dark-surface-1..4` |
| `surface-1..4-hover` | `$bg` ± (step × N + `$surface-hover-step`) | `$light-surface-N-hover` / `$dark-surface-N-hover` |
| `border` | `$bg` adjusted by `$border-*-lightness-offset` + saturation | `$light-border` / `$dark-border` |
| `text` | base input | `$light-text` / `$dark-text` |
| `text-muted` | `$text` adjusted by `$text-muted-*-offset` | `$light-text-muted` / `$dark-text-muted` |
| `text-highlight` | `$text` adjusted by `$text-highlight-*-offset` | `$light-text-highlight` / `$dark-text-highlight` |
| `control-bg/-border/-text/-hover` | derived from `$bg` / `$border` | `$light-control-*` / `$dark-control-*` |
| `focus-ring` | semantic `link` color | `$focus-ring-color-light` / `$focus-ring-color-dark` |
| `fill-{N}` | semantic-color entry | `light:` / `dark:` (required keys) |
| `fill-text-{N}` | semantic-color entry | `text-light:` / `text-dark:` (required keys) |
| `fill-{N}-hover` | `fill` darkened by `$hover-lightness-offset` | `hover: (light: …, dark: …)` |
| `fill-{N}-active` | `fill` darkened by `$active-lightness-offset` | `active: (light: …, dark: …)` |
| `ink-{N}` | `fill` with lightness clamped to readable range | `ink: (light: …, dark: …)` |
| `tint-light-{N}` | mix of `fill` with `surface-1` / `light-bg` | `tint-light: (light: …, dark: …)` |
| `tint-light-text-{N}` | mix of `ink` with `text` | `tint-light-text: (light: …, dark: …)` |
| `tint-dark-{N}` | mix of `fill` with `#000` / `dark-bg` | `tint-dark: (light: …, dark: …)` |
| `tint-dark-text-{N}` | `light-bg` (light block) / `tint-light-text` (dark block) | `tint-dark-text: (light: …, dark: …)` |

### Navbar Colors

The navbar reads three CSS custom properties that you can override per-scope to brand it:

```css
:root {
  --nv-navbar-bg:    hsl(216, 98%, 44%);
  --nv-navbar-text:  hsl(216, 98%, 95%);
  --nv-navbar-hover: hsl(216, 98%, 36%);
}

@media (prefers-color-scheme: dark) {
  :root {
    --nv-navbar-bg:    hsl(216, 40%, 14%);
    --nv-navbar-text:  hsl(216, 20%, 88%);
    --nv-navbar-hover: hsl(216, 40%, 20%);
  }
}
```

### Tuning Icons for Your Icon Font

Different icon fonts (Lucide, Phosphor, FontAwesome, …) draw their glyphs at slightly different vertical baselines and optical weights. Nuvio exposes three small SCSS variables and a set of per-icon utility classes so you can adapt the framework to whichever icon set you ship – without rewriting any component styles.

| Variable | Default | Effect |
|----------|---------|--------|
| `$button-icon-y-compensation` | `.5px` | Vertical `translateY` applied to `.button .icon`. Implemented as `transform`, so it never affects button height. |
| `$text-icon-y-compensation` | `0` | Vertical `translateY` applied to `.icon.is-glyph` – icons sitting in flowing text or headings. Separate from the button knob because the optical center for inline text icons differs from buttons. |
| `$button-icon-x-compensation` | `0` | Added to the negative horizontal margins that pull an `.icon` toward its `.button` edge (leading, trailing, `.is-icon-only` and `.is-pill` variants alike). Knob for icon fonts whose glyphs carry more or less intrinsic side-bearing. Implemented as `margin`, so it does not change `.button` padding. |

Override at the entry point:

```scss
@use "nuvio/src/config" with (
  $button-icon-y-compensation: 0,
  $text-icon-y-compensation:   -.5px,
  $button-icon-x-compensation: 1px,
);
```

For the rare case where a single glyph sits off-baseline, add a `.yc-up{1,2,3}` or `.yc-down{1,2,3}` class to that specific `.icon` – ±0.5px, ±1px, or ±1.5px respectively. Layers on top of the relevant compensation variable.

```html
<span class="icon yc-up1"><i class="my-icon-quirky"></i></span>
```

### Tuning Label Alignment for Your Body Font

The same problem exists for text. A font reserves more room below the baseline than its glyphs actually use, so a label centered by metrics inside a fixed-height control renders slightly *low* – noticeably so once you compare it against a button edge or a full-height logo in a navbar.

`$control-label-y-compensation` shifts the label of `.button`, `.tag`, `.navbar-item` / `.navbar-link` and `.segmented > label` back onto its optical center. It is applied as asymmetric `padding-block`, so control heights are unchanged, and it is expressed in `em`, so it follows the size modifiers.

```scss
@use "nuvio/src/config" with (
  $control-label-y-compensation: 0,   // pure metric centering
);
```

### Cascade Layers (Opt-In)

Set `$css-layers: true` to wrap all output in cascade layers, declared in this order:

```scss
@use "nuvio/src/config" with ($css-layers: true);
```

```css
@layer nuvio.tokens, nuvio.reset, nuvio.components, nuvio.utilities;
```

Your own unlayered CSS then beats every Nuvio rule regardless of selector specificity – no `!important`, no `.foo.foo.foo` escalation. This is source-only: the pre-built `dist/` files are compiled with the flag off, so nothing changes for consumers who use them.

One caveat worth knowing before you flip it. Inside a layer, `!important` precedence is *reversed* – layered `!important` declarations outrank unlayered ones. Nuvio's utility helpers (`mt-*`, `is-hidden`, `has-text-*`, …) are all `!important`, so with layers enabled your unlayered `!important` no longer overrides them. Override from a layer of your own declared after Nuvio's instead:

```css
@layer nuvio.tokens, nuvio.reset, nuvio.components, nuvio.utilities, app;

@layer app {
  .my-thing { margin-top: 0 !important; }
}
```

## Accessibility

**Focus rings.** Every interactive component exposes a visible ring driven by the `--nv-focus-ring` token: links and buttons, `.button`, `.input` / `.textarea` / `.select`, `.checkbox` / `.radio`, `.toggle`, `.range`, `.segmented`, `.file` (the ring surfaces on `.file-cta`, since the real input is transparent), `.accordion > summary` and `.dropdown-item`. Navbar items indicate focus with a background change instead.

**Reduced motion.** Under `prefers-reduced-motion: reduce`, smooth scrolling is off, the `.is-loading` spinner slows to a third of its speed rather than disappearing, `.placeholder-*` skeletons stop pulsing, and the navbar burger swaps to its X without travelling.

**ARIA contract.** Expanded state is the browser's to report – a button with `popovertarget` exposes it for you, so do not set `aria-expanded` by hand. What is left is naming and relationships:

| Component | Attributes |
|---|---|
| `.navbar-burger` | `aria-label` and `aria-controls="<menu id>"` alongside its `popovertarget` |
| `.dropdown-trigger` button | `aria-haspopup="true"`; the menu takes `role="menu"` |
| `.modal` | `aria-labelledby` pointing at its heading (or `aria-label`); `autofocus` on the first control you want focused |
| `.accordion` | Nothing – `<details>`/`<summary>` are already a disclosure widget to assistive tech |

`.sr-only` hides text visually while leaving it available to screen readers.

## Logical Properties & RTL

Component internals use flow-relative properties throughout (`margin-inline-*`, `inset-inline-*`, `padding-inline`, `text-align: start`), so components mirror correctly under `dir="rtl"` – including button and tag icon insets, dropdown alignment, the toggle thumb, table cell alignment and list markers.

The spacing helpers come in both flavors, and the distinction is deliberate:

| Helpers | Behavior |
|---|---|
| `ml-*`, `mr-*`, `pl-*`, `pr-*` | Strictly physical left/right – they do not mirror |
| `ms-*`, `me-*`, `ps-*`, `pe-*` | Flow-relative inline-start/inline-end – they mirror under `dir="rtl"` |
| `mx-*`, `my-*`, `px-*`, `py-*` | Symmetric, so the distinction does not arise |
| `.is-aligned-left/-right` vs `.is-aligned-start/-end` | Same split for text alignment |

Component modifiers named for a side (`.dropdown.is-right`, `.file.is-right`, `.field.has-addons-right`) are flow-relative: they pin to the trailing edge, which is the left in RTL. The exceptions are `.control.has-icons-left/-right` and `.icon.is-left/.is-right`, which stay physical to match their names. Set `$spacing-logical: false` to drop the `ms-*`/`me-*`/`ps-*`/`pe-*` set (the base bundle already does).

## Browser Support

Nuvio replaces JavaScript with recent platform features:

- the Popover API and CSS anchor positioning, for dropdowns and the navbar menu,
- invoker commands (`command` / `commandfor`), to open and close modals,
- `:has()`, for the theme switch, the modal's scroll lock and some focus rings,
- `:user-valid` / `:user-invalid` and `color-mix()`, for forms,
- exclusive accordions (`<details name>`).

All of it is supported from **Chrome and Edge 135**, **Firefox 147** and **Safari 26.2**. Older browsers still render the page, but dropdowns, the navbar menu and modals may not open or position correctly.

## Experimental: `ideas/`

The package also ships `ideas/` – components that are not part of any bundle yet. They are outside semantic versioning: anything in it may change or disappear in any release, so pin an exact version if you build on it.

**[`ideas/sidebar-nav`](ideas/sidebar-nav/README.md)** is an application shell with a side navigation: a full-height rail on wide screens that collapses to a bar of icons, and a top bar with a burger menu on phones – no JavaScript. Load it after Nuvio:

```scss
@use "nuvio/src/config" with ($output-mode: "auto");
@use "nuvio/src/includes-full";
@use "nuvio/ideas/sidebar-nav/sidebar-nav";
```

Its [README](ideas/sidebar-nav/README.md) covers the markup, the settings and its limits.

**[`ideas/multi-toggle`](ideas/multi-toggle/README.md)** is a toggle with up to six positions instead of two – a row of radio buttons with one sliding thumb, for picking one of a few values. Load it the same way, with `@use "nuvio/ideas/multi-toggle/multi-toggle"`.

## Working on Nuvio

In a clone of this repository:

```bash
npm install
npm run build                           # all 16 bundles into dist/
npm run dist-sizes                      # their sizes, uncompressed and gzipped
npm run palette                         # random harmonious palette – outputs ready-to-paste SCSS
npm run palette -- --seed=42            # reproducible result
npm run palette -- --harmony=triadic    # triadic | split-comp | analogous | complementary
npm run palette -- --write              # also write to generated-palette.scss
```

## License

[MIT](LICENSE)
