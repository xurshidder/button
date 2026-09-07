/**
 * Line-art garment silhouettes, one per category.
 *
 * Used in the "photo coming soon" state. A grid of identical grey boxes reads
 * as broken; a grid of category-appropriate drawings reads as deliberate — and
 * it still tells the truth, which a stock photo of a garment Button does not
 * stock would not (CLAUDE.md §1, §19).
 */

const PATHS: Record<string, React.ReactNode> = {
  // Outerwear — jacket with collar and centre zip
  "ust-kiyim": (
    <>
      <path d="M8 7 4 9v11h4M16 7l4 2v11h-4" />
      <path d="M8 7h8v13H8z" />
      <path d="M12 7v13M9.5 5l2.5 2 2.5-2" />
    </>
  ),
  // Shirts — collar and buttoned placket
  koylaklar: (
    <>
      <path d="M9 4 4.5 6.5 6 10l1.5-.8V20h9V9.2L18 10l1.5-3.5L15 4" />
      <path d="M9 4l3 2.5L15 4" />
      <path d="M12 9v9" />
    </>
  ),
  // Knitwear — crew neck, ribbed hem
  trikotaj: (
    <>
      <path d="M9 4 4 7v6h3v7h10v-7h3V7l-5-3" />
      <path d="M9 4a3 3 0 0 0 6 0" />
      <path d="M7 17h10" />
    </>
  ),
  // Trousers
  shimlar: (
    <>
      <path d="M7 3h10l-.7 18h-3.1L12 10l-1.2 11H7.7z" />
      <path d="M7 6h10" />
    </>
  ),
  // Jeans — trousers with pocket detail
  jinsilar: (
    <>
      <path d="M7 3h10l-.7 18h-3.1L12 10l-1.2 11H7.7z" />
      <path d="M7 7h10M8.5 4.5v2M15.5 4.5v2" />
    </>
  ),
  // Shoes — low profile sneaker
  poyabzallar: (
    <>
      <path d="M3 16v-4l3-1 3 2 6 1c2 .2 5 .8 6 2.2V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <path d="M6 11l1.5 2M9 12.5l1.5 2M12.5 14l1 1.6" />
    </>
  ),
  // Bags — briefcase with handle
  sumkalar: (
    <>
      <rect x="3" y="8" width="18" height="11" rx="2" />
      <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </>
  ),
  // Accessories — wristwatch
  aksessuarlar: (
    <>
      <circle cx="12" cy="12" r="5" />
      <path d="M9.5 7 9 3h6l-.5 4M9.5 17l-.5 4h6l-.5-4" />
      <path d="M12 10v2.5l1.5 1" />
    </>
  ),
};

/** Falls back to a clothes hanger for any category without its own drawing. */
const HANGER = (
  <>
    <path d="M12 6a2 2 0 1 1 2 2c-1.2 0-2 .8-2 2" />
    <path d="M12 10 3.5 16.2a1 1 0 0 0 .6 1.8h15.8a1 1 0 0 0 .6-1.8L12 10Z" />
  </>
);

export function GarmentIcon({
  categorySlug,
  className = "",
}: {
  categorySlug?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {(categorySlug && PATHS[categorySlug]) || HANGER}
    </svg>
  );
}
