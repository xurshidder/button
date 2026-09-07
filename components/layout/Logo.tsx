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

  return (
    <span
      style={{
        fontSize: isWordmark ? height * 0.82 : height,
        letterSpacing: isWordmark ? "0.16em" : undefined,
      }}
      className={`font-display leading-none ${
        isWordmark ? "font-semibold uppercase" : "lowercase tracking-tight"
      } ${onBrand ? "text-brand-ink" : "text-brand"} ${className}`}
    >
      button
    </span>
  );
}
