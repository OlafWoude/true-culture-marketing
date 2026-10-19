import "server-only";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb, schema } from "@/lib/db";
import { sha256 } from "./crypto";

export async function clientIpKey(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || h.get("x-real-ip") || "unknown";
  // Only a salted hash is stored, never the raw IP address.
  return sha256(`${process.env.ADMIN_SETUP_TOKEN ?? "tc"}:${ip}`).slice(0, 32);
}

/** Counts hits for `key` in the window; returns true when the limit is reached. */
export async function isRateLimited(key: string, limit: number, windowMs: number) {
  const db = getDb();
  const since = new Date(Date.now() - windowMs);
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.rateLimits)
    .where(and(eq(schema.rateLimits.key, key), gte(schema.rateLimits.createdAt, since)));
  return (row?.count ?? 0) >= limit;
}

export async function recordHit(key: string) {
  const db = getDb();
  await db.insert(schema.rateLimits).values({ key });
  // Opportunistic cleanup keeps the table small.
  if (Math.random() < 0.05) {
    await db
      .delete(schema.rateLimits)
      .where(lt(schema.rateLimits.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)));
  }
}

export async function clearHits(key: string) {
  await getDb().delete(schema.rateLimits).where(eq(schema.rateLimits.key, key));
}
