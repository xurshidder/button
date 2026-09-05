import Image from "next/image";
import Link from "next/link";

interface CategoryTileProps {
  href: string;
  label: string;
  /** Category image. Until Button supplies photography this stays undefined. */
  src?: string;
  priority?: boolean;
}

/**
 * Category tile in the Uniqlo/JUST idiom: a photo does the selling and the
 * label sits quietly underneath. Text-only category links read as a directory;
 * image tiles read as a shop.
 *
 * The placeholder is a neutral surface with the category name set large, so an
 * unphotographed catalogue still looks deliberate rather than broken.
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
      className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div className="relative aspect-4/5 w-full overflow-hidden bg-surface">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center p-4">
            <span className="text-center text-sm font-medium leading-snug text-fg-disabled">
              {label}
            </span>
          </div>
        )}
      </div>

      <p className="pt-2 text-[13px] font-medium text-fg group-hover:underline">
        {label}
      </p>
    </Link>
  );
}
