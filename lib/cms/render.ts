import { VACANCY_BASE, withVacancy } from "@/lib/vacancy-link";
import type { LinkValue } from "./fields";
import type { Bundle, MediaInfo } from "./types";

type Service = Bundle["services"][number];

export type RenderCtx = {
  bundle: Bundle;
  /** The vacancy whose page is being rendered; links to the application form then mention it. */
  vacancy: Service | null;
  /** Empty photo and video slots show a placeholder (always in preview, live only when the setting is on). */
  showPlaceholders: boolean;
  href: (link: LinkValue | null | undefined) => string | null;
  isExternal: (link: LinkValue | null | undefined) => boolean;
  media: (id: string | null | undefined) => MediaInfo | null;
  pagePath: (pageId: string) => string | null;
  /** The vacancy's own button link, falling back to its own page. */
  serviceHref: (service: Service) => string | null;
  /** Where to apply for this vacancy: its own button link, else the application form, both mentioning the vacancy. */
  applyHref: (service: Service) => string | null;
  /** Whether a link leads to the application form. */
  isFormLink: (link: LinkValue | null | undefined) => boolean;
  /** The vacancy's own page (for "read more" style links), also inside the preview. */
  serviceDetailHref: (service: Service) => string;
};

const slugify = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** The URL name of a vacancy: its own setting, or derived from the job title. */
export function serviceSlug(service: Pick<Service, "anchor" | "title">) {
  return service.anchor || slugify(service.title);
}

export function vacancyPath(service: Pick<Service, "anchor" | "title">) {
  return `${VACANCY_BASE}/${serviceSlug(service)}`;
}

export function pathForSlug(slug: string) {
  return slug ? `/${slug}` : "/";
}

export function createRenderCtx(bundle: Bundle, options: { vacancy?: Service } = {}): RenderCtx {
  const pages = new Map(bundle.pages.map((p) => [p.id, p]));
  // In preview mode internal links stay inside the preview.
  const pagePath = (pageId: string) => {
    const page = pages.get(pageId);
    if (!page) return null;
    return bundle.mode === "preview" ? `/preview/${page.id}` : pathForSlug(page.slug);
  };
  // Pages with the application form: a link there can say which vacancy someone applies for.
  const formPages = bundle.pages.filter((p) => p.sections.some((s) => s.type === "contactHero" && !s.hidden));
  const formPageIds = new Set(formPages.map((p) => p.id));
  const isFormLink = (link: LinkValue | null | undefined) => link?.kind === "page" && formPageIds.has(link.pageId);
  const linkHref = (link: LinkValue | null | undefined, vacancy: Service | null) => {
    if (!link) return null;
    if (link.kind === "page") {
      const base = pagePath(link.pageId);
      if (!base) return null;
      const path = vacancy && formPageIds.has(link.pageId) ? withVacancy(base, serviceSlug(vacancy)) : base;
      return link.anchor ? `${path}#${link.anchor}` : path;
    }
    if (link.kind === "url") return link.href || null;
    return null;
  };
  const vacancy = options.vacancy ?? null;
  const href = (link: LinkValue | null | undefined) => linkHref(link, vacancy);
  const serviceDetailHref = (service: Service) =>
    bundle.mode === "preview" ? `/preview/${service.id}` : vacancyPath(service);
  const applyHref = (service: Service) => {
    const own = linkHref(service.cta?.link, service);
    if (own) return own;
    const form = formPages[0] ? pagePath(formPages[0].id) : null;
    return form ? withVacancy(form, serviceSlug(service)) : null;
  };

  return {
    bundle,
    vacancy,
    showPlaceholders: bundle.mode === "preview" || bundle.settings.showMediaPlaceholders,
    href,
    isExternal: (link) => link?.kind === "url" && (Boolean(link.newTab) || /^https?:\/\//.test(link.href)),
    media: (id) => (id ? (bundle.media[id] ?? null) : null),
    pagePath,
    serviceHref: (service) => linkHref(service.cta?.link, service) ?? serviceDetailHref(service),
    serviceDetailHref,
    applyHref,
    isFormLink,
  };
}
