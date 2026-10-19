import type { Metadata } from "next";
import MediaLibrary from "@/components/admin/media/MediaLibrary";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Afbeeldingen" };

export default async function MediaPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Afbeeldingen" description="Upload, beschrijf en beheer alle afbeeldingen. Een afbeelding kun je op meerdere plekken gebruiken; vervang je haar hier, dan verandert ze overal." />
      <MediaLibrary />
    </>
  );
}
