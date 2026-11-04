import { notFound } from "next/navigation";
import { asc, desc } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { RelationOptionsLoader } from "@/lib/admin/relations";
import { ResourceManager } from "@/components/admin/resource-manager";
import { SingletonEditor } from "@/components/admin/singleton-editor";
import { requireAdminPage } from "@/lib/auth";
import { getResource } from "@/lib/admin/definitions";
import { TABLES } from "@/lib/admin/registry";
import { getSingleton } from "@/lib/data";
import type { Row } from "@/components/admin/resource-form";

export const dynamic = "force-dynamic";

/** One generic page renders every admin collection from its definition. */
export default async function ResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  await requireAdminPage();
  const { resource } = await params;
  const def = getResource(resource);
  const table = TABLES[resource] as (PgTable & Record<string, never>) | undefined;
  if (!def || !table) notFound();

  const relationOptions = await RelationOptionsLoader(def);
  const heading = (
    <header className="mb-6">
      <p className="eyebrow">{def.group}</p>
      <h1 className="text-3xl font-extrabold sm:text-4xl">{def.title}</h1>
      <p className="mt-2 max-w-2xl text-muted">{def.description}</p>
    </header>
  );

  if (def.singleton) {
    const row = (await getSingleton(table)) as Row;
    return <>{heading}<SingletonEditor def={def} row={row} relationOptions={relationOptions} /></>;
  }

  const t = table as unknown as Record<string, never>;
  const order = def.sortable ? [asc(t.sortOrder), desc(t.id)] : resource === "blog" ? [desc(t.publishedAt), desc(t.id)] : [desc(t.id)];
  const rows = (await db.select().from(table).orderBy(...order)) as Row[];
  return <>{heading}<ResourceManager def={def} rows={rows} relationOptions={relationOptions} /></>;
}
