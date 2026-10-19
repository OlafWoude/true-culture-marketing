import type { Metadata } from "next";
import Link from "next/link";
import { SetupForm } from "@/components/admin/AuthForms";
import ConfigMissing from "@/components/admin/ConfigMissing";
import { Notice } from "@/components/admin/ui";
import { hasAnyUser, setupTokenConfigured } from "@/lib/auth/users";
import { isDbConfigured } from "@/lib/db";

export const metadata: Metadata = { title: "Eerste beheerder" };

export default async function SetupPage() {
  if (!isDbConfigured()) return <ConfigMissing />;
  if (await hasAnyUser()) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-zinc-900">Al ingesteld</h1>
        <Notice tone="info">Er bestaat al een beheerder. Deze pagina is daarom uitgeschakeld.</Notice>
        <Link href="/admin/login" className="inline-block font-semibold underline underline-offset-4">
          Naar inloggen
        </Link>
      </div>
    );
  }
  if (!setupTokenConfigured()) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-zinc-900">Eerste beheerder aanmaken</h1>
        <Notice tone="warning" title="Setup-sleutel ontbreekt">
          Voeg in Vercel de omgevingsvariabele <code>ADMIN_SETUP_TOKEN</code> toe met een lange, willekeurige waarde
          (minimaal 24 tekens) en deploy opnieuw. Daarna kun je hier je account aanmaken.
        </Notice>
      </div>
    );
  }
  return <SetupForm />;
}
