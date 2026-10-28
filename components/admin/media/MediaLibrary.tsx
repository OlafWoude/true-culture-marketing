"use client";

/* eslint-disable @next/next/no-img-element -- admin previews come from arbitrary storage URLs */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { deleteMediaAction, mediaUsageAction, updateMediaAction } from "@/app/admin/cms-actions";
import { acceptAttr, formatDuration, isVideo, replaceImage, thumbnailOf, videoAcceptAttr, type MediaItem } from "@/lib/admin/upload";
import type { DocType } from "@/lib/cms/types";
import { useAdminData } from "../AdminContext";
import { useConfirm, useToast } from "../feedback";
import { AdminButton, EmptyState, FieldLabel, Input, Notice } from "../ui";
import { MediaThumb, useUpload } from "./MediaPicker";
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
  const video = isVideo(item);
  const noun = video ? "video" : "afbeelding";
  const { upload, busy: replacing, status } = useUpload();

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
      toast("error", `Deze ${noun} is nog in gebruik. Haal die eerst weg op de genoemde plekken.`);
      return;
    }
    if (!(await confirm({ title: `${video ? "Video" : "Afbeelding"} definitief verwijderen?`, body: `De ${noun} wordt nergens meer gebruikt. Verwijderen kan niet ongedaan worden gemaakt.`, confirmLabel: "Verwijderen", danger: true }))) return;
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
    <aside className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm" aria-label={`${video ? "Video" : "Afbeelding"} bewerken`}>
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-zinc-900">{video ? "Video" : "Afbeelding"}</h2>
        <AdminButton variant="ghost" onClick={onClose}>Sluiten</AdminButton>
      </div>
      {video && (
        <video src={item.url} poster={item.posterUrl ?? undefined} controls preload="none" playsInline className="block max-h-80 w-full rounded-xl bg-black" />
      )}
      <div>
        <p className="mb-1.5 text-sm font-semibold text-zinc-800">{video ? "Focuspunt (op het beeld uit de video)" : "Focuspunt voor uitsneden"}</p>
        <button
          type="button"
          className="relative block w-full cursor-crosshair overflow-hidden rounded-xl bg-zinc-100"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setFocal({ x: Math.round(((e.clientX - r.left) / r.width) * 100), y: Math.round(((e.clientY - r.top) / r.height) * 100) });
          }}
          aria-label={`Klik op het belangrijkste deel van de ${noun}`}
        >
          <img src={thumbnailOf(item) ?? ""} alt={item.alt} className="block h-auto w-full" />
          <span className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#fece00]/80 shadow" style={{ left: `${focal.x}%`, top: `${focal.y}%` }} />
        </button>
        <p className="mt-1.5 text-xs text-zinc-500">Klik op het belangrijkste deel. Bij smalle of vierkante uitsneden blijft dat punt in beeld.</p>
      </div>
      <FieldLabel
        htmlFor="media-alt"
        label={video ? "Omschrijving" : "Alt-tekst"}
        help={video ? "Waar gaat de video over? Dit hoort wie een schermlezer gebruikt bij de afspeelknop." : "Beschrijf kort wat er te zien is. Belangrijk voor toegankelijkheid en Google."}
        count={{ value: alt.length, max: 300 }}
      >
        <Input id="media-alt" value={alt} maxLength={300} onChange={(e) => setAlt(e.target.value)} />
      </FieldLabel>
      <dl className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
        <div><dt className="font-semibold text-zinc-800">Bestand</dt><dd className="truncate">{item.filename}</dd></div>
        <div><dt className="font-semibold text-zinc-800">Afmetingen</dt><dd>{item.width} × {item.height} px</dd></div>
        {video && item.duration ? <div><dt className="font-semibold text-zinc-800">Lengte</dt><dd>{formatDuration(item.duration)}</dd></div> : null}
      </dl>
      <div className="flex flex-wrap gap-2">
        <AdminButton variant="dark" onClick={save} disabled={!changed || pending}>Opslaan</AdminButton>
        <input
          ref={replaceRef}
          type="file"
          accept={video ? videoAcceptAttr : acceptAttr}
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            if (video) {
              const [updated] = await upload([file], { replaceId: item.id });
              if (updated) toast("success", "Video vervangen. Overal waar hij gebruikt wordt, staat nu de nieuwe versie.");
              return;
            }
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
        <AdminButton onClick={() => replaceRef.current?.click()} disabled={pending || replacing}>{replacing ? status : "Vervangen"}</AdminButton>
        <AdminButton variant="danger" onClick={del} disabled={pending || replacing || usage === null}>Verwijderen</AdminButton>
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-800">Gebruikt op</p>
        {usage === null ? (
          <p className="mt-1 text-sm text-zinc-500">Bezig met controleren…</p>
        ) : usage.length === 0 ? (
          <p className="mt-1 text-sm text-zinc-500">Nergens. Je kunt deze {noun} veilig verwijderen.</p>
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

const filters = [
  { value: "all", label: "Alles" },
  { value: "image", label: "Foto’s" },
  { value: "video", label: "Video’s" },
] as const;

export default function MediaLibrary() {
  const { items: all } = useMediaRegistry();
  const { storage } = useAdminData();
  const { upload, busy, status } = useUpload();
  const [show, setShow] = useState<(typeof filters)[number]["value"]>("all");
  const items = useMemo(() => (show === "all" ? all : all.filter((m) => isVideo(m) === (show === "video"))), [all, show]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((m) => m.alt.toLowerCase().includes(q) || m.filename.toLowerCase().includes(q)) : items;
  }, [items, query]);
  const current = all.find((m) => m.id === selected) ?? null;
  const missingAlt = all.filter((m) => !m.alt.trim()).length;

  return (
    <div className="space-y-4">
      {storage === "unavailable" && (
        <Notice tone="warning" title="Uploaden nog niet mogelijk">
          Koppel in Vercel een Blob-opslag aan dit project (Storage → Blob). Daarmee komt BLOB_READ_WRITE_TOKEN beschikbaar en worden foto’s en video’s duurzaam opgeslagen.
        </Notice>
      )}
      {storage === "local" && (
        <Notice tone="info">Ontwikkelmodus: foto’s en video’s worden lokaal opgeslagen. In productie gebruikt de website Vercel Blob.</Notice>
      )}
      {missingAlt > 0 && <Notice tone="warning">{missingAlt} foto(’s) of video(’s) hebben nog geen omschrijving (alt-tekst).</Notice>}

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
        <div className="mr-auto min-w-0 flex-1 basis-96">
          <p className="font-semibold text-zinc-900">Sleep foto’s of video’s hierheen of kies bestanden</p>
          <p className="text-sm text-zinc-500">
            Foto’s: JPG, PNG, WebP, AVIF of GIF; grote foto’s worden automatisch verkleind. Video’s: MP4 (liefst), WebM of MOV tot 100 MB; korter dan een minuut werkt het best.
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept={`${acceptAttr},${videoAcceptAttr}`}
          className="hidden"
          onChange={async (e) => {
            const files = e.target.files ? Array.from(e.target.files) : [];
            e.target.value = "";
            if (files.length) await upload(files);
          }}
        />
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Input placeholder="Zoeken" value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 sm:w-56 sm:flex-none" aria-label="Zoek foto’s en video’s" />
          <AdminButton variant="primary" disabled={busy || storage === "unavailable"} onClick={() => fileRef.current?.click()}>
            {busy ? status : "Uploaden"}
          </AdminButton>
        </div>
      </div>

      <div role="group" aria-label="Toon" className="inline-flex rounded-xl border border-zinc-200 bg-white p-1 text-sm">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={show === f.value}
            onClick={() => setShow(f.value)}
            className={`rounded-lg px-3 py-1.5 font-medium ${show === f.value ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          {filtered.length === 0 ? (
            <EmptyState
              title={items.length ? "Niets gevonden" : show === "video" ? "Nog geen video’s" : show === "image" ? "Nog geen foto’s" : "Nog geen foto’s of video’s"}
              text={items.length ? "Probeer een andere zoekterm." : "Upload je eerste bestand om het op de website te gebruiken."}
            />
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
                    <MediaThumb item={m} className="aspect-square" />
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
          {current ? <Details key={current.id + current.url} item={current} onClose={() => setSelected(null)} /> : <p className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500">Klik op een foto of video om de omschrijving, het focuspunt en het gebruik te bekijken.</p>}
        </div>
      </div>
    </div>
  );
}
