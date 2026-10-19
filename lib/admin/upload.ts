// Client-side helpers: large photos are scaled down in the browser before upload, so
// uploads stay below the hosting request limit. The server optimises them again.

export type MediaItem = {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  filename: string;
  focalX: number;
  focalY: number;
};

const MAX_BYTES = 3.5 * 1024 * 1024;
const MAX_SIDE = 2560;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export const acceptAttr = ACCEPTED.join(",");

async function shrink(file: File): Promise<File> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const needsResize = bitmap.width > MAX_SIDE || bitmap.height > MAX_SIDE;
  if (!needsResize && file.size <= MAX_BYTES) {
    bitmap.close();
    return file;
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const quality of [0.9, 0.82, 0.72, 0.6]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", quality));
    if (blob && blob.size <= MAX_BYTES) {
      return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
    }
  }
  return file;
}

async function send(url: string, file: File, alt?: string): Promise<MediaItem> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Gebruik een JPG-, PNG-, WebP-, AVIF- of GIF-afbeelding.");
  const prepared = await shrink(file);
  if (prepared.size > 4 * 1024 * 1024) throw new Error("Deze afbeelding is te groot, ook na verkleinen. Kies een kleinere afbeelding.");
  const body = new FormData();
  body.append("file", prepared);
  if (alt !== undefined) body.append("alt", alt);
  const res = await fetch(url, { method: "POST", body, credentials: "same-origin" });
  const json = (await res.json().catch(() => ({}))) as { media?: MediaItem; error?: string };
  if (!res.ok || !json.media) throw new Error(json.error ?? "Uploaden mislukt.");
  return json.media;
}

export function uploadImage(file: File, alt = "") {
  return send("/api/admin/media", file, alt);
}

export function replaceImage(id: string, file: File) {
  return send(`/api/admin/media/${id}`, file);
}

export function altFromFilename(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
