import type { Metadata } from "next";

import "../globals.css";

export const metadata: Metadata = {
  title: "Button — Boshqaruv",
  // The admin surface must never be indexed (CLAUDE.md §21.3).
  robots: { index: false, follow: false },
};

/**
 * Admin root layout.
 *
 * Separate from the storefront's: /admin is not locale-prefixed, and its UI is
 * Uzbek-only with Russian fallback — never English, because the staff using it
 * are Uzbek-speaking and a panel in English is a wall (CLAUDE.md §13).
 */
export default function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  return (
    <html lang="uz-Latn-UZ" className="h-full antialiased">
      <body className="min-h-full bg-surface font-sans text-fg">{children}</body>
    </html>
  );
}
