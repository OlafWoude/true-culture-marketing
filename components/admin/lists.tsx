"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  createItemAction,
  createPageAction,
  deleteAction,
  duplicateAction,
  publishAction,
  purgeAction,
  reorderAction,
  restoreAction,
  unpublishAction,
} from "@/app/admin/cms-actions";
import type { CollectionType } from "@/lib/cms/documents";
import type { ActionResult, DocSummary } from "@/lib/cms/types";
import { useConfirm, useToast } from "./feedback";
import { AdminButton, EmptyState, FieldLabel, formatDate, Input, Select, StatusBadge } from "./ui";

function useRunner() {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<ActionResult<unknown>>, after?: (res: ActionResult<unknown>) => void) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        if (res.message) toast("success", res.message);
        after?.(res);
        router.refresh();
      } else toast("error", res.error);
    });
  return { run, pending, router };
}

export function DocStatusBadge({ doc }: { doc: DocSummary }) {
  if (doc.status === "published" && doc.hasChanges) return <StatusBadge status="changes" label="Live · concept gewijzigd" />;
  return <StatusBadge status={doc.status} />;
}

export function CollectionList({ type, items, basePath, singular, subtitle }: { type: CollectionType; items: DocSummary[]; basePath: string; singular: string; subtitle?: (d: DocSummary) => string }) {
  const { run, pending, router } = useRunner();
  const confirm = useConfirm();
  const [order, setOrder] = useState(items);

  const moveItem = (i: number, dir: -1 | 1) => {
    const next = [...order];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    setOrder(next);
    run(() => reorderAction(type, next.map((d) => d.id)));
  };

  const create = () =>
    run(() => createItemAction(type), (res) => {
      const data = (res as { data?: { id: string } }).data;
      if (data) router.push(`${basePath}/${data.id}`);
    });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AdminButton variant="primary" onClick={create} disabled={pending}>
          + {singular} toevoegen
        </AdminButton>
      </div>
      {order.length === 0 ? (
        <EmptyState title={`Nog geen ${singular.toLowerCase()}s`} text="Voeg er een toe. Nieuwe items zijn eerst een concept en worden pas na publiceren zichtbaar." />
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {order.map((d, i) => (
            <li key={d.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="flex flex-col">
                <button type="button" aria-label="Omhoog" disabled={i === 0 || pending} onClick={() => moveItem(i, -1)} className="rounded px-1.5 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30">↑</button>
                <button type="button" aria-label="Omlaag" disabled={i === order.length - 1 || pending} onClick={() => moveItem(i, 1)} className="rounded px-1.5 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30">↓</button>
              </div>
              <Link href={`${basePath}/${d.id}`} className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-zinc-900 hover:underline">{d.title}</span>
                <span className="block text-xs text-zinc-500">{subtitle ? subtitle(d) : `Bijgewerkt ${formatDate(d.updatedAt)}`}</span>
              </Link>
              <DocStatusBadge doc={d} />
              <div className="flex gap-1">
                {d.status !== "published" ? (
                  <AdminButton onClick={() => run(() => publishAction(d.id))} disabled={pending}>Publiceren</AdminButton>
                ) : (
                  <AdminButton variant="ghost" onClick={() => run(() => unpublishAction(d.id))} disabled={pending}>Offline halen</AdminButton>
                )}
                <AdminButton variant="ghost" onClick={() => run(() => duplicateAction(d.id))} disabled={pending}>Dupliceren</AdminButton>
                <AdminButton
                  variant="ghost"
                  disabled={pending}
                  onClick={async () => {
                    if (await confirm({ title: `‘${d.title}’ naar de prullenbak?`, body: "Je kunt dit terugzetten via Prullenbak.", confirmLabel: "Verplaatsen", danger: true })) run(() => deleteAction(d.id));
                  }}
                >
                  Verwijderen
                </AdminButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PagesList({ pages, templates }: { pages: DocSummary[]; templates: { key: string; label: string; description: string }[] }) {
  const { run, pending, router } = useRunner();
  const confirm = useConfirm();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [template, setTemplate] = useState(templates[0]?.key ?? "standaard");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (creating && !d.open) d.showModal();
    if (!creating && d.open) d.close();
  }, [creating]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? pages.filter((p) => p.title.toLowerCase().includes(q) || (p.slug ?? "").includes(q)) : pages;
  }, [pages, query]);

  const toSlug = (v: string) =>
    v.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Zoek een pagina" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" aria-label="Zoek een pagina" />
        <span className="ml-auto" />
        <AdminButton variant="primary" onClick={() => setCreating(true)}>
          + Nieuwe pagina
        </AdminButton>
      </div>

      <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {filtered.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
            <Link href={`/admin/paginas/${p.id}`} className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-zinc-900 hover:underline">
                {p.title}
                {p.systemKey === "home" && <span className="ml-2 rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600">Homepage</span>}
              </span>
              <span className="block text-xs text-zinc-500">
                {p.slug ? `/${p.slug}` : "/"} · bijgewerkt {formatDate(p.updatedAt)}
              </span>
            </Link>
            <DocStatusBadge doc={p} />
            <div className="flex gap-1">
              <Link href={`/admin/paginas/${p.id}`} className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-100">
                Bewerken
              </Link>
              {p.status !== "published" ? (
                <AdminButton onClick={() => run(() => publishAction(p.id))} disabled={pending}>Publiceren</AdminButton>
              ) : (
                p.systemKey !== "home" && (
                  <AdminButton variant="ghost" onClick={() => run(() => unpublishAction(p.id))} disabled={pending}>Offline halen</AdminButton>
                )
              )}
              <AdminButton variant="ghost" onClick={() => run(() => duplicateAction(p.id), (res) => { const data = (res as { data?: { id: string } }).data; if (data) router.push(`/admin/paginas/${data.id}`); })} disabled={pending}>
                Dupliceren
              </AdminButton>
              {p.systemKey !== "home" && (
                <AdminButton
                  variant="ghost"
                  disabled={pending}
                  onClick={async () => {
                    if (await confirm({ title: `‘${p.title}’ naar de prullenbak?`, body: "De pagina verdwijnt van de website. Je kunt haar terugzetten via Prullenbak.", confirmLabel: "Verplaatsen", danger: true })) run(() => deleteAction(p.id));
                  }}
                >
                  Verwijderen
                </AdminButton>
              )}
            </div>
          </li>
        ))}
      </ul>

      <dialog ref={dialogRef} onCancel={(e) => { e.preventDefault(); setCreating(false); }} className="m-auto w-[min(94vw,36rem)] rounded-2xl p-0 shadow-2xl backdrop:bg-black/50">
        {creating && (
          <form
            className="space-y-5 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => createPageAction({ title, slug, template }), (res) => {
                const data = (res as { data?: { id: string } }).data;
                setCreating(false);
                if (data) router.push(`/admin/paginas/${data.id}`);
              });
            }}
          >
            <h2 className="text-lg font-bold">Nieuwe pagina</h2>
            <FieldLabel htmlFor="np-title" label="Paginatitel">
              <Input id="np-title" required value={title} autoFocus onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(toSlug(e.target.value)); }} />
            </FieldLabel>
            <FieldLabel htmlFor="np-slug" label="URL" help="Bijvoorbeeld: over-ons/team">
              <div className="flex items-center rounded-xl border border-zinc-300 pl-3.5 shadow-sm">
                <span className="text-zinc-500">/</span>
                <input id="np-slug" required value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-/]/g, "")); }} className="w-full rounded-r-xl px-1 py-2.5 outline-none" />
              </div>
            </FieldLabel>
            <FieldLabel htmlFor="np-template" label="Begin met">
              <Select id="np-template" value={template} onChange={(e) => setTemplate(e.target.value)}>
                <optgroup label="Sjablonen">
                  {templates.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label} – {t.description}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Kopie van een bestaande pagina">
                  {pages.map((p) => (
                    <option key={p.id} value={`copy:${p.id}`}>
                      Indeling van ‘{p.title}’
                    </option>
                  ))}
                </optgroup>
              </Select>
            </FieldLabel>
            <div className="flex justify-end gap-2">
              <AdminButton onClick={() => setCreating(false)}>Annuleren</AdminButton>
              <button type="submit" disabled={pending} className="inline-flex items-center rounded-xl bg-[#fece00] px-4 py-2.5 text-sm font-semibold text-[#050505] hover:bg-[#ffda3d] disabled:opacity-50">
                Pagina aanmaken
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
}

export function TrashList({ items }: { items: DocSummary[] }) {
  const { run, pending } = useRunner();
  const confirm = useConfirm();
  const typeLabel: Record<string, string> = { page: "Pagina", service: "Dienst", case: "Case", testimonial: "Testimonial" };
  if (!items.length) return <EmptyState title="De prullenbak is leeg" text="Verwijderde pagina’s, diensten, cases en testimonials komen hier terecht, zodat je ze kunt terugzetten." />;
  return (
    <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {items.map((d) => (
        <li key={d.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-zinc-900">{d.title}</p>
            <p className="text-xs text-zinc-500">
              {typeLabel[d.type] ?? d.type} · verwijderd {formatDate(d.deletedAt)}
            </p>
          </div>
          <AdminButton onClick={() => run(() => restoreAction(d.id))} disabled={pending}>
            Terugzetten
          </AdminButton>
          <AdminButton
            variant="danger"
            disabled={pending}
            onClick={async () => {
              if (await confirm({ title: "Definitief verwijderen?", body: "Dit kan niet ongedaan worden gemaakt.", confirmLabel: "Definitief verwijderen", danger: true })) run(() => purgeAction(d.id));
            }}
          >
            Definitief verwijderen
          </AdminButton>
        </li>
      ))}
    </ul>
  );
}
