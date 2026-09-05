"use client";

/**
 * Client-side wishlist.
 *
 * Stored in localStorage, deliberately: v1 has no customer accounts, and this
 * lets someone save items with zero friction and zero sign-up. It also means
 * we hold no customer PII at all — the safest customer database is the one you
 * don't have (CLAUDE.md §21.3).
 *
 * Trade-off to be honest about: saves live in one browser only. They do not
 * follow the customer to another device. That is the thing customer accounts
 * would fix, and it is a v2 decision.
 *
 * Every access is wrapped: localStorage throws in private mode and in some
 * embedded webviews, and a saved-items feature must never take the page down.
 */

const KEY = "button:wishlist:v1";

/** Notifies components in the same tab; `storage` only fires cross-tab. */
const EVENT = "button:wishlist-change";

export function readWishlist(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function write(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* Storage unavailable or full — saving is a convenience, never critical. */
  }
}

export function toggleWishlist(id: string): string[] {
  const current = readWishlist();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  write(next);
  return next;
}

export function subscribeWishlist(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
