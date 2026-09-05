import Image from "next/image";

interface LogoProps {
  /** Path to logo artwork, or undefined to render the text fallback. */
  src?: string;
  /** Rendered height in px; width scales automatically. */
  height?: number;
  /** True when the logo sits on the brand purple rather than on white. */
  onBrand?: boolean;
  className?: string;
}

/**
 * Button's logo.
 *
 * Uses real artwork when `public/brand/` contains it (see lib/brand.ts). Until
 * then it renders a text wordmark in the geometric display face — deliberately
 * an approximation, and replaced automatically the moment the file lands.
 */
export function Logo({
  src,
  height = 28,
  onBrand = false,
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

  return (
    <span
      style={{ fontSize: height }}
      className={`font-display lowercase leading-none tracking-tight ${
        onBrand ? "text-brand-ink" : "text-brand"
      } ${className}`}
    >
      button
    </span>
  );
}
