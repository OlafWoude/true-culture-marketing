"use client";

import { useId, useState } from "react";
import { defaultsFor, type CtaValue, type FieldDef, type LinkValue, type Values } from "@/lib/cms/fields";
import { useAdminData } from "../AdminContext";
import { ImageInput, ImagesInput, VideoInput } from "../media/MediaPicker";
import { FieldLabel, Input, Select, Switch, Textarea } from "../ui";
import RichTextEditor from "./RichTextEditor";

type OnChange = (values: Values) => void;

const move = <T,>(list: T[], from: number, to: number) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

function SmallBtn({ label, onClick, disabled, children, danger }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md px-2 py-1 text-sm transition disabled:opacity-30 ${danger ? "text-red-700 hover:bg-red-50" : "text-zinc-600 hover:bg-zinc-200"}`}
    >
      {children}
    </button>
  );
}

export function LinkInput({ value, onChange, idPrefix }: { value: LinkValue; onChange: (v: LinkValue) => void; idPrefix: string }) {
  const { pages } = useAdminData();
  const link = value ?? { kind: "none" };
  const missingPage = link.kind === "page" && !pages.some((p) => p.id === link.pageId);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Select
          id={`${idPrefix}-kind`}
          aria-label="Soort link"
          className="w-auto"
          value={link.kind}
          onChange={(e) => {
            const kind = e.target.value as LinkValue["kind"];
            onChange(kind === "page" ? { kind, pageId: pages[0]?.id ?? "" } : kind === "url" ? { kind, href: "" } : { kind: "none" });
          }}
        >
          <option value="none">Geen link</option>
          <option value="page">Pagina op deze website</option>
          <option value="url">Webadres, e-mail of telefoon</option>
        </Select>
        {link.kind === "page" && (
          <>
            <Select aria-label="Pagina" className="w-auto min-w-48 flex-1" value={link.pageId} onChange={(e) => onChange({ ...link, pageId: e.target.value })}>
              {missingPage && <option value={link.pageId}>⚠ Pagina bestaat niet meer</option>}
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.slug ? `/${p.slug}` : "/"}){p.status !== "published" ? " – niet gepubliceerd" : ""}
                </option>
              ))}
            </Select>
            <Input
              aria-label="Anker (optioneel)"
              placeholder="#anker (optioneel)"
              className="w-40"
              value={link.anchor ?? ""}
              onChange={(e) => {
                const anchor = e.target.value.replace(/^#/, "").toLowerCase().replace(/[^a-z0-9-]/g, "");
                onChange(anchor ? { ...link, anchor } : { kind: "page", pageId: link.pageId });
              }}
            />
          </>
        )}
        {link.kind === "url" && (
          <Input aria-label="Webadres" placeholder="https://… of mailto:…" className="min-w-56 flex-1" value={link.href} onChange={(e) => onChange({ ...link, href: e.target.value })} />
        )}
      </div>
      {link.kind === "url" && (
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" checked={Boolean(link.newTab)} onChange={(e) => onChange({ ...link, newTab: e.target.checked })} />
          Openen in een nieuw tabblad
        </label>
      )}
      {link.kind === "page" && pages.find((p) => p.id === link.pageId)?.status !== "published" && !missingPage && (
        <p className="text-xs text-amber-700">Deze pagina is niet gepubliceerd; de link wordt pas zichtbaar als de pagina live staat.</p>
      )}
      {missingPage && <p className="text-xs text-red-600">De gekoppelde pagina bestaat niet meer. Kies een andere pagina.</p>}
    </div>
  );
}

function StringList({ value, onChange, itemLabel, max = 30 }: { value: string[]; onChange: (v: string[]) => void; itemLabel: string; max?: number }) {
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <Input aria-label={`${itemLabel} ${i + 1}`} value={item} onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))} />
          <SmallBtn label="Omhoog" disabled={i === 0} onClick={() => onChange(move(value, i, i - 1))}>↑</SmallBtn>
          <SmallBtn label="Omlaag" disabled={i === value.length - 1} onClick={() => onChange(move(value, i, i + 1))}>↓</SmallBtn>
          <SmallBtn label="Verwijderen" danger onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</SmallBtn>
        </div>
      ))}
      {value.length < max && (
        <button type="button" onClick={() => onChange([...value, ""])} className="text-sm font-semibold text-zinc-700 underline underline-offset-4 hover:text-zinc-950">
          + {itemLabel} toevoegen
        </button>
      )}
    </div>
  );
}

function Repeater({ field, value, onChange }: { field: Extract<FieldDef, { type: "repeater" }>; value: Values[]; onChange: (v: Values[]) => void }) {
  const [open, setOpen] = useState<number | null>(value.length === 1 ? 0 : null);
  const max = field.max ?? 50;
  return (
    <div className="space-y-2">
      {value.map((item, i) => {
        const title = String((field.titleKey && item[field.titleKey]) || `${field.itemLabel} ${i + 1}`);
        const isOpen = open === i;
        return (
          <div key={String(item._key ?? i)} className="rounded-xl border border-zinc-200 bg-white">
            <div className="flex items-center gap-1 px-3 py-2">
              <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex flex-1 items-center gap-2 truncate text-left text-sm font-semibold text-zinc-800">
                <span aria-hidden="true" className={`inline-block text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
                <span className="truncate">{title}</span>
                {item.visible === false && <span className="rounded bg-zinc-100 px-1.5 text-xs font-normal text-zinc-500">verborgen</span>}
              </button>
              <SmallBtn label="Omhoog" disabled={i === 0} onClick={() => { onChange(move(value, i, i - 1)); setOpen(i - 1); }}>↑</SmallBtn>
              <SmallBtn label="Omlaag" disabled={i === value.length - 1} onClick={() => { onChange(move(value, i, i + 1)); setOpen(i + 1); }}>↓</SmallBtn>
              <SmallBtn label="Dupliceren" disabled={value.length >= max} onClick={() => { const copy = { ...structuredClone(item), _key: crypto.randomUUID() }; onChange([...value.slice(0, i + 1), copy, ...value.slice(i + 1)]); setOpen(i + 1); }}>⧉</SmallBtn>
              <SmallBtn label="Verwijderen" danger onClick={() => { onChange(value.filter((_, j) => j !== i)); setOpen(null); }}>✕</SmallBtn>
            </div>
            {isOpen && (
              <div className="border-t border-zinc-200 p-4">
                <FieldList fields={field.fields} values={item} onChange={(v) => onChange(value.map((x, j) => (j === i ? { ...v, _key: x._key } : x)))} />
              </div>
            )}
          </div>
        );
      })}
      {value.length < max && (
        <button
          type="button"
          onClick={() => {
            const fresh = { ...defaultsFor(field.fields), _key: crypto.randomUUID() } as Values;
            if (field.fields.some((f) => f.key === "visible")) fresh.visible = true;
            onChange([...value, fresh]);
            setOpen(value.length);
          }}
          className="w-full rounded-xl border-2 border-dashed border-zinc-300 px-3 py-2.5 text-sm font-semibold text-zinc-700 hover:border-zinc-900"
        >
          + {field.itemLabel} toevoegen
        </button>
      )}
    </div>
  );
}

function NumberInput({ field, value, onChange, id }: { field: Extract<FieldDef, { type: "number" }>; value: number; onChange: (v: number) => void; id: string }) {
  // Amounts are typed in; a slider only suits small ranges such as sizes and percentages.
  if (field.control === "input") {
    return (
      <div className="flex items-center gap-3">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          onChange={(e) => onChange(Math.min(field.max, Math.max(field.min, Number(e.target.value) || 0)))}
          className="w-40"
        />
        {field.unit && <span className="text-sm text-zinc-600">{field.unit}</span>}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <input id={id} type="range" min={field.min} max={field.max} step={field.step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 accent-[#050505]" />
      <span className="w-20 text-right text-sm tabular-nums text-zinc-700">
        {value}
        {field.unit ? ` ${field.unit}` : ""}
      </span>
    </div>
  );
}

function ColorInput({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  const [text, setText] = useState(value);
  const valid = /^#[0-9a-fA-F]{6}$/.test(text);
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label="Kies een kleur"
        value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value);
        }}
        className="h-10 w-14 cursor-pointer rounded-lg border border-zinc-300 bg-white p-1"
      />
      <Input
        id={id}
        value={text}
        maxLength={7}
        className={`w-32 font-mono ${valid ? "" : "border-red-400"}`}
        onChange={(e) => {
          setText(e.target.value);
          if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(e.target.value.toLowerCase());
        }}
      />
    </div>
  );
}

function Field({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const id = useId();
  switch (field.type) {
    case "text": {
      const v = String(value ?? "");
      return (
        <FieldLabel htmlFor={id} label={field.label} help={field.help} count={field.max ? { value: v.length, max: field.max } : undefined}>
          <Input id={id} value={v} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
        </FieldLabel>
      );
    }
    case "textarea": {
      const v = String(value ?? "");
      return (
        <FieldLabel htmlFor={id} label={field.label} help={field.help} count={field.max ? { value: v.length, max: field.max } : undefined}>
          <Textarea id={id} rows={field.rows ?? 4} value={v} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
        </FieldLabel>
      );
    }
    case "richtext":
      return (
        <FieldLabel htmlFor={id} label={field.label} help={field.help}>
          <RichTextEditor id={id} value={String(value ?? "")} onChange={onChange} minimal={field.minimal} />
        </FieldLabel>
      );
    case "image":
      return (
        <FieldLabel label={field.label} help={field.help}>
          <ImageInput value={(value as string | null) ?? null} onChange={onChange} label={field.label} />
        </FieldLabel>
      );
    case "video":
      return (
        <FieldLabel label={field.label} help={field.help}>
          <VideoInput value={(value as string | null) ?? null} onChange={onChange} label={field.label} />
        </FieldLabel>
      );
    case "images":
      return (
        <FieldLabel label={field.label} help={field.help}>
          <ImagesInput value={(value as string[]) ?? []} onChange={onChange} max={field.max} />
        </FieldLabel>
      );
    case "link":
      return (
        <FieldLabel label={field.label} help={field.help}>
          <LinkInput idPrefix={id} value={value as LinkValue} onChange={onChange} />
        </FieldLabel>
      );
    case "cta": {
      const v = (value as CtaValue) ?? { label: "", link: { kind: "none" } };
      return (
        <fieldset className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
          <legend className="px-1 text-sm font-semibold text-zinc-800">{field.label}</legend>
          {field.help && <p className="mb-3 text-xs text-zinc-500">{field.help}</p>}
          <div className="space-y-3">
            <FieldLabel htmlFor={`${id}-label`} label="Tekst op de knop" count={{ value: v.label.length, max: 60 }}>
              <Input id={`${id}-label`} value={v.label} onChange={(e) => onChange({ ...v, label: e.target.value })} />
            </FieldLabel>
            <FieldLabel label="Waar gaat de knop naartoe?">
              <LinkInput idPrefix={id} value={v.link} onChange={(link) => onChange({ ...v, link })} />
            </FieldLabel>
          </div>
        </fieldset>
      );
    }
    case "boolean":
      return (
        <div>
          <Switch id={id} checked={Boolean(value)} onChange={onChange} label={field.label} />
          {field.help && <p className="mt-1.5 text-xs text-zinc-500">{field.help}</p>}
        </div>
      );
    case "select":
      return (
        <FieldLabel htmlFor={id} label={field.label} help={field.help}>
          <Select id={id} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </FieldLabel>
      );
    case "number":
      return (
        <FieldLabel htmlFor={id} label={field.label} help={field.help}>
          <NumberInput id={id} field={field} value={Number(value ?? field.min)} onChange={onChange} />
        </FieldLabel>
      );
    case "color":
      return (
        <FieldLabel htmlFor={id} label={field.label} help={field.help}>
          <ColorInput id={id} value={String(value ?? "#000000")} onChange={onChange} />
        </FieldLabel>
      );
    case "stringList":
      return (
        <FieldLabel label={field.label} help={field.help}>
          <StringList value={(value as string[]) ?? []} onChange={onChange} itemLabel={field.itemLabel} max={field.max} />
        </FieldLabel>
      );
    case "repeater":
      return (
        <FieldLabel label={field.label} help={field.help}>
          <Repeater field={field} value={(value as Values[]) ?? []} onChange={onChange} />
        </FieldLabel>
      );
    case "group":
      return (
        <fieldset className="rounded-2xl border border-zinc-200 p-5">
          <legend className="px-1 text-base font-bold text-zinc-900">{field.label}</legend>
          {field.help && <p className="mb-4 text-sm text-zinc-500">{field.help}</p>}
          <FieldList fields={field.fields} values={(value as Values) ?? {}} onChange={onChange} />
        </fieldset>
      );
  }
}

export function FieldList({ fields, values, onChange }: { fields: FieldDef[]; values: Values; onChange: OnChange }) {
  return (
    <div className="space-y-5">
      {fields.map((f) => (
        <Field key={f.key} field={f} value={values[f.key]} onChange={(v) => onChange({ ...values, [f.key]: v })} />
      ))}
    </div>
  );
}
