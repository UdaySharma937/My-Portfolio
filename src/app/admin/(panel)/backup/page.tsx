import { BackupPanel } from "@/components/admin/backup-panel";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function BackupPage() {
  await requireAdminPage();
  return (
    <>
      <header className="mb-6">
        <p className="eyebrow">System</p>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Backup &amp; restore</h1>
        <p className="mt-2 max-w-2xl text-muted">Download all site content as one JSON file, or restore a previous export. Uploaded files (images, PDFs) are stored separately in your upload directory – back that folder up too.</p>
      </header>
      <BackupPanel />
    </>
  );
}
