import { notFound } from "next/navigation";
import DocEditor from "@/components/admin/editor/DocEditor";
import { CollectionList } from "@/components/admin/lists";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { collectionDefs, type CollectionType } from "@/lib/cms/documents";
import type { FieldDef } from "@/lib/cms/fields";
import { normalizeCollection } from "@/lib/cms/normalize";
import { getDocRow, listDocs } from "@/lib/cms/repo";
import type { DocStatus } from "@/lib/cms/types";

const descriptions: Record<CollectionType, string> = {
  service: "De diensten verschijnen automatisch in de dienstentegels, het dienstenoverzicht en op de dienstenpagina. Gebruik de pijltjes om de volgorde te bepalen.",
  case: "Cases verschijnen in de Cases-sectie en krijgen een eigen pagina op /cases/<url-naam>. Zet ‘Tonen op de homepage’ aan om een case op de homepage te laten zien.",
  testimonial: "Testimonials verschijnen in elke Testimonials-sectie die je aan een pagina toevoegt. Zonder gepubliceerde testimonials blijft die sectie verborgen.",
};

export async function CollectionListPage({ type }: { type: CollectionType }) {
  await requireAdmin();
  const def = collectionDefs[type];
  const items = await listDocs(type);
  return (
    <>
      <PageHeader title={def.label} description={descriptions[type]} />
      <CollectionList key={items.map((i) => `${i.id}:${i.status}:${i.updatedAt}`).join("|")} type={type} items={items} basePath={`/admin/${def.path}`} singular={def.singular} />
    </>
  );
}

export async function CollectionEditPage({ type, id }: { type: CollectionType; id: string }) {
  await requireAdmin();
  const def = collectionDefs[type];
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const row = await getDocRow(id);
  if (!row || row.type !== type || row.deletedAt) notFound();
  const values = normalizeCollection<Record<string, unknown>>(type, row.draft);
  const title = String(values[def.titleKey] || def.singular);
  return (
    <>
      <PageHeader title={title} back={{ href: `/admin/${def.path}`, label: `Alle ${def.label.toLowerCase()}` }} />
      <DocEditor
        key={row.draftUpdatedAt.toISOString()}
        docId={row.id}
        kind={{ collection: type }}
        fields={def.fields as unknown as FieldDef[]}
        initial={values}
        status={row.status as DocStatus}
        serverHasChanges={!row.published || JSON.stringify(row.draft) !== JSON.stringify(row.published)}
        listHref={`/admin/${def.path}`}
        previewHref={type === "case" ? `/preview/${row.id}` : undefined}
        liveHref={type === "case" && row.status === "published" ? `/cases/${row.slug}` : null}
      />
    </>
  );
}
