import "server-only";
import { and, asc, desc, eq, inArray, isNotNull, isNull, ne, or, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDb, isDbConfigured, schema } from "@/lib/db";
import type { DocumentRow } from "@/lib/db/schema";
import {
  collectionDefs,
  type CaseDoc,
  type CollectionType,
  type PageDoc,
  type ServiceDoc,
  type SingletonType,
  type TestimonialDoc,
} from "./documents";
import { normalizeCollection, normalizePage, normalizeSingleton, seedSingleton } from "./normalize";
import { SEED_IDS, seedCases, seedPages, seedServices, seedTestimonials } from "./seed";
import type { Bundle, BundlePage, DocStatus, DocSummary, DocType, MediaInfo } from "./types";

export const CMS_TAG = "cms";
const SINGLETONS: SingletonType[] = ["settings", "navigation", "footer", "forms", "theme"];

// ---------- Public data ----------

function seedBundle(): Bundle {
  const now = new Date(0).toISOString();
  return {
    mode: "live",
    source: "seed",
    pages: seedPages().map((p) => ({ ...normalizePage(p.doc), id: p.id, systemKey: p.systemKey, updatedAt: now })),
    services: seedServices().map((s) => ({ ...s.doc, id: s.id })),
    cases: seedCases().map((c) => ({ ...c.doc, id: c.id })),
    testimonials: seedTestimonials().map((t) => ({ ...t.doc, id: t.id })),
    settings: normalizeSingleton("settings", {}),
    navigation: normalizeSingleton("navigation", {}),
    footer: normalizeSingleton("footer", {}),
    forms: normalizeSingleton("forms", {}),
    theme: normalizeSingleton("theme", {}),
    media: {},
  };
}

async function loadMedia(): Promise<Record<string, MediaInfo>> {
  const rows = await getDb().select().from(schema.media);
  return Object.fromEntries(
    rows.map((m) => [
      m.id,
      { id: m.id, url: m.url, alt: m.alt, width: m.width, height: m.height, focalX: m.focalX, focalY: m.focalY },
    ]),
  );
}

function rowsToBundle(rows: DocumentRow[], mode: "live" | "preview", media: Record<string, MediaInfo>): Bundle {
  const pick = (r: DocumentRow) => (mode === "live" ? r.published : r.draft);
  const visible = (r: DocumentRow) => (mode === "live" ? r.status === "published" && r.published : true);
  const ofType = (type: string) =>
    rows
      .filter((r) => r.type === type && !r.deletedAt && visible(r))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.getTime() - b.createdAt.getTime());
  const singleton = <T,>(type: SingletonType): T => {
    const row = rows.find((r) => r.systemKey === type);
    return normalizeSingleton<T>(type, row ? (mode === "live" ? (row.published ?? row.draft) : row.draft) : {});
  };

  return {
    mode,
    source: "database",
    pages: ofType("page").map(
      (r): BundlePage => ({
        ...normalizePage(pick(r)),
        id: r.id,
        systemKey: r.systemKey,
        updatedAt: r.updatedAt.toISOString(),
      }),
    ),
    services: ofType("service").map((r) => ({ ...normalizeCollection<ServiceDoc>("service", pick(r)), id: r.id })),
    cases: ofType("case").map((r) => ({ ...normalizeCollection<CaseDoc>("case", pick(r)), id: r.id })),
    testimonials: ofType("testimonial").map((r) => ({
      ...normalizeCollection<TestimonialDoc>("testimonial", pick(r)),
      id: r.id,
    })),
    settings: singleton<Bundle["settings"]>("settings"),
    navigation: singleton<Bundle["navigation"]>("navigation"),
    footer: singleton<Bundle["footer"]>("footer"),
    forms: singleton<Bundle["forms"]>("forms"),
    theme: singleton<Bundle["theme"]>("theme"),
    media,
  };
}

async function loadLiveBundle(): Promise<Bundle> {
  if (!isDbConfigured()) return seedBundle();
  try {
    const db = getDb();
    const rows = await db.select().from(schema.documents).where(isNull(schema.documents.deletedAt));
    if (rows.length === 0) return seedBundle();
    return rowsToBundle(rows, "live", await loadMedia());
  } catch (error) {
    console.error("[cms] Falling back to built-in content, database unavailable:", error);
    return seedBundle();
  }
}

const cachedLiveBundle = unstable_cache(loadLiveBundle, ["cms-live-bundle"], { tags: [CMS_TAG] });

export async function getLiveBundle(): Promise<Bundle> {
  return cachedLiveBundle();
}

export async function getPreviewBundle(): Promise<Bundle> {
  const rows = await getDb().select().from(schema.documents).where(isNull(schema.documents.deletedAt));
  if (rows.length === 0) return { ...seedBundle(), mode: "preview" };
  return rowsToBundle(rows, "preview", await loadMedia());
}

export const getRedirect = unstable_cache(
  async (path: string) => {
    if (!isDbConfigured()) return null;
    try {
      const [row] = await getDb()
        .select()
        .from(schema.redirects)
        .where(eq(schema.redirects.fromPath, path))
        .limit(1);
      return row ? { to: row.toPath, permanent: row.permanent } : null;
    } catch {
      return null;
    }
  },
  ["cms-redirect"],
  { tags: [CMS_TAG] },
);

// ---------- Seeding ----------

export async function ensureSeeded(userId?: string) {
  const db = getDb();
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.documents);
  if (count > 0) return false;

  const now = new Date();
  const values: (typeof schema.documents.$inferInsert)[] = [];
  seedPages().forEach((p, i) =>
    values.push({
      id: p.id,
      type: "page",
      systemKey: p.systemKey,
      slug: p.doc.slug,
      status: "published",
      draft: p.doc,
      published: p.doc,
      sortOrder: i,
      publishedAt: now,
      updatedBy: userId,
    }),
  );
  seedServices().forEach((s, i) =>
    values.push({ id: s.id, type: "service", status: "published", draft: s.doc, published: s.doc, sortOrder: i, publishedAt: now, updatedBy: userId }),
  );
  for (const type of SINGLETONS) {
    const doc = seedSingleton(type);
    values.push({
      id: SEED_IDS[type],
      type,
      systemKey: type,
      status: "published",
      draft: doc,
      published: doc,
      publishedAt: now,
      updatedBy: userId,
    });
  }
  await db.insert(schema.documents).values(values).onConflictDoNothing();
  return true;
}

// ---------- Admin reads ----------

export function docTitle(type: DocType, data: unknown): string {
  const d = (data ?? {}) as Record<string, unknown>;
  if (type === "page") return String(d.title ?? "Zonder titel");
  if (type in collectionDefs) {
    const key = collectionDefs[type as CollectionType].titleKey;
    return String(d[key] || "Zonder titel");
  }
  return type;
}

function toSummary(r: DocumentRow): DocSummary {
  const draftSlug = (r.draft as { slug?: string })?.slug;
  return {
    id: r.id,
    type: r.type as DocType,
    title: docTitle(r.type as DocType, r.draft),
    slug: draftSlug ?? r.slug,
    status: r.status as DocStatus,
    hasChanges: !r.published || JSON.stringify(r.draft) !== JSON.stringify(r.published),
    systemKey: r.systemKey,
    sortOrder: r.sortOrder,
    updatedAt: r.updatedAt.toISOString(),
    publishedAt: r.publishedAt?.toISOString() ?? null,
    deletedAt: r.deletedAt?.toISOString() ?? null,
  };
}

export async function listDocs(type: DocType, opts: { deleted?: boolean } = {}): Promise<DocSummary[]> {
  const rows = await getDb()
    .select()
    .from(schema.documents)
    .where(
      and(
        eq(schema.documents.type, type),
        opts.deleted ? isNotNull(schema.documents.deletedAt) : isNull(schema.documents.deletedAt),
      ),
    )
    .orderBy(asc(schema.documents.sortOrder), asc(schema.documents.createdAt));
  return rows.map(toSummary);
}

export async function listTrash(): Promise<DocSummary[]> {
  const rows = await getDb()
    .select()
    .from(schema.documents)
    .where(isNotNull(schema.documents.deletedAt))
    .orderBy(desc(schema.documents.deletedAt));
  return rows.map(toSummary);
}

export async function recentDocs(limit = 8): Promise<DocSummary[]> {
  const rows = await getDb()
    .select()
    .from(schema.documents)
    .where(isNull(schema.documents.deletedAt))
    .orderBy(desc(schema.documents.updatedAt))
    .limit(limit);
  return rows.map(toSummary);
}

export async function getDocRow(id: string) {
  const [row] = await getDb().select().from(schema.documents).where(eq(schema.documents.id, id)).limit(1);
  return row ?? null;
}

export async function getSingletonRow(type: SingletonType) {
  const db = getDb();
  const [row] = await db.select().from(schema.documents).where(eq(schema.documents.systemKey, type)).limit(1);
  if (row) return row;
  const doc = seedSingleton(type);
  const [created] = await db
    .insert(schema.documents)
    .values({ type, systemKey: type, status: "published", draft: doc, published: doc, publishedAt: new Date() })
    .onConflictDoNothing()
    .returning();
  return created ?? (await db.select().from(schema.documents).where(eq(schema.documents.systemKey, type)))[0];
}

export async function allPageOptions(): Promise<{ id: string; title: string; slug: string; status: DocStatus }[]> {
  const rows = await getDb()
    .select()
    .from(schema.documents)
    .where(and(eq(schema.documents.type, "page"), isNull(schema.documents.deletedAt)))
    .orderBy(asc(schema.documents.sortOrder));
  return rows.map((r) => ({
    id: r.id,
    title: docTitle("page", r.draft),
    slug: String((r.draft as PageDoc).slug ?? ""),
    status: r.status as DocStatus,
  }));
}

// ---------- Admin writes ----------

export class CmsError extends Error {}

async function assertSlugFree(type: "page" | "case", id: string | null, slug: string) {
  const db = getDb();
  const clash = await db
    .select({ id: schema.documents.id })
    .from(schema.documents)
    .where(
      and(
        eq(schema.documents.type, type),
        isNull(schema.documents.deletedAt),
        id ? ne(schema.documents.id, id) : sql`true`,
        or(eq(schema.documents.slug, slug), sql`${schema.documents.draft}->>'slug' = ${slug}`),
      ),
    )
    .limit(1);
  if (clash.length) {
    throw new CmsError(
      type === "page" ? `De URL /${slug} is al in gebruik door een andere pagina.` : `De URL-naam ‘${slug}’ is al in gebruik door een andere case.`,
    );
  }
}

export async function createDoc(type: DocType, draft: unknown, userId: string) {
  const db = getDb();
  if (type === "page") await assertSlugFree("page", null, (draft as PageDoc).slug);
  if (type === "case") await assertSlugFree("case", null, (draft as CaseDoc).slug);
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${schema.documents.sortOrder}), -1)::int` })
    .from(schema.documents)
    .where(eq(schema.documents.type, type));
  const [row] = await db
    .insert(schema.documents)
    .values({ type, status: "draft", draft, sortOrder: max + 1, updatedBy: userId })
    .returning();
  return row;
}

export async function saveDraft(id: string, draft: unknown, userId: string) {
  const row = await getDocRow(id);
  if (!row) throw new CmsError("Dit item bestaat niet meer.");
  if (row.type === "page") {
    const slug = (draft as PageDoc).slug;
    if (row.systemKey === "home" && slug !== "") throw new CmsError("De URL van de homepage kan niet worden gewijzigd.");
    await assertSlugFree("page", id, slug);
  }
  if (row.type === "case") await assertSlugFree("case", id, (draft as CaseDoc).slug);
  const now = new Date();
  await getDb()
    .update(schema.documents)
    .set({ draft, draftUpdatedAt: now, updatedAt: now, updatedBy: userId })
    .where(eq(schema.documents.id, id));
}

async function addRevision(documentId: string, data: unknown, note: string, userId: string) {
  const db = getDb();
  await db.insert(schema.revisions).values({ documentId, data, note, createdBy: userId });
  // Keep the 20 most recent versions per item.
  await db.execute(sql`
    delete from revisions where document_id = ${documentId} and id not in (
      select id from revisions where document_id = ${documentId} order by created_at desc limit 20
    )`);
}

async function upsertSlugRedirect(oldSlug: string, newSlug: string) {
  const db = getDb();
  const from = `/${oldSlug}`;
  const to = `/${newSlug}`;
  await db.delete(schema.redirects).where(eq(schema.redirects.fromPath, to));
  await db.update(schema.redirects).set({ toPath: to }).where(eq(schema.redirects.toPath, from));
  await db
    .insert(schema.redirects)
    .values({ fromPath: from, toPath: to, permanent: true, automatic: true })
    .onConflictDoUpdate({ target: schema.redirects.fromPath, set: { toPath: to, permanent: true, automatic: true } });
}

export async function publishDoc(id: string, userId: string) {
  const row = await getDocRow(id);
  if (!row || row.deletedAt) throw new CmsError("Dit item bestaat niet meer.");
  const db = getDb();
  let slug = row.slug;

  if (row.type === "page" || row.type === "case") {
    const nextSlug = String((row.draft as { slug?: string }).slug ?? "");
    await assertSlugFree(row.type, id, nextSlug);
    if (row.slug !== null && row.slug !== nextSlug && row.status !== "draft") {
      const prefix = row.type === "case" ? "cases/" : "";
      await upsertSlugRedirect(prefix + row.slug, prefix + nextSlug);
    }
    slug = nextSlug;
  }

  const now = new Date();
  await db
    .update(schema.documents)
    .set({ published: row.draft, status: "published", slug, publishedAt: now, updatedAt: now, updatedBy: userId })
    .where(eq(schema.documents.id, id));
  await addRevision(id, row.draft, "Gepubliceerd", userId);
}

export async function unpublishDoc(id: string, userId: string) {
  const row = await getDocRow(id);
  if (!row) throw new CmsError("Dit item bestaat niet meer.");
  if (row.systemKey === "home") throw new CmsError("De homepage kan niet offline worden gehaald.");
  if (row.systemKey && row.type !== "page") throw new CmsError("Dit onderdeel kan niet offline worden gehaald.");
  await getDb()
    .update(schema.documents)
    .set({ status: row.published ? "offline" : "draft", updatedAt: new Date(), updatedBy: userId })
    .where(eq(schema.documents.id, id));
}

export async function discardDraft(id: string, userId: string) {
  const row = await getDocRow(id);
  if (!row?.published) throw new CmsError("Er is nog geen gepubliceerde versie om naar terug te gaan.");
  await getDb()
    .update(schema.documents)
    .set({ draft: row.published, draftUpdatedAt: new Date(), updatedAt: new Date(), updatedBy: userId })
    .where(eq(schema.documents.id, id));
}

export async function softDeleteDoc(id: string, userId: string) {
  const row = await getDocRow(id);
  if (!row) throw new CmsError("Dit item bestaat niet meer.");
  if (row.systemKey) throw new CmsError("Dit onderdeel kan niet worden verwijderd.");
  await getDb()
    .update(schema.documents)
    .set({ deletedAt: new Date(), updatedAt: new Date(), updatedBy: userId })
    .where(eq(schema.documents.id, id));
}

export async function restoreDoc(id: string, userId: string) {
  const row = await getDocRow(id);
  if (!row) throw new CmsError("Dit item bestaat niet meer.");
  const slug = (row.draft as { slug?: string }).slug;
  if ((row.type === "page" || row.type === "case") && slug !== undefined) {
    await assertSlugFree(row.type, id, slug).catch(() => {
      throw new CmsError("Herstellen lukt niet: de URL is inmiddels door een ander item in gebruik. Wijzig eerst die URL.");
    });
  }
  await getDb()
    .update(schema.documents)
    .set({ deletedAt: null, updatedAt: new Date(), updatedBy: userId })
    .where(eq(schema.documents.id, id));
}

export async function purgeDoc(id: string) {
  const row = await getDocRow(id);
  if (!row?.deletedAt) throw new CmsError("Alleen items in de prullenbak kunnen definitief worden verwijderd.");
  await getDb().delete(schema.documents).where(eq(schema.documents.id, id));
}

async function uniqueSlug(type: "page" | "case", base: string) {
  const db = getDb();
  for (let i = 1; i < 50; i++) {
    const candidate = i === 1 ? `${base}-kopie` : `${base}-kopie-${i}`;
    const clash = await db
      .select({ id: schema.documents.id })
      .from(schema.documents)
      .where(
        and(
          eq(schema.documents.type, type),
          isNull(schema.documents.deletedAt),
          or(eq(schema.documents.slug, candidate), sql`${schema.documents.draft}->>'slug' = ${candidate}`),
        ),
      )
      .limit(1);
    if (!clash.length) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function duplicateDoc(id: string, userId: string) {
  const row = await getDocRow(id);
  if (!row) throw new CmsError("Dit item bestaat niet meer.");
  if (row.systemKey && row.type !== "page") throw new CmsError("Dit onderdeel kan niet worden gedupliceerd.");
  const draft = structuredClone(row.draft) as Record<string, unknown>;
  const type = row.type as DocType;
  if (type === "page" || type === "case") {
    draft.slug = await uniqueSlug(type, String(draft.slug || (type === "page" ? "pagina" : "case")));
  }
  if (type === "page") {
    draft.title = `${draft.title} (kopie)`;
    draft.sections = ((draft.sections as { id: string }[]) ?? []).map((s) => ({ ...s, id: crypto.randomUUID() }));
  } else {
    const key = collectionDefs[type as CollectionType].titleKey;
    draft[key] = `${draft[key]} (kopie)`;
  }
  return createDoc(type, draft, userId);
}

export async function reorderDocs(type: DocType, ids: string[]) {
  const db = getDb();
  await db.transaction(async (tx) => {
    for (const [i, id] of ids.entries()) {
      await tx
        .update(schema.documents)
        .set({ sortOrder: i })
        .where(and(eq(schema.documents.id, id), eq(schema.documents.type, type)));
    }
  });
}

export async function listRevisions(documentId: string) {
  return getDb()
    .select({ id: schema.revisions.id, note: schema.revisions.note, createdAt: schema.revisions.createdAt, createdBy: schema.users.name })
    .from(schema.revisions)
    .leftJoin(schema.users, eq(schema.users.id, schema.revisions.createdBy))
    .where(eq(schema.revisions.documentId, documentId))
    .orderBy(desc(schema.revisions.createdAt))
    .limit(20);
}

export async function restoreRevision(documentId: string, revisionId: string, userId: string) {
  const [rev] = await getDb()
    .select()
    .from(schema.revisions)
    .where(and(eq(schema.revisions.id, revisionId), eq(schema.revisions.documentId, documentId)))
    .limit(1);
  if (!rev) throw new CmsError("Deze versie bestaat niet meer.");
  await saveDraft(documentId, rev.data, userId);
}

/** Pages, menus and buttons that point to a given page, so deleting it can be confirmed knowingly. */
export async function findPageReferences(pageId: string) {
  const rows = await getDb()
    .select()
    .from(schema.documents)
    .where(and(isNull(schema.documents.deletedAt), ne(schema.documents.id, pageId)));
  const needle = `"pageId":"${pageId}"`;
  return rows
    .filter((r) => JSON.stringify(r.draft).includes(needle) || JSON.stringify(r.published ?? {}).includes(needle))
    .map((r) => ({ id: r.id, type: r.type as DocType, title: r.systemKey && r.type !== "page" ? r.type : docTitle(r.type as DocType, r.draft) }));
}

export async function searchDocs(query: string) {
  const q = `%${query.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
  const rows = await getDb()
    .select()
    .from(schema.documents)
    .where(and(isNull(schema.documents.deletedAt), sql`${schema.documents.draft}::text ilike ${q}`))
    .orderBy(desc(schema.documents.updatedAt))
    .limit(30);
  return rows.map(toSummary);
}

export async function countByStatus() {
  const rows = await getDb()
    .select({ type: schema.documents.type, status: schema.documents.status, count: sql<number>`count(*)::int` })
    .from(schema.documents)
    .where(isNull(schema.documents.deletedAt))
    .groupBy(schema.documents.type, schema.documents.status);
  return rows;
}

export async function docsByIds(ids: string[]) {
  if (!ids.length) return [];
  return getDb().select().from(schema.documents).where(inArray(schema.documents.id, ids));
}
