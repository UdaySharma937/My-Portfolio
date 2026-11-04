"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { media, messages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getResource } from "@/lib/admin/definitions";
import { TABLES } from "@/lib/admin/registry";
import { buildSchema } from "@/lib/admin/validation";
import { SESSION_COOKIE } from "@/lib/session";
import { deleteUpload } from "@/lib/storage";

/* Every action below begins with requireAdmin() – never trust the UI. */

export type SaveResult =
  | { ok: true; id: number }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Public pages are dynamic, but this also clears the router cache so edits show instantly. */
function refreshSite() {
  revalidatePath("/", "layout");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

function pgCode(e: unknown): string | undefined {
  const err = e as { code?: string; cause?: { code?: string } };
  return err?.cause?.code ?? err?.code;
}

export async function saveRecord(key: string, id: number | null, input: Record<string, unknown>): Promise<SaveResult> {
  await requireAdmin();
  const def = getResource(key);
  const table = TABLES[key] as Any;
  if (!def || !table) return { ok: false, error: "Unknown resource" };

  const parsed = buildSchema(def, id !== null || !!def.singleton).safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }
  const values = parsed.data as Record<string, unknown>;

  try {
    let targetId = id;
    if (def.singleton) {
      const [row] = await db.select({ id: table.id }).from(table).limit(1);
      targetId = row?.id ?? null;
    }
    if (targetId !== null) {
      await db.update(table).set(values).where(eq(table.id, targetId));
    } else {
      if (def.sortable) {
        const [m] = await db.select({ n: sql<number>`coalesce(max(${table.sortOrder}), -1) + 1` }).from(table);
        values.sortOrder = Number(m?.n ?? 0);
      }
      const [created] = await db.insert(table).values(values).returning({ id: table.id });
      targetId = created.id;
    }
    refreshSite();
    return { ok: true, id: targetId as number };
  } catch (e) {
    if (pgCode(e) === "23505") return { ok: false, error: "That slug is already used.", fieldErrors: { slug: "Already used – choose another" } };
    console.error("saveRecord failed", e);
    return { ok: false, error: "Could not save. Please try again." };
  }
}

export async function deleteRecord(key: string, id: number): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const def = getResource(key);
  const table = TABLES[key] as Any;
  if (!def || !table || def.noDelete || def.singleton) return { ok: false, error: "Not allowed" };
  await db.delete(table).where(eq(table.id, Number(id)));
  refreshSite();
  return { ok: true };
}

/** Persists drag-and-drop ordering: position in `ids` becomes the new sort_order. */
export async function reorderRecords(key: string, ids: number[]): Promise<{ ok: boolean }> {
  await requireAdmin();
  const def = getResource(key);
  const table = TABLES[key] as Any;
  if (!def?.sortable || !table || !Array.isArray(ids) || ids.length > 500) return { ok: false };
  await db.transaction(async (tx) => {
    for (const [i, id] of ids.entries()) await tx.update(table).set({ sortOrder: i }).where(eq(table.id, Number(id)));
  });
  refreshSite();
  return { ok: true };
}

/** Flips a whitelisted boolean (publish / visible / featured). */
export async function toggleField(key: string, id: number, field: string, value: boolean): Promise<{ ok: boolean }> {
  await requireAdmin();
  const def = getResource(key);
  const table = TABLES[key] as Any;
  if (!def || !table || (field !== def.publishField && field !== def.featuredField)) return { ok: false };
  await db.update(table).set({ [field]: !!value }).where(eq(table.id, Number(id)));
  refreshSite();
  return { ok: true };
}

/* ------------------------------- messages ------------------------------- */

export async function setMessageRead(id: number, isRead: boolean) {
  await requireAdmin();
  await db.update(messages).set({ isRead }).where(eq(messages.id, Number(id)));
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(id: number) {
  await requireAdmin();
  await db.delete(messages).where(eq(messages.id, Number(id)));
  revalidatePath("/admin", "layout");
}

export async function markAllRead() {
  await requireAdmin();
  await db.update(messages).set({ isRead: true }).where(eq(messages.isRead, false));
  revalidatePath("/admin", "layout");
}

/* -------------------------------- media --------------------------------- */

export async function deleteMedia(id: number): Promise<{ ok: boolean }> {
  await requireAdmin();
  const [row] = await db.select().from(media).where(eq(media.id, Number(id))).limit(1);
  if (!row) return { ok: false };
  await deleteUpload(row.bucket, row.filename);
  await db.delete(media).where(eq(media.id, row.id));
  revalidatePath("/admin/media");
  return { ok: true };
}

/** Drops media records whose stored file no longer exists (housekeeping). */
export async function pruneMissingMedia(): Promise<{ removed: number }> {
  await requireAdmin();
  const res = await db.execute(sql`delete from media m where not exists (select 1 from stored_files f where f.bucket = m.bucket and f.filename = m.filename)`);
  revalidatePath("/admin/media");
  return { removed: res.rowCount ?? 0 };
}

/* -------------------------------- session ------------------------------- */

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
