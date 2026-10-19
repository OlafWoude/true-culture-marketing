import type { Metadata } from "next";
import { ResetForm } from "@/components/admin/AuthForms";
import ConfigMissing from "@/components/admin/ConfigMissing";
import { isDbConfigured } from "@/lib/db";

export const metadata: Metadata = { title: "Nieuw wachtwoord", referrer: "no-referrer" };

export default async function ResetPage({ params }: { params: Promise<{ token: string }> }) {
  if (!isDbConfigured()) return <ConfigMissing />;
  const { token } = await params;
  return <ResetForm token={token} />;
}
