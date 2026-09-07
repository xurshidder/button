# Hero image — drop the campaign photo here

> ## ⚠ `main.jpg` is currently a STOCK PLACEHOLDER
>
> Source: [Unsplash](https://unsplash.com/photos/photo-1516257984-b1b4d707412e),
> under the [Unsplash License](https://unsplash.com/license) — free for
> commercial use, no attribution required. So it is safe to keep while
> developing.
>
> **It is not safe to launch with.** It shows a garment Button does not sell, on
> a model Button did not shoot. A homepage hero is the brand's single biggest
> visual claim, and pointing it at stock photography tells the customer this is
> not a real shop. Replace it with Button's own campaign photography before
> anything goes in front of the client or the public.


Auto-detected. The first image file in this folder becomes the homepage hero
background, sitting behind the "Sifatli erkaklar kiyimlari" headline.

```
public/hero/main.jpg     ← the brown suede jacket shot goes here
```

If the folder is empty the hero falls back to the plain brand-purple gradient,
so the homepage always looks finished.

## How it is composed

The photo is anchored to the **right** (`object-position: 70–75%`) so the model
stays in frame while the headline occupies the left. A purple scrim runs across
it — opaque on the left, clearing to the right — which does two jobs:

1. **Keeps white text readable.** The supplied photography has a pale cream
   background; white type directly on it would be unreadable.
2. **Keeps the hero on-brand.** Without it, the section stops looking like
   Button and starts looking like a stock photo with words on top.

On mobile the text column overlaps far more of the image, so a second gradient
darkens the lower half and the copy is bottom-aligned.

## What works best here

- **Landscape or square** crops beat portrait. The supplied 4:5 portraits work,
  but a wide shot with the model to one side and empty space to the other is
  ideal — the empty space is where the headline goes.
- **Leave room on the left.** Compose with the subject right-of-centre.
- **Minimum 2000px wide** — this element is full-bleed on large screens.
- Any of `.jpg`, `.png`, `.webp`, `.avif`.

Swapping the campaign is just replacing this file — no code change, which
matters because Button will want to rotate it with each new collection.
