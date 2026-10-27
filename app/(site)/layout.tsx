import type { Metadata, Viewport } from "next";
import SiteChrome from "@/components/site/SiteChrome";
import { getLiveBundle } from "@/lib/cms/repo";
import { createRenderCtx } from "@/lib/cms/render";
import { siteIcons, siteUrl } from "@/lib/cms/metadata";
import { browserBarColor } from "@/lib/cms/theme-css";

export async function generateMetadata(): Promise<Metadata> {
  const bundle = await getLiveBundle();
  return {
    metadataBase: new URL(siteUrl(bundle)),
    title: bundle.settings.siteName,
    description: bundle.settings.defaultDescription,
    icons: siteIcons(bundle),
    robots: bundle.settings.allowIndexing ? undefined : { index: false, follow: false },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const bundle = await getLiveBundle();
  return { themeColor: browserBarColor(bundle.theme) };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const bundle = await getLiveBundle();
  return <SiteChrome ctx={createRenderCtx(bundle)}>{children}</SiteChrome>;
}
