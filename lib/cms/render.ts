import type { LinkValue } from "./fields";
import type { Bundle, MediaInfo } from "./types";

export type RenderCtx = {
  bundle: Bundle;
  href: (link: LinkValue | null | undefined) => string | null;
  isExternal: (link: LinkValue | null | undefined) => boolean;
  media: (id: string | null | undefined) => MediaInfo | null;
  pagePath: (pageId: string) => string | null;
  serviceHref: (service: Bundle["services"][number]) => string | null;
};

export function pathForSlug(slug: string) {
  return slug ? `/${slug}` : "/";
}

export function createRenderCtx(bundle: Bundle): RenderCtx {
  const pages = new Map(bundle.pages.map((p) => [p.id, p]));
  const pagePath = (pageId: string) => {
    const page = pages.get(pageId);
    return page ? pathForSlug(page.slug) : null;
  };
  const href = (link: LinkValue | null | undefined) => {
    if (!link) return null;
    if (link.kind === "page") {
      const base = pagePath(link.pageId);
      if (!base) return null;
      return link.anchor ? `${base}#${link.anchor}` : base;
    }
    if (link.kind === "url") return link.href || null;
    return null;
  };
  const servicesPage = bundle.pages.find((p) =>
    p.sections.some((s) => s.type === "servicesDetailed" && !s.hidden),
  );

  return {
    bundle,
    href,
    isExternal: (link) => link?.kind === "url" && (Boolean(link.newTab) || /^https?:\/\//.test(link.href)),
    media: (id) => (id ? (bundle.media[id] ?? null) : null),
    pagePath,
    serviceHref: (service) => {
      const own = href(service.cta?.link);
      if (own) return own;
      if (!servicesPage) return null;
      const base = pathForSlug(servicesPage.slug);
      return service.anchor ? `${base}#${service.anchor}` : base;
    },
  };
}
