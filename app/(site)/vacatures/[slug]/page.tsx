import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import VacancyView from "@/components/site/VacancyView";
import { getLiveBundle, getRedirect } from "@/lib/cms/repo";
import { serviceSlug } from "@/lib/cms/render";
import type { Bundle } from "@/lib/cms/types";
import { vacancyMetadata } from "@/lib/cms/vacancy";

type Props = { params: Promise<{ slug: string }> };

// Rendered on the first visit and then served from cache until something is published.
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

const findVacancy = (bundle: Bundle, slug: string) => bundle.services.find((s) => serviceSlug(s) === decodeURIComponent(slug).toLowerCase());

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getLiveBundle();
  const service = findVacancy(bundle, slug);
  if (!service) return { title: "Vacature niet gevonden", robots: { index: false } };
  return vacancyMetadata(bundle, service);
}

export default async function VacancyPage({ params }: Props) {
  const { slug } = await params;
  const bundle = await getLiveBundle();
  const service = findVacancy(bundle, slug);
  if (!service) {
    // A vacancy whose URL name changed forwards to its new address.
    const target = await getRedirect(`/vacatures/${slug}`);
    if (target) {
      if (target.permanent) permanentRedirect(target.to);
      redirect(target.to);
    }
    notFound();
  }
  return <VacancyView bundle={bundle} service={service} />;
}
