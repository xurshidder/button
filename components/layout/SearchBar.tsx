"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Locale } from "@/lib/i18n/config";

interface SearchBarProps {
  locale: Locale;
  placeholder: string;
  label: string;
  /**
   * "underline" is the Banana Republic treatment — a rule under the field and
   * the magnifier on the right. "pill" is the rounded field used on mobile,
   * where a bordered box reads as more obviously tappable.
   */
  variant?: "underline" | "pill";
}

/**
 * Header search.
 *
 * Submits to the catalogue as `?q=`, so results are a normal server-rendered,
 * shareable, indexable URL — not client-side state. Zero-result searches are
 * also the best signal of what Button should import next (CLAUDE.md §21.4),
 * and that only works if the query is in the URL.
 */
export function SearchBar({
  locale,
  placeholder,
  label,
  variant = "pill",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    router.push(
      q ? `/${locale}/katalog?q=${encodeURIComponent(q)}` : `/${locale}/katalog`,
    );
  }

  const isUnderline = variant === "underline";

  return (
    <form onSubmit={onSubmit} role="search" className="relative w-full">
      <label htmlFor={`site-search-${variant}`} className="sr-only">
        {label}
      </label>

      <input
        id={`site-search-${variant}`}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={
          isUnderline
            ? "w-full border-0 border-b border-border bg-transparent py-1.5 pr-7 text-sm text-fg outline-none transition placeholder:text-fg-placeholder focus:border-fg"
            : "w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-fg outline-none transition placeholder:text-fg-placeholder focus:border-brand focus:bg-bg"
        }
      />

      <button
        type="submit"
        aria-label={label}
        className={`absolute top-1/2 -translate-y-1/2 text-fg-muted transition hover:text-fg ${
          isUnderline ? "right-0" : "left-3.5 pointer-events-none"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="size-[18px]"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}
