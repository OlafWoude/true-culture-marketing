import DocEditor from "@/components/admin/editor/DocEditor";
import ThemeEditor from "@/components/admin/editor/ThemeEditor";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { singletonDefs, type SingletonType } from "@/lib/cms/documents";
import type { FieldDef } from "@/lib/cms/fields";
import { normalizeSingleton, seedSingleton } from "@/lib/cms/normalize";
import { getSingletonRow } from "@/lib/cms/repo";
import { SEED_IDS } from "@/lib/cms/seed";
import type { DocStatus } from "@/lib/cms/types";

export default async function SingletonPage({ type, aside }: { type: SingletonType; aside?: React.ReactNode }) {
  await requireAdmin();
  const def = singletonDefs[type];
  const row = await getSingletonRow(type);
  const values = normalizeSingleton<Record<string, unknown>>(type, row.draft);
  const common = {
    docId: row.id,
    initial: values,
    status: row.status as DocStatus,
    serverHasChanges: JSON.stringify(row.draft) !== JSON.stringify(row.published),
    previewHref: `/preview/${SEED_IDS.home}`,
    canUnpublish: false,
  };
  return (
    <>
      <PageHeader title={def.label} description={def.description} />
      {type === "theme" ? (
        <ThemeEditor key={row.draftUpdatedAt.toISOString()} {...common} fields={def.fields as unknown as FieldDef[]} defaults={seedSingleton("theme") as Record<string, unknown>} />
      ) : (
        <DocEditor key={row.draftUpdatedAt.toISOString()} {...common} kind={{ singleton: type }} fields={def.fields as unknown as FieldDef[]} aside={aside} />
      )}
    </>
  );
}
