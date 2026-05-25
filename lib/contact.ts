/**
 * Contact normalization.
 *
 * A player identifies at play time with an email OR a phone. To match reliably
 * against the contact stored on their selected roster row, we normalize both
 * sides the same way before comparing:
 *  - email: trim + lowercase
 *  - phone: keep digits only (drops spaces, dashes, parens, +, etc.)
 *
 * classifyContact decides whether a raw input looks like an email or a phone,
 * so the play form can accept a single field for either.
 */

export type ContactKind = "email" | "phone" | "unknown";

export function classifyContact(raw: string): ContactKind {
  const v = raw.trim();
  if (!v) return "unknown";
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return "email";
  // phone: at least 7 digits once stripped
  const digits = v.replace(/\D/g, "");
  if (digits.length >= 7) return "phone";
  return "unknown";
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

/**
 * Phone matching is fuzzy by nature: people type +91, leading zeros, or just
 * the local number. We compare the last 10 digits (the local subscriber
 * number) so "+91 98765 43210", "098765 43210", and "9876543210" all match.
 * Email remains the exact, reliable identity key; phone is best-effort.
 */
export function phoneMatchKey(raw: string): string {
  const digits = normalizePhone(raw);
  return digits.slice(-10);
}

/** Returns { kind, value } where value is the normalized form, or null if unrecognized. */
export function normalizeContact(
  raw: string,
): { kind: "email" | "phone"; value: string } | null {
  const kind = classifyContact(raw);
  if (kind === "email") return { kind, value: normalizeEmail(raw) };
  if (kind === "phone") return { kind, value: normalizePhone(raw) };
  return null;
}
