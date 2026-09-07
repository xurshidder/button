import "server-only";

import fs from "node:fs";
import path from "node:path";

/**
 * Locates Button's logo artwork.
 *
 * The wordmark is custom lettering, not a font — geometric monoline forms with
 * a distinctive hooked `t` that no webfont reproduces exactly. Approximating it
 * with Poppins was always a stand-in. Real brands ship the logo as artwork, so
 * the moment a file exists we use it and stop guessing.
 *
 * Drop files in `public/brand/` (see the README there). SVG is preferred and is
 * picked first; PNG is accepted. Missing files fall back to a text wordmark, so
 * the header is never broken.
 */

const BRAND_DIR = path.join(process.cwd(), "public", "brand");

/** Preference order: vector first, then raster. */
const CANDIDATES = {
  /** Full lock-up: monogram + "button" wordmark. */
  full: ["logo.svg", "logo.png", "logo.webp"],
  /** Horizontal wordmark alone — best for a slim header. */
  wordmark: ["wordmark.svg", "wordmark.png", "wordmark.webp"],
  /** Circular `bttn` monogram — favicon, app icon, compact header. */
  mark: ["mark.svg", "mark.png", "mark.webp"],
} as const;

function findFirst(files: readonly string[]): string | undefined {
  for (const file of files) {
    if (fs.existsSync(path.join(BRAND_DIR, file))) return `/brand/${file}`;
  }
  return undefined;
}

export interface BrandAssets {
  full?: string;
  wordmark?: string;
  mark?: string;
}

export function getBrandAssets(): BrandAssets {
  return {
    full: findFirst(CANDIDATES.full),
    wordmark: findFirst(CANDIDATES.wordmark),
    mark: findFirst(CANDIDATES.mark),
  };
}

/**
 * Hero campaign image, from `public/hero/`.
 *
 * Returns undefined when no file exists, and the hero falls back to the plain
 * brand gradient — so the homepage looks finished either way.
 */
export function getHeroImage(): string | undefined {
  const dir = path.join(process.cwd(), "public", "hero");
  try {
    /*
     * NEWEST file wins, not the alphabetically first.
     *
     * Alphabetical ordering meant dropping in a new photo did nothing if an
     * older filename happened to sort earlier — which is exactly what happened
     * with a camera-style name like "photo_2026-09-07_21-17-09.jpg" landing
     * behind "image.png". "The one I just added" is what anyone dropping a file
     * in here means, so modification time is the honest rule.
     */
    const newest = fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
      .map((f) => ({ f, mtime: fs.statSync(path.join(dir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime)[0];

    return newest ? `/hero/${newest.f}` : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Campaign mosaic imagery, from `public/campaign/`.
 *
 * First file alphabetically becomes the large panel; the rest fill the smaller
 * detail cells. Returns however many exist — the mosaic draws placeholders for
 * the remainder, so it is never half-broken while photography trickles in.
 */
export function getCampaignImages(): string[] {
  const dir = path.join(process.cwd(), "public", "campaign");
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
      .sort()
      .map((f) => `/campaign/${f}`);
  } catch {
    return [];
  }
}
