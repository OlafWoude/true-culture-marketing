import type { Metadata } from "next";
import MediaLibrary from "@/components/admin/media/MediaLibrary";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Foto’s en video’s" };

export default async function MediaPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        title="Foto’s en video’s"
        description="Upload, beschrijf en beheer alle foto’s en video’s. Je kunt ze op meerdere plekken gebruiken; vervang je er hier een, dan verandert die overal."
      />
      <MediaLibrary />
    </>
  );
}
