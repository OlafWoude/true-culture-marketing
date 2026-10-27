"use client";

/* eslint-disable @next/next/no-img-element -- admin previews come from arbitrary storage URLs */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { deleteMediaAction, mediaUsageAction, updateMediaAction } from "@/app/admin/cms-actions";
import { acceptAttr, replaceImage, type MediaItem } from "@/lib/admin/upload";
import type { DocType } from "@/lib/cms/types";
import { useAdminData } from "../AdminContext";
import { useConfirm, useToast } from "../feedback";
import { AdminButton, EmptyState, FieldLabel, Input, Notice } from "../ui";
import { useUpload } from "./MediaPicker";
import { useMediaRegistry } from "./MediaRegistry";

const editHref: Partial<Record<DocType, string>> = {
  page: "/admin/paginas/",
  service: "/admin/vacatures/",
  case: "/admin/cases/",
  testimonial: "/admin/testimonials/",
};
const singletonHref: Record<string, string> = {
  settings: "/admin/instellingen",
  theme: "/admin/huisstijl",
  navigation: "/admin/navigatie",
  footer: "/admin/footer",
  forms: "/admin/formulieren",
};

function Details({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const toast = useToast();
  const confirm = useConfirm();
  const { upsert, remove } = useMediaRegistry();
  const [alt, setAlt] = useState(item.alt);
  const [focal, setFocal] = useState({ x: item.focalX, y: item.focalY });
  const [usage, setUsage] = useState<{ id: string; type: DocType; title: string; inTrash: boolean }[] | null>(null);
  const [pending, start] = useTransition();
  const replaceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    mediaUsageAction(item.id).then((res) => active && setUsage(res.ok ? (res.data ?? []) : []));
    return () => {
      active = false;
    };
  }, [item.id]);

  const changed = alt !== item.alt || focal.x !== item.focalX || focal.y !== item.focalY;

  const save = () =>
    start(async () => {
      const res = await updateMediaAction(item.id, { alt, focalX: focal.x, focalY: focal.y });
      if (res.ok) {
        upsert({ ...item, alt, focalX: focal.x, focalY: focal.y });
        toast("success", res.message ?? "Opgeslagen.");
      } else toast("error", res.error);
    });

  const del = async () => {
    if (usage?.length) {
      toast("error", "Deze afbeelding is nog in gebruik. Haal haar eerst weg op de genoemde plekken.");
      return;
    }
    if (!(await confirm({ title: "Afbeelding definitief verwijderen?", body: "De afbeelding wordt nergens meer gebruikt. Verwijderen kan niet ongedaan worden gemaakt.", confirmLabel: "Verwijderen", danger: true }))) return;
    start(async () => {
      const res = await deleteMediaAction(item.id);
      if (res.ok) {
        remove(item.id);
        toast("success", res.message ?? "Verwijderd.");
        onClose();
      } else toast("error", res.error);
    });
  };

  return (
    <aside className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm" aria-label="Afbeelding bewerken">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-zinc-900">Afbeelding</h2>
        <AdminButton variant="ghost" onClick={onClose}>Sluiten</AdminButton>
      </div>
      <div>
        <p className="mb-1.5 text-sm font-semibold text-zinc-800">Focuspunt voor uitsneden</p>
        <button
          type="button"
          className="relative block w-full cursor-crosshair overflow-hidden rounded-xl bg-zinc-100"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setFocal({ x: Math.round(((e.clientX - r.left) / r.width) * 100), y: Math.round(((e.clientY - r.top) / r.height) * 100) });
          }}
          aria-label="Klik op het belangrijkste deel van de afbeelding"
        >
          <img src={item.url} alt={item.alt} className="block h-auto w-full" />
          <span className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#fece00]/80 shadow" style={{ left: `${focal.x}%`, top: `${focal.y}%` }} />
        </button>
        <p className="mt-1.5 text-xs text-zinc-500">Klik op het belangrijkste deel. Bij smalle of vierkante uitsneden blijft dat punt in beeld.</p>
      </div>
      <FieldLabel htmlFor="media-alt" label="Alt-tekst" help="Beschrijf kort wat er te zien is. Belangrijk voor toegankelijkheid en Google." count={{ value: alt.length, max: 300 }}>
        <Input id="media-alt" value={alt} maxLength={300} onChange={(e) => setAlt(e.target.value)} />
      </FieldLabel>
      <dl className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
        <div><dt className="font-semibold text-zinc-800">Bestand</dt><dd className="truncate">{item.filename}</dd></div>
        <div><dt className="font-semibold text-zinc-800">Afmetingen</dt><dd>{item.width} × {item.height} px</dd></div>
      </dl>
      <div className="flex flex-wrap gap-2">
        <AdminButton variant="dark" onClick={save} disabled={!changed || pending}>Opslaan</AdminButton>
        <input
          ref={replaceRef}
          type="file"
          accept={acceptAttr}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            start(async () => {
              try {
                const updated = await replaceImage(item.id, file);
                upsert(updated);
                toast("success", "Afbeelding vervangen. Overal waar ze gebruikt wordt, staat nu de nieuwe versie.");
              } catch (err) {
                toast("error", (err as Error).message);
              }
            });
          }}
        />
        <AdminButton onClick={() => replaceRef.current?.click()} disabled={pending}>Vervangen</AdminButton>
        <AdminButton variant="danger" onClick={del} disabled={pending || usage === null}>Verwijderen</AdminButton>
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-800">Gebruikt op</p>
        {usage === null ? (
          <p className="mt-1 text-sm text-zinc-500">Bezig met controleren…</p>
        ) : usage.length === 0 ? (
          <p className="mt-1 text-sm text-zinc-500">Nergens. Je kunt deze afbeelding veilig verwijderen.</p>
        ) : (
          <ul className="mt-1 space-y-1 text-sm">
            {usage.map((u) => (
              <li key={u.id}>
                <Link className="font-medium underline underline-offset-4" href={editHref[u.type] ? `${editHref[u.type]}${u.id}` : (singletonHref[u.title] ?? "/admin")}>
                  {singletonHref[u.title] ? { settings: "Instellingen", theme: "Huisstijl", navigation: "Navigatie", footer: "Footer", forms: "Formulieren" }[u.title] : u.title}
                </Link>
                {u.inTrash && <span className="text-zinc-500"> (in prullenbak)</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

export default function MediaLibrary() {
  const { items } = useMediaRegistry();
  const { storage } = useAdminData();
  const { upload, busy } = useUpload();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((m) => m.alt.toLowerCase().includes(q) || m.filename.toLowerCase().includes(q)) : items;
  }, [items, query]);
  const current = items.find((m) => m.id === selected) ?? null;
  const missingAlt = items.filter((m) => !m.alt.trim()).length;

  return (
    <div className="space-y-4">
      {storage === "unavailable" && (
        <Notice tone="warning" title="Uploaden nog niet mogelijk">
          Koppel in Vercel een Blob-opslag aan dit project (Storage → Blob). Daarmee komt BLOB_READ_WRITE_TOKEN beschikbaar en worden afbeeldingen duurzaam opgeslagen.
        </Notice>
      )}
      {storage === "local" && (
        <Notice tone="info">Ontwikkelmodus: afbeeldingen worden lokaal opgeslagen. In productie gebruikt de website Vercel Blob.</Notice>
      )}
      {missingAlt > 0 && <Notice tone="warning">{missingAlt} afbeelding(en) hebben nog geen alt-tekst.</Notice>}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={async (e) => {
          e.preventDefault();
          setDragging(false);
          if (storage !== "unavailable" && e.dataTransfer.files.length) await upload(e.dataTransfer.files);
        }}
        className={`flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed px-5 py-5 transition ${dragging ? "border-zinc-900 bg-[#fffbe6]" : "border-zinc-300 bg-white"}`}
      >
        <div className="mr-auto">
          <p className="font-semibold text-zinc-900">Sleep afbeeldingen hierheen of kies bestanden</p>
          <p className="text-sm text-zinc-500">JPG, PNG, WebP, AVIF of GIF. Grote foto’s worden automatisch verkleind en geoptimaliseerd.</p>
        </div>
        <input ref={fileRef} type="file" multiple accept={acceptAttr} className="hidden" onChange={async (e) => { if (e.target.files?.length) await upload(e.target.files); e.target.value = ""; }} />
        <Input placeholder="Zoeken" value={query} onChange={(e) => setQuery(e.target.value)} className="w-56" aria-label="Zoek afbeeldingen" />
        <AdminButton variant="primary" disabled={busy || storage === "unavailable"} onClick={() => fileRef.current?.click()}>
          {busy ? "Bezig met uploaden…" : "Afbeeldingen uploaden"}
        </AdminButton>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          {filtered.length === 0 ? (
            <EmptyState title={items.length ? "Geen afbeeldingen gevonden" : "Nog geen afbeeldingen"} text={items.length ? "Probeer een andere zoekterm." : "Upload je eerste afbeelding om haar op de website te gebruiken."} />
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(m.id)}
                    aria-pressed={selected === m.id}
                    className={`block w-full overflow-hidden rounded-xl border bg-white text-left shadow-sm transition ${selected === m.id ? "border-zinc-900 ring-2 ring-[#fece00]" : "border-zinc-200 hover:border-zinc-400"}`}
                  >
                    <span className="block aspect-square bg-[repeating-conic-gradient(#e4e4e7_0_25%,#fff_0_50%)] bg-[length:16px_16px]">
                      <img src={m.url} alt={m.alt} loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: `${m.focalX}% ${m.focalY}%` }} />
                    </span>
                    <span className="block truncate px-3 py-2 text-xs">
                      {m.alt ? <span className="text-zinc-700">{m.alt}</span> : <span className="font-semibold text-amber-700">Geen alt-tekst</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="lg:sticky lg:top-20 lg:self-start">
          {current ? <Details key={current.id + current.url} item={current} onClose={() => setSelected(null)} /> : <p className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500">Klik op een afbeelding om de alt-tekst, het focuspunt en het gebruik te bekijken.</p>}
        </div>
      </div>
    </div>
  );
}
