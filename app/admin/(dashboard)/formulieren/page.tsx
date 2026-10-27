import type { Metadata } from "next";
import SingletonPage from "@/components/admin/SingletonPage";
import { Card } from "@/components/admin/ui";
import { isEmailConfigured, emailFrom } from "@/lib/email";

export const metadata: Metadata = { title: "Formulieren" };

export default function Page() {
  const email = isEmailConfigured();
  return (
    <SingletonPage
      type="forms"
      aside={
        <Card className="space-y-2 text-sm">
          <p className="font-semibold text-zinc-900">Status e-mail</p>
          {email ? (
            <p className="text-zinc-600">E-mail is ingesteld. Afzender: <span className="font-mono text-xs">{emailFrom()}</span></p>
          ) : (
            <p className="text-amber-800">E-mail is nog niet ingesteld (RESEND_API_KEY). Sollicitaties worden alleen in het dashboard bewaard.</p>
          )}
          <p className="text-zinc-600">Spam wordt beperkt met een onzichtbaar controleveld en een limiet van 5 inzendingen per 10 minuten per bezoeker.</p>
        </Card>
      }
    />
  );
}
