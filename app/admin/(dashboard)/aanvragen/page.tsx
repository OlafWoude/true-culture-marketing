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

export const metadata: Metadata = { title: "Aanvragen" };

export default async function SubmissionsPage() {
  await requireAdmin();
  const { forms } = await getLiveBundle();
  const db = getDb();
  await pruneOldSubmissions(forms.retentionDays);
  const rows = await db.select().from(schema.submissions).orderBy(desc(schema.submissions.createdAt)).limit(500);
  const recipient = forms.recipientEmail || process.env.CONTACT_TO_EMAIL || "";
  return (
    <>
      <PageHeader title="Aanvragen" description={`Inzendingen van het contactformulier. Ze worden na ${forms.retentionDays} dagen automatisch verwijderd.`} />
      <div className="mb-6 space-y-3">
        {!isEmailConfigured() && (
          <Notice tone="warning" title="E-mailmeldingen staan uit">
            Aanvragen komen alleen hier binnen. Stel RESEND_API_KEY in om ze ook per e-mail te ontvangen.
          </Notice>
        )}
        {isEmailConfigured() && !recipient && (
          <Notice tone="warning" title="Geen ontvanger ingesteld">
            Vul bij <Link className="font-semibold underline" href="/admin/formulieren">Formulieren</Link> een ontvanger in om aanvragen per e-mail te krijgen.
          </Notice>
        )}
        {!forms.storeSubmissions && <Notice tone="info">Opslaan in het dashboard staat uit (zie Formulieren). Nieuwe aanvragen worden alleen gemaild.</Notice>}
      </div>
      {rows.length === 0 ? (
        <EmptyState title="Nog geen aanvragen" text="Zodra iemand het contactformulier invult, verschijnt de aanvraag hier." />
      ) : (
        <SubmissionsList items={rows.map((r) => ({ id: r.id, createdAt: r.createdAt.toISOString(), read: Boolean(r.readAt), emailed: r.emailed, data: r.data as Record<string, string> }))} />
      )}
    </>
  );
}
