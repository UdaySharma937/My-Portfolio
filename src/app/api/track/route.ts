import crypto from "node:crypto";
import { db } from "@/db";
import { pageViews } from "@/db/schema";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sameOrigin } from "@/lib/request";

export const dynamic = "force-dynamic";
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|curl|wget/i;

/** Privacy-friendly analytics: stores path + a salted, daily-rotating visitor hash. No cookies, no raw IPs. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response(null, { status: 403 });
  const ua = req.headers.get("user-agent") ?? "";
  if (BOT.test(ua)) return new Response(null, { status: 204 });
  const ip = clientIp(req.headers);
  const rl = await rateLimit(`track:${ip}`, 120, 3600);
  if (!rl.ok) return new Response(null, { status: 204 });
  const body = (await req.json().catch(() => ({}))) as { path?: unknown; referrer?: unknown };
  const path = typeof body.path === "string" ? body.path.slice(0, 200) : "";
  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) return new Response(null, { status: 204 });
  const day = new Date().toISOString().slice(0, 10);
  const visitor = crypto.createHash("sha256").update(`${ip}|${ua}|${day}|${process.env.AUTH_SECRET ?? ""}`).digest("hex").slice(0, 32);
  await db.insert(pageViews).values({ path, referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 120) : "", visitor });
  return new Response(null, { status: 204 });
}
