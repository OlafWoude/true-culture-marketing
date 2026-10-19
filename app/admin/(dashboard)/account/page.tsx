import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { AccountPanel } from "@/components/admin/misc";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";

export const metadata: Metadata = { title: "Account en beheerders" };

export default async function AccountPage() {
  const user = await requireAdmin();
  const users = await getDb().select().from(schema.users).orderBy(asc(schema.users.createdAt));
  return (
    <>
      <PageHeader title="Account en beheerders" description="Wijzig je wachtwoord en beheer wie toegang heeft tot het dashboard." />
      <AccountPanel
        currentUserId={user.id}
        users={users.map((u) => ({ id: u.id, name: u.name, email: u.email, lastLoginAt: u.lastLoginAt?.toISOString() ?? null, pending: !u.passwordHash }))}
      />
    </>
  );
}
