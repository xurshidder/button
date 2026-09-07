# Hero image — drop the campaign photo here

> ## Which file is used
>
> **The most recently modified image wins.** Drop a new photo in and it takes
> over immediately — no renaming, no deleting the old one. Older files are
> harmless but clutter the folder, so tidy up when convenient.
>
> `main.jpg` is a stock placeholder from Unsplash and `image.png` is a portrait
> product shot; neither should be the live hero. Delete both once you are happy
> with the real one.


Auto-detected: whichever image here was modified most recently becomes the
homepage hero background, sitting behind the campaign headline. Any filename
works — a camera name like `photo_2026-09-07_21-17-09.jpg` is fine.

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
