"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Locale } from "@/lib/i18n/config";

interface SearchBarProps {
  locale: Locale;
  placeholder: string;
  label: string;
}

/**
 * Header search, in the Uniqlo idiom: a rounded field that sits in the header
 * rather than hiding behind an icon.
 *
 * Submits to the catalogue as `?q=`, so results are a normal server-rendered,
 * shareable, indexable URL — not client-side state. Zero-result searches are
 * also the single best signal of what Button should import next
 * (CLAUDE.md §21.4), and that only works if the query is in the URL.
 */
export function SearchBar({ locale, placeholder, label }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    router.push(
      q
        ? `/${locale}/katalog?q=${encodeURIComponent(q)}`
        : `/${locale}/katalog`,
    );
  }

  return (
    <form onSubmit={onSubmit} role="search" className="relative w-full">
      <label htmlFor="site-search" className="sr-only">
        {label}
      </label>

      <input
        id="site-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-fg outline-none transition placeholder:text-fg-placeholder focus:border-brand focus:bg-bg"
      />

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    </form>
  );
}
