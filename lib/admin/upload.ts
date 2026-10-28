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
  mimeType: string;
  /** Videos: a still from the video. */
  posterUrl: string | null;
  /** Videos: length in seconds. */
  duration: number | null;
};

export const isVideo = (item: Pick<MediaItem, "mimeType">) => item.mimeType.startsWith("video/");

/** The picture that represents an item in the dashboard: the photo itself, or a still from the video. */
export const thumbnailOf = (item: MediaItem) => (isVideo(item) ? item.posterUrl : item.url);

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

// ---------- Videos ----------

const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
// Above this, visitors on a phone connection wait noticeably before a video plays.
const LARGE_VIDEO_BYTES = 40 * 1024 * 1024;

export const videoAcceptAttr = VIDEO_TYPES.join(",");

const UNPLAYABLE =
  "Je browser kan deze video niet afspelen, en veel bezoekers dan ook niet. Sla de video op als MP4 (H.264) en probeer het opnieuw.";

/**
 * Plays the video in the browser to read its size and length and to take a still from it. That also
 * proves the browser can play it at all.
 */
function inspectVideo(file: File): Promise<{ width: number; height: number; duration: number; poster: File }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    let settled = false;
    const finish = (result: Error | { width: number; height: number; duration: number; poster: File }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(url);
      if (result instanceof Error) reject(result);
      else resolve(result);
    };
    const timer = setTimeout(() => finish(new Error(UNPLAYABLE)), 30000);
    video.addEventListener("error", () => finish(new Error(UNPLAYABLE)));
    video.addEventListener("loadedmetadata", () => {
      if (!video.videoWidth || !video.videoHeight) return finish(new Error(UNPLAYABLE));
      // A moment into the video, past a fade-in or a black first frame.
      video.currentTime = Number.isFinite(video.duration) && video.duration > 0 ? Math.min(1, video.duration / 4) : 0.1;
    });
    video.addEventListener(
      "seeked",
      () => {
        const scale = Math.min(1, 1920 / Math.max(video.videoWidth, video.videoHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) =>
            finish(
              blob
                ? {
                    width: video.videoWidth,
                    height: video.videoHeight,
                    duration: Number.isFinite(video.duration) ? video.duration : 0,
                    poster: new File([blob], "beeld.jpg", { type: "image/jpeg" }),
                  }
                : new Error(UNPLAYABLE),
            ),
          "image/jpeg",
          0.85,
        );
      },
      { once: true },
    );
    video.src = url;
  });
}

const fourcc = (view: DataView, at: number) => String.fromCharCode(...[0, 1, 2, 3].map((i) => view.getUint8(at + i)));

/**
 * The video codec of an MP4 or MOV file, read from its "moov" box. Used to warn about HEVC (iPhone's
 * "High Efficiency" format), which plays in Safari but not in every other browser.
 */
export async function videoCodec(file: File): Promise<string | null> {
  if (file.type !== "video/mp4" && file.type !== "video/quicktime") return null;
  const read = async (start: number, length: number) => new DataView(await file.slice(start, start + length).arrayBuffer());
  let moov: DataView | null = null;
  // The top-level boxes follow each other; "moov" is at the start or (camera files) after the media data.
  for (let offset = 0, steps = 0; offset + 8 <= file.size && steps < 1000; steps++) {
    const header = await read(offset, 16);
    let size = header.getUint32(0);
    let headerSize = 8;
    if (size === 1 && header.byteLength >= 16) {
      size = Number(header.getBigUint64(8));
      headerSize = 16;
    } else if (size === 0) {
      size = file.size - offset;
    }
    if (size < headerSize) return null;
    if (fourcc(header, 4) === "moov") {
      if (size > 64 * 1024 * 1024) return null;
      moov = await read(offset + headerSize, size - headerSize);
      break;
    }
    offset += size;
  }
  if (!moov) return null;
  const box = moov;
  const formats: string[] = [];
  const walk = (start: number, end: number, path: string[]) => {
    for (let pos = start; pos + 8 <= end; ) {
      const size = box.getUint32(pos);
      if (size < 8 || pos + size > end) return;
      if (fourcc(box, pos + 4) === path[0]) {
        // The sample description lists the codec of each track: header (8), version and flags (4), count (4), entry size (4), codec.
        if (path.length === 1) {
          if (pos + 24 <= end) formats.push(fourcc(box, pos + 20));
        } else {
          walk(pos + 8, pos + size, path.slice(1));
        }
      }
      pos += size;
    }
  };
  walk(0, box.byteLength, ["trak", "mdia", "minf", "stbl", "stsd"]);
  return formats.find((f) => /^(avc1|avc3|hvc1|hev1|dvh1|dvhe|vp09|av01|mp4v)$/.test(f)) ?? null;
}

const fileBaseName = (name: string) =>
  name
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[^\w-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 60) || "video";

export type VideoUploadOptions = {
  storage: "blob" | "local" | "unavailable";
  alt?: string;
  /** Swap the video behind this existing item, so every page that shows it gets the new one. */
  replaceId?: string;
  onProgress?: (percentage: number) => void;
  /** Asked before uploading a video that may not play everywhere or is very large; false cancels. */
  confirm: (warning: { title: string; body: string }) => Promise<boolean>;
};

/** Uploads a video with a still from it. Returns null when the upload was cancelled after a warning. */
export async function uploadVideo(file: File, options: VideoUploadOptions): Promise<MediaItem | null> {
  if (!VIDEO_TYPES.includes(file.type)) throw new Error("Gebruik een MP4-, WebM- of MOV-video.");
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("Deze video is groter dan 100 MB. Maak hem korter of sla hem op in een lagere kwaliteit, bijvoorbeeld 720p.");
  }
  if (options.storage === "unavailable") throw new Error("Uploaden kan pas als Vercel Blob-opslag aan het project is gekoppeld.");

  const info = await inspectVideo(file);
  const codec = await videoCodec(file).catch(() => null);
  if (
    codec &&
    /^(hvc1|hev1|dvh1|dvhe)$/.test(codec) &&
    !(await options.confirm({
      title: "Deze video speelt misschien niet overal af",
      body: "De video is opgeslagen als HEVC (op een iPhone heet dat ‘Hoge efficiëntie’). Niet elke browser kan dat afspelen, vooral oudere computers niet. Zet op je iPhone bij Instellingen > Camera > Formaten ‘Meest compatibel’ aan, of sla de video op als MP4 (H.264). Toch uploaden?",
    }))
  ) {
    return null;
  }
  if (
    file.size > LARGE_VIDEO_BYTES &&
    !(await options.confirm({
      title: "Dit is een grote video",
      body: `De video is ${Math.round(file.size / 1024 / 1024)} MB. Wie op een telefoon kijkt, moet dan lang wachten voordat hij speelt. Maak hem korter of sla hem op in 720p. Toch uploaden?`,
    }))
  ) {
    return null;
  }

  const body = new FormData();
  if (options.storage === "blob") {
    // Straight from the browser to storage: videos are too large to pass through the server.
    const { upload } = await import("@vercel/blob/client");
    const extension = { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" }[file.type];
    const blob = await upload(`media/${fileBaseName(file.name)}.${extension}`, file, {
      access: "public",
      handleUploadUrl: "/api/admin/media/video",
      contentType: file.type,
      multipart: file.size > 20 * 1024 * 1024,
      onUploadProgress: ({ percentage }) => options.onProgress?.(percentage),
    });
    body.append("url", blob.url);
  } else {
    body.append("file", file);
  }
  body.append("poster", info.poster);
  body.append("width", String(info.width));
  body.append("height", String(info.height));
  body.append("duration", String(info.duration));
  body.append("filename", file.name);
  body.append("alt", options.alt ?? "");
  if (options.replaceId) body.append("replaceId", options.replaceId);
  const res = await fetch("/api/admin/media/video", { method: "POST", body, credentials: "same-origin" });
  const json = (await res.json().catch(() => ({}))) as { media?: MediaItem; error?: string };
  if (!res.ok || !json.media) throw new Error(json.error ?? "Uploaden mislukt.");
  return json.media;
}

export function formatDuration(seconds: number | null) {
  if (!seconds) return "";
  return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;
}
