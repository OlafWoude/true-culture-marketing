import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { guardAdminRequest } from "@/lib/auth/request-guard";
import { MAX_UPLOAD_BYTES, MAX_VIDEO_BYTES, MediaError, saveVideo, storageMode, toMediaItem, VIDEO_TYPES } from "@/lib/cms/media";
import { revalidatePublicSite } from "@/lib/cms/revalidate";

const fail = (error: string, status = 400) => Response.json({ error }, { status });

export async function POST(request: Request) {
  const guard = await guardAdminRequest(request);
  if (guard.error) return guard.error;

  // Step 1, with Blob storage: permission for the browser to upload one video straight to storage.
  // Videos are far larger than what a server request may carry, so they never pass through the server.
  if ((request.headers.get("content-type") ?? "").includes("application/json")) {
    if (storageMode() !== "blob") return fail("Uploaden is nog niet mogelijk: koppel eerst Vercel Blob-opslag aan dit project.");
    try {
      const body = (await request.json()) as HandleUploadBody;
      if (body.type !== "blob.generate-client-token") return fail("Verzoek geweigerd.");
      const result = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (pathname) => {
          if (!/^media\/[\w-]+\.(mp4|webm|mov)$/.test(pathname)) throw new MediaError("Ongeldige bestandsnaam.");
          return {
            allowedContentTypes: VIDEO_TYPES,
            maximumSizeInBytes: MAX_VIDEO_BYTES,
            addRandomSuffix: true,
            cacheControlMaxAge: 60 * 60 * 24 * 365,
            validUntil: Date.now() + 60 * 60 * 1000,
          };
        },
      });
      return Response.json(result);
    } catch (error) {
      if (!(error instanceof MediaError)) console.error("[media] Video upload could not start:", error);
      return fail(error instanceof MediaError ? error.message : "Het uploaden kon niet worden gestart. Probeer het opnieuw.");
    }
  }

  // Step 2: register the video with a still from it. Without Blob storage (development) the video itself comes along.
  const limit = (storageMode() === "local" ? MAX_VIDEO_BYTES : 0) + MAX_UPLOAD_BYTES + 256 * 1024;
  if (Number(request.headers.get("content-length") ?? 0) > limit) return fail("Dit bestand is te groot.", 413);
  try {
    const form = await request.formData();
    const poster = form.get("poster");
    if (!(poster instanceof File)) return fail("Er is geen beeld uit de video ontvangen.");
    const file = form.get("file");
    const url = String(form.get("url") ?? "");
    const source = file instanceof File ? { file } : url ? { url } : null;
    if (!source) return fail("Er is geen video ontvangen.");
    const replaceId = String(form.get("replaceId") ?? "") || undefined;
    if (replaceId && !/^[0-9a-f-]{36}$/i.test(replaceId)) return fail("Ongeldige video.");
    const row = await saveVideo(
      source,
      {
        filename: String(form.get("filename") ?? "video"),
        alt: String(form.get("alt") ?? ""),
        width: Number(form.get("width")),
        height: Number(form.get("height")),
        duration: Number(form.get("duration")),
        poster,
      },
      replaceId,
    );
    // A replaced video changes on every page that shows it.
    if (replaceId) revalidatePublicSite();
    return Response.json({ media: toMediaItem(row) });
  } catch (error) {
    if (error instanceof MediaError) return fail(error.message);
    console.error("[media] Video upload failed:", error);
    return fail("Uploaden mislukt. Probeer het opnieuw.", 500);
  }
}
