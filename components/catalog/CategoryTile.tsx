import Image from "next/image";
import Link from "next/link";

interface CategoryTileProps {
  href: string;
  label: string;
  /**
   * Category image — ideally a cut-out garment on a white/transparent
   * background, in Uniqlo's "Search by category" idiom. Undefined until
   * Button supplies artwork.
   */
  src?: string;
  priority?: boolean;
}

/**
 * Category entry modelled on Uniqlo's "Search by category" row: a single
 * garment floating on white, with a small centred label underneath.
 *
 * Deliberately has NO card, border or background — the cut-out sits directly on
 * the page. That is what makes the row feel light instead of like a grid of
 * boxes, and it is the detail that separates it from a plain link directory.
 */
export function CategoryTile({
  href,
  label,
  src,
  priority = false,
}: CategoryTileProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 rounded-2xl p-2 transition-colors duration-200 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div className="relative flex aspect-square w-full max-w-[120px] items-center justify-center">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="120px"
            priority={priority}
            /* object-contain, not cover: a cut-out must never be cropped. */
            className="object-contain transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center rounded-2xl bg-surface">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-7 text-fg-disabled"
              aria-hidden="true"
            >
              <path d="M12 6a2 2 0 1 1 2 2c-1.2 0-2 .8-2 2" />
              <path d="M12 10 3.5 16.2a1 1 0 0 0 .6 1.8h15.8a1 1 0 0 0 .6-1.8L12 10Z" />
            </svg>
          </div>
        )}
      </div>

      <span className="text-center text-[13px] leading-snug text-fg group-hover:underline">
        {label}
      </span>
    </Link>
  );
}
