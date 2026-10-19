import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, isNull } from "drizzle-orm";
import { RedirectManager } from "@/components/admin/misc";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { normalizePage } from "@/lib/cms/normalize";
import { getDb, schema } from "@/lib/db";


export const metadata: Metadata = { title: "SEO en redirects" };

export default async function SeoPage() {
  await requireAdmin();
  const db = getDb();
  const [redirects, pages] = await Promise.all([
    db.select().from(schema.redirects).orderBy(desc(schema.redirects.createdAt)),
    db.select().from(schema.documents).where(and(eq(schema.documents.type, "page"), isNull(schema.documents.deletedAt))),
  ]);
  return (
    <>
      <PageHeader
        title="SEO en redirects"
        description={
          <>
            Overzicht van de vindbaarheid per pagina en doorverwijzingen van oude naar nieuwe URL’s. Standaardinstellingen (zoals de deelafbeelding en de titelaanvulling) beheer je bij{" "}
            <Link href="/admin/instellingen" className="font-semibold underline underline-offset-4">Instellingen</Link>.
          </>
        }
      />
      <h2 className="mb-3 text-lg font-bold">Pagina’s</h2>
      <Card flush className="mb-10 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3">Pagina</th>
              <th className="px-4 py-3">SEO-titel</th>
              <th className="px-4 py-3">Meta description</th>
              <th className="px-4 py-3">Zoekmachines</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {pages.map((row) => {
              const p = normalizePage(row.draft);
              const titleLen = (p.seo.title || p.title).length;
              const descLen = p.seo.description.length;
              return (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/paginas/${row.id}`} className="font-semibold underline-offset-4 hover:underline">{p.title}</Link>
                    <span className="block text-xs text-zinc-500">{p.slug ? `/${p.slug}` : "/"}</span>
                  </td>
                  <td className="px-4 py-3">{titleLen > 60 ? <StatusBadge status="offline" label={`Lang (${titleLen})`} /> : <StatusBadge status="published" label={`${titleLen} tekens`} />}</td>
                  <td className="px-4 py-3">
                    {descLen === 0 ? <StatusBadge status="offline" label="Ontbreekt" /> : descLen > 160 ? <StatusBadge status="offline" label={`Lang (${descLen})`} /> : <StatusBadge status="published" label={`${descLen} tekens`} />}
                  </td>
                  <td className="px-4 py-3">{p.seo.noindex ? <StatusBadge status="hidden" label="Verborgen" /> : <StatusBadge status="published" label="Zichtbaar" />}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <h2 className="mb-3 text-lg font-bold">Redirects</h2>
      <RedirectManager redirects={redirects.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))} />
    </>
  );
}
