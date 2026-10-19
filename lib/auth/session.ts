import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, lt, or } from "drizzle-orm";
import { getDb, isDbConfigured, schema } from "@/lib/db";
import { randomToken, sha256 } from "./crypto";

const IDLE_MS = 8 * 60 * 60 * 1000;
const ABSOLUTE_MS = 7 * 24 * 60 * 60 * 1000;
const TOUCH_INTERVAL_MS = 10 * 60 * 1000;

export const SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-tc_session" : "tc_session";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  lastLoginAt: Date | null;
};

export async function createSession(userId: string) {
  const token = randomToken();
  const now = Date.now();
  const h = await headers();
  await getDb()
    .insert(schema.sessions)
    .values({
      tokenHash: sha256(token),
      userId,
      expiresAt: new Date(now + IDLE_MS),
      absoluteExpiresAt: new Date(now + ABSOLUTE_MS),
      userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
    });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ABSOLUTE_MS / 1000,
  });
}

export const getCurrentUser = cache(async (): Promise<AdminUser | null> => {
  if (!isDbConfigured()) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;

  const db = getDb();
  const now = new Date();
  const [row] = await db
    .select({
      sessionId: schema.sessions.id,
      lastSeenAt: schema.sessions.lastSeenAt,
      absoluteExpiresAt: schema.sessions.absoluteExpiresAt,
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      lastLoginAt: schema.users.lastLoginAt,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(
      and(
        eq(schema.sessions.tokenHash, sha256(token)),
        gt(schema.sessions.expiresAt, now),
        gt(schema.sessions.absoluteExpiresAt, now),
      ),
    )
    .limit(1);

  if (!row) return null;

  // Sliding idle timeout, capped by the absolute lifetime.
  if (now.getTime() - row.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    const nextExpiry = Math.min(now.getTime() + IDLE_MS, row.absoluteExpiresAt.getTime());
    await db
      .update(schema.sessions)
      .set({ lastSeenAt: now, expiresAt: new Date(nextExpiry) })
      .where(eq(schema.sessions.id, row.sessionId));
  }

  return { id: row.id, email: row.email, name: row.name, lastLoginAt: row.lastLoginAt };
});

/** For admin pages and layouts: redirects to the login page when not signed in. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Niet ingelogd");
  }
}

/** For server actions and route handlers: throws instead of redirecting. */
export async function assertAdmin(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function destroyCurrentSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token && isDbConfigured()) {
    await getDb().delete(schema.sessions).where(eq(schema.sessions.tokenHash, sha256(token)));
  }
  jar.delete(SESSION_COOKIE);
}

export async function destroyAllSessions(userId: string) {
  await getDb().delete(schema.sessions).where(eq(schema.sessions.userId, userId));
}

export async function pruneExpiredSessions() {
  const now = new Date();
  await getDb()
    .delete(schema.sessions)
    .where(or(lt(schema.sessions.expiresAt, now), lt(schema.sessions.absoluteExpiresAt, now)));
}
