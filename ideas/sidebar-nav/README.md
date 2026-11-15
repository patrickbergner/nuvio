# sidebar-nav

An application shell with a side navigation: a full-height rail beside the page on a wide screen, a top bar with a burger menu on a
phone. The rail can be collapsed to a bar of icons to give the page more width.

It is an idea, not part of Nuvio's bundles. See *Using it*.

## What it does

- **Desktop (from the `sm` breakpoint, 769px).** A sticky rail of `$sidebar-width` (15rem), full viewport height: brand at the top, the
  navigation filling the middle and scrolling on its own if it runs out of height, a footer pushed to the bottom.
- **Collapsing (desktop).** A control at the bottom left narrows the rail to `$sidebar-width-collapsed` (4.25rem) and shows only the icons.
  Labels and counts stay in the markup, visually hidden, so screen readers still read them; a label flies out beside its icon on
  hover and on keyboard focus. The width change is animated unless the user asks for reduced motion.
- **Mobile (below 769px).** The rail becomes a sticky top bar of `$sidebar-bar-height` (3.5rem) with the brand and a burger (like the
  default navbar component).

No script is needed for any of it. The one thing CSS cannot do is remember the collapsed state across page loads –
see *Remembering the collapsed state*.

## Markup

```html
<div class="sidebar-layout">
    <aside class="sidebar">
        <div class="sidebar-head">
            <a class="sidebar-brand" href="/">
                <img class="sidebar-when-expanded" src="/logo.svg" alt="App" />
                <img class="sidebar-when-collapsed" src="/icon.svg" alt="App" />
            </a>
            <button type="button" class="sidebar-burger" popovertarget="sidebar-body" aria-label="Toggle navigation">
                <span></span><span></span><span></span>
            </button>
        </div>
        <div class="sidebar-body" id="sidebar-body" popover>
            <nav class="sidebar-nav" aria-label="Main navigation">
                <a class="sidebar-item is-active" href="/">
                    <span class="icon"><i class="icon-gauge"></i></span> <span class="sidebar-label">Overview</span>
                </a>
                <a class="sidebar-item" href="/activities">
                    <span class="icon"><i class="icon-activity"></i></span> <span class="sidebar-label">Activities</span>
                    <span class="sidebar-count">128</span>
                </a>
            </nav>
            <div class="sidebar-foot">
                <label class="sidebar-item sidebar-collapse">
                    <input type="checkbox" class="sidebar-collapse-input" autocomplete="off" />
                    <span class="icon sidebar-when-expanded"><i class="icon-panel-left-close"></i></span>
                    <span class="icon sidebar-when-collapsed"><i class="icon-panel-left-open"></i></span>
                    <span class="sidebar-label sidebar-when-expanded">Collapse</span>
                    <span class="sidebar-label sidebar-when-collapsed">Expand</span>
                </label>
                <a class="button is-fullwidth" href="/logout">
                    <span class="icon"><i class="icon-log-out"></i></span> <span class="sidebar-label">Sign out</span>
                </a>
            </div>
        </div>
    </aside>
    <main class="sidebar-main">…</main>
</div>
```

| Class | Role |
|-------|------|
| `.sidebar-layout` | The shell: a row of sidebar and page, a column on a phone. |
| `.sidebar` | The rail on a desktop, the top bar on a phone. |
| `.sidebar-head` | Brand and burger. |
| `.sidebar-brand` | Logo link; an `img` or `svg` in it is sized to the rail. |
| `.sidebar-burger` | Opens the body as a popover on a phone; hidden on a desktop. |
| `.sidebar-body[popover]` | Everything below the head: in flow on a desktop, a popover on a phone. |
| `.sidebar-nav` | The list of items. |
| `.sidebar-item` | A navigation entry; `.is-active` marks the current page. |
| `.sidebar-label` | An item's text: truncated with an ellipsis, a flyout when collapsed. |
| `.sidebar-count` | An optional figure at the item's end; hidden when collapsed. |
| `.sidebar-foot` | Pinned to the bottom of the rail. |
| `.sidebar-collapse` | The collapse control: a label around `.sidebar-collapse-input`. |
| `.sidebar-when-expanded` | Shown unless the rail is collapsed, and never on a phone. |
| `.sidebar-when-collapsed` | Shown only while the rail is collapsed, and never on a phone. |
| `.sidebar-main` | The page beside the rail. |

Text in the sidebar that should disappear when it collapses has to sit in a `.sidebar-label` – a bare text node cannot be hidden.
That includes a button's text in the footer. A `.button` in `.sidebar-foot` is centered on its icon when collapsed.

The collapse control carries two labels, one per state, each marked with `.sidebar-when-expanded` or `.sidebar-when-collapsed`. The hidden
one is `display: none`, so it is neither shown nor read out: the control says "Collapse" while expanded and "Expand" in its flyout when
collapsed. A screen reader announces it as a checkbox, checked while collapsed, under whichever label is current.

## Remembering the collapsed state

Collapsing is a checkbox: `.sidebar-layout:has(.sidebar-collapse-input:checked)` is the collapsed state, so the control works without
a script and without a class to toggle. On its own that state lasts until the next page load. An application that wants it to persist
stores the choice and renders the box `checked`:

- **Server side (recommended).** A script writes a cookie when the box changes; the server reads it and renders `checked`. The first
  paint is already right, with no flash of an expanded rail, and it works under a `script-src 'self'` policy because the script is the
  application's own bundle:

  ```js
  document.querySelector(".sidebar-collapse-input")?.addEventListener("change", (event) => {
      document.cookie = "sidebar-collapsed=" + (event.target.checked ? "1" : "0") + "; path=/; max-age=31536000; SameSite=Lax";
  });
  ```

- **Client side only.** Reading `localStorage` and setting `checked` from a script at the end of the page works, but the rail paints
  expanded first and then collapses, animated unless reduced motion is on.

`autocomplete="off"` keeps Firefox from restoring the box's state from its form cache on a reload, which would otherwise override what
the server rendered.

## Settings

All `!default`, configurable with `@use … with (…)`:

| Variable | Default | |
|----------|---------|-|
| `$sidebar-width` | `15rem` | Expanded rail width. |
| `$sidebar-width-collapsed` | `4.25rem` | Collapsed rail width. |
| `$sidebar-padding` | `.75rem` | Inline padding of rail and bar. |
| `$sidebar-bar-height` | `3.5rem` | Height of the phone's top bar and the menu's offset. |
| `$sidebar-breakpoint` | `"sm"` | Key of `$breakpoints` where the bar becomes the rail. |
| `$sidebar-z` | `20` | Stacking of the rail over the page, for the flyouts. |
| `$sidebar-accent` | `"link"` | Semantic color of the active item. |
| `$sidebar-item-radius` | `c.$radius` | Corner radius of items and flyouts. |

Colors come from the theme tokens: `surface-1` for the rail, `border`, `surface-2` for a hovered item, `surface-3` for a flyout, the
accent's fill mixed down to 14 % and 40 % for the active item's background and border. An application with its own palette overrides
those rules.

## Using it

Load it after Nuvio itself:

```scss
@use "nuvio/src/config" as c with ($output-mode: "dark");
@use "nuvio/src/includes-full";
@use "nuvio/ideas/sidebar-nav/sidebar-nav" with ($sidebar-width: 16rem);
```

It needs Nuvio's `.icon` and, for a footer button, `.button`. It does not need the navbar. `demo.html` loads the prebuilt `dist/nuvio.css`
with this module compiled on its own into `sidebar-nav.css`, which `./build-css.sh` recreates after the SCSS changed (it uses the sass in
the package's `node_modules`).

## Limits

- A collapsed rail does not scroll: scrolling would clip the flyouts, which extend past its edge. Very many items on a short screen
  overflow instead.
- The collapse icons named in the example are physical (`panel-left-*`); a right-to-left page wants the mirrored pair.
- The flyout shows the label only, not the count.
