import Image from "next/image";
import Link from "next/link";

import { GarmentIcon } from "@/components/product/GarmentIcon";

interface CategoryTileProps {
  href: string;
  label: string;
  /** Localised "Shop now". */
  shopNowLabel: string;
  /** Category slug — picks the silhouette shown until a photo exists. */
  slug?: string;
  /** Category photograph. */
  src?: string;
  priority?: boolean;
}

/**
 * Category tile in the Banana Republic idiom: a tall photograph running
 * edge to edge, then the category name in uppercase, then an underlined
 * "shop now" link.
 *
 * The photograph is the whole tile — no card, no border, no radius. That is
 * what makes the row read as editorial rather than as a menu of buttons, and
 * it is why the previous version of this (small rounded chips with an icon)
 * looked like a placeholder even once photos were added.
 *
 * 3:4 rather than the products' 4:5 — category imagery is lifestyle and wants
 * more height; product imagery is uniform so the grid stays even.
 */
export function CategoryTile({
  href,
  label,
  shopNowLabel,
  slug,
  src,
  priority = false,
}: CategoryTileProps) {
  return (
    <div className="group flex flex-col">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden={src ? undefined : "true"}
        className="block overflow-hidden"
      >
        <div className="relative aspect-3/4 w-full overflow-hidden bg-surface">
          {src ? (
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              priority={priority}
              className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <GarmentIcon
                categorySlug={slug}
                className="size-20 text-fg-disabled"
              />
            </div>
          )}
        </div>
      </Link>

      <h3 className="mt-4 text-lg font-normal uppercase tracking-[0.04em] text-fg sm:text-xl">
        {label}
      </h3>

      <Link
        href={href}
        className="mt-1.5 w-fit border-b border-fg pb-0.5 text-[13px] uppercase tracking-[0.08em] text-fg transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {shopNowLabel}
      </Link>
    </div>
  );
}
