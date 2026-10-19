import { isNull, sql } from "drizzle-orm";
import AdminShell from "@/components/admin/AdminShell";
import { AdminDataProvider } from "@/components/admin/AdminContext";
import { ConfirmProvider, ToastProvider } from "@/components/admin/feedback";
import { MediaRegistryProvider } from "@/components/admin/media/MediaRegistry";
import { requireAdmin } from "@/lib/auth/session";
import { allPageOptions, ensureSeeded } from "@/lib/cms/repo";
import { listMedia, storageMode } from "@/lib/cms/media";
import { getDb, schema } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  await ensureSeeded(user.id);
  const [pages, media, [{ unread }]] = await Promise.all([
    allPageOptions(),
    listMedia(),
    getDb()
      .select({ unread: sql<number>`count(*)::int` })
      .from(schema.submissions)
      .where(isNull(schema.submissions.readAt)),
  ]);

  return (
    <ToastProvider>
      <ConfirmProvider>
        <AdminDataProvider value={{ pages, storage: storageMode() }}>
          <MediaRegistryProvider
            initial={media.map((m) => ({ id: m.id, url: m.url, alt: m.alt, width: m.width, height: m.height, filename: m.filename, focalX: m.focalX, focalY: m.focalY }))}
          >
            <AdminShell user={{ name: user.name, email: user.email }} unread={unread}>
              {children}
            </AdminShell>
          </MediaRegistryProvider>
        </AdminDataProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
