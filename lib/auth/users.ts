import "server-only";
import { sql } from "drizzle-orm";
import { getDb, isDbConfigured, schema } from "@/lib/db";

export async function hasAnyUser(): Promise<boolean> {
  if (!isDbConfigured()) return false;
  const [{ count }] = await getDb().select({ count: sql<number>`count(*)::int` }).from(schema.users);
  return count > 0;
}

export function setupTokenConfigured() {
  return (process.env.ADMIN_SETUP_TOKEN ?? "").length >= 24;
}
