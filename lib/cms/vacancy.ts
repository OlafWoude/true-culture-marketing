import "server-only";
import type { Metadata } from "next";
import { employmentTypes } from "./documents";
import { buildMetadata, siteUrl } from "./metadata";
import { pathForSlug, vacancyPath } from "./render";
import type { Bundle, BundleService } from "./types";

/** "Groningen, Friesland en Drenthe". */
export function joinDutch(items: string[]) {
  return items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} en ${items[items.length - 1]}`;
}

/** The provinces of the work areas (or the places, where no province is filled in). */
export function regionsText(service: BundleService) {
  return joinDutch([...new Set(service.locations.map((l) => l.region.trim() || l.city.trim()).filter(Boolean))]);
}

export function employmentLabel(value: string) {
  return value === "OTHER" ? "" : (employmentTypes.find((t) => t.value === value)?.label ?? "");
}

export const jobTitleOf = (service: BundleService) => service.jobTitle.trim() || service.title;

/** The page with the list of all vacancies, for breadcrumbs. */
export function vacanciesPage(bundle: Bundle) {
  return bundle.pages.find((p) => p.sections.some((s) => s.type === "servicesDetailed" && !s.hidden)) ?? null;
}

export function vacancyMetadata(bundle: Bundle, service: BundleService): Metadata {
  const jobTitle = jobTitleOf(service);
  // "Vacature promotor deur-aan-deur", keeping abbreviations such as "HR-medewerker" intact.
  const name = /^\p{Lu}\p{Ll}/u.test(jobTitle) ? jobTitle.charAt(0).toLowerCase() + jobTitle.slice(1) : jobTitle;
  return buildMetadata(bundle, {
    title: `Vacature ${name}`,
    seo: { ...service.seo, description: service.seo.description || service.short },
    path: vacancyPath(service),
    // Drawn per vacancy by opengraph-image.tsx next to the page.
    generatedImage: true,
  });
}

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Plain text with blank lines between paragraphs. */
export const paragraphsOf = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

function descriptionHtml(service: BundleService) {
  const paragraphs = (text: string) => paragraphsOf(text).map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("");
  const list = (title: string, items: string[]) => {
    const filled = items.map((i) => i.trim()).filter(Boolean);
    return filled.length ? `<p><strong>${title}</strong></p><ul>${filled.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>` : "";
  };
  return [
    paragraphs(service.short),
    paragraphs(service.description),
    list("Wat je doet", service.points),
    list("Wat we vragen", service.requirements),
    list("Wat je krijgt", service.offer),
    service.payText ? `<p><strong>Beloning:</strong> ${escapeHtml(service.payText)}</p>` : "",
  ].join("");
}

/**
 * Google's job posting data (https://developers.google.com/search/docs/appearance/structured-data/job-posting).
 * Without a work location Google rejects the posting, so then nothing is returned.
 */
export function jobPostingJsonLd(bundle: Bundle, service: BundleService) {
  const locations = service.locations.filter((l) => l.city.trim() || l.region.trim());
  if (!locations.length) return null;
  const base = siteUrl(bundle);
  const organization = bundle.settings.company.legalName || bundle.settings.siteName;
  const posted = new Date(service.createdAt);
  const types = service.employmentType.split(",").map((t) => t.trim()).filter(Boolean);
  const { min, max, unit } = service.salary;
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: jobTitleOf(service),
    description: descriptionHtml(service),
    identifier: { "@type": "PropertyValue", name: organization, value: service.id },
    // Only the built-in example content has no real date.
    datePosted: (posted.getUTCFullYear() < 2020 ? new Date() : posted).toISOString().slice(0, 10),
    ...(types.length ? { employmentType: types.length === 1 ? types[0] : types } : {}),
    hiringOrganization: { "@type": "Organization", name: organization, sameAs: base, logo: `${base}/brand/favicon.png` },
    jobLocation: locations.map((l) => ({
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(l.city.trim() ? { addressLocality: l.city.trim() } : {}),
        ...(l.region.trim() ? { addressRegion: l.region.trim() } : {}),
        addressCountry: "NL",
      },
    })),
    // Only a real amount filled in by the employer; never an estimate.
    ...(min > 0
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "EUR",
            value: { "@type": "QuantitativeValue", ...(max > min ? { minValue: min, maxValue: max } : { value: min }), unitText: unit },
          },
        }
      : {}),
    // Applying happens on this site, unless the vacancy's button sends people elsewhere.
    directApply: service.cta?.link?.kind !== "url",
    url: `${base}${vacancyPath(service)}`,
  };
}

export function breadcrumbJsonLd(bundle: Bundle, service: BundleService) {
  const base = siteUrl(bundle);
  const list = vacanciesPage(bundle);
  const trail = [
    { name: "Home", path: "/" },
    ...(list && list.systemKey !== "home" ? [{ name: list.title, path: pathForSlug(list.slug) }] : []),
    { name: service.title, path: vacancyPath(service) },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: `${base}${t.path}` })),
  };
}
