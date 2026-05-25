import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";

/**
 * Lightweight admin gate. No user accounts — a single shared secret
 * (ADMIN_SECRET) unlocks the admin panel. On successful login we set an
 * httpOnly cookie whose value is a hash of the secret, so the raw secret
 * is never stored in the browser.
 *
 * This is intentionally simple for an early-phase internal tool. If you later
 * need multiple admins or audit trails, swap this for a real auth provider;
 * nothing else in the write layer depends on how isAdmin() is satisfied.
 */

const COOKIE_NAME = "wol_admin";

function expectedToken(): string {
  const secret = process.env.ADMIN_SECRET ?? "";
  return createHash("sha256").update(secret).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** True if the request carries a valid admin cookie. */
export async function isAdmin(): Promise<boolean> {
  if (!process.env.ADMIN_SECRET) return false; // not configured -> locked
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return safeEqual(token, expectedToken());
}

/** Verify a submitted secret and, if correct, set the admin cookie. */
export async function login(secret: string): Promise<boolean> {
  const configured = process.env.ADMIN_SECRET ?? "";
  if (!configured) return false;
  if (!safeEqual(secret, configured)) return false;

  const store = await cookies();
  store.set(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return true;
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Throw if not admin — use at the top of every write action. */
export async function assertAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized: admin access required.");
  }
}
