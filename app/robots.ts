import type { MetadataRoute } from "next";
import { getLiveBundle } from "@/lib/cms/repo";
import { siteUrl } from "@/lib/cms/metadata";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const bundle = await getLiveBundle();
  const base = siteUrl(bundle);
  if (!bundle.settings.allowIndexing) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/preview", "/api"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
