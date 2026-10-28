// Shared by the server and the browser: how links carry the vacancy someone is applying for.

/** Every vacancy has its own page under this path, e.g. /vacatures/deur-aan-deur. */
export const VACANCY_BASE = "/vacatures";

/** Query parameter that tells the application form which vacancy someone is applying for. */
export const VACANCY_PARAM = "vacature";

export function withVacancy(href: string, slug: string) {
  const [path, hash] = href.split("#");
  const query = `${VACANCY_PARAM}=${encodeURIComponent(slug)}`;
  return `${path}${path.includes("?") ? "&" : "?"}${query}${hash ? `#${hash}` : ""}`;
}

/** The vacancy whose page is open, read from a path like /vacatures/deur-aan-deur. */
export function vacancyFromPath(pathname: string) {
  return /^\/vacatures\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/.exec(pathname)?.[1] ?? null;
}
