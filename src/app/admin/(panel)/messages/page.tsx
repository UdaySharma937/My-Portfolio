import { desc } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { MessagesInbox } from "@/components/admin/messages-inbox";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  await requireAdminPage();
  const rows = await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(1000);
  return (
    <>
      <header className="mb-6">
        <p className="eyebrow">Inbox</p>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Messages</h1>
        <p className="mt-2 text-muted">Everything sent through the contact form. Reply straight from your mail app.</p>
      </header>
      <MessagesInbox initial={rows.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))} />
    </>
  );
}
