import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { resetSequences } from "@/db/seed";
import { getAdmin } from "@/lib/auth";
import { BACKUP_TABLES } from "@/lib/admin/registry";
import { sameOrigin } from "@/lib/request";

export const dynamic = "force-dynamic";

/** GET → download a JSON export of all content tables. */
export async function GET() {
  if (!(await getAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const tables: Record<string, unknown[]> = {};
  for (const [name, table] of Object.entries(BACKUP_TABLES)) tables[name] = await db.select().from(table);
  const body = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), tables }, null, 2);
  return new Response(body, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="portfolio-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}

const DATE_KEYS = ["createdAt", "updatedAt", "publishedAt"];

/** POST → replace all content tables with the uploaded export (runs in one transaction). */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  if (!(await getAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const text = await req.text();
  if (text.length > 15_000_000) return Response.json({ error: "File too large" }, { status: 413 });
  let data: { version?: number; tables?: Record<string, unknown> };
  try { data = JSON.parse(text); } catch { return Response.json({ error: "Not valid JSON" }, { status: 400 }); }
  if (data.version !== 1 || !data.tables || typeof data.tables !== "object") return Response.json({ error: "Not a portfolio backup file" }, { status: 400 });

  const names = Object.keys(BACKUP_TABLES);
  for (const n of names) {
    const rows = data.tables[n];
    if (!Array.isArray(rows) || rows.some((r) => !r || typeof r !== "object" || typeof (r as { id?: unknown }).id !== "number")) {
      return Response.json({ error: `Backup is missing or has invalid data for “${n}”` }, { status: 400 });
    }
  }

  let total = 0;
  try {
    await db.transaction(async (tx) => {
      for (const n of [...names].reverse()) await tx.delete(BACKUP_TABLES[n]); // children first
      for (const n of names) {
        const rows = (data.tables![n] as Record<string, unknown>[]).map((r) => {
          const o = { ...r };
          for (const k of DATE_KEYS) if (typeof o[k] === "string") o[k] = new Date(o[k] as string);
          return o;
        });
        for (let i = 0; i < rows.length; i += 100) await tx.insert(BACKUP_TABLES[n]).values(rows.slice(i, i + 100) as never);
        total += rows.length;
      }
    });
    await resetSequences(names);
  } catch (e) {
    console.error("backup import failed", e);
    return Response.json({ error: "Import failed – nothing was changed." }, { status: 400 });
  }
  revalidatePath("/", "layout");
  return Response.json({ ok: true, rows: total });
}
