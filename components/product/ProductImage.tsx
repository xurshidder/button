interface ProductImageProps {
  src?: string;
  alt: string;
  /** Localised "Rasm tez orada" / "Фото скоро" / "Photo coming soon". */
  pendingLabel: string;
  priority?: boolean;
}

/**
 * Product imagery, or an honest placeholder when Button has not supplied a
 * photo yet.
 *
 * Photography is the single biggest quality lever and the one thing we cannot
 * fix in code (CLAUDE.md §17 ask #6). Rather than shipping a broken image icon
 * or a stock photo that misrepresents the product, we show a deliberate
 * placeholder — it looks intentional in review and it makes the missing asset
 * visible to the client.
 *
 * Aspect ratio is locked to 4:5 for every product. Mixed ratios are the
 * number-one thing that makes a catalogue look amateur (CLAUDE.md §12).
 */
export function ProductImage({ src, alt, pendingLabel }: ProductImageProps) {
  if (src) {
    // TODO: swap for next/image once real photography and a CDN host exist.
    // Images are ~90% of this site's bandwidth (CLAUDE.md §21.2), so this must
    // not ship to production as a plain <img>.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className="aspect-4/5 w-full rounded-lg object-cover"
      />
    );
  }

  return (
    <div className="photo-pending flex aspect-4/5 w-full flex-col items-center justify-center gap-2 rounded-lg border border-border">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8 text-fg-muted/50"
        aria-hidden="true"
      >
        {/* Clothes hanger */}
        <path d="M12 6a2 2 0 1 1 2 2c-1.2 0-2 .8-2 2" />
        <path d="M12 10 3.5 16.2a1 1 0 0 0 .6 1.8h15.8a1 1 0 0 0 .6-1.8L12 10Z" />
      </svg>
      <span className="px-2 text-center text-[11px] font-medium text-fg-muted/70">
        {pendingLabel}
      </span>
    </div>
  );
}
