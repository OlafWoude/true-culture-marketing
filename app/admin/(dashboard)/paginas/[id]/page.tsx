import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageEditor from "@/components/admin/editor/PageEditor";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { normalizePage } from "@/lib/cms/normalize";
import { getDocRow } from "@/lib/cms/repo";
import type { DocStatus } from "@/lib/cms/types";

export const metadata: Metadata = { title: "Pagina bewerken" };

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const row = await getDocRow(id);
  if (!row || row.type !== "page" || row.deletedAt) notFound();
  const draft = normalizePage(row.draft);
  return (
    <>
      <PageHeader title={draft.title || "Pagina"} back={{ href: "/admin/paginas", label: "Alle pagina’s" }} />
      <PageEditor
        key={row.draftUpdatedAt.toISOString()}
        page={{
          id: row.id,
          draft,
          status: row.status as DocStatus,
          serverHasChanges: !row.published || JSON.stringify(row.draft) !== JSON.stringify(row.published),
          systemKey: row.systemKey,
          liveSlug: row.status === "published" ? row.slug : null,
        }}
      />
    </>
  );
}
