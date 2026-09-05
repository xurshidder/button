# Product photography — drop files here

Images are **auto-detected**. Put files in the right folder and they appear on
the site — no code change needed. Any `.jpg`, `.jpeg`, `.png`, `.webp` or
`.avif` is picked up, in filename order, so name them `1.jpg`, `2.jpg`, … to
control which one leads.

If a folder is missing, that product renders a "photo coming soon" placeholder
rather than a broken image. The site is never in a broken state.

## Where the photos you already sent should go

| # | Photo | Save as |
|---|---|---|
| 1 | Black bomber jacket, on model, mint background | `public/products/qora-bomber-kurtka/1.jpg` |
| 2 | Watch close-up, navy strap, mint background | `public/products/qol-soati/1.jpg` |
| 3 | White sneakers, on feet, cream background | `public/products/oq-krossovka/1.jpg` |
| 4 | Brown suede jacket, full length, cream background | `public/products/jigarrang-zamsh-kurtka/1.jpg` |
| 5 | Black croc-texture laptop bag, mint background | `public/products/qora-charm-sumka/1.jpg` |
| 6 | Navy croc-texture laptop bag, mint background | `public/products/kok-charm-sumka/1.jpg` |
| 7 | Teal leather jacket, full length, cream background | `public/products/yashil-charm-kurtka/1.jpg` |
| 8 | Teal leather jacket, waist up, cream background | `public/products/yashil-charm-kurtka/2.jpg` |

Create the folders as you go. On Windows, `public\products\qora-bomber-kurtka\1.jpg`.

Other slots:
- Category tiles: `public/categories/<category-slug>.jpg`
  (`ust-kiyim`, `koylaklar`, `trikotaj`, `shimlar`, `jinsilar`, `poyabzallar`,
  `sumkalar`, `aksessuarlar`)
- Hero banner: `public/hero/main.jpg` — landscape, not 4:5

## Requirements

**Aspect ratio: 4:5 portrait (e.g. 1024×1280).** The photos already supplied are
exactly this — keep it. Every image in the grid must be the same shape; mixed
ratios are the number-one thing that makes a catalogue look amateur, and uniform
ratio is why the Uniqlo grid reads as clean.

- **Format:** JPG or WebP. Keep files under ~2 MB; Next optimises them at build
  time, but the git repo should stay small.
- **Background:** consistent across a set. The mint-green and cream backgrounds
  in the supplied photos both work — but try not to mix them *within one
  category*, or the grid looks unsorted.
- **Per product:** 3–5 shots, including at least one worn/on-model shot. Clothes
  on a person sell considerably better than clothes laid flat.
- **Framing:** garment fills the frame; crop tight.

## A note on branding

Some supplied photos show items carrying third-party maker's marks. Product
names in this catalogue are **generic garment descriptions** ("Qora charm
noutbuk sumkasi", not a brand name). Button is a reseller and the site must not
present goods as authorised brand merchandise — see CLAUDE.md §1 and §19. If a
photo makes another brand's logo the focal point, prefer a different angle.
