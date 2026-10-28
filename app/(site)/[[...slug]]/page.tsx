import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import JsonLd from "@/components/site/JsonLd";
import Sections from "@/components/site/Sections";
import { getLiveBundle, getRedirect } from "@/lib/cms/repo";
import { buildMetadata, organizationJsonLd } from "@/lib/cms/metadata";
import { createRenderCtx, pathForSlug } from "@/lib/cms/render";

type Props = { params: Promise<{ slug?: string[] }> };

// Pages are rendered on their first visit and then served from cache until something is published.
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

function toSlug(segments: string[] | undefined) {
  return (segments ?? []).map((s) => decodeURIComponent(s).toLowerCase()).join("/");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = toSlug((await params).slug);
  const bundle = await getLiveBundle();
  const page = bundle.pages.find((p) => p.slug === slug);
  if (!page) return { title: "Pagina niet gevonden", robots: { index: false } };
  return buildMetadata(bundle, {
    title: page.title,
    seo: page.seo,
    path: pathForSlug(page.slug),
    isHome: page.systemKey === "home",
  });
}

export default async function CmsPage({ params }: Props) {
  const slug = toSlug((await params).slug);
  const bundle = await getLiveBundle();
  const page = bundle.pages.find((p) => p.slug === slug);

  if (!page) {
    const target = await getRedirect(`/${slug}`);
    if (target) {
      if (target.permanent) permanentRedirect(target.to);
      redirect(target.to);
    }
    notFound();
  }

  return (
    <>
      {page.systemKey === "home" && <JsonLd data={organizationJsonLd(bundle)} />}
      <Sections sections={page.sections} ctx={createRenderCtx(bundle)} />
    </>
  );
}
