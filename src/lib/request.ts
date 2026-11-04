import "server-only";

/** CSRF defence for cookie-authenticated API routes: Origin (if sent) must match Host. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin GET/navigation requests don't send it; cookies are SameSite=Lax anyway
  try {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
