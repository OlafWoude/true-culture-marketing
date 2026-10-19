import { notFound } from "next/navigation";
import CaseView from "@/components/site/CaseView";
import Sections from "@/components/site/Sections";
import { requireAdmin } from "@/lib/auth/session";
import { getDocRow, getPreviewBundle } from "@/lib/cms/repo";
import { createRenderCtx } from "@/lib/cms/render";

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const row = await getDocRow(id);
  if (!row || row.deletedAt) notFound();
  const bundle = await getPreviewBundle();

  if (row.type === "case") {
    const item = bundle.cases.find((c) => c.id === id);
    if (!item) notFound();
    return <CaseView bundle={bundle} slug={item.slug} />;
  }
  const page = bundle.pages.find((p) => p.id === id);
  if (!page) notFound();
  return <Sections sections={page.sections} ctx={createRenderCtx(bundle)} />;
}
