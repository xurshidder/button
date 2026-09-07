import Image from "next/image";

import { GarmentIcon } from "@/components/product/GarmentIcon";

interface ProductImageProps {
  src?: string;
  alt: string;
  /** Localised "Rasm tez orada" / "Фото скоро" / "Photo coming soon". */
  pendingLabel: string;
  /** Picks the silhouette drawn in the empty state. */
  categorySlug?: string;
  /** Set on above-the-fold images so they are not lazy-loaded. */
  priority?: boolean;
  /** Responsive `sizes` hint — must match the grid the image sits in. */
  sizes?: string;
}

/**
 * Product imagery, or a designed placeholder when Button has not supplied a
 * photo yet.
 *
 * Aspect ratio is locked to 4:5 for every product. Mixed ratios are the
 * number-one thing that makes a catalogue look amateur (CLAUDE.md §12), and a
 * uniform ratio is why a dense grid reads as clean.
 *
 * The placeholder deliberately stays a placeholder. Filling it with stock
 * photography would attach garments Button does not stock to real names,
 * prices and per-branch availability — which misleads the customer and risks
 * showing other brands' marks (CLAUDE.md §1, §19). An honest empty state is
 * the better failure mode, so it is drawn to look intentional instead.
 */
export function ProductImage({
  src,
  alt,
  pendingLabel,
  categorySlug,
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
    /* Flat warm surface, not a purple-tinted gradient: against the warm
       neutral ramp a cool lilac wash reads as a mismatch rather than a tint.
       The purple stays where it belongs — on the drawing itself. */
    <div className="relative flex aspect-4/5 w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-surface">
      <GarmentIcon
        categorySlug={categorySlug}
        className="size-16 text-brand/25 sm:size-20"
      />
      <span className="px-3 text-center text-[11px] font-medium uppercase tracking-[0.08em] text-fg-disabled">
        {pendingLabel}
      </span>
    </div>
  );
}
