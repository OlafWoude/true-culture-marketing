// Field definitions drive the admin forms, the server-side validation and the defaults.
// This module is shared by client and server code, so it must stay free of server imports.

export type LinkValue =
  | { kind: "none" }
  | { kind: "page"; pageId: string; anchor?: string }
  | { kind: "url"; href: string; newTab?: boolean };

export type CtaValue = { label: string; link: LinkValue };

type Base = { key: string; label: string; help?: string };

export type FieldDef =
  | (Base & { type: "text"; max?: number; placeholder?: string; required?: boolean })
  | (Base & { type: "textarea"; max?: number; rows?: number; placeholder?: string })
  | (Base & { type: "richtext"; minimal?: boolean })
  | (Base & { type: "image" })
  | (Base & { type: "images"; max?: number })
  | (Base & { type: "video" })
  | (Base & { type: "link" })
  | (Base & { type: "cta" })
  | (Base & { type: "boolean" })
  | (Base & { type: "select"; options: { value: string; label: string }[] })
  | (Base & { type: "number"; min: number; max: number; step: number; unit?: string; control?: "slider" | "input" })
  | (Base & { type: "color" })
  | (Base & { type: "stringList"; itemLabel: string; max?: number })
  | (Base & { type: "repeater"; itemLabel: string; fields: FieldDef[]; titleKey?: string; max?: number })
  | (Base & { type: "group"; fields: FieldDef[] });

export type Values = Record<string, unknown>;

export function emptyValue(field: FieldDef): unknown {
  switch (field.type) {
    case "text":
    case "textarea":
    case "richtext":
      return "";
    case "image":
    case "video":
      return null;
    case "images":
    case "stringList":
    case "repeater":
      return [];
    case "link":
      return { kind: "none" } satisfies LinkValue;
    case "cta":
      return { label: "", link: { kind: "none" } } satisfies CtaValue;
    case "boolean":
      return false;
    case "select":
      return field.options[0]?.value ?? "";
    case "number":
      return field.min;
    case "color":
      return "#000000";
    case "group":
      return defaultsFor(field.fields);
  }
}

export function defaultsFor(fields: FieldDef[]): Values {
  return Object.fromEntries(fields.map((f) => [f.key, emptyValue(f)]));
}

/** Fills in missing keys (e.g. after a field was added to a block) without touching existing values. */
export function withDefaults(fields: FieldDef[], data: unknown): Values {
  const src = (data && typeof data === "object" ? data : {}) as Values;
  const out: Values = {};
  for (const f of fields) {
    const v = src[f.key];
    if (v === undefined) {
      out[f.key] = emptyValue(f);
    } else if (f.type === "group") {
      out[f.key] = withDefaults(f.fields, v);
    } else if (f.type === "repeater" && Array.isArray(v)) {
      out[f.key] = v.map((item) => ({ ...withDefaults(f.fields, item), _key: (item as Values)?._key }));
    } else {
      out[f.key] = v;
    }
  }
  return out;
}

export const pageLink = (pageId: string, anchor?: string): LinkValue =>
  anchor ? { kind: "page", pageId, anchor } : { kind: "page", pageId };

export const cta = (label: string, link: LinkValue): CtaValue => ({ label, link });

export const backgroundOptions = [
  { value: "white", label: "Wit" },
  { value: "light", label: "Lichtgrijs" },
  { value: "dark", label: "Zwart" },
];
