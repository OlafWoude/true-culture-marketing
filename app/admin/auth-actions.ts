"use server";

import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, isDbConfigured, schema } from "@/lib/db";
import { hashPassword, passwordProblem, randomToken, safeEqual, sha256, verifyPassword } from "@/lib/auth/crypto";
import { clearHits, clientIpKey, isRateLimited, recordHit } from "@/lib/auth/rate-limit";
import { createSession, destroyAllSessions, destroyCurrentSession } from "@/lib/auth/session";
import { ensureSeeded } from "@/lib/cms/repo";
import { isEmailConfigured, sendEmail, siteBaseUrl } from "@/lib/email";

export type AuthState = { error?: string; message?: string; values?: Record<string, string> } | undefined;

// Non-secret fields are echoed back so a form keeps them after an error; passwords never are.
function keep(formData: FormData, ...keys: string[]) {
  return Object.fromEntries(keys.map((k) => [k, String(formData.get(k) ?? "").slice(0, 200)]));
}

const MINUTE = 60 * 1000;
const emailSchema = z.string().trim().toLowerCase().email().max(200);

function setupTokenAvailable() {
  const token = process.env.ADMIN_SETUP_TOKEN ?? "";
  return token.length >= 24 ? token : null;
}

async function userCount() {
  const [{ count }] = await getDb().select({ count: sql<number>`count(*)::int` }).from(schema.users);
  return count;
}

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return /^\/admin(\/[\w\-/?=&.%]*)?$/.test(next) && !next.startsWith("//") ? next : "/admin";
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isDbConfigured()) return { error: "De database is nog niet gekoppeld.", values: keep(formData, "email") };
  const parsedEmail = emailSchema.safeParse(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const generic = "Onjuist e-mailadres of wachtwoord.";
  if (!parsedEmail.success || !password || password.length > 200) return { error: generic, values: keep(formData, "email") };
  const email = parsedEmail.data;

  const ipKey = `login-ip:${await clientIpKey()}`;
  const emailKey = `login-email:${sha256(email)}`;
  if ((await isRateLimited(emailKey, 5, 15 * MINUTE)) || (await isRateLimited(ipKey, 20, 15 * MINUTE))) {
    return { error: "Te veel inlogpogingen. Wacht 15 minuten en probeer het opnieuw.", values: keep(formData, "email") };
  }

  const db = getDb();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  const valid = await verifyPassword(password, user?.passwordHash ?? null);
  if (!user || !valid) {
    await recordHit(emailKey);
    await recordHit(ipKey);
    return { error: generic, values: keep(formData, "email") };
  }

  await clearHits(emailKey);
  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));
  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  await destroyCurrentSession();
  redirect("/admin/login?uitgelogd=1");
}

const setupSchema = z.object({
  name: z.string().trim().min(2, "Vul je naam in.").max(80),
  email: emailSchema,
  password: z.string().max(200),
  confirm: z.string().max(200),
  token: z.string().max(200),
});

export async function setupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isDbConfigured()) return { error: "De database is nog niet gekoppeld.", values: keep(formData, "name", "email") };
  const expected = setupTokenAvailable();
  if (!expected) return { error: "Stel eerst de omgevingsvariabele ADMIN_SETUP_TOKEN in (minimaal 24 tekens).", values: keep(formData, "name", "email") };

  const ipKey = `setup-ip:${await clientIpKey()}`;
  if (await isRateLimited(ipKey, 10, 60 * MINUTE)) return { error: "Te veel pogingen. Probeer het over een uur opnieuw.", values: keep(formData, "name", "email") };

  const parsed = setupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Controleer de velden.", values: keep(formData, "name", "email") };
  const { name, email, password, confirm, token } = parsed.data;

  if (!safeEqual(token, expected)) {
    await recordHit(ipKey);
    return { error: "De setup-sleutel klopt niet.", values: keep(formData, "name", "email") };
  }
  if ((await userCount()) > 0) return { error: "Er bestaat al een beheerder. Log in of gebruik ‘Wachtwoord vergeten’.", values: keep(formData, "name", "email") };
  const problem = passwordProblem(password, email);
  if (problem) return { error: problem, values: keep(formData, "name", "email") };
  if (password !== confirm) return { error: "De wachtwoorden zijn niet gelijk.", values: keep(formData, "name", "email") };

  const db = getDb();
  const [user] = await db
    .insert(schema.users)
    .values({ name, email, passwordHash: await hashPassword(password), passwordChangedAt: new Date(), lastLoginAt: new Date() })
    .returning();
  await ensureSeeded(user.id);
  await createSession(user.id);
  redirect("/admin?welkom=1");
}

export async function requestResetAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isDbConfigured()) return { error: "De database is nog niet gekoppeld.", values: keep(formData, "email") };
  const parsed = emailSchema.safeParse(formData.get("email"));
  const done = {
    message:
      "Als dit e-mailadres bij een beheerder hoort, ontvang je binnen enkele minuten een link om een nieuw wachtwoord in te stellen. De link is één uur geldig.",
  };
  if (!parsed.success) return done;
  if (!isEmailConfigured()) {
    return {
      error:
        "E-mail versturen is nog niet ingesteld (RESEND_API_KEY). Gebruik in de tussentijd de noodprocedure met de setup-sleutel.",
    };
  }

  const email = parsed.data;
  const ipKey = `reset-ip:${await clientIpKey()}`;
  const emailKey = `reset-email:${sha256(email)}`;
  if ((await isRateLimited(emailKey, 3, 60 * MINUTE)) || (await isRateLimited(ipKey, 10, 60 * MINUTE))) return done;
  await recordHit(emailKey);
  await recordHit(ipKey);

  const db = getDb();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (!user) return done;

  const token = randomToken();
  await db.insert(schema.passwordTokens).values({
    userId: user.id,
    tokenHash: sha256(token),
    purpose: "reset",
    expiresAt: new Date(Date.now() + 60 * MINUTE),
  });
  const link = `${siteBaseUrl()}/admin/wachtwoord-herstellen/${token}`;
  await sendEmail({
    to: user.email,
    subject: "Nieuw wachtwoord instellen voor het True Culture-dashboard",
    text: `Hallo ${user.name || ""},\n\nJe hebt gevraagd om een nieuw wachtwoord voor het beheer van de website.\nKlik binnen een uur op deze link om een nieuw wachtwoord in te stellen:\n\n${link}\n\nHeb je dit niet zelf aangevraagd? Dan kun je deze e-mail negeren; je wachtwoord blijft ongewijzigd.`,
  });
  return done;
}

export async function resetPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isDbConfigured()) return { error: "De database is nog niet gekoppeld." };
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!token || token.length > 100) return { error: "Deze link is ongeldig of verlopen." };

  const db = getDb();
  const [row] = await db
    .select({ id: schema.passwordTokens.id, userId: schema.passwordTokens.userId, email: schema.users.email })
    .from(schema.passwordTokens)
    .innerJoin(schema.users, eq(schema.users.id, schema.passwordTokens.userId))
    .where(
      and(
        eq(schema.passwordTokens.tokenHash, sha256(token)),
        isNull(schema.passwordTokens.usedAt),
        gt(schema.passwordTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!row) return { error: "Deze link is ongeldig of verlopen. Vraag een nieuwe link aan." };

  const problem = passwordProblem(password, row.email);
  if (problem) return { error: problem };
  if (password !== confirm) return { error: "De wachtwoorden zijn niet gelijk." };

  await db
    .update(schema.users)
    .set({ passwordHash: await hashPassword(password), passwordChangedAt: new Date() })
    .where(eq(schema.users.id, row.userId));
  await db.update(schema.passwordTokens).set({ usedAt: new Date() }).where(eq(schema.passwordTokens.userId, row.userId));
  await destroyAllSessions(row.userId);
  redirect("/admin/login?gewijzigd=1");
}

export async function recoveryAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isDbConfigured()) return { error: "De database is nog niet gekoppeld.", values: keep(formData, "email") };
  const expected = setupTokenAvailable();
  if (!expected) return { error: "De noodprocedure is uitgeschakeld: ADMIN_SETUP_TOKEN is niet ingesteld.", values: keep(formData, "email") };

  const ipKey = `recovery-ip:${await clientIpKey()}`;
  if (await isRateLimited(ipKey, 5, 60 * MINUTE)) return { error: "Te veel pogingen. Probeer het over een uur opnieuw.", values: keep(formData, "email") };

  const parsedEmail = emailSchema.safeParse(formData.get("email"));
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!safeEqual(token, expected) || !parsedEmail.success) {
    await recordHit(ipKey);
    return { error: "De gegevens kloppen niet.", values: keep(formData, "email") };
  }

  const db = getDb();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, parsedEmail.data)).limit(1);
  if (!user) {
    await recordHit(ipKey);
    return { error: "De gegevens kloppen niet.", values: keep(formData, "email") };
  }
  const problem = passwordProblem(password, user.email);
  if (problem) return { error: problem, values: keep(formData, "email") };
  if (password !== confirm) return { error: "De wachtwoorden zijn niet gelijk.", values: keep(formData, "email") };

  await db
    .update(schema.users)
    .set({ passwordHash: await hashPassword(password), passwordChangedAt: new Date() })
    .where(eq(schema.users.id, user.id));
  await destroyAllSessions(user.id);
  redirect("/admin/login?gewijzigd=1");
}
