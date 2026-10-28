import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!url) {
  console.log("[migrate] DATABASE_URL is not set, skipping database migrations.");
  process.exit(0);
}

const CONTENT_DIR = "./drizzle/content";

// Content migrations rewrite the built-in pages once per database (for example when the site gets a new
// positioning). Preview deployments may share the production database, so only production builds and
// local runs apply them.
const applyContent = !process.env.VERCEL || process.env.VERCEL_ENV === "production";

const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
// Drizzle changes how its client serialises dates and JSON, so the content step gets a connection of its own.
const contentClient = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
try {
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  console.log("[migrate] Database is up to date.");
  if (applyContent) await applyContentMigrations(contentClient);
  else console.log("[migrate] Content migrations only run for production builds.");
} catch (error) {
  console.error("[migrate] Migration failed:", error);
  process.exitCode = 1;
} finally {
  await Promise.all([client.end(), contentClient.end()]);
}

async function applyContentMigrations(sql) {
  const ids = (await readdir(CONTENT_DIR).catch(() => []))
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
  for (const id of ids) {
    const file = `${id}.json`;
    const [done] = await sql`select 1 from content_migrations where id = ${id}`;
    if (done) continue;
    const migration = JSON.parse(await readFile(path.join(CONTENT_DIR, file), "utf8"));
    let applied = false;
    await sql.begin(async (tx) => {
      // Two builds running at once must not both apply the same migration.
      await tx`lock table content_migrations in exclusive mode`;
      const [again] = await tx`select 1 from content_migrations where id = ${id}`;
      if (again) return;
      const [{ count }] = await tx`select count(*)::int as count from documents`;
      // An empty database receives the current built-in content when the first admin is created.
      if (count > 0) {
        await applyContentMigration(tx, migration);
        applied = true;
      }
      await tx`insert into content_migrations (id) values (${id})`;
    });
    console.log(`[migrate] Content migration ${id} ${applied ? "applied" : "recorded (empty database)"}.`);
  }
}

async function applyContentMigration(tx, migration) {
  const now = new Date();
  const note = migration.backupNote;
  for (const [i, page] of (migration.pages ?? []).entries()) {
    await replaceDocument(tx, { ...page, type: "page", sortOrder: i }, note, now);
  }
  for (const [i, service] of (migration.services ?? []).entries()) {
    await replaceDocument(tx, { ...service, type: "service", systemKey: null, sortOrder: i }, note, now);
  }
  for (const [key, change] of Object.entries(migration.singletons ?? {})) {
    await patchSingleton(tx, key, change, note, now);
  }
  // Additions that leave everything the editor changed alone: new fields on an item, new sections on a page.
  for (const patch of migration.documentPatches ?? []) {
    await updateDocument(tx, patch.id, (doc) => (matches(doc, patch.onlyIf) ? fillMissing(doc, patch.setIfMissing) : doc), note, now);
  }
  for (const insert of migration.sectionInserts ?? []) {
    await updateDocument(tx, insert.pageId, (doc) => insertSection(doc, insert), note, now);
  }
  for (const patch of migration.sectionPatches ?? []) {
    await updateDocument(
      tx,
      patch.pageId,
      (doc) => ({
        ...doc,
        sections: (doc.sections ?? []).map((s) => (s.id === patch.sectionId ? { ...s, data: fillMissing(s.data ?? {}, patch.setIfMissing) } : s)),
      }),
      note,
      now,
    );
  }
}

// Helpers are function declarations: the migration above runs before later `const` bindings exist.

/** Reads "a.b" style paths, so a change can target one value inside a group. */
function getPath(obj, key) {
  return key.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function setPath(obj, key, value) {
  const parts = key.split(".");
  let target = obj;
  for (const part of parts.slice(0, -1)) {
    target[part] = target[part] && typeof target[part] === "object" ? { ...target[part] } : {};
    target = target[part];
  }
  target[parts[parts.length - 1]] = value;
}

function matches(doc, onlyIf) {
  return Object.entries(onlyIf ?? {}).every(([k, v]) => JSON.stringify(getPath(doc, k)) === JSON.stringify(v));
}

function fillMissing(doc, values) {
  const next = { ...doc };
  for (const [k, v] of Object.entries(values ?? {})) {
    const current = getPath(next, k);
    if (current === undefined || current === null || current === "") setPath(next, k, v);
  }
  return next;
}

/** Adds a section after another one, unless it is already there or the editor removed the section it follows. */
function insertSection(doc, { after, section }) {
  const sections = doc.sections ?? [];
  if (sections.some((s) => s.id === section.id)) return doc;
  const at = sections.findIndex((s) => s.id === after);
  if (at < 0) return doc;
  return { ...doc, sections: [...sections.slice(0, at + 1), section, ...sections.slice(at + 1)] };
}

/** Applies a change to both the draft and the published version of an item, after keeping a backup. */
async function updateDocument(tx, id, change, note, now) {
  const [row] = await tx`select * from documents where id = ${id} and deleted_at is null`;
  if (!row) return;
  const draft = change(row.draft);
  const published = row.published ? change(row.published) : null;
  if (JSON.stringify(draft) === JSON.stringify(row.draft) && JSON.stringify(published) === JSON.stringify(row.published)) return;
  await backup(tx, row, note);
  await tx`
    update documents set
      draft = ${tx.json(draft)}, published = ${published ? tx.json(published) : null},
      draft_updated_at = ${now}, updated_at = ${now}
    where id = ${id}`;
}

/** Keeps the previous version in the item's history, so it can be restored from the dashboard (Versies). */
async function backup(tx, row, note) {
  const current = row.published ?? row.draft;
  await tx`insert into revisions (document_id, data, note) values (${row.id}, ${tx.json(current)}, ${note})`;
  if (row.published && JSON.stringify(row.draft) !== JSON.stringify(row.published)) {
    await tx`insert into revisions (document_id, data, note) values (${row.id}, ${tx.json(row.draft)}, ${`${note} (concept)`})`;
  }
  await tx`
    delete from revisions where document_id = ${row.id} and id not in (
      select id from revisions where document_id = ${row.id} order by created_at desc limit 20
    )`;
}

async function replaceDocument(tx, item, note, now) {
  let doc = item.doc;
  const [row] = await tx`select * from documents where id = ${item.id}`;
  if (!row) {
    const slug = item.type === "page" ? doc.slug : null;
    await tx`
      insert into documents (id, type, system_key, slug, status, draft, published, sort_order, published_at, draft_updated_at, updated_at)
      values (${item.id}, ${item.type}, ${item.systemKey ?? null}, ${slug}, 'published', ${tx.json(doc)}, ${tx.json(doc)}, ${item.sortOrder}, ${now}, ${now}, ${now})`;
    return;
  }

  await backup(tx, row, note);
  let slug = row.slug;
  if (item.type === "page") {
    const wanted = doc.slug;
    const [taken] = await tx`
      select 1 from documents
      where type = 'page' and slug = ${wanted} and id <> ${item.id} and deleted_at is null
      limit 1`;
    if (taken) {
      // A page the editor made already uses this URL: keep the current one instead of clashing.
      doc = { ...doc, slug: row.slug ?? "" };
    } else if (row.slug !== null && row.slug !== wanted && row.status !== "draft") {
      await moveRedirect(tx, row.slug, wanted);
    }
    slug = doc.slug;
  }
  const status = row.status === "offline" ? "offline" : "published";
  const sortOrder = item.type === "service" ? item.sortOrder : row.sort_order;
  await tx`
    update documents set
      draft = ${tx.json(doc)}, published = ${tx.json(doc)}, slug = ${slug}, status = ${status}, sort_order = ${sortOrder},
      published_at = ${now}, draft_updated_at = ${now}, updated_at = ${now}
    where id = ${item.id}`;
}

async function patchSingleton(tx, key, change, note, now) {
  const [row] = await tx`select * from documents where system_key = ${key} and type = ${key}`;
  // Without a stored row the site already uses the current built-in defaults.
  if (!row) return;
  const current = row.published ?? row.draft;
  // `onlyIf` limits a change to values the editor never touched (still the old built-in default).
  if (!matches(current, change.onlyIf)) return;
  await backup(tx, row, note);
  let next = change.replace;
  if (!next) {
    next = { ...current };
    for (const [k, v] of Object.entries(change.set ?? {})) setPath(next, k, v);
  }
  await tx`
    update documents set
      draft = ${tx.json(next)}, published = ${tx.json(next)}, status = 'published',
      published_at = ${now}, draft_updated_at = ${now}, updated_at = ${now}
    where id = ${row.id}`;
}

/** Same rules as a slug change in the dashboard: the old address forwards to the new one, without loops. */
async function moveRedirect(tx, oldSlug, newSlug) {
  const from = `/${oldSlug}`;
  const to = newSlug ? `/${newSlug}` : "/";
  await tx`delete from redirects where from_path = ${to}`;
  await tx`update redirects set to_path = ${to} where to_path = ${from}`;
  await tx`
    insert into redirects (from_path, to_path, permanent, automatic) values (${from}, ${to}, true, true)
    on conflict (from_path) do update set to_path = excluded.to_path, permanent = true, automatic = true`;
}
