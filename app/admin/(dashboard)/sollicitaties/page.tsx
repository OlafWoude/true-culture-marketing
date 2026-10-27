import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { SubmissionsList } from "@/components/admin/misc";
import { EmptyState, Notice, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { getLiveBundle } from "@/lib/cms/repo";
import { pruneOldSubmissions } from "@/lib/cms/submissions";
import { getDb, schema } from "@/lib/db";
import { isEmailConfigured } from "@/lib/email";

export const metadata: Metadata = { title: "Sollicitaties" };

export default async function SubmissionsPage() {
  await requireAdmin();
  const { forms } = await getLiveBundle();
  const db = getDb();
  await pruneOldSubmissions(forms.retentionDays);
  const rows = await db.select().from(schema.submissions).orderBy(desc(schema.submissions.createdAt)).limit(500);
  const recipient = forms.recipientEmail || process.env.CONTACT_TO_EMAIL || "";
  return (
    <>
      <PageHeader title="Sollicitaties" description={`Sollicitaties via de website. Bel nieuwe sollicitanten binnen 24 uur. Ze worden na ${forms.retentionDays} dagen automatisch verwijderd.`} />
      <div className="mb-6 space-y-3">
        {!isEmailConfigured() && (
          <Notice tone="warning" title="E-mailmeldingen staan uit">
            Sollicitaties komen alleen hier binnen. Stel RESEND_API_KEY in om ze ook direct per e-mail te ontvangen.
          </Notice>
        )}
        {isEmailConfigured() && !recipient && (
          <Notice tone="warning" title="Geen ontvanger ingesteld">
            Vul bij <Link className="font-semibold underline" href="/admin/formulieren">Formulieren</Link> een ontvanger in om sollicitaties per e-mail te krijgen.
          </Notice>
        )}
        {!forms.storeSubmissions && <Notice tone="info">Opslaan in het dashboard staat uit (zie Formulieren). Nieuwe sollicitaties worden alleen gemaild.</Notice>}
      </div>
      {rows.length === 0 ? (
        <EmptyState title="Nog geen sollicitaties" text="Zodra iemand het sollicitatieformulier invult, verschijnt de sollicitatie hier." />
      ) : (
        <SubmissionsList items={rows.map((r) => ({ id: r.id, createdAt: r.createdAt.toISOString(), read: Boolean(r.readAt), emailed: r.emailed, data: r.data as Record<string, string> }))} />
      )}
    </>
  );
}
