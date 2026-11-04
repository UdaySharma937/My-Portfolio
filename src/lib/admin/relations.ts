import "server-only";
import { asc } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { getResource, type ResourceDef } from "@/lib/admin/definitions";
import { TABLES } from "@/lib/admin/registry";

/** Loads `{value,label}` option lists for every relation field of a resource (e.g. skill → category). */
export async function RelationOptionsLoader(def: ResourceDef): Promise<Record<string, { value: string; label: string }[]>> {
  const out: Record<string, { value: string; label: string }[]> = {};
  for (const f of def.fields) {
    if (f.type !== "relation" || !f.relation || out[f.relation]) continue;
    const target = getResource(f.relation);
    const table = TABLES[f.relation] as unknown as (PgTable & Record<string, never>) | undefined;
    if (!target || !table) continue;
    const rows = (await db.select().from(table).orderBy(asc(table.id))) as Record<string, unknown>[];
    out[f.relation] = rows.map((r) => ({ value: String(r.id), label: String(r[target.titleField] ?? r.id) }));
  }
  return out;
}
