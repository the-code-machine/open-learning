import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

/**
 * Database client.
 *
 * Production (Vercel): set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
 *   Get them from `turso db show <name> --url` and `turso db tokens create <name>`.
 *
 * Local dev: if no Turso URL is set, it falls back to a local file
 *   `file:local.db`. This local file is fine for development ONLY — do not
 *   rely on it in production. On Vercel the filesystem is read-only and
 *   ephemeral, so a local file would lose all writes. Turso is what persists.
 */
const url = process.env.TURSO_DATABASE_URL ?? "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
export { schema };
