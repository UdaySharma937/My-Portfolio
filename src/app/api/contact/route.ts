import { db } from "@/db";
import { messages } from "@/db/schema";
import { sendContactEmail } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sameOrigin } from "@/lib/request";
import { contactSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

async function turnstileOk(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // captcha is optional
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(6000),
    });
    return ((await res.json()) as { success?: boolean }).success === true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const ip = clientIp(req.headers);
  const limit = await rateLimit(`contact:${ip}`, 5, 60 * 60);
  if (!limit.ok) return Response.json({ error: "Too many messages. Please try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });

  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    // A filled honeypot fails validation (max 0) – pretend success so bots learn nothing.
    if (body && typeof body === "object" && (body as { website?: string }).website) return Response.json({ ok: true });
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const m = parsed.data;
  if (!(await turnstileOk(m.turnstileToken, ip))) return Response.json({ error: "Captcha verification failed." }, { status: 400 });

  await db.insert(messages).values({ name: m.name, email: m.email, subject: m.subject, message: m.message });
  await sendContactEmail(m); // best-effort: the message is already safely stored
  return Response.json({ ok: true });
}
