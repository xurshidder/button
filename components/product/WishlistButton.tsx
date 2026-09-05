"use client";

import { useEffect, useState } from "react";

import {
  readWishlist,
  subscribeWishlist,
  toggleWishlist,
} from "@/lib/wishlist";

interface WishlistButtonProps {
  productId: string;
  labels: { add: string; remove: string };
  className?: string;
}

/**
 * Heart toggle for saving a product.
 *
 * Renders unsaved on the server and syncs after mount, because localStorage
 * does not exist during prerendering — reading it during render would cause a
 * hydration mismatch. Subscribing keeps every heart on the page consistent
 * when one of them is clicked.
 */
export function WishlistButton({
  productId,
  labels,
  className = "",
}: WishlistButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(readWishlist().includes(productId));
    sync();
    return subscribeWishlist(sync);
  }, [productId]);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? labels.remove : labels.add}
      title={saved ? labels.remove : labels.add}
      onClick={(e) => {
        // The card is a link; don't navigate when the heart is clicked.
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      className={`flex size-9 items-center justify-center rounded-full bg-bg/85 backdrop-blur transition hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`size-[18px] transition-colors ${saved ? "text-brand" : "text-fg"}`}
        aria-hidden="true"
      >
        <path d="M12 20.5s-7.5-4.6-7.5-9.6a4.2 4.2 0 0 1 7.5-2.6 4.2 4.2 0 0 1 7.5 2.6c0 5-7.5 9.6-7.5 9.6Z" />
      </svg>
    </button>
  );
}
