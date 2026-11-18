# multi-toggle

A toggle with more than two positions: a pill-shaped track whose thumb slides between up to six slots, each a radio button. It looks
like Nuvio's `.toggle`, but picks one of a few values – off / low / high, a three-way setting and the like.

It is an idea, not part of Nuvio's bundles. Load it after Nuvio itself:

```scss
@use "nuvio/src/config";
@use "nuvio/src/includes-full";
@use "nuvio/ideas/multi-toggle/multi-toggle";
```

## Markup

```html
<span class="multi-toggle" role="radiogroup" aria-label="Volume">
    <label><input type="radio" name="volume" checked><span class="sr-only">Off</span></label>
    <label><input type="radio" name="volume"><span class="sr-only">Low</span></label>
    <label><input type="radio" name="volume"><span class="sr-only">High</span></label>
</span>
```

- Each `<label>` is one slot, in order; the checked radio decides where the thumb sits. No script is needed.
- The slots show no text, so give each radio a name for screen readers (`.sr-only` text or `aria-label`) and the group an
  `aria-label`, and put the visible meaning next to the control.
- Arrow keys move between the slots; the focus ring surrounds the whole control.
- `.is-small`, `.is-medium` and `.is-large` scale it. `.is-primary`, `.is-success` and the other semantic colors color the thumb, which is
  `link` by default.
- Inside a disabled `<fieldset>` it is dimmed and ignores clicks.
- The thumb moves along `inset-inline-start`, so it mirrors under `dir="rtl"`. Under `prefers-reduced-motion: reduce` it jumps instead of
  sliding.

## Settings

| Variable | Default | Effect |
|---|---|---|
| `$multi-toggle-max-slots` | `6` | How many slots the thumb can reach – one `:has()` rule each. |

```scss
@use "nuvio/ideas/multi-toggle/multi-toggle" with ($multi-toggle-max-slots: 3);
```

## Limits

- The slots carry no visible labels.
- Like any radio group, the choice survives a page load only through a form or a script.
