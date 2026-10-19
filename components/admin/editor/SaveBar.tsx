"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  discardDraftAction,
  publishAction,
  restoreRevisionAction,
  revisionsAction,
  unpublishAction,
} from "@/app/admin/cms-actions";
import type { ActionResult, DocStatus } from "@/lib/cms/types";
import { useConfirm, useToast } from "../feedback";
import { AdminButton, formatDate, StatusBadge } from "../ui";

export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}

type SaveBarProps = {
  docId: string;
  status: DocStatus;
  serverHasChanges: boolean;
  dirty: boolean;
  onSave: () => Promise<ActionResult>;
  previewHref?: string;
  liveHref?: string | null;
  canUnpublish?: boolean;
  publishLabel?: string;
};

export default function SaveBar({ docId, status, serverHasChanges, dirty, onSave, previewHref, liveHref, canUnpublish = true, publishLabel = "Publiceren" }: SaveBarProps) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [pending, start] = useTransition();
  const [history, setHistory] = useState<{ id: string; note: string; createdAt: string; createdBy: string | null }[] | null>(null);

  const report = (res: ActionResult) => {
    if (res.ok) {
      if (res.message) toast("success", res.message);
    } else toast("error", res.error);
    return res.ok;
  };

  const save = () =>
    start(async () => {
      if (report(await onSave())) router.refresh();
    });

  const publish = () =>
    start(async () => {
      if (dirty && !report(await onSave())) return;
      if (report(await publishAction(docId))) router.refresh();
    });

  const preview = () =>
    start(async () => {
      if (dirty && !report(await onSave())) return;
      if (previewHref) window.open(previewHref, "_blank", "noopener");
      router.refresh();
    });

  const unpublish = async () => {
    const ok = await confirm({
      title: "Offline halen?",
      body: "Bezoekers kunnen dit dan niet meer zien. Je kunt het later opnieuw publiceren.",
      confirmLabel: "Offline halen",
      danger: true,
    });
    if (ok) start(async () => { if (report(await unpublishAction(docId))) router.refresh(); });
  };

  const discard = async () => {
    const ok = await confirm({
      title: "Wijzigingen verwerpen?",
      body: "Het concept wordt teruggezet naar de versie die nu live staat. Niet-gepubliceerde wijzigingen gaan verloren.",
      confirmLabel: "Verwerpen",
      danger: true,
    });
    if (ok) start(async () => { if (report(await discardDraftAction(docId))) router.refresh(); });
  };

  const openHistory = () =>
    start(async () => {
      const res = await revisionsAction(docId);
      if (res.ok) setHistory(res.data ?? []);
      else toast("error", res.error);
    });

  const restore = async (revId: string) => {
    if (dirty) {
      const ok = await confirm({ title: "Niet-opgeslagen wijzigingen", body: "Je huidige niet-opgeslagen wijzigingen gaan verloren. Doorgaan?", confirmLabel: "Doorgaan", danger: true });
      if (!ok) return;
    }
    start(async () => {
      if (report(await restoreRevisionAction(docId, revId))) {
        setHistory(null);
        router.refresh();
        setTimeout(() => window.location.reload(), 150);
      }
    });
  };

  const statusBadge = dirty ? (
    <StatusBadge status="new" label="Niet opgeslagen" />
  ) : status === "published" && serverHasChanges ? (
    <StatusBadge status="changes" />
  ) : (
    <StatusBadge status={status} />
  );

  return (
    <>
      <div className="sticky bottom-0 z-30 -mx-4 mt-10 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-auto flex items-center gap-3">
            {statusBadge}
            {liveHref && status === "published" && (
              <a href={liveHref} target="_blank" rel="noopener" className="hidden text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900 sm:inline">
                Bekijk live
              </a>
            )}
          </div>
          <AdminButton variant="ghost" onClick={openHistory} disabled={pending}>
            Versies
          </AdminButton>
          {status === "published" && serverHasChanges && !dirty && (
            <AdminButton variant="ghost" onClick={discard} disabled={pending}>
              Wijzigingen verwerpen
            </AdminButton>
          )}
          {canUnpublish && status === "published" && (
            <AdminButton variant="danger" onClick={unpublish} disabled={pending}>
              Offline halen
            </AdminButton>
          )}
          {previewHref && (
            <AdminButton onClick={preview} disabled={pending}>
              Voorbeeld bekijken
            </AdminButton>
          )}
          <AdminButton variant="dark" onClick={save} disabled={pending || !dirty}>
            {pending ? "Bezig…" : "Wijzigingen opslaan"}
          </AdminButton>
          <AdminButton variant="primary" onClick={publish} disabled={pending || (!dirty && !serverHasChanges && status === "published")}>
            {publishLabel}
          </AdminButton>
        </div>
      </div>

      {history && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setHistory(null)}>
          <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()} aria-label="Eerdere versies">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Eerdere versies</h2>
              <AdminButton variant="ghost" onClick={() => setHistory(null)}>Sluiten</AdminButton>
            </div>
            <p className="mt-1 text-sm text-zinc-600">Elke publicatie wordt bewaard. Terugzetten maakt er eerst een concept van, zodat je kunt controleren voordat je opnieuw publiceert.</p>
            {history.length === 0 ? (
              <p className="mt-8 text-sm text-zinc-500">Nog geen gepubliceerde versies.</p>
            ) : (
              <ul className="mt-6 divide-y divide-zinc-200">
                {history.map((h, i) => (
                  <li key={h.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{formatDate(h.createdAt)}{i === 0 ? " · huidige live versie" : ""}</p>
                      <p className="text-xs text-zinc-500">{h.note}{h.createdBy ? ` door ${h.createdBy}` : ""}</p>
                    </div>
                    <AdminButton onClick={() => restore(h.id)} disabled={pending}>Terugzetten</AdminButton>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
