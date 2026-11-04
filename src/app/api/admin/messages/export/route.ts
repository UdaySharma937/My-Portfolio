import { desc } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** CSV cell escaping, including protection against spreadsheet formula injection. */
const cell = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET() {
  if (!(await getAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(messages).orderBy(desc(messages.createdAt));
  const csv = [["id", "date", "name", "email", "subject", "message", "read"].join(",")]
    .concat(rows.map((m) => [m.id, m.createdAt.toISOString(), m.name, m.email, m.subject, m.message, m.isRead].map(cell).join(",")))
    .join("\n");
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="messages.csv"', "Cache-Control": "no-store" },
  });
}
