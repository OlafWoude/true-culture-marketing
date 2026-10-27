import type { Metadata } from "next";
import Link from "next/link";
import { desc, isNull, sql } from "drizzle-orm";
import { Card, formatDate, Notice, PageHeader, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { storageMode } from "@/lib/cms/media";
import { countByStatus, recentDocs } from "@/lib/cms/repo";
import { getDb, schema } from "@/lib/db";
import { isEmailConfigured } from "@/lib/email";

export const metadata: Metadata = { title: "Dashboard" };

const typeLabel: Record<string, string> = {
  page: "Pagina",
  service: "Dienst",
  case: "Case",
  testimonial: "Testimonial",
  settings: "Instellingen",
  navigation: "Navigatie",
  footer: "Footer",
  forms: "Formulieren",
  theme: "Huisstijl",
};
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

const shortcuts = [
  { href: "/admin/paginas", title: "Pagina’s", text: "Teksten, secties en SEO per pagina" },
  { href: "/admin/media", title: "Afbeeldingen", text: "Uploaden, vervangen en alt-teksten" },
  { href: "/admin/vacatures", title: "Vacatures", text: "Functies, omschrijvingen en volgorde" },
  { href: "/admin/huisstijl", title: "Huisstijl", text: "Kleuren, lettertypen en logo" },
  { href: "/admin/navigatie", title: "Navigatie", text: "Menu-items en de knop in het menu" },
  { href: "/admin/instellingen", title: "Instellingen", text: "Bedrijfs- en contactgegevens" },
];

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function Dashboard({ searchParams }: Props) {
  const user = await requireAdmin();
  const params = await searchParams;
  const db = getDb();
  const [counts, recent, [{ media }], [{ unread }], latest] = await Promise.all([
    countByStatus(),
    recentDocs(8),
    db.select({ media: sql<number>`count(*)::int` }).from(schema.media),
    db.select({ unread: sql<number>`count(*)::int` }).from(schema.submissions).where(isNull(schema.submissions.readAt)),
    db.select().from(schema.submissions).orderBy(desc(schema.submissions.createdAt)).limit(4),
  ]);
  const count = (type: string, status?: string) => counts.filter((c) => c.type === type && (!status || c.status === status)).reduce((n, c) => n + c.count, 0);
  const storage = storageMode();
  const setup = [
    { ok: true, label: "Database gekoppeld" },
    { ok: storage !== "unavailable", label: storage === "local" ? "Opslag voor afbeeldingen (lokaal, ontwikkelmodus)" : "Opslag voor afbeeldingen (Vercel Blob)" },
    { ok: isEmailConfigured(), label: "E-mail voor formulieren en wachtwoordherstel (Resend)" },
    { ok: Boolean(process.env.SITE_URL), label: "Website-adres ingesteld (SITE_URL)" },
  ];

  return (
    <>
      <PageHeader title={`Welkom${user.name ? `, ${user.name.split(" ")[0]}` : ""}`} description="Hier beheer je de inhoud en uitstraling van trueculture.nl. Wijzigingen worden pas zichtbaar als je ze publiceert." />
      {params.welkom && (
        <div className="mb-6">
          <Notice tone="success" title="Je account is aangemaakt">
            De huidige inhoud van de website staat klaar in het CMS. Verwijder voor de veiligheid ADMIN_SETUP_TOKEN in Vercel of vervang hem door een nieuwe waarde die je alleen voor noodherstel bewaart.
          </Notice>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Pagina’s", value: count("page"), sub: `${count("page", "published")} gepubliceerd`, href: "/admin/paginas" },
          { label: "Afbeeldingen", value: media, sub: "in de mediabibliotheek", href: "/admin/media" },
          { label: "Vacatures", value: count("service"), sub: `${count("service")} functies`, href: "/admin/vacatures" },
          { label: "Nieuwe sollicitaties", value: unread, sub: "nog niet bekeken", href: "/admin/sollicitaties" },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-400">
            <p className="text-sm font-medium text-zinc-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{s.value}</p>
            <p className="mt-1 text-xs text-zinc-500">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-bold">Snel naar</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {shortcuts.map((s) => (
                <Link key={s.href} href={s.href} className="group rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-900">
                  <p className="font-semibold text-zinc-900">{s.title} <span className="inline-block transition group-hover:translate-x-0.5">→</span></p>
                  <p className="mt-1 text-sm text-zinc-500">{s.text}</p>
                </Link>
              ))}
            </div>
          </div>
          <Card flush>
            <h2 className="border-b border-zinc-200 px-5 py-4 text-lg font-bold">Laatst gewijzigd</h2>
            <ul className="divide-y divide-zinc-200">
              {recent.map((d) => (
                <li key={d.id}>
                  <Link href={editPath[d.type]?.(d.id) ?? "/admin"} className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-zinc-900">{d.systemKey && d.type !== "page" ? typeLabel[d.type] : d.title}</span>
                      <span className="block text-xs text-zinc-500">{typeLabel[d.type]} · {formatDate(d.updatedAt)}</span>
                    </span>
                    {d.status === "published" && d.hasChanges ? <StatusBadge status="changes" label="Concept gewijzigd" /> : <StatusBadge status={d.status} />}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-bold">Instellingen voor productie</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {setup.map((s) => (
                <li key={s.label} className="flex items-start gap-2">
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${s.ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{s.ok ? "✓" : "!"}</span>
                  <span className={s.ok ? "text-zinc-700" : "text-zinc-900"}>{s.label}{!s.ok && " – nog niet ingesteld"}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card flush>
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <h2 className="text-lg font-bold">Laatste sollicitaties</h2>
              <Link href="/admin/sollicitaties" className="text-sm font-semibold underline underline-offset-4">Alles</Link>
            </div>
            {latest.length === 0 ? (
              <p className="px-5 py-6 text-sm text-zinc-500">Nog geen sollicitaties.</p>
            ) : (
              <ul className="divide-y divide-zinc-200">
                {latest.map((s) => {
                  const d = s.data as { name?: string; city?: string; companyName?: string };
                  return (
                    <li key={s.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                      <span className={`h-2 w-2 rounded-full ${s.readAt ? "bg-zinc-200" : "bg-[#fece00]"}`} />
                      <span className="min-w-0 flex-1 truncate">{[d.name, d.city ?? d.companyName].filter(Boolean).join(" · ")}</span>
                      <span className="text-xs text-zinc-500">{formatDate(s.createdAt)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
