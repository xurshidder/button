import "server-only";

/**
 * Supabase Storage.
 *
 * Uses the REST endpoint directly rather than @supabase/supabase-js: we need
 * exactly three operations, and the SDK would add a dependency plus its own
 * auth model for no benefit.
 *
 * Authenticated with the SECRET key, which bypasses row-level security — so
 * every function here is server-only and must never be reachable from a
 * route that has not already checked authorisation (CLAUDE.md §21.3).
 */

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "products";

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "").replace(
    /\/rest\/v1$/,
    "",
  );
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase storage is not configured. NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env.local.",
    );
  }
  return { url, key };
}

/**
 * Auth headers for the Storage API.
 *
 * `apikey` is the one that matters. Supabase's newer `sb_secret_…` keys are
 * NOT JWTs, and Storage tries to parse an `Authorization: Bearer` value as
 * one — it answers "Invalid Compact JWS" and rejects the request. Passed as
 * `apikey` the same key is accepted.
 *
 * `Authorization` is sent as well so this keeps working for anyone still on a
 * legacy service-role JWT, where that header is the expected route.
 */
function authHeaders(key: string): Record<string, string> {
  return { apikey: key, Authorization: `Bearer ${key}` };
}

/** Public URL for an object, assuming the bucket is public. */
export function publicUrl(objectPath: string): string {
  const { url } = config();
  return `${url}/storage/v1/object/public/${BUCKET}/${objectPath}`;
}

/**
 * Uploads bytes, replacing anything already at that path.
 *
 * `upsert` matters: re-uploading the hero should replace it rather than
 * accumulate copies. Cache-Control is short because the whole point of
 * replacing an image is to see the new one.
 */
export async function uploadObject(
  objectPath: string,
  body: ArrayBuffer,
  contentType: string,
): Promise<string> {
  const { url, key } = config();

  const response = await fetch(
    `${url}/storage/v1/object/${BUCKET}/${objectPath}`,
    {
      method: "POST",
      headers: {
        ...authHeaders(key),
        "Content-Type": contentType,
        "x-upsert": "true",
        "Cache-Control": "60",
      },
      body,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Storage upload failed (${response.status}): ${await response.text()}`,
    );
  }

  return publicUrl(objectPath);
}

export async function deleteObject(objectPath: string): Promise<void> {
  const { url, key } = config();
  const response = await fetch(
    `${url}/storage/v1/object/${BUCKET}/${objectPath}`,
    { method: "DELETE", headers: authHeaders(key) },
  );
  if (!response.ok && response.status !== 404) {
    throw new Error(`Storage delete failed (${response.status})`);
  }
}

/**
 * Verifies a file really is the image type it claims, by inspecting the first
 * bytes.
 *
 * Extension and Content-Type both come from the client and both can lie. A
 * renamed script uploaded as "photo.jpg" is the classic upload attack, so the
 * bytes are what we trust (CLAUDE.md §12, §21.3).
 */
export function sniffImageType(bytes: Uint8Array): string | null {
  const startsWith = (...sig: number[]) =>
    sig.every((byte, i) => bytes[i] === byte);

  if (startsWith(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))
    return "image/png";
  // RIFF....WEBP
  if (
    startsWith(0x52, 0x49, 0x46, 0x46) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
    return "image/webp";
  // ftyp....avif
  if (
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70 &&
    bytes[8] === 0x61 &&
    bytes[9] === 0x76 &&
    bytes[10] === 0x69 &&
    bytes[11] === 0x66
  )
    return "image/avif";

  return null;
}

export const EXTENSION_FOR: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** 10 MB, per CLAUDE.md §12. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
