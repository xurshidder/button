# Brand assets — drop the logo here

> ## Current state: the wordmark is a RECONSTRUCTION
>
> `components/layout/Logo.tsx` draws the "button" wordmark as inline SVG,
> rebuilt from the logo's geometry (see `scripts/build-wordmark.mjs`, which also
> renders a PNG preview). It is monoline geometric — straight segments, circles
> and arcs at one stroke width — so it reproduces closely and scales perfectly.
>
> **It is still a reconstruction, not the real artwork.** Letter spacing and
> stroke weight are matched by eye. Dropping a real file in this folder
> overrides it automatically — a supplied vector always wins.
>
> The circular `bttn` monogram has NOT been reconstructed; it is needed for the
> favicon, so `mark.svg` or `mark.png` is still worth supplying.


Auto-detected, like product photos. Put a file here and the header, footer and
favicon start using it. Nothing to change in code.

## Save the logo you sent as

```
public/brand/logo.png        ← the full lock-up (monogram + "button")
```

That alone is enough to get the real logo on the site. The two below are
optional but give a better result:

```
public/brand/wordmark.png    ← just the word "button", cropped, transparent bg
public/brand/mark.png        ← just the circular bttn monogram, square
```

SVG is preferred over PNG wherever available (`logo.svg`, `wordmark.svg`,
`mark.svg`) — it is picked first automatically, stays sharp at every size, and
is far smaller. **Ask the client for the vector file**; any designer who made
this logo has it.

## Why a file and not a font

The "button" wordmark is **custom lettering, not a typeface**. The bowls are
true circles, the stroke weight is uniform, and the `t` has a hooked foot that
no commercial webfont reproduces. Poppins is currently standing in for it and is
visibly not the same — that gap closes only by using the artwork itself.

This is also just how logos are handled in production: a logo is an image, never
text styled to look like one. It renders identically on every device, needs no
font download, and cannot break if a font fails to load.

## Ideal specs

| Asset | Format | Notes |
|---|---|---|
| `wordmark` | SVG, or PNG ≥ 600px wide | Transparent background. Trim whitespace tight to the letters. |
| `mark` | SVG, or PNG ≥ 512×512 | Square, transparent background. Used for the favicon and app icon. |
| `logo` | SVG or PNG | The full lock-up as supplied. |

**Colour:** supply the purple-on-transparent or white-on-transparent versions if
they exist. The file sent so far is white-on-purple, which works on the hero but
not on a white header — a transparent wordmark solves that. Brand purple is
`#4A1082` (currently sampled by eye; confirm against the vector).
