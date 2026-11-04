import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";

/** Extracts the client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(h: Headers): string {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/**
 * Fixed-window rate limiter stored in Postgres (works on serverless, no Redis needed).
 * Returns ok=false once `limit` hits are made inside `windowSec`.
 */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<{ ok: boolean; retryAfter: number }> {
  const reset = new Date(Date.now() + windowSec * 1000).toISOString();
  const res = await db.execute(sql`
    insert into rate_limits (key, count, reset_at) values (${key}, 1, ${reset}::timestamptz)
    on conflict (key) do update set
      count = case when rate_limits.reset_at < now() then 1 else rate_limits.count + 1 end,
      reset_at = case when rate_limits.reset_at < now() then ${reset}::timestamptz else rate_limits.reset_at end
    returning count, extract(epoch from (reset_at - now()))::int as retry
  `);
  const row = res.rows[0] as { count: number; retry: number };
  return { ok: Number(row.count) <= limit, retryAfter: Math.max(1, Number(row.retry)) };
}
