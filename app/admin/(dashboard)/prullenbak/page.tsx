import type { Metadata } from "next";
import { TrashList } from "@/components/admin/lists";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { listTrash } from "@/lib/cms/repo";

export const metadata: Metadata = { title: "Prullenbak" };

export default async function TrashPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Prullenbak" description="Verwijderde items kun je hier terugzetten. Pas bij ‘Definitief verwijderen’ zijn ze echt weg." />
      <TrashList items={await listTrash()} />
    </>
  );
}
