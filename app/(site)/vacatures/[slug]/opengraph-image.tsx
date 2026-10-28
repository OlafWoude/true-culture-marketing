import { getLiveBundle } from "@/lib/cms/repo";
import { serviceSlug } from "@/lib/cms/render";
import { shareImageSize, vacancyShareImage } from "@/lib/og/vacancy-image";

// Drawn on the first request and then served from cache until something is published.
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export const alt = "Vacature bij True Culture Marketing";
export const size = shareImageSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundle = await getLiveBundle();
  const service = bundle.services.find((s) => serviceSlug(s) === decodeURIComponent(slug).toLowerCase());
  if (!service) return new Response("Niet gevonden", { status: 404 });
  return vacancyShareImage(bundle, service);
}
