import Image from "next/image";

interface LogoProps {
  /** Path to logo artwork, or undefined to render the text fallback. */
  src?: string;
  /** Rendered height in px; width scales automatically. */
  height?: number;
  /** True when the logo sits on the brand purple rather than on white. */
  onBrand?: boolean;
  /**
   * "wordmark" is the Banana Republic treatment for the text fallback:
   * uppercase, widely letterspaced, at a size that anchors the header.
   * "default" keeps Button's own lowercase geometric styling.
   */
  variant?: "default" | "wordmark";
  className?: string;
}

/**
 * Button's logo.
 *
 * Uses real artwork when `public/brand/` contains it (see lib/brand.ts). Until
 * then it renders a text wordmark — deliberately an approximation, replaced
 * automatically the moment the file lands.
 */
export function Logo({
  src,
  height = 28,
  onBrand = false,
  variant = "default",
  className = "",
}: LogoProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt="Button"
        height={height}
        width={height * 4}
        priority
        // Intrinsic ratio wins; width above is only a layout hint.
        style={{ height, width: "auto" }}
        className={className}
      />
    );
  }

  const isWordmark = variant === "wordmark";

  if (isWordmark) {
    /*
     * Banana Republic's treatment: high-contrast serif, uppercase, widely
     * letterspaced, in near-black rather than a brand colour. Their wordmark
     * carries authority through the letterforms, not through hue.
     *
     * Purple has not left the brand — it still owns hover states, the primary
     * CTA and the product chrome. And all of this is a stand-in: the real logo
     * artwork replaces it the moment `public/brand/` has a file.
     */
    return (
      <span
        style={{ fontSize: height, letterSpacing: "0.1em" }}
        className={`font-display font-normal uppercase leading-none ${
          onBrand ? "text-brand-ink" : "text-fg"
        } ${className}`}
      >
        Button
      </span>
    );
  }

  return (
    <span
      style={{ fontSize: height }}
      className={`font-geometric lowercase leading-none tracking-tight ${
        onBrand ? "text-brand-ink" : "text-brand"
      } ${className}`}
    >
      button
    </span>
  );
}
