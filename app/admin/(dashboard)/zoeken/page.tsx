import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, formatDate, PageHeader, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { listMedia } from "@/lib/cms/media";
import { searchDocs } from "@/lib/cms/repo";

export const metadata: Metadata = { title: "Zoeken" };

const editPath: Record<string, (id: string) => string> = {
  page: (id) => `/admin/paginas/${id}`,
  service: (id) => `/admin/vacatures/${id}`,
  case: (id) => `/admin/cases/${id}`,
  testimonial: (id) => `/admin/testimonials/${id}`,
  settings: () => "/admin/instellingen",
  navigation: () => "/admin/navigatie",
  footer: () => "/admin/footer",
  forms: () => "/admin/formulieren",
  theme: () => "/admin/huisstijl",
};
const typeLabel: Record<string, string> = { page: "Pagina", service: "Dienst", case: "Case", testimonial: "Testimonial", settings: "Instellingen", navigation: "Navigatie", footer: "Footer", forms: "Formulieren", theme: "Huisstijl" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const [docs, media] = q ? await Promise.all([searchDocs(q), listMedia(q)]) : [[], []];
  return (
    <>
      <PageHeader title="Zoeken" description={q ? `Resultaten voor ‘${q}’` : "Zoek in alle teksten, pagina’s, vacatures, cases, foto’s en video’s."} />
      {!q ? null : docs.length === 0 && media.length === 0 ? (
        <EmptyState title="Niets gevonden" text="Probeer een ander woord." />
      ) : (
        <div className="space-y-6">
          {docs.length > 0 && (
            <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              {docs.map((d) => (
                <li key={d.id}>
                  <Link href={editPath[d.type]?.(d.id) ?? "/admin"} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{d.systemKey && d.type !== "page" ? typeLabel[d.type] : d.title}</span>
                      <span className="block text-xs text-zinc-500">{typeLabel[d.type]} · {formatDate(d.updatedAt)}</span>
                    </span>
                    <StatusBadge status={d.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {media.length > 0 && (
            <p className="text-sm text-zinc-600">
              {media.length} afbeelding(en) gevonden. <Link href="/admin/media" className="font-semibold underline">Open de mediabibliotheek</Link>.
            </p>
          )}
        </div>
      )}
    </>
  );
}
