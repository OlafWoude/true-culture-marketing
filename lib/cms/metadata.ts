import "server-only";
import type { Metadata } from "next";
import { siteBaseUrl } from "@/lib/email";
import type { Seo } from "./documents";
import type { Bundle } from "./types";

export function siteUrl(bundle: Bundle) {
  return (bundle.settings.siteUrl || siteBaseUrl()).replace(/\/$/, "");
}

export function siteIcons(bundle: Bundle): Metadata["icons"] {
  const fav = bundle.theme.brand.favicon ? bundle.media[bundle.theme.brand.favicon] : null;
  if (fav) return { icon: [{ url: fav.url }], apple: [{ url: fav.url }] };
  return {
    icon: [{ url: "/brand/favicon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/brand/apple-icon.png", sizes: "180x180" }],
  };
}

export function buildMetadata(
  bundle: Bundle,
  input: {
    title: string;
    seo: Seo;
    path: string;
    isHome?: boolean;
    type?: "website" | "article";
    /** The page has its own generated share image (an opengraph-image file next to it). */
    generatedImage?: boolean;
  },
): Metadata {
  const { settings } = bundle;
  const baseTitle = input.seo.title || input.title || settings.siteName;
  const title =
    input.isHome || !settings.titleSuffix || baseTitle.includes(settings.siteName)
      ? baseTitle
      : `${baseTitle} ${settings.titleSuffix}`;
  const description = input.seo.description || settings.defaultDescription;
  const ogMedia =
    (input.seo.ogImage && bundle.media[input.seo.ogImage]) ||
    (settings.ogImage && bundle.media[settings.ogImage]) ||
    null;
  const ogImage = ogMedia
    ? { url: ogMedia.url, width: ogMedia.width, height: ogMedia.height, alt: ogMedia.alt }
    : { url: "/brand/og-default.jpg", width: 1200, height: 630, alt: settings.siteName };
  const noindex = input.seo.noindex || !settings.allowIndexing;

  return {
    metadataBase: new URL(siteUrl(bundle)),
    title: { absolute: title },
    description,
    alternates: { canonical: input.seo.canonical || input.path },
    robots: noindex ? { index: false, follow: false } : undefined,
    icons: siteIcons(bundle),
    openGraph: {
      type: input.type ?? "website",
      locale: "nl_NL",
      siteName: settings.siteName,
      url: input.path,
      title: input.seo.ogTitle || title,
      description: input.seo.ogDescription || description,
      // Without an `images` key Next.js fills in the generated image.
      ...(input.generatedImage ? {} : { images: [ogImage] }),
    },
    twitter: {
      card: "summary_large_image",
      title: input.seo.ogTitle || title,
      description: input.seo.ogDescription || description,
      ...(input.generatedImage ? {} : { images: [ogImage.url] }),
    },
  };
}

/** Who the site belongs to and how to reach them, for search engines (on the homepage). */
export function organizationJsonLd(bundle: Bundle) {
  const base = siteUrl(bundle);
  const { settings } = bundle;
  const phone = settings.contact.phone.replace(/\(0\)/g, "").replace(/[^0-9+]/g, "");
  const profiles = settings.socials.map((s) => s.url).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.company.legalName || settings.siteName,
    url: base,
    logo: `${base}/brand/favicon.png`,
    ...(settings.contact.email ? { email: settings.contact.email } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(profiles.length ? { sameAs: profiles } : {}),
  };
}
