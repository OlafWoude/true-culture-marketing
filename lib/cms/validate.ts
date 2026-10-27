import "server-only";
import { z } from "zod";
import type { FieldDef } from "./fields";
import { blockDefs, isBlockType, type BlockDef, type Section } from "./blocks";
import { collectionDefs, pageFields, singletonDefs, type CollectionType, type SingletonType } from "./documents";
import { isSafeHref, sanitizeRichText } from "./sanitize";

const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

const linkSchema = z.union([
  z.object({ kind: z.literal("none") }),
  z.object({
    kind: z.literal("page"),
    pageId: uuid,
    anchor: z
      .string()
      .max(60)
      .regex(/^[a-z0-9-]*$/, "Ankers bevatten alleen kleine letters, cijfers en streepjes")
      .optional(),
  }),
  z.object({
    kind: z.literal("url"),
    href: z
      .string()
      .trim()
      .max(500)
      .refine(isSafeHref, "Gebruik een link die begint met https://, mailto:, tel: of /"),
    newTab: z.boolean().optional(),
  }),
]);

function text(max: number, label?: string) {
  return z.string().max(max, `${label ? `${label}: m` : "M"}aximaal ${max} tekens`);
}

export function schemaForField(field: FieldDef): z.ZodType {
  switch (field.type) {
    case "text":
      return text(field.max ?? 300, field.label);
    case "textarea":
      return text(field.max ?? 2000, field.label);
    case "richtext":
      return z.string().max(40000, `${field.label}: de tekst is te lang`).transform(sanitizeRichText);
    case "image":
      return uuid.nullable();
    case "images":
      return z.array(uuid).max(field.max ?? 20, `${field.label}: maximaal ${field.max ?? 20} afbeeldingen`);
    case "link":
      return linkSchema;
    case "cta":
      return z.object({ label: text(60, `${field.label} (knoptekst)`), link: linkSchema });
    case "boolean":
      return z.boolean();
    case "select":
      return z.enum(field.options.map((o) => o.value) as [string, ...string[]]);
    case "number":
      return z
        .number()
        .min(field.min, `${field.label}: minimaal ${field.min}`)
        .max(field.max, `${field.label}: maximaal ${field.max}`);
    case "color":
      return z.string().regex(/^#[0-9a-fA-F]{6}$/, `${field.label}: gebruik een kleurcode zoals #fece00`);
    case "stringList":
      return z.array(text(200, field.itemLabel)).max(field.max ?? 30, `${field.label}: maximaal ${field.max ?? 30} regels`);
    case "repeater":
      return z
        .array(objectSchema(field.fields).extend({ _key: z.string().max(60).optional() }))
        .max(field.max ?? 50, `${field.label}: maximaal ${field.max ?? 50} items`);
    case "group":
      return objectSchema(field.fields);
  }
}

export function objectSchema(fields: FieldDef[]) {
  return z.object(Object.fromEntries(fields.map((f) => [f.key, schemaForField(f)])));
}

const sectionSchema = z
  .object({
    id: z.string().min(1).max(80),
    type: z.string().refine(isBlockType, "Onbekend sectietype"),
    hidden: z.boolean(),
    data: z.record(z.string(), z.unknown()),
  })
  .transform((s, ctx) => {
    const def: BlockDef = blockDefs[s.type as keyof typeof blockDefs];
    const parsed = objectSchema(def.fields).safeParse(s.data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        ctx.addIssue({ code: "custom", message: `${def.label}: ${issue.message}`, path: ["data", ...issue.path] });
      }
      return z.NEVER;
    }
    return { ...s, data: parsed.data } as Section;
  });

export const RESERVED_SLUGS = new Set([
  "admin", "api", "preview", "cases", "media", "brand", "_next", "sitemap.xml", "robots.txt",
  "favicon.ico", "icon.png", "apple-icon.png", "opengraph-image.jpg",
]);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$|^$/, "Gebruik alleen kleine letters, cijfers, streepjes en eventueel /")
  .refine((s) => !RESERVED_SLUGS.has(s.split("/")[0]), "Deze URL is gereserveerd voor het systeem");

export const pageDocSchema = objectSchema(pageFields).extend({
  title: z.string().trim().min(1, "Geef de pagina een titel").max(120),
  slug: slugSchema,
  sections: z.array(sectionSchema).max(60),
});

export function collectionSchema(type: CollectionType) {
  const base = objectSchema(collectionDefs[type].fields as unknown as FieldDef[]);
  if (type === "service") {
    return base.extend({
      title: z.string().trim().min(1, "Geef de dienst een naam").max(80),
      anchor: z.string().trim().toLowerCase().max(60).regex(/^[a-z0-9-]*$/, "Alleen kleine letters, cijfers en streepjes"),
    });
  }
  if (type === "case") {
    return base.extend({
      title: z.string().trim().min(1, "Geef de case een titel").max(120),
      slug: z.string().trim().toLowerCase().min(1, "Vul een URL-naam in").max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Alleen kleine letters, cijfers en streepjes"),
    });
  }
  return base.extend({ name: z.string().trim().min(1, "Vul een naam in").max(80) });
}

export function singletonSchema(type: SingletonType) {
  const base = objectSchema(singletonDefs[type].fields as unknown as FieldDef[]);
  if (type === "settings") {
    return base.extend({
      siteUrl: z.union([z.literal(""), z.string().trim().url("Gebruik een volledige URL, bijv. https://trueculture.nl").max(120)]),
      contact: z.object({
        email: z.union([z.literal(""), z.string().trim().email("Ongeldig e-mailadres")]),
        phone: z.string().trim().max(30).regex(/^[0-9+()\s-]*$/, "Ongeldig telefoonnummer"),
        whatsapp: z.string().trim().max(30).regex(/^[0-9+()\s-]*$/, "Ongeldig WhatsApp-nummer"),
      }),
      socials: z
        .array(z.object({ platform: z.string().max(30), url: z.string().trim().max(300).refine((u) => /^https:\/\//.test(u), "Gebruik een volledige https://-link"), _key: z.string().optional() }))
        .max(8),
    });
  }
  if (type === "forms") {
    return base.extend({
      recipientEmail: z.union([z.literal(""), z.string().trim().email("Ongeldig e-mailadres")]),
    });
  }
  return base;
}

export function formatIssues(error: z.ZodError): string {
  const first = error.issues.slice(0, 3).map((i) => i.message);
  return first.join(" · ");
}
