// Client-safe types for the data the public renderer and the admin share.
import type {
  CaseDoc,
  CollectionType,
  Footer,
  FormsConfig,
  Navigation,
  PageDoc,
  ServiceDoc,
  Settings,
  SingletonType,
  TestimonialDoc,
  Theme,
} from "./documents";

export type DocType = "page" | CollectionType | SingletonType;
export type DocStatus = "draft" | "published" | "offline";

export type MediaInfo = {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  focalX: number;
  focalY: number;
};

export type BundlePage = PageDoc & { id: string; systemKey: string | null; updatedAt: string };
export type WithId<T> = T & { id: string };

export type Bundle = {
  mode: "live" | "preview";
  source: "database" | "seed";
  pages: BundlePage[];
  services: WithId<ServiceDoc>[];
  cases: WithId<CaseDoc>[];
  testimonials: WithId<TestimonialDoc>[];
  settings: Settings;
  navigation: Navigation;
  footer: Footer;
  forms: FormsConfig;
  theme: Theme;
  media: Record<string, MediaInfo>;
};

export type DocSummary = {
  id: string;
  type: DocType;
  title: string;
  slug: string | null;
  status: DocStatus;
  hasChanges: boolean;
  systemKey: string | null;
  sortOrder: number;
  updatedAt: string;
  publishedAt: string | null;
  deletedAt: string | null;
};

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string };
