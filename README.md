# ☁️ Nuvio CSS Framework

*Nuvio – like "nuvola" (cloud), light foundation*

## Motivation

Modern and lightweight CSS framework providing *a good but small foundation for all types of web applications* using the Flexible Box Layout module (Flexbox).

We provide *ready-to-use frontend components and layout helpers* that are easily combinable to build responsive web applications. *Light and dark mode agnostic designs* are supported out of the box.

The framework is free to use and optimized for size and load speed. *All color and typography choices are easily customizable to your needs.*

*There is no mandatory Javascript.* Only specific components in specific use cases need small snippets that can easily be implemented in the application technology of your choice, including vanilla.

## Quick Start

**HTML – link a pre-built file directly:**

```html
<link rel="stylesheet" href="https://unpkg.com/nuvio/dist/nuvio.min.css" />
```

**npm:**

```bash
npm install nuvio
```

Then link the stylesheet from your `node_modules`, or import it inside your JS/CSS entry point (see [Framework integration](#framework-integration) below).

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
| `auto` | Includes both light & dark mode, automatically switches using `prefers-color-scheme`, mode can also be forced via `<html class="is-light">` / `<html class="is-dark">` or, with no JavaScript at all, by a checked `.theme-light` / `.theme-dark` control (see [Theme switching](#theme-switching-without-javascript)) |
| `prefer` | Includes both light & dark mode, automatically switches using `prefers-color-scheme`, mode cannot be forced (saves ~6 KB uncompressed) |
| `light` / `dark` | Includes light or dark mode only (saves ~10 KB uncompressed) |

### Component Sets

| Set | Includes | Gzipped Size |
|------|-----------|-|
| Full | All components: layout, 24-column grid, typography, elements (box, notification, tag, table, dropdown, navbar, modal, accordion, progress, placeholder, image, icon, …), and forms (input, textarea, select, button, checkbox, radio, toggle, range, file upload, segmented control, …), 9 semantic colors | ~23 KB |
| Base | Minimal subset: layout, 12-column grid, spacing, box, notification, 4 semantic colors (`link`, `success`, `warning`, `danger`). Suitable for email, widgets, or server-rendered pages that only need basic structure.| ~4 KB |

## Components & Utilities

**Layout** – `.container`, `.container.is-fluid`, `.container.is-max-[sm|md|lg|xl]`, 24-column flex grid (`.row` / `.col`, `.is-{1–24}`, `.has-offset-{1–24}`, responsive suffixes `-sm/-md/-lg/-xl`), spacing helpers (`mt-*`, `mb-*`, `mx-*`, `py-*`, `ms-*`, `pe-*`, …), flexbox utilities and shorthands (`.row-spaced`, `.cols-leading`, …), border, radius, overflow, position and visibility helpers.

**Elements** – `.box`, `.notification`, `.tag`, `.progress`, `.button`, `.dropdown`, `.navbar`, `.icon` / `.icon.is-glyph`, `.image`, `.placeholder`, `.modal` (native `<dialog>`), `.accordion` (native `<details>`).

**Forms** – `.input`, `.textarea`, `.select`, `.checkbox`, `.radio`, `.toggle`, `.range`, `.file`, `.segmented`, plus `.field` / `.control` layout.

**Typography** – `.title`, `.subtitle`, headings (`.is-level-1` through `.is-level-6`), rich-text wrapper (`.content`), color helpers, interaction utilities.

**Renamed in 0.0.4:** the icon-in-text modifier is `.icon.is-glyph`. It used to be `.icon.is-inline`, which collided with the `.is-inline` display utility and lost its own `display: inline-flex` to it – so the glyph sat low wherever the parent was a flex container. There is no alias; update the markup.

Most components support semantic color modifiers (`.is-primary`, `.is-success`, `.is-danger`, …) and size modifiers (`.is-small`, `.is-medium`, `.is-large`) where applicable – `.checkbox` and `.radio` deliberately have neither, so they keep the native control rendering. Buttons additionally support `.is-outlined`, `.is-ghost`, `.is-pill`, `.is-static`, `.is-fullwidth`, `.is-loading`, `.is-hoverless`, `.is-icon-only` and `.has-icon-trailing`; `.is-light` and `.is-dark` produce tinted variants and require a semantic color alongside them.

## Framework Integration

Import the pre-built CSS in your framework's entry point. All examples below use the full auto-mode bundle; swap the filename for any variant listed above.

### React / Vite

```js
// src/main.jsx  (or main.tsx)
import 'nuvio/dist/nuvio.css'
```

### Vue 3 / Vite

```js
// src/main.js  (or main.ts)
import 'nuvio/dist/nuvio.css'
```

### Next.js

```js
// app/layout.tsx  (App Router)
import 'nuvio/dist/nuvio.css'

// – or – pages/_app.tsx  (Pages Router)
import 'nuvio/dist/nuvio.css'
```

### Nuxt 3

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['nuvio/dist/nuvio.css'],
})
```

### Angular

```json
// angular.json → projects.<name>.architect.build.options.styles
"styles": [
  "node_modules/nuvio/dist/nuvio.css"
]
```

### SvelteKit

```js
// src/routes/+layout.svelte
<script>
  import 'nuvio/dist/nuvio.css'
</script>
```

## Customization

For deeper control – custom colors, different breakpoints, reduced output – import the SCSS sources directly instead of a pre-built file. This requires `sass` as a dev dependency.

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

@use "nuvio/src/config/themes";
@use "nuvio/src/base";
@use "nuvio/src/layout/container";
@use "nuvio/src/layout/grid";
// ... add only the component layers you use
```

Then import this file in place of the pre-built CSS in your framework entry point.

### Available Semantic Colors

Nine colors ship by default: `primary`, `secondary`, `link`, `info`, `success`, `warning`, `danger`, `bright`, `dim`. Each generates component modifier classes (`.is-primary`, `.is-danger`, …) and CSS custom properties (`--nv-fill-primary`, `--nv-ink-primary`, `--nv-tint-primary`, …).

Use `$semantic-color-additions` to add or override individual colors without rewriting the full map. Use `$semantic-color-excludes` to drop colors you don't need – excluded colors generate no tokens and no classes.

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

### Palette Generator

```bash
npm run palette                         # random harmonious palette – outputs ready-to-paste SCSS
npm run palette -- --seed=42            # reproducible result
npm run palette -- --harmony=triadic    # triadic | split-comp | analogous | complementary
npm run palette -- --write              # also write to generated-palette.scss
```

## License

MIT
