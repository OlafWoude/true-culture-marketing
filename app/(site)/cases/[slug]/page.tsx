import type { Metadata } from "next";
import CaseView from "@/components/site/CaseView";
import { getLiveBundle } from "@/lib/cms/repo";
import { buildMetadata } from "@/lib/cms/metadata";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getLiveBundle();
  const item = bundle.cases.find((c) => c.slug === slug);
  if (!item) return { title: "Case niet gevonden", robots: { index: false } };
  return buildMetadata(bundle, {
    title: item.title,
    seo: { ...item.seo, description: item.seo.description || item.summary, ogImage: item.seo.ogImage || item.coverImage },
    path: `/cases/${item.slug}`,
    type: "article",
  });
}

export default async function CasePage({ params }: Props) {
  const { slug } = await params;
  const bundle = await getLiveBundle();
  return <CaseView bundle={bundle} slug={slug} />;
}
