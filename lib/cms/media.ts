import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { desc, eq, sql } from "drizzle-orm";
import sharp from "sharp";
import { del, head, put } from "@vercel/blob";
import { getDb, schema } from "@/lib/db";
import type { MediaItem } from "@/lib/admin/upload";
import type { MediaRow } from "@/lib/db/schema";
import { docTitle } from "./repo";
import type { DocType } from "./types";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
export const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const VIDEO_EXTENSIONS: Record<string, string> = { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" };
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const MAX_DIMENSION = 2560;
export const LOCAL_MEDIA_DIR = path.join(process.cwd(), ".data", "uploads");

/** Files in Vercel Blob storage (only ever this project's store, see `head` checks where it matters). */
export function isBlobUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/** The stored bytes of an uploaded file, e.g. to draw a share image with it. */
export async function readMediaFile(url: string): Promise<Buffer | null> {
  try {
    if (url.startsWith("/media/")) return await readFile(path.join(LOCAL_MEDIA_DIR, path.basename(url)));
    if (!isBlobUrl(url)) return null;
    const res = await fetch(url);
    return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

export function storageMode(): "blob" | "local" | "unavailable" {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  // Local files disappear on serverless redeploys, so they are only allowed outside Vercel.
  if (!process.env.VERCEL) return "local";
  return "unavailable";
}

export class MediaError extends Error {}

/** What the dashboard needs to know about an uploaded photo or video. */
export function toMediaItem(row: MediaRow): MediaItem {
  return {
    id: row.id,
    url: row.url,
    alt: row.alt,
    width: row.width,
    height: row.height,
    filename: row.filename,
    focalX: row.focalX,
    focalY: row.focalY,
    mimeType: row.mimeType,
    posterUrl: row.posterUrl,
    duration: row.duration,
  };
}

export function safeBaseName(filename: string, fallback = "afbeelding") {
  const base = filename.replace(/\.[^.]+$/, "").normalize("NFKD").replace(/[^\w-]+/g, "-").replace(/-+/g, "-");
  return base.replace(/^-|-$/g, "").toLowerCase().slice(0, 60) || fallback;
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

/** Local files are stored as "local:<name>"; files in Blob storage by their URL. */
const storageKeyOf = (url: string) => (url.startsWith("/media/") ? `local:${path.basename(url)}` : url);

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
  if (existing.mimeType.startsWith("video/")) throw new MediaError("Een video vervang je door hier een nieuwe video te uploaden.");
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
      `Dit bestand wordt nog gebruikt in: ${usage.map((u) => u.title).join(", ")}. Haal het daar eerst weg.`,
    );
  }
  const row = await getMedia(id);
  if (!row) return;
  await getDb().delete(schema.media).where(eq(schema.media.id, id));
  await removeStored(row.storageKey);
  if (row.posterUrl) await removeStored(storageKeyOf(row.posterUrl));
}

export type VideoDetails = {
  filename: string;
  alt: string;
  width: number;
  height: number;
  /** In seconds; 0 when the browser could not tell. */
  duration: number;
  /** A still from the video, taken in the browser when it was uploaded. */
  poster: File;
};

/**
 * Stores a video and its still. With Blob storage the browser has already uploaded the video straight
 * to storage (it is too large to pass through the server) and only its address arrives here; without
 * Blob storage (development) the file itself arrives. Optionally swaps the video behind an existing item.
 */
export async function saveVideo(source: { url: string } | { file: File }, details: VideoDetails, replaceId?: string) {
  const { width, height } = details;
  if (![width, height].every((n) => Number.isInteger(n) && n >= 16 && n <= 8192)) throw new MediaError("De afmetingen van de video zijn onbekend.");
  const duration = Number.isFinite(details.duration) && details.duration > 0 ? Math.min(Math.round(details.duration), 24 * 3600) : null;
  if (!ALLOWED.has(details.poster.type) || details.poster.size > MAX_UPLOAD_BYTES) throw new MediaError("Het beeld uit de video kon niet worden gemaakt.");

  const db = getDb();
  const existing = replaceId ? await getMedia(replaceId) : null;
  if (replaceId && !existing?.mimeType.startsWith("video/")) throw new MediaError("Deze video bestaat niet meer.");

  let video: { url: string; storageKey: string; size: number; mimeType: string };
  if ("url" in source) {
    if (storageMode() !== "blob" || !isBlobUrl(source.url) || !new URL(source.url).pathname.startsWith("/media/")) {
      throw new MediaError("Onbekende video.");
    }
    // Ask storage itself what arrived: this also proves the file is in this project's own store.
    const blob = await head(source.url).catch(() => null);
    if (!blob) throw new MediaError("De video is niet goed aangekomen. Probeer het opnieuw.");
    video = { url: blob.url, storageKey: blob.url, size: blob.size, mimeType: blob.contentType };
    if (!VIDEO_TYPES.includes(blob.contentType) || blob.size > MAX_VIDEO_BYTES) {
      await removeStored(blob.url);
      throw new MediaError("Gebruik een MP4-, WebM- of MOV-video van maximaal 100 MB.");
    }
  } else {
    if (storageMode() !== "local") throw new MediaError("Uploaden is nog niet mogelijk: koppel eerst Vercel Blob-opslag aan dit project.");
    const { file } = source;
    if (!VIDEO_TYPES.includes(file.type)) throw new MediaError("Gebruik een MP4-, WebM- of MOV-video.");
    if (file.size > MAX_VIDEO_BYTES) throw new MediaError("Deze video is groter dan 100 MB.");
    await mkdir(LOCAL_MEDIA_DIR, { recursive: true });
    const name = `${safeBaseName(details.filename, "video")}-${crypto.randomUUID().slice(0, 8)}.${VIDEO_EXTENSIONS[file.type]}`;
    await writeFile(path.join(LOCAL_MEDIA_DIR, name), Buffer.from(await file.arrayBuffer()));
    video = { url: `/media/${name}`, storageKey: `local:${name}`, size: file.size, mimeType: file.type };
  }

  let posterUrl: string;
  try {
    const still = await optimize(Buffer.from(await details.poster.arrayBuffer()));
    posterUrl = (await store(`${safeBaseName(details.filename, "video")}-beeld.webp`, still.data)).url;
  } catch (error) {
    await removeStored(video.storageKey);
    throw error instanceof MediaError ? error : new MediaError("Het beeld uit de video kon niet worden opgeslagen.");
  }

  const values = {
    url: video.url,
    storageKey: video.storageKey,
    filename: details.filename.slice(0, 200),
    mimeType: video.mimeType,
    size: video.size,
    width,
    height,
    posterUrl,
    duration,
  };
  if (existing) {
    const [row] = await db.update(schema.media).set({ ...values, updatedAt: new Date() }).where(eq(schema.media.id, existing.id)).returning();
    await removeStored(existing.storageKey);
    if (existing.posterUrl) await removeStored(storageKeyOf(existing.posterUrl));
    return row;
  }
  const [row] = await db.insert(schema.media).values({ ...values, alt: details.alt.slice(0, 300) }).returning();
  return row;
}
