import crypto from "node:crypto";

/**
 * Stateless signed-cookie session helpers (pure crypto, no Next.js imports,
 * so they can be used from the proxy, server actions and route handlers).
 */
export const SESSION_COOKIE = "admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET must be set to a random string of 16+ characters");
  return s;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** Returns the admin email if the token is authentic, unexpired and belongs to ADMIN_EMAIL. */
export function verifySessionToken(token: string | undefined | null): { email: string } | null {
  if (!token) return null;
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    const expected = sign(payload);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email: string; exp: number };
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    const admin = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
    if (!admin || data.email.toLowerCase() !== admin) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/**
 * Checks login credentials against env. Supports either
 * ADMIN_PASSWORD_HASH (`scrypt$<salt>$<hash>`, recommended) or ADMIN_PASSWORD.
 */
export function checkCredentials(email: string, password: string): boolean {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  if (!adminEmail) return false;
  const emailOk = safeEqual(email.trim().toLowerCase(), adminEmail);
  let passOk = false;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash && hash.startsWith("scrypt$")) {
    const [, salt, digest] = hash.split("$");
    if (salt && digest) {
      const derived = crypto.scryptSync(password, salt, 64).toString("hex");
      passOk = safeEqual(derived, digest);
    }
  } else if (process.env.ADMIN_PASSWORD) {
    passOk = safeEqual(password, process.env.ADMIN_PASSWORD);
  }
  return emailOk && passOk;
}
