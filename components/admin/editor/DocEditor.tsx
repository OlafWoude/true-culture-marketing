"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteAction, duplicateAction, saveItemAction, saveSingletonAction } from "@/app/admin/cms-actions";
import type { FieldDef, Values } from "@/lib/cms/fields";
import type { CollectionType, SingletonType } from "@/lib/cms/documents";
import type { DocStatus } from "@/lib/cms/types";
import { FieldList } from "../fields/FieldEditor";
import { useConfirm, useToast } from "../feedback";
import { AdminButton, Card } from "../ui";
import SaveBar, { useUnsavedWarning } from "./SaveBar";

type Props = {
  docId: string;
  kind: { collection: CollectionType } | { singleton: SingletonType };
  fields: FieldDef[];
  initial: Values;
  status: DocStatus;
  serverHasChanges: boolean;
  previewHref?: string;
  liveHref?: string | null;
  listHref?: string;
  aside?: React.ReactNode;
  canUnpublish?: boolean;
  before?: (values: Values) => React.ReactNode;
};

export default function DocEditor({ docId, kind, fields, initial, status, serverHasChanges, previewHref, liveHref, listHref, aside, canUnpublish, before }: Props) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [values, setValues] = useState<Values>(initial);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  useUnsavedWarning(dirty);

  const onSave = async () => {
    const res = "collection" in kind ? await saveItemAction(docId, values) : await saveSingletonAction(kind.singleton, values);
    if (res.ok) setDirty(false);
    return res;
  };

  const remove = async () => {
    const ok = await confirm({
      title: "Naar de prullenbak verplaatsen?",
      body: "Dit item verdwijnt van de website. Je kunt het binnen het dashboard terugzetten via Prullenbak.",
      confirmLabel: "Verplaatsen",
      danger: true,
    });
    if (!ok) return;
    start(async () => {
      const res = await deleteAction(docId);
      if (res.ok) {
        toast("success", res.message ?? "Verwijderd.");
        router.push(listHref ?? "/admin");
      } else toast("error", res.error);
    });
  };

  const duplicate = () =>
    start(async () => {
      const res = await duplicateAction(docId);
      if (res.ok && res.data) {
        toast("success", res.message ?? "Gedupliceerd.");
        router.push(`${listHref}/${res.data.id}`);
      } else if (!res.ok) toast("error", res.error);
    });

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card>
          {before?.(values)}
          <FieldList
            fields={fields}
            values={values}
            onChange={(v) => {
              setValues(v);
              setDirty(true);
            }}
          />
        </Card>
        <div className="space-y-4">
          {aside}
          {"collection" in kind && (
            <Card className="space-y-2">
              <p className="text-sm font-semibold text-zinc-900">Acties</p>
              <AdminButton className="w-full" onClick={duplicate} disabled={pending}>
                Dupliceren
              </AdminButton>
              <AdminButton variant="danger" className="w-full" onClick={remove} disabled={pending}>
                Verwijderen
              </AdminButton>
            </Card>
          )}
        </div>
      </div>
      <SaveBar
        docId={docId}
        status={status}
        serverHasChanges={serverHasChanges}
        dirty={dirty}
        onSave={onSave}
        previewHref={previewHref}
        liveHref={liveHref}
        canUnpublish={canUnpublish ?? "collection" in kind}
      />
    </div>
  );
}
