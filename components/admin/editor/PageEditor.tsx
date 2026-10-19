"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { deleteAction, duplicateAction, pageReferencesAction, savePageAction } from "@/app/admin/cms-actions";
import { blockDefaults, blockDefs, type BlockCategory, type BlockDef, type BlockType, type Section } from "@/lib/cms/blocks";
import { seoFields, type PageDoc } from "@/lib/cms/documents";
import type { FieldDef, Values } from "@/lib/cms/fields";
import type { DocStatus } from "@/lib/cms/types";
import { FieldList } from "../fields/FieldEditor";
import { useConfirm, useToast } from "../feedback";
import { AdminButton, Card, FieldLabel, Input, StatusBadge } from "../ui";
import SaveBar, { useUnsavedWarning } from "./SaveBar";

type Props = {
  page: { id: string; draft: PageDoc; status: DocStatus; serverHasChanges: boolean; systemKey: string | null; liveSlug: string | null };
};

const categories: BlockCategory[] = ["Kop", "Tekst", "Inhoud", "Media", "Collecties", "Oproep", "Contact"];

function summary(section: Section) {
  const d = section.data;
  const text = [d.title, d.highlight].filter((x) => typeof x === "string" && x).join(" ");
  if (text) return text;
  if (Array.isArray(d.items) && d.items.length) return `${d.items.length} items`;
  return "";
}

function AddSectionDialog({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (type: BlockType) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  const entries = Object.entries(blockDefs) as [BlockType, BlockDef][];
  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); onClose(); }} className="m-auto max-h-[85vh] w-[min(94vw,52rem)] rounded-2xl p-0 shadow-2xl backdrop:bg-black/50">
      {open && (
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Sectie toevoegen</h2>
            <AdminButton variant="ghost" onClick={onClose}>Sluiten</AdminButton>
          </div>
          <div className="mt-4 space-y-6">
            {categories.map((cat) => {
              const items = entries.filter(([, d]) => d.category === cat);
              if (!items.length) return null;
              return (
                <div key={cat}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">{cat}</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {items.map(([type, d]) => (
                      <li key={type}>
                        <button type="button" onClick={() => onAdd(type)} className="h-full w-full rounded-xl border border-zinc-200 p-3 text-left transition hover:border-zinc-900 hover:bg-zinc-50">
                          <span className="block text-sm font-semibold text-zinc-900">{d.label}</span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-zinc-600">{d.description}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </dialog>
  );
}

export default function PageEditor({ page }: Props) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [doc, setDoc] = useState<PageDoc>(page.draft);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState<"content" | "seo">("content");
  const [openId, setOpenId] = useState<string | null>(null);
  const [addAt, setAddAt] = useState<number | null>(null);
  const [pending, start] = useTransition();
  useUnsavedWarning(dirty);
  const isHome = page.systemKey === "home";

  const update = (next: Partial<PageDoc>) => {
    setDoc((d) => ({ ...d, ...next }));
    setDirty(true);
  };
  const setSections = (fn: (s: Section[]) => Section[]) => update({ sections: fn(doc.sections) });

  const onSave = async () => {
    const res = await savePageAction(page.id, doc);
    if (res.ok) setDirty(false);
    return res;
  };

  const move = (i: number, dir: -1 | 1) =>
    setSections((s) => {
      const n = [...s];
      [n[i], n[i + dir]] = [n[i + dir], n[i]];
      return n;
    });

  const removeSection = async (i: number) => {
    const label = blockDefs[doc.sections[i].type].label;
    const ok = await confirm({
      title: `Sectie ‘${label}’ verwijderen?`,
      body: "Tip: met het oog-icoon kun je een sectie ook tijdelijk verbergen. Een verwijderde sectie kun je terughalen met ‘Wijzigingen verwerpen’ of via Versies, zolang je nog niet hebt gepubliceerd.",
      confirmLabel: "Verwijderen",
      danger: true,
    });
    if (ok) setSections((s) => s.filter((_, j) => j !== i));
  };

  const removePage = async () => {
    const refs = await pageReferencesAction(page.id);
    const list = refs.ok && refs.data?.length ? refs.data : [];
    const ok = await confirm({
      title: "Pagina naar de prullenbak?",
      body: (
        <>
          <p>De pagina verdwijnt van de website. Je kunt haar terugzetten via Prullenbak.</p>
          {list.length > 0 && (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-amber-900">
              Let op: er wordt nog naar deze pagina gelinkt vanuit {list.map((r) => r.title).join(", ")}. Die links worden automatisch verborgen.
            </p>
          )}
        </>
      ),
      confirmLabel: "Naar prullenbak",
      danger: true,
    });
    if (!ok) return;
    start(async () => {
      const res = await deleteAction(page.id);
      if (res.ok) {
        toast("success", res.message ?? "Verwijderd.");
        router.push("/admin/paginas");
      } else toast("error", res.error);
    });
  };

  const duplicatePage = () =>
    start(async () => {
      const res = await duplicateAction(page.id);
      if (res.ok && res.data) {
        toast("success", res.message ?? "Gedupliceerd.");
        router.push(`/admin/paginas/${res.data.id}`);
      } else if (!res.ok) toast("error", res.error);
    });

  const liveHref = page.liveSlug === null ? null : page.liveSlug ? `/${page.liveSlug}` : "/";

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-6">
          <Card className="space-y-5">
            <FieldLabel htmlFor="page-title" label="Paginatitel" help="Wordt gebruikt in het menu-overzicht en als SEO-titel als die leeg is.">
              <Input id="page-title" value={doc.title} maxLength={120} onChange={(e) => update({ title: e.target.value })} />
            </FieldLabel>
            <FieldLabel htmlFor="page-slug" label="URL" help={isHome ? "De homepage staat altijd op /." : "Alleen kleine letters, cijfers en streepjes. Bij een gewijzigde URL maken we automatisch een doorverwijzing van het oude adres."}>
              <div className="flex items-center rounded-xl border border-zinc-300 bg-zinc-50 pl-3.5 shadow-sm focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-[#fece00]/50">
                <span className="text-[15px] text-zinc-500">/</span>
                <input
                  id="page-slug"
                  disabled={isHome}
                  value={doc.slug}
                  onChange={(e) => update({ slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-/]/g, "") })}
                  className="w-full rounded-r-xl bg-white px-1 py-2.5 text-[15px] outline-none disabled:bg-zinc-50"
                />
              </div>
            </FieldLabel>
          </Card>

          <div role="tablist" aria-label="Pagina-onderdelen" className="flex gap-1 rounded-xl bg-zinc-200/70 p-1">
            {[
              ["content", "Teksten en secties"],
              ["seo", "SEO en delen"],
            ].map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                type="button"
                onClick={() => setTab(key as "content" | "seo")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === key ? "bg-white text-zinc-900 shadow" : "text-zinc-600 hover:text-zinc-900"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "seo" ? (
            <Card>
              <FieldList fields={seoFields} values={doc.seo as unknown as Values} onChange={(v) => update({ seo: v as unknown as PageDoc["seo"] })} />
            </Card>
          ) : (
            <div className="space-y-3">
              {doc.sections.length === 0 && (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-600">Deze pagina heeft nog geen secties.</div>
              )}
              {doc.sections.map((section, i) => {
                const def: BlockDef = blockDefs[section.type];
                const isOpen = openId === section.id;
                return (
                  <div key={section.id}>
                    <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${section.hidden ? "border-dashed border-zinc-300 opacity-70" : "border-zinc-200"}`}>
                      <div className="flex items-center gap-1 px-4 py-3">
                        <button type="button" onClick={() => setOpenId(isOpen ? null : section.id)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-600">{i + 1}</span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold text-zinc-900">{def.label}</span>
                            <span className="block truncate text-xs text-zinc-500">{summary(section) || def.description}</span>
                          </span>
                          {section.hidden && <StatusBadge status="hidden" />}
                        </button>
                        <button type="button" title="Omhoog" aria-label="Sectie omhoog" disabled={i === 0} onClick={() => move(i, -1)} className="rounded-md px-2 py-1 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30">↑</button>
                        <button type="button" title="Omlaag" aria-label="Sectie omlaag" disabled={i === doc.sections.length - 1} onClick={() => move(i, 1)} className="rounded-md px-2 py-1 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30">↓</button>
                        <button type="button" title={section.hidden ? "Tonen" : "Verbergen"} aria-label={section.hidden ? "Sectie tonen" : "Sectie verbergen"} onClick={() => setSections((s) => s.map((x, j) => (j === i ? { ...x, hidden: !x.hidden } : x)))} className="rounded-md px-2 py-1 text-zinc-600 hover:bg-zinc-100">
                          {section.hidden ? "◌" : "◉"}
                        </button>
                        <button type="button" title="Dupliceren" aria-label="Sectie dupliceren" onClick={() => setSections((s) => [...s.slice(0, i + 1), { ...structuredClone(section), id: crypto.randomUUID() }, ...s.slice(i + 1)])} className="rounded-md px-2 py-1 text-zinc-600 hover:bg-zinc-100">⧉</button>
                        <button type="button" title="Verwijderen" aria-label="Sectie verwijderen" onClick={() => removeSection(i)} className="rounded-md px-2 py-1 text-red-700 hover:bg-red-50">✕</button>
                      </div>
                      {isOpen && (
                        <div className="border-t border-zinc-200 p-5">
                          <FieldList
                            fields={def.fields as FieldDef[]}
                            values={section.data}
                            onChange={(data) => setSections((s) => s.map((x, j) => (j === i ? { ...x, data } : x)))}
                          />
                        </div>
                      )}
                    </div>
                    <div className="group flex justify-center py-1">
                      <button type="button" onClick={() => setAddAt(i + 1)} className="rounded-full px-3 py-0.5 text-xs font-semibold text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-900">
                        + Sectie invoegen
                      </button>
                    </div>
                  </div>
                );
              })}
              <button type="button" onClick={() => setAddAt(doc.sections.length)} className="w-full rounded-2xl border-2 border-dashed border-zinc-300 px-4 py-4 text-sm font-semibold text-zinc-700 hover:border-zinc-900">
                + Sectie toevoegen
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="space-y-2 text-sm text-zinc-600">
            <p className="font-semibold text-zinc-900">Zo werkt het</p>
            <p>Je wijzigingen worden eerst als <strong>concept</strong> bewaard. Bezoekers zien ze pas na <strong>Publiceren</strong>.</p>
            <p>Met <strong>Voorbeeld bekijken</strong> zie je het concept zoals het op de website komt te staan.</p>
          </Card>
          <Card className="space-y-2">
            <p className="text-sm font-semibold text-zinc-900">Acties</p>
            <AdminButton className="w-full" onClick={duplicatePage} disabled={pending}>
              Pagina dupliceren
            </AdminButton>
            {!isHome && (
              <AdminButton variant="danger" className="w-full" onClick={removePage} disabled={pending}>
                Pagina verwijderen
              </AdminButton>
            )}
          </Card>
        </div>
      </div>

      <AddSectionDialog
        open={addAt !== null}
        onClose={() => setAddAt(null)}
        onAdd={(type) => {
          const section: Section = { id: crypto.randomUUID(), type, hidden: false, data: blockDefaults(type) };
          const at = addAt ?? doc.sections.length;
          setSections((s) => [...s.slice(0, at), section, ...s.slice(at)]);
          setOpenId(section.id);
          setAddAt(null);
        }}
      />

      <SaveBar
        docId={page.id}
        status={page.status}
        serverHasChanges={page.serverHasChanges}
        dirty={dirty}
        onSave={onSave}
        previewHref={`/preview/${page.id}`}
        liveHref={liveHref}
        canUnpublish={!isHome}
      />
    </div>
  );
}
