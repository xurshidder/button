import Image from "next/image";
import Link from "next/link";

import { GarmentIcon } from "@/components/product/GarmentIcon";

interface CampaignMosaicProps {
  href: string;
  /** Positional slots: index 0 is the large panel. Gaps stay gaps. */
  images: (string | undefined)[];
  t: { eyebrow: string; title: string; text: string; cta: string };
}

/** Silhouettes used for the cells that have no photograph yet. */
const PLACEHOLDER_CATEGORIES = [
  "jinsilar",
  "poyabzallar",
  "koylaklar",
  "shimlar",
];

function Cell({
  src,
  index,
  sizes,
  priority = false,
}: {
  src?: string;
  index: number;
  sizes: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    );
  }
  return (
    <div className="flex size-full items-center justify-center bg-surface">
      <GarmentIcon
        categorySlug={PLACEHOLDER_CATEGORIES[index % PLACEHOLDER_CATEGORIES.length]}
        className="size-14 text-fg-disabled"
      />
    </div>
  );
}

/**
 * Editorial campaign block: one tall panel carrying the copy, beside a grid of
 * close-up detail shots.
 *
 * The mix is the point. The large frame sells the outfit; the small ones sell
 * the fabric and the stitching, which is what actually answers "is this worth
 * the money" for a shopper who cannot handle the garment. For a reseller
 * competing on "noticeably better than the bazaar" (CLAUDE.md §1) that detail
 * photography does more work than another full-length shot would.
 *
 * Cells are a one-pixel grid gap over the page, so the images butt together
 * with hairline separations rather than sitting in cards.
 */
export function CampaignMosaic({ href, images, t }: CampaignMosaicProps) {
  const [hero, ...details] = images;

  return (
    <section className="bg-surface px-1 pb-1">
      <div className="grid gap-1 md:grid-cols-2">
        {/* Large panel with the copy overlaid, bottom-left. */}
        <div className="relative aspect-4/5 w-full overflow-hidden md:aspect-auto md:min-h-[560px]">
          <Cell src={hero} index={0} sizes="(max-width: 768px) 100vw, 50vw" priority />

          {hero ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
            />
          ) : null}

          <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-6 sm:p-10">
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
                hero ? "text-white/85" : "text-fg-muted"
              }`}
            >
              {t.eyebrow}
            </p>
            <h2
              className={`font-display mt-2 max-w-md text-3xl font-normal leading-[1.1] sm:text-4xl lg:text-5xl ${
                hero ? "text-white" : "text-fg"
              }`}
            >
              {t.title}
            </h2>
            <p
              className={`mt-3 max-w-sm text-sm leading-relaxed ${
                hero ? "text-white/85" : "text-fg-muted"
              }`}
            >
              {t.text}
            </p>
            <Link
              href={href}
              className={`mt-5 border-b pb-1 text-[13px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                hero
                  ? "border-white text-white hover:border-brand hover:text-brand"
                  : "border-fg text-fg hover:border-brand hover:text-brand"
              }`}
            >
              {t.cta}
            </Link>
          </div>
        </div>

        {/* Detail grid — two by two beside the panel. */}
        <div className="grid grid-cols-2 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative aspect-square w-full overflow-hidden md:aspect-auto md:min-h-[278px]"
            >
              <Cell
                src={details[i]}
                index={i + 1}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
