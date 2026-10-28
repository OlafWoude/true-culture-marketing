import { guardAdminRequest } from "@/lib/auth/request-guard";
import { MAX_UPLOAD_BYTES, MediaError, replaceMedia, toMediaItem } from "@/lib/cms/media";
import { revalidatePublicSite } from "@/lib/cms/revalidate";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardAdminRequest(request);
  if (guard.error) return guard.error;
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: "Ongeldige afbeelding." }, { status: 400 });

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_UPLOAD_BYTES + 64 * 1024) {
    return Response.json({ error: "Dit bestand is groter dan 4 MB." }, { status: 413 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Geen bestand ontvangen." }, { status: 400 });
    const row = await replaceMedia(id, file);
    revalidatePublicSite();
    return Response.json({ media: toMediaItem(row) });
  } catch (error) {
    if (error instanceof MediaError) return Response.json({ error: error.message }, { status: 400 });
    console.error("[media] Replace failed:", error);
    return Response.json({ error: "Vervangen mislukt. Probeer het opnieuw." }, { status: 500 });
  }
}
