import { desc } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { MediaLibrary } from "@/components/admin/media-library";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  await requireAdminPage();
  const rows = await db.select().from(media).orderBy(desc(media.id)).limit(500);
  return (
    <>
      <header className="mb-6">
        <p className="eyebrow">System</p>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Media library</h1>
        <p className="mt-2 text-muted">Every file uploaded through the admin panel. Copy a URL or delete files you no longer use.</p>
      </header>
      <MediaLibrary initial={rows.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))} />
    </>
  );
}
