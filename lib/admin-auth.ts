import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Minimal admin authentication.
 *
 * A single shared password, exchanged for an HMAC-signed cookie. This is
 * deliberately NOT the auth described in CLAUDE.md §11 — that one has per-staff
 * accounts, phone-number logins, roles and an audit trail, and it is what a
 * real shop with staff turnover needs.
 *
 * This exists so the upload endpoint is not open to the internet the moment it
 * is deployed. It is an interim gate, not the finished access control, and it
 * should be replaced before Button's staff ever use the panel.
 */

const COOKIE = "button_admin";
/** Eight hours: long enough for a working day, short enough to matter. */
const MAX_AGE_SECONDS = 8 * 60 * 60;

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set in .env.local");
  return value;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

/** `<expiry>.<signature>` — stateless, so no session table is needed yet. */
export function createSessionToken(): string {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  return `${expiresAt}.${sign(String(expiresAt))}`;
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expiry, signature] = token.split(".");
  if (!expiry || !signature) return false;
  if (Number(expiry) < Date.now()) return false;

  const expected = sign(expiry);
  // Constant-time compare, so the signature cannot be guessed byte by byte.
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return isValidSessionToken(store.get(COOKIE)?.value);
}

/**
 * Checks a submitted password against ADMIN_PASSWORD.
 *
 * Compared in constant time and length-padded first, so the check leaks
 * neither the password's content nor its length through timing.
 */
export function isCorrectPassword(submitted: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  const hashOf = (value: string) =>
    crypto.createHash("sha256").update(value).digest();
  return crypto.timingSafeEqual(hashOf(submitted), hashOf(expected));
}

export async function startSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
