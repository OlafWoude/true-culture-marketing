import { open, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { LOCAL_MEDIA_DIR, storageMode } from "@/lib/cms/media";

const TYPES: Record<string, string> = { webp: "image/webp", mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime" };

// Serves uploads from local disk during development. In production uploads live in Vercel Blob.
export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (storageMode() !== "local") return new Response("Not found", { status: 404 });
  const { path: parts } = await params;
  const file = path.basename(parts.join("/"));
  const match = /^[\w.-]+\.(webp|mp4|webm|mov)$/.exec(file);
  if (!match) return new Response("Not found", { status: 404 });
  const full = path.join(LOCAL_MEDIA_DIR, file);
  const headers = { "Content-Type": TYPES[match[1]], "Cache-Control": "public, max-age=31536000, immutable", "Accept-Ranges": "bytes" };
  try {
    const { size } = await stat(full);
    // Browsers fetch videos in parts (Safari insists on it), so ranges are answered with just that part.
    const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
    if (range && (range[1] || range[2])) {
      const start = range[1] ? Number(range[1]) : Math.max(size - Number(range[2]), 0);
      const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      if (start > end || start >= size) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
      const handle = await open(full);
      try {
        const part = Buffer.alloc(end - start + 1);
        await handle.read(part, 0, part.length, start);
        return new Response(new Uint8Array(part), {
          status: 206,
          headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(part.length) },
        });
      } finally {
        await handle.close();
      }
    }
    const data = await readFile(full);
    return new Response(new Uint8Array(data), { headers: { ...headers, "Content-Length": String(size) } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
