import type { Metadata } from "next";
import { ForgotForm } from "@/components/admin/AuthForms";
import ConfigMissing from "@/components/admin/ConfigMissing";
import { isDbConfigured } from "@/lib/db";

export const metadata: Metadata = { title: "Wachtwoord vergeten" };

export default function ForgotPage() {
  if (!isDbConfigured()) return <ConfigMissing />;
  return <ForgotForm />;
}
