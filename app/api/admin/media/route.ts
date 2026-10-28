import { guardAdminRequest } from "@/lib/auth/request-guard";
import { MAX_UPLOAD_BYTES, MediaError, toMediaItem, uploadMedia } from "@/lib/cms/media";

export async function POST(request: Request) {
  const guard = await guardAdminRequest(request);
  if (guard.error) return guard.error;

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_UPLOAD_BYTES + 64 * 1024) {
    return Response.json({ error: "Dit bestand is groter dan 4 MB." }, { status: 413 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Geen bestand ontvangen." }, { status: 400 });
    const alt = String(form.get("alt") ?? "");
    const row = await uploadMedia(file, alt);
    return Response.json({
      media: toMediaItem(row),
    });
  } catch (error) {
    if (error instanceof MediaError) return Response.json({ error: error.message }, { status: 400 });
    console.error("[media] Upload failed:", error);
    return Response.json({ error: "Uploaden mislukt. Probeer het opnieuw." }, { status: 500 });
  }
}
