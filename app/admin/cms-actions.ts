"use server";

import { eq, lt } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { hashPassword, passwordProblem, randomToken, sha256, verifyPassword } from "@/lib/auth/crypto";
import { assertAdmin, destroyAllSessions, UnauthorizedError } from "@/lib/auth/session";
import { blockDefaults, type BlockType, type Section } from "@/lib/cms/blocks";
import type { CollectionType, PageDoc, SingletonType } from "@/lib/cms/documents";
import { collectionDefaults, emptySeo } from "@/lib/cms/documents";
import { CmsError, createDoc, discardDraft, duplicateDoc, getDocRow, getSingletonRow, publishDoc, purgeDoc, reorderDocs, restoreDoc, restoreRevision, saveDraft, softDeleteDoc, unpublishDoc, findPageReferences, listRevisions } from "@/lib/cms/repo";
import { deleteMedia, listMedia, MediaError, mediaUsage, updateMediaMeta } from "@/lib/cms/media";
import { revalidatePublicSite } from "@/lib/cms/revalidate";
import { collectionSchema, formatIssues, pageDocSchema, singletonSchema, slugSchema } from "@/lib/cms/validate";
import type { ActionResult, DocType } from "@/lib/cms/types";
import { pageTemplates } from "@/lib/cms/templates";
import { isEmailConfigured, sendEmail, siteBaseUrl } from "@/lib/email";

const id = z.string().uuid();

async function guard<T>(fn: (userId: string) => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    const user = await assertAdmin();
    return await fn(user.id);
  } catch (error) {
    if (error instanceof UnauthorizedError) return { ok: false, error: "Je sessie is verlopen. Log opnieuw in." };
    if (error instanceof CmsError || error instanceof MediaError) return { ok: false, error: error.message };
    console.error("[admin] Action failed:", error);
    return { ok: false, error: "Er ging iets mis. Probeer het opnieuw." };
  }
}

// ---------- Pages ----------

export async function createPageAction(input: { title: string; slug: string; template: string }) {
  return guard<{ id: string }>(async (userId) => {
    const title = z.string().trim().min(1, "Geef de pagina een titel").max(120).safeParse(input.title);
    if (!title.success) return { ok: false, error: title.error.issues[0].message };
    const slug = slugSchema.safeParse(input.slug);
    if (!slug.success) return { ok: false, error: slug.error.issues[0].message };
    if (!slug.data) return { ok: false, error: "Vul een URL in voor de nieuwe pagina." };

    let sections: Section[];
    if (input.template.startsWith("copy:")) {
      const source = await getDocRow(input.template.slice(5));
      if (!source || source.type !== "page") return { ok: false, error: "De gekozen voorbeeldpagina bestaat niet meer." };
      sections = ((source.draft as PageDoc).sections ?? []).map((s) => ({ ...s, id: crypto.randomUUID() }));
    } else {
      const template = pageTemplates.find((t) => t.key === input.template) ?? pageTemplates[0];
      sections = template.sections.map((type: BlockType) => ({ id: crypto.randomUUID(), type, hidden: false, data: blockDefaults(type) }));
    }
    const draft: PageDoc = { title: title.data, slug: slug.data, seo: emptySeo(), sections };
    const row = await createDoc("page", draft, userId);
    return { ok: true, data: { id: row.id } };
  });
}

export async function savePageAction(pageId: string, draft: unknown) {
  return guard(async (userId) => {
    if (!id.safeParse(pageId).success) return { ok: false, error: "Ongeldige pagina." };
    const parsed = pageDocSchema.safeParse(draft);
    if (!parsed.success) return { ok: false, error: formatIssues(parsed.error) };
    await saveDraft(pageId, parsed.data, userId);
    return { ok: true, message: "Concept opgeslagen." };
  });
}

// ---------- Collections ----------

export async function createItemAction(type: CollectionType) {
  return guard<{ id: string }>(async (userId) => {
    if (!["service", "case", "testimonial"].includes(type)) return { ok: false, error: "Onbekend type." };
    const draft = collectionDefaults(type);
    if (type === "case") draft.slug = `case-${Date.now().toString(36)}`;
    if (type === "service") draft.title = "Nieuwe dienst";
    if (type === "case") draft.title = "Nieuwe case";
    if (type === "testimonial") draft.name = "Nieuwe testimonial";
    const row = await createDoc(type, draft, userId);
    return { ok: true, data: { id: row.id } };
  });
}

export async function saveItemAction(itemId: string, draft: unknown) {
  return guard(async (userId) => {
    if (!id.safeParse(itemId).success) return { ok: false, error: "Ongeldig item." };
    const row = await getDocRow(itemId);
    if (!row || !["service", "case", "testimonial"].includes(row.type)) return { ok: false, error: "Dit item bestaat niet meer." };
    const parsed = collectionSchema(row.type as CollectionType).safeParse(draft);
    if (!parsed.success) return { ok: false, error: formatIssues(parsed.error) };
    await saveDraft(itemId, parsed.data, userId);
    return { ok: true, message: "Concept opgeslagen." };
  });
}

// ---------- Singletons (navigation, footer, theme, settings, forms) ----------

export async function saveSingletonAction(type: SingletonType, draft: unknown) {
  return guard(async (userId) => {
    if (!["settings", "navigation", "footer", "forms", "theme"].includes(type)) return { ok: false, error: "Onbekend onderdeel." };
    const parsed = singletonSchema(type).safeParse(draft);
    if (!parsed.success) return { ok: false, error: formatIssues(parsed.error) };
    const row = await getSingletonRow(type);
    await saveDraft(row.id, parsed.data, userId);
    return { ok: true, message: "Concept opgeslagen." };
  });
}

// ---------- Lifecycle ----------

export async function publishAction(docId: string) {
  return guard(async (userId) => {
    if (!id.safeParse(docId).success) return { ok: false, error: "Ongeldig item." };
    await publishDoc(docId, userId);
    revalidatePublicSite();
    return { ok: true, message: "Gepubliceerd. De wijzigingen staan nu live." };
  });
}

export async function unpublishAction(docId: string) {
  return guard(async (userId) => {
    if (!id.safeParse(docId).success) return { ok: false, error: "Ongeldig item." };
    await unpublishDoc(docId, userId);
    revalidatePublicSite();
    return { ok: true, message: "Offline gehaald. Bezoekers zien dit niet meer." };
  });
}

export async function discardDraftAction(docId: string) {
  return guard(async (userId) => {
    await discardDraft(docId, userId);
    return { ok: true, message: "Wijzigingen verworpen. Het concept is gelijk aan de live versie." };
  });
}

export async function deleteAction(docId: string) {
  return guard(async (userId) => {
    await softDeleteDoc(docId, userId);
    revalidatePublicSite();
    return { ok: true, message: "Verplaatst naar de prullenbak. Je kunt dit daar terugzetten." };
  });
}

export async function restoreAction(docId: string) {
  return guard(async (userId) => {
    await restoreDoc(docId, userId);
    revalidatePublicSite();
    return { ok: true, message: "Teruggezet." };
  });
}

export async function purgeAction(docId: string) {
  return guard(async () => {
    await purgeDoc(docId);
    return { ok: true, message: "Definitief verwijderd." };
  });
}

export async function duplicateAction(docId: string) {
  return guard<{ id: string }>(async (userId) => {
    const row = await duplicateDoc(docId, userId);
    return { ok: true, data: { id: row.id }, message: "Kopie gemaakt als concept." };
  });
}

export async function reorderAction(type: DocType, ids: string[]) {
  return guard(async () => {
    const parsed = z.array(id).max(200).safeParse(ids);
    if (!parsed.success) return { ok: false, error: "Ongeldige volgorde." };
    await reorderDocs(type, parsed.data);
    revalidatePublicSite();
    return { ok: true, message: "Volgorde opgeslagen." };
  });
}

export async function revisionsAction(docId: string) {
  return guard<{ id: string; note: string; createdAt: string; createdBy: string | null }[]>(async () => {
    const rows = await listRevisions(docId);
    return { ok: true, data: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })) };
  });
}

export async function restoreRevisionAction(docId: string, revisionId: string) {
  return guard(async (userId) => {
    await restoreRevision(docId, revisionId, userId);
    return { ok: true, message: "Eerdere versie teruggezet als concept. Controleer en publiceer om hem live te zetten." };
  });
}

export async function pageReferencesAction(pageId: string) {
  return guard<{ id: string; type: DocType; title: string }[]>(async () => ({ ok: true, data: await findPageReferences(pageId) }));
}

// ---------- Media ----------

export async function listMediaAction(query?: string) {
  return guard<{ id: string; url: string; alt: string; width: number; height: number; filename: string; focalX: number; focalY: number }[]>(async () => {
    const rows = await listMedia(query?.slice(0, 100));
    return {
      ok: true,
      data: rows.map((m) => ({ id: m.id, url: m.url, alt: m.alt, width: m.width, height: m.height, filename: m.filename, focalX: m.focalX, focalY: m.focalY })),
    };
  });
}

export async function updateMediaAction(mediaId: string, input: { alt: string; focalX: number; focalY: number }) {
  return guard(async () => {
    const parsed = z
      .object({ alt: z.string().trim().max(300), focalX: z.number().int().min(0).max(100), focalY: z.number().int().min(0).max(100) })
      .safeParse(input);
    if (!parsed.success || !id.safeParse(mediaId).success) return { ok: false, error: "Ongeldige invoer." };
    await updateMediaMeta(mediaId, parsed.data);
    revalidatePublicSite();
    return { ok: true, message: "Opgeslagen." };
  });
}

export async function mediaUsageAction(mediaId: string) {
  return guard<{ id: string; type: DocType; title: string; inTrash: boolean }[]>(async () => ({ ok: true, data: await mediaUsage(mediaId) }));
}

export async function deleteMediaAction(mediaId: string) {
  return guard(async () => {
    if (!id.safeParse(mediaId).success) return { ok: false, error: "Ongeldig bestand." };
    await deleteMedia(mediaId);
    revalidatePublicSite();
    return { ok: true, message: "Verwijderd." };
  });
}

// ---------- Redirects ----------

const pathSchema = z
  .string()
  .trim()
  .max(300)
  .regex(/^\/[a-z0-9\-/._~%]*$/i, "Begin met / en gebruik geen spaties")
  .refine((p) => !/^\/(admin|api|preview|_next)(\/|$)/.test(p), "Dit pad is gereserveerd");

export async function saveRedirectAction(input: { from: string; to: string; permanent: boolean }) {
  return guard(async () => {
    const from = pathSchema.safeParse(input.from.toLowerCase().replace(/\/$/, "") || "/");
    if (!from.success) return { ok: false, error: `Van: ${from.error.issues[0].message}` };
    const to = z
      .string()
      .trim()
      .max(500)
      .refine((v) => /^\/(?!\/)/.test(v) || /^https:\/\//.test(v), "Naar: gebruik een pad dat met / begint of een https://-link")
      .safeParse(input.to);
    if (!to.success) return { ok: false, error: to.error.issues[0].message };
    if (from.data === to.data) return { ok: false, error: "Van en naar mogen niet hetzelfde zijn." };
    await getDb()
      .insert(schema.redirects)
      .values({ fromPath: from.data, toPath: to.data, permanent: input.permanent, automatic: false })
      .onConflictDoUpdate({ target: schema.redirects.fromPath, set: { toPath: to.data, permanent: input.permanent, automatic: false } });
    revalidatePublicSite();
    return { ok: true, message: "Redirect opgeslagen." };
  });
}

export async function deleteRedirectAction(redirectId: string) {
  return guard(async () => {
    await getDb().delete(schema.redirects).where(eq(schema.redirects.id, redirectId));
    revalidatePublicSite();
    return { ok: true, message: "Redirect verwijderd." };
  });
}

// ---------- Submissions ----------

export async function markSubmissionAction(submissionId: string, read: boolean) {
  return guard(async () => {
    await getDb().update(schema.submissions).set({ readAt: read ? new Date() : null }).where(eq(schema.submissions.id, submissionId));
    return { ok: true };
  });
}

export async function deleteSubmissionAction(submissionId: string) {
  return guard(async () => {
    await getDb().delete(schema.submissions).where(eq(schema.submissions.id, submissionId));
    return { ok: true, message: "Aanvraag verwijderd." };
  });
}

export async function pruneSubmissionsAction(days: number) {
  return guard(async () => {
    const cutoff = new Date(Date.now() - Math.max(30, Math.min(730, days)) * 24 * 60 * 60 * 1000);
    await getDb().delete(schema.submissions).where(lt(schema.submissions.createdAt, cutoff));
    return { ok: true };
  });
}

// ---------- Account & users ----------

export async function changePasswordAction(input: { current: string; next: string; confirm: string }) {
  return guard(async (userId) => {
    const db = getDb();
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    if (!user || !(await verifyPassword(input.current.slice(0, 200), user.passwordHash))) {
      return { ok: false, error: "Je huidige wachtwoord klopt niet." };
    }
    const problem = passwordProblem(input.next, user.email);
    if (problem) return { ok: false, error: problem };
    if (input.next !== input.confirm) return { ok: false, error: "De nieuwe wachtwoorden zijn niet gelijk." };
    await db.update(schema.users).set({ passwordHash: await hashPassword(input.next), passwordChangedAt: new Date() }).where(eq(schema.users.id, userId));
    return { ok: true, message: "Wachtwoord gewijzigd." };
  });
}

export async function logoutEverywhereAction() {
  return guard(async (userId) => {
    await destroyAllSessions(userId);
    return { ok: true, message: "Je bent op alle apparaten uitgelogd." };
  });
}

export async function inviteUserAction(input: { name: string; email: string }) {
  return guard<{ link: string; emailed: boolean }>(async () => {
    const parsed = z.object({ name: z.string().trim().min(2, "Vul een naam in").max(80), email: z.string().trim().toLowerCase().email("Ongeldig e-mailadres") }).safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    const db = getDb();
    const existing = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, parsed.data.email)).limit(1);
    if (existing.length) return { ok: false, error: "Er bestaat al een beheerder met dit e-mailadres." };
    const [user] = await db.insert(schema.users).values({ name: parsed.data.name, email: parsed.data.email }).returning();
    const token = randomToken();
    await db.insert(schema.passwordTokens).values({ userId: user.id, tokenHash: sha256(token), purpose: "invite", expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000) });
    const link = `${siteBaseUrl()}/admin/wachtwoord-herstellen/${token}`;
    let emailed = false;
    if (isEmailConfigured()) {
      const res = await sendEmail({
        to: user.email,
        subject: "Je bent uitgenodigd voor het beheer van de True Culture-website",
        text: `Hallo ${user.name},\n\nJe hebt toegang gekregen tot het beheer van de website. Stel via deze link binnen 72 uur je wachtwoord in:\n\n${link}\n`,
      });
      emailed = res.ok;
    }
    return { ok: true, data: { link, emailed }, message: "Beheerder toegevoegd." };
  });
}

export async function removeUserAction(targetId: string) {
  return guard(async (userId) => {
    if (targetId === userId) return { ok: false, error: "Je kunt je eigen account niet verwijderen." };
    const db = getDb();
    const users = await db.select({ id: schema.users.id }).from(schema.users);
    if (users.length <= 1) return { ok: false, error: "Er moet minimaal één beheerder overblijven." };
    await db.delete(schema.users).where(eq(schema.users.id, targetId));
    return { ok: true, message: "Beheerder verwijderd." };
  });
}
