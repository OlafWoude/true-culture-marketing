import { blockDefs, blockDefaults, isBlockType, type Section } from "./blocks";
import { withDefaults, type FieldDef } from "./fields";
import {
  collectionDefs,
  emptySeo,
  seoFields,
  singletonDefs,
  type CollectionType,
  type PageDoc,
  type SingletonType,
} from "./documents";
import {
  seedFooter,
  seedForms,
  seedNavigation,
  seedSettings,
  seedTheme,
} from "./seed";

export function normalizeSection(raw: unknown): Section | null {
  const s = raw as Partial<Section> | null;
  if (!s || !isBlockType(s.type)) return null;
  const fields = blockDefs[s.type].fields as FieldDef[];
  return {
    id: String(s.id ?? crypto.randomUUID()),
    type: s.type,
    hidden: Boolean(s.hidden),
    data: withDefaults(fields, { ...blockDefaults(s.type), ...(s.data ?? {}) }),
  };
}

export function normalizePage(raw: unknown): PageDoc {
  const p = (raw ?? {}) as Partial<PageDoc>;
  return {
    title: String(p.title ?? ""),
    slug: String(p.slug ?? ""),
    seo: withDefaults(seoFields, { ...emptySeo(), ...(p.seo ?? {}) }) as PageDoc["seo"],
    sections: (Array.isArray(p.sections) ? p.sections : [])
      .map(normalizeSection)
      .filter((s): s is Section => s !== null),
  };
}

export function normalizeCollection<T>(type: CollectionType, raw: unknown): T {
  return withDefaults(collectionDefs[type].fields as unknown as FieldDef[], raw) as T;
}

const singletonSeeds = {
  settings: seedSettings,
  navigation: seedNavigation,
  footer: seedFooter,
  forms: seedForms,
  theme: seedTheme,
} satisfies Record<SingletonType, () => unknown>;

export function seedSingleton(type: SingletonType) {
  return singletonSeeds[type]();
}

/** Missing values fall back to the original site defaults, never to empty strings. */
export function normalizeSingleton<T>(type: SingletonType, raw: unknown): T {
  const defaults = seedSingleton(type) as Record<string, unknown>;
  const merged = deepMerge(defaults, (raw ?? {}) as Record<string, unknown>);
  return withDefaults(singletonDefs[type].fields as unknown as FieldDef[], merged) as T;
}

function deepMerge(base: Record<string, unknown>, over: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(over)) {
    const b = base[k];
    if (v && typeof v === "object" && !Array.isArray(v) && b && typeof b === "object" && !Array.isArray(b)) {
      out[k] = deepMerge(b as Record<string, unknown>, v as Record<string, unknown>);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}
