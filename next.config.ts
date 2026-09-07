import type { NextConfig } from "next";

/**
 * Supabase Storage host, derived from the env var rather than hardcoded so the
 * project reference is not duplicated in two places.
 */
function supabaseHost(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return undefined;
  try {
    return new URL(raw).hostname;
  } catch {
    return undefined;
  }
}

const host = supabaseHost();

const nextConfig: NextConfig = {
  images: {
    // next/image refuses remote hosts unless they are listed. Uploaded product
    // photography is served from Supabase Storage, so that host must be here
    // or every uploaded image 400s.
    remotePatterns: host
      ? [{ protocol: "https", hostname: host, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default nextConfig;
