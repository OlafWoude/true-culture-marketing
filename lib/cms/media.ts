import "server-only";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { desc, eq, sql } from "drizzle-orm";
import sharp from "sharp";
import { put, del } from "@vercel/blob";
import { getDb, schema } from "@/lib/db";
import type { MediaRow } from "@/lib/db/schema";
import { docTitle } from "./repo";
import type { DocType } from "./types";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const MAX_DIMENSION = 2560;
export const LOCAL_MEDIA_DIR = path.join(process.cwd(), ".data", "uploads");

export function storageMode(): "blob" | "local" | "unavailable" {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  // Local files disappear on serverless redeploys, so they are only allowed outside Vercel.
  if (!process.env.VERCEL) return "local";
  return "unavailable";
}

export class MediaError extends Error {}

function safeBaseName(filename: string) {
  const base = filename.replace(/\.[^.]+$/, "").normalize("NFKD").replace(/[^\w-]+/g, "-").replace(/-+/g, "-");
  return base.replace(/^-|-$/g, "").toLowerCase().slice(0, 60) || "afbeelding";
}

async function optimize(buffer: Buffer) {
  const image = sharp(buffer, { failOn: "error", animated: false });
  const meta = await image.metadata();
  if (!meta.width || !meta.height) throw new MediaError("Dit bestand is geen geldige afbeelding.");
  // Images with transparency (logos) stay lossless-ish; photos get efficient lossy WebP.
  const output = await image
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp(meta.hasAlpha ? { quality: 90, alphaQuality: 100, effort: 4 } : { quality: 82, effort: 4 })
    .toBuffer({ resolveWithObject: true });
  return { data: output.data, width: output.info.width, height: output.info.height };
}

async function store(key: string, data: Buffer): Promise<{ url: string; storageKey: string }> {
  const mode = storageMode();
  if (mode === "blob") {
    const blob = await put(`media/${key}`, data, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: true,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return { url: blob.url, storageKey: blob.url };
  }
  if (mode === "local") {
    await mkdir(LOCAL_MEDIA_DIR, { recursive: true });
    const unique = `${key.replace(/\.webp$/, "")}-${crypto.randomUUID().slice(0, 8)}.webp`;
    await writeFile(path.join(LOCAL_MEDIA_DIR, unique), data);
    return { url: `/media/${unique}`, storageKey: `local:${unique}` };
  }
  throw new MediaError(
    "Uploaden is nog niet mogelijk: koppel eerst Vercel Blob-opslag aan dit project (BLOB_READ_WRITE_TOKEN).",
  );
}

async function removeStored(storageKey: string) {
  try {
    if (storageKey.startsWith("local:")) {
      const file = path.basename(storageKey.slice("local:".length));
      await unlink(path.join(LOCAL_MEDIA_DIR, file));
    } else if (process.env.BLOB_READ_WRITE_TOKEN) {
      await del(storageKey);
    }
  } catch (error) {
    console.error("[media] Could not remove stored file:", error);
  }
}

async function processFile(file: File) {
  if (!ALLOWED.has(file.type)) {
    throw new MediaError("Dit bestandstype wordt niet ondersteund. Gebruik JPG, PNG, WebP, AVIF of GIF.");
  }
  if (file.size > MAX_UPLOAD_BYTES) throw new MediaError("Dit bestand is groter dan 4 MB.");
  const optimized = await optimize(Buffer.from(await file.arrayBuffer()));
  const stored = await store(`${safeBaseName(file.name)}.webp`, optimized.data);
  return { ...optimized, ...stored, size: optimized.data.length };
}

export async function uploadMedia(file: File, alt: string) {
  const result = await processFile(file);
  const [row] = await getDb()
    .insert(schema.media)
    .values({
      url: result.url,
      storageKey: result.storageKey,
      filename: file.name.slice(0, 200),
      mimeType: "image/webp",
      size: result.size,
      width: result.width,
      height: result.height,
      alt: alt.slice(0, 300),
    })
    .returning();
  return row;
}

/** Swaps the file behind an existing media item, so every page that uses it updates at once. */
export async function replaceMedia(id: string, file: File) {
  const db = getDb();
  const [existing] = await db.select().from(schema.media).where(eq(schema.media.id, id)).limit(1);
  if (!existing) throw new MediaError("Deze afbeelding bestaat niet meer.");
  const result = await processFile(file);
  const [row] = await db
    .update(schema.media)
    .set({
      url: result.url,
      storageKey: result.storageKey,
      filename: file.name.slice(0, 200),
      size: result.size,
      width: result.width,
      height: result.height,
      updatedAt: new Date(),
    })
    .where(eq(schema.media.id, id))
    .returning();
  await removeStored(existing.storageKey);
  return row;
}

export async function listMedia(query?: string): Promise<MediaRow[]> {
  const db = getDb();
  const base = db.select().from(schema.media);
  const q = query?.trim();
  const rows = q
    ? await base
        .where(sql`${schema.media.alt} ilike ${`%${q}%`} or ${schema.media.filename} ilike ${`%${q}%`}`)
        .orderBy(desc(schema.media.createdAt))
    : await base.orderBy(desc(schema.media.createdAt));
  return rows;
}

export async function getMedia(id: string) {
  const [row] = await getDb().select().from(schema.media).where(eq(schema.media.id, id)).limit(1);
  return row ?? null;
}

export async function updateMediaMeta(id: string, meta: { alt: string; focalX: number; focalY: number }) {
  await getDb()
    .update(schema.media)
    .set({ alt: meta.alt.slice(0, 300), focalX: meta.focalX, focalY: meta.focalY, updatedAt: new Date() })
    .where(eq(schema.media.id, id));
}

export async function mediaUsage(id: string) {
  const rows = await getDb().select().from(schema.documents);
  const needle = `"${id}"`;
  return rows
    .filter((r) => JSON.stringify(r.draft).includes(needle) || JSON.stringify(r.published ?? {}).includes(needle))
    .map((r) => ({
      id: r.id,
      type: r.type as DocType,
      title: r.systemKey && r.type !== "page" ? r.type : docTitle(r.type as DocType, r.draft),
      inTrash: Boolean(r.deletedAt),
    }));
}

export async function deleteMedia(id: string) {
  const usage = await mediaUsage(id);
  if (usage.length) {
    throw new MediaError(
      `Deze afbeelding wordt nog gebruikt in: ${usage.map((u) => u.title).join(", ")}. Haal haar daar eerst weg.`,
    );
  }
  const row = await getMedia(id);
  if (!row) return;
  await getDb().delete(schema.media).where(eq(schema.media.id, id));
  await removeStored(row.storageKey);
}
