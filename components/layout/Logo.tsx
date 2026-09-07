import Image from "next/image";

interface LogoProps {
  /** Path to real logo artwork, when public/brand/ contains it. */
  src?: string;
  /** Rendered height in px; width scales with the artwork's ratio. */
  height?: number;
  /** True when the logo sits on the brand purple rather than on white. */
  onBrand?: boolean;
  className?: string;
}

/** Intrinsic ratio of the drawn wordmark. */
const VIEW_W = 720;
const VIEW_H = 190;

/**
 * Button's "button" wordmark, reconstructed as vector artwork.
 *
 * The logo is a monoline geometric face: every letter is a straight segment, a
 * full circle, or a circular arc, all at one constant stroke width. That makes
 * it reproducible exactly rather than approximated with a webfont — which is
 * what we were doing before, and it never matched, because the wordmark is
 * lettering rather than type.
 *
 * Geometry lives in scripts/build-wordmark.mjs, which also renders a PNG
 * preview for eyeballing. It is inlined here rather than loaded as a file so
 * the strokes inherit `currentColor` and can flip to white on the purple.
 */
function Wordmark({ height }: { height: number }) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      height={height}
      width={(height * VIEW_W) / VIEW_H}
      fill="none"
      /* The wrapping link already announces "Button"; naming this too would
         make a screen reader say it twice. */
      aria-hidden="true"
      focusable="false"
      className="block"
    >
      <g stroke="currentColor" strokeWidth={25} strokeLinecap="butt">
        {/* b */}
        <path d="M15 20L15 170" />
        <path d="M15 115a55 55 0 1 0 110 0a55 55 0 1 0 -110 0" />
        {/* u */}
        <path d="M145 60L145 115" />
        <path d="M255 60L255 170" />
        <path d="M255 115A55 55 0 0 1 145 115" />
        {/* t */}
        <path d="M295 20L295 115" />
        <path d="M275 60L345 60" />
        <path d="M350 170A55 55 0 0 1 295 115" />
        {/* t */}
        <path d="M390 20L390 115" />
        <path d="M370 60L440 60" />
        <path d="M445 170A55 55 0 0 1 390 115" />
        {/* o */}
        <path d="M465 115a55 55 0 1 0 110 0a55 55 0 1 0 -110 0" />
        {/* n */}
        <path d="M595 60L595 170" />
        <path d="M705 115L705 170" />
        <path d="M595 115A55 55 0 0 1 705 115" />
      </g>
    </svg>
  );
}

/**
 * Button's logo.
 *
 * Prefers real artwork from `public/brand/` when it exists — a supplied vector
 * always beats a reconstruction. Otherwise it draws the wordmark above.
 */
export function Logo({
  src,
  height = 28,
  onBrand = false,
  className = "",
}: LogoProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt="Button"
        height={height}
        width={height * 4}
        priority
        style={{ height, width: "auto" }}
        className={className}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center ${
        onBrand ? "text-brand-ink" : "text-brand"
      } ${className}`}
    >
      <Wordmark height={height} />
    </span>
  );
}
