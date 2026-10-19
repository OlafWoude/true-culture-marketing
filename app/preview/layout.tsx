import type { Metadata } from "next";
import Link from "next/link";
import SiteChrome from "@/components/site/SiteChrome";
import { requireAdmin } from "@/lib/auth/session";
import { getPreviewBundle } from "@/lib/cms/repo";
import { createRenderCtx } from "@/lib/cms/render";

export const metadata: Metadata = { title: "Voorbeeld", robots: { index: false, follow: false, nocache: true } };
export const dynamic = "force-dynamic";

function PreviewBanner() {
  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex h-10 items-center justify-center gap-4 bg-[#fece00] px-4 text-sm font-semibold text-[#050505]">
      <span>Voorbeeldweergave · niet-gepubliceerde wijzigingen zijn zichtbaar</span>
      <Link href="/admin" className="rounded-md bg-[#050505] px-3 py-1 text-xs text-white">
        Terug naar beheer
      </Link>
    </div>
  );
}

export default async function PreviewLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const bundle = await getPreviewBundle();
  return (
    <div className="pt-10">
      <SiteChrome ctx={createRenderCtx(bundle)} banner={<PreviewBanner />}>
        {children}
      </SiteChrome>
    </div>
  );
}
