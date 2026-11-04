import type { Metadata } from "next";
import type { ReactNode } from "react";
import { eq, count } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { AdminShell } from "@/components/admin/shell";
import { AdminProviders } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { RESOURCES } from "@/lib/admin/definitions";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdminPage(); // second line of defence behind the proxy
  const [{ n }] = await db.select({ n: count() }).from(messages).where(eq(messages.isRead, false));
  return (
    <AdminProviders>
      <AdminShell resources={RESOURCES.map((r) => ({ key: r.key, title: r.title, group: r.group }))} unread={n} email={admin.email}>
        {children}
      </AdminShell>
    </AdminProviders>
  );
}
