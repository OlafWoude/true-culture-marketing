import type { MetadataRoute } from "next";

import { getLiveBundle } from "@/lib/cms/repo";
import { siteUrl } from "@/lib/cms/metadata";
import { pathForSlug, vacancyPath } from "@/lib/cms/render";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const bundle = await getLiveBundle();
  if (!bundle.settings.allowIndexing) return [];
  const base = siteUrl(bundle);

  const pages = bundle.pages
    .filter((p) => !p.seo.noindex && !p.seo.canonical)
    .map((p) => ({
      url: `${base}${pathForSlug(p.slug) === "/" ? "" : pathForSlug(p.slug)}`,
      lastModified: new Date(p.updatedAt).getTime() > 0 ? new Date(p.updatedAt) : undefined,
      changeFrequency: "monthly" as const,
      priority: p.systemKey === "home" ? 1 : 0.7,
    }));

  const cases = bundle.cases
    .filter((c) => !c.seo.noindex)
    .map((c) => ({ url: `${base}/cases/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.6 }));

  const vacancies = bundle.services
    .filter((s) => !s.seo.noindex && !s.seo.canonical)
    .map((s) => ({
      url: `${base}${vacancyPath(s)}`,
      lastModified: new Date(s.updatedAt).getTime() > 0 ? new Date(s.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...pages, ...vacancies, ...cases];
}
