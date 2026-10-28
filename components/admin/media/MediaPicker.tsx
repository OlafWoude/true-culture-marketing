"use client";

/* eslint-disable @next/next/no-img-element -- admin thumbnails come from arbitrary storage URLs */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  acceptAttr,
  altFromFilename,
  formatDuration,
  isVideo,
  thumbnailOf,
  uploadImage,
  uploadVideo,
  videoAcceptAttr,
  type MediaItem,
} from "@/lib/admin/upload";
import { useAdminData } from "../AdminContext";
import { useConfirm, useToast } from "../feedback";
import { AdminButton, Input, Notice } from "../ui";
import { useMediaRegistry } from "./MediaRegistry";

export type MediaKind = "image" | "video";

export const kindOf = (item: MediaItem): MediaKind => (isVideo(item) ? "video" : "image");

/** Uploads photos and videos alike; videos go straight to storage and show their progress. */
export function useUpload() {
  const toast = useToast();
  const confirm = useConfirm();
  const { storage } = useAdminData();
  const { upsert } = useMediaRegistry();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const upload = async (files: FileList | File[], options: { replaceId?: string } = {}) => {
    setBusy(true);
    const done: MediaItem[] = [];
    for (const file of Array.from(files)) {
      try {
        const video = file.type.startsWith("video/");
        const item = video
          ? await uploadVideo(file, {
              storage,
              alt: altFromFilename(file.name),
              replaceId: options.replaceId,
              onProgress: (p) => setProgress(Math.round(p)),
              confirm: ({ title, body }) => confirm({ title, body, confirmLabel: "Toch uploaden" }),
            })
          : await uploadImage(file, altFromFilename(file.name));
        if (item) {
          upsert(item);
          done.push(item);
        }
      } catch (e) {
        toast("error", `${file.name}: ${(e as Error).message}`);
      } finally {
        setProgress(null);
      }
    }
    setBusy(false);
    if (done.length) {
      const videos = done.filter(isVideo).length;
      const photos = done.length - videos;
      toast(
        "success",
        [photos && (photos === 1 ? "Afbeelding geüpload." : `${photos} afbeeldingen geüpload.`), videos && (videos === 1 ? "Video geüpload." : `${videos} video's geüpload.`)]
          .filter(Boolean)
          .join(" "),
      );
    }
    return done;
  };
  const status = progress !== null ? `Video uploaden… ${progress}%` : "Bezig met uploaden…";
  return { upload, busy, status };
}

/** A still with a play symbol and the length, for videos in lists and pickers. */
export function MediaThumb({ item, className = "" }: { item: MediaItem; className?: string }) {
  const src = thumbnailOf(item);
  return (
    <span className={`relative block overflow-hidden bg-[repeating-conic-gradient(#e4e4e7_0_25%,#fff_0_50%)] bg-[length:16px_16px] ${className}`}>
      {src ? (
        <img src={src} alt={item.alt} loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: `${item.focalX}% ${item.focalY}%` }} />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-zinc-800 text-xs text-white">Video</span>
      )}
      {isVideo(item) && (
        <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3 w-3 fill-current">
            <path d="M8 5.5v13l10.5-6.5L8 5.5Z" />
          </svg>
          {formatDuration(item.duration) || "Video"}
        </span>
      )}
    </span>
  );
}

export function MediaPickerDialog({
  open,
  onClose,
  onSelect,
  kind = "image",
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
  kind?: MediaKind;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { items: all } = useMediaRegistry();
  const items = useMemo(() => all.filter((m) => kindOf(m) === kind), [all, kind]);
  const { storage } = useAdminData();
  const { upload, busy, status } = useUpload();
  const [query, setQuery] = useState("");
  const noun = kind === "video" ? { one: "video", many: "video's" } : { one: "afbeelding", many: "afbeeldingen" };

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((m) => m.alt.toLowerCase().includes(q) || m.filename.toLowerCase().includes(q)) : items;
  }, [items, query]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="m-auto h-[min(85vh,52rem)] w-[min(94vw,64rem)] rounded-2xl p-0 shadow-2xl backdrop:bg-black/50"
    >
      {open && (
        <div className="flex h-full flex-col">
          <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 p-4">
            <h2 className="mr-auto text-lg font-bold">Kies een {noun.one}</h2>
            <Input placeholder="Zoeken op naam of omschrijving" value={query} onChange={(e) => setQuery(e.target.value)} className="w-64" />
            <input
              ref={fileRef}
              type="file"
              accept={kind === "video" ? videoAcceptAttr : acceptAttr}
              className="hidden"
              onChange={async (e) => {
                const files = e.target.files;
                if (!files?.length) return;
                const done = await upload(files);
                e.target.value = "";
                if (done.length === 1) onSelect(done[0]);
              }}
            />
            <AdminButton variant="primary" disabled={busy || storage === "unavailable"} onClick={() => fileRef.current?.click()}>
              {busy ? status : `Nieuwe ${noun.one} uploaden`}
            </AdminButton>
            <AdminButton onClick={onClose}>Sluiten</AdminButton>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {storage === "unavailable" && (
              <div className="mb-4">
                <Notice tone="warning">Uploaden kan pas als Vercel Blob-opslag aan het project is gekoppeld.</Notice>
              </div>
            )}
            {filtered.length === 0 ? (
              <p className="py-16 text-center text-sm text-zinc-500">
                {items.length ? `Geen ${noun.many} gevonden.` : `Nog geen ${noun.many}. Upload je eerste ${noun.one}.`}
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filtered.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(m)}
                      className="group block w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 text-left transition hover:border-zinc-900 focus-visible:outline-2 focus-visible:outline-[#fece00]"
                    >
                      <MediaThumb item={m} className="aspect-square" />
                      <span className="block truncate px-2.5 py-2 text-xs text-zinc-600">{m.alt || m.filename}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

function MediaInput({ value, onChange, label, kind }: { value: string | null; onChange: (id: string | null) => void; label: string; kind: MediaKind }) {
  const { get } = useMediaRegistry();
  const [open, setOpen] = useState(false);
  const found = get(value);
  const media = found && kindOf(found) === kind ? found : null;
  const noun = kind === "video" ? "video" : "afbeelding";
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[repeating-conic-gradient(#e4e4e7_0_25%,#fff_0_50%)] bg-[length:16px_16px]">
        {media ? <MediaThumb item={media} className="h-full w-full" /> : <span className="text-xs text-zinc-400">Geen {noun}</span>}
      </div>
      <div className="min-w-0 flex-1">
        {media ? (
          <>
            <p className="truncate text-sm font-medium text-zinc-800">{media.alt || media.filename}</p>
            {!media.alt && <p className="text-xs text-amber-700">Geen omschrijving. Voeg die toe bij Foto’s en video’s.</p>}
          </>
        ) : value ? (
          <p className="text-sm text-red-600">Deze {noun} bestaat niet meer.</p>
        ) : (
          <p className="text-sm text-zinc-500">Nog geen {noun} gekozen.</p>
        )}
        <div className="mt-2 flex gap-2">
          <AdminButton onClick={() => setOpen(true)} aria-label={`${label}: ${noun} kiezen`}>
            {value ? "Andere kiezen" : kind === "video" ? "Video kiezen" : "Afbeelding kiezen"}
          </AdminButton>
          {value && (
            <AdminButton variant="ghost" onClick={() => onChange(null)}>
              Verwijderen
            </AdminButton>
          )}
        </div>
      </div>
      <MediaPickerDialog
        kind={kind}
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(m) => {
          onChange(m.id);
          setOpen(false);
        }}
      />
    </div>
  );
}

export function ImageInput(props: { value: string | null; onChange: (id: string | null) => void; label: string }) {
  return <MediaInput {...props} kind="image" />;
}

export function VideoInput(props: { value: string | null; onChange: (id: string | null) => void; label: string }) {
  return <MediaInput {...props} kind="video" />;
}

export function ImagesInput({ value, onChange, max = 12 }: { value: string[]; onChange: (ids: string[]) => void; max?: number }) {
  const { get } = useMediaRegistry();
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {value.map((id, i) => {
          const m = get(id);
          return (
            <li key={id + i} className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-200">
              {m && <MediaThumb item={m} className="h-full w-full" />}
              <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                <button type="button" className="rounded bg-white/90 px-1.5 text-xs" aria-label="Naar links" disabled={i === 0} onClick={() => { const n = [...value]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }}>←</button>
                <button type="button" className="rounded bg-white/90 px-1.5 text-xs text-red-700" aria-label="Verwijderen" onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button>
                <button type="button" className="rounded bg-white/90 px-1.5 text-xs" aria-label="Naar rechts" disabled={i === value.length - 1} onClick={() => { const n = [...value]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; onChange(n); }}>→</button>
              </div>
            </li>
          );
        })}
        {value.length < max && (
          <li>
            <button type="button" onClick={() => setOpen(true)} className="flex aspect-square w-full items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 text-sm font-medium text-zinc-600 hover:border-zinc-900">
              + Toevoegen
            </button>
          </li>
        )}
      </ul>
      <MediaPickerDialog open={open} onClose={() => setOpen(false)} onSelect={(m) => { onChange([...value, m.id]); setOpen(false); }} />
    </div>
  );
}
