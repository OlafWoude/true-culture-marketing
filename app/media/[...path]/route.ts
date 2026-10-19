import { readFile } from "node:fs/promises";
import path from "node:path";
import { LOCAL_MEDIA_DIR, storageMode } from "@/lib/cms/media";

// Serves uploads from local disk during development. In production uploads live in Vercel Blob.
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (storageMode() !== "local") return new Response("Not found", { status: 404 });
  const { path: parts } = await params;
  const file = path.basename(parts.join("/"));
  if (!/^[\w.-]+\.webp$/.test(file)) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(path.join(LOCAL_MEDIA_DIR, file));
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
