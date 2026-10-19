import type { Metadata } from "next";
import { RecoveryForm } from "@/components/admin/AuthForms";
import ConfigMissing from "@/components/admin/ConfigMissing";
import { Notice } from "@/components/admin/ui";
import { setupTokenConfigured } from "@/lib/auth/users";
import { isDbConfigured } from "@/lib/db";

export const metadata: Metadata = { title: "Noodprocedure" };

export default function RecoveryPage() {
  if (!isDbConfigured()) return <ConfigMissing />;
  if (!setupTokenConfigured()) {
    return (
      <Notice tone="warning" title="Noodprocedure uitgeschakeld">
        Deze procedure werkt alleen als ADMIN_SETUP_TOKEN is ingesteld in Vercel.
      </Notice>
    );
  }
  return <RecoveryForm />;
}
