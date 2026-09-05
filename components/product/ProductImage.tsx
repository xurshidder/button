import Image from "next/image";

interface ProductImageProps {
  src?: string;
  alt: string;
  /** Localised "Rasm tez orada" / "Фото скоро" / "Photo coming soon". */
  pendingLabel: string;
  /** Set on above-the-fold images so they are not lazy-loaded. */
  priority?: boolean;
  /** Responsive `sizes` hint — must match the grid the image sits in. */
  sizes?: string;
}

/**
 * Product imagery, or an honest placeholder when Button has not supplied a
 * photo yet.
 *
 * Aspect ratio is locked to 4:5 for every product. Mixed ratios are the
 * number-one thing that makes a catalogue look amateur (CLAUDE.md §12), and
 * Uniqlo's grid works precisely because every image is identical in shape.
 *
 * Square corners, no border: the photo should meet the white page directly so
 * the chrome disappears and the garment carries the layout (CLAUDE.md §20).
 */
export function ProductImage({
  src,
  alt,
  pendingLabel,
  priority = false,
  sizes = "(max-width: 768px) 50vw, 25vw",
}: ProductImageProps) {
  if (src) {
    return (
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-xl bg-surface">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-4/5 w-full flex-col items-center justify-center gap-2 bg-surface">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8 text-fg-disabled"
        aria-hidden="true"
      >
        {/* Clothes hanger */}
        <path d="M12 6a2 2 0 1 1 2 2c-1.2 0-2 .8-2 2" />
        <path d="M12 10 3.5 16.2a1 1 0 0 0 .6 1.8h15.8a1 1 0 0 0 .6-1.8L12 10Z" />
      </svg>
      <span className="px-2 text-center text-[11px] font-medium text-fg-disabled">
        {pendingLabel}
      </span>
    </div>
  );
}
