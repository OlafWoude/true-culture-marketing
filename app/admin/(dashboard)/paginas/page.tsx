import type { Metadata } from "next";
import { PagesList } from "@/components/admin/lists";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { listDocs } from "@/lib/cms/repo";
import { pageTemplates } from "@/lib/cms/templates";

export const metadata: Metadata = { title: "Pagina’s" };

export default async function PagesPage() {
  await requireAdmin();
  const pages = await listDocs("page");
  return (
    <>
      <PageHeader title="Pagina’s" description="Beheer de pagina’s van je website. Klik op een pagina om teksten, afbeeldingen, secties en SEO aan te passen." />
      <PagesList pages={pages} templates={pageTemplates.map(({ key, label, description }) => ({ key, label, description }))} />
    </>
  );
}
