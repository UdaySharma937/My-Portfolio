"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, checkCredentials, createSessionToken } from "@/lib/session";
import { loginSchema } from "@/lib/validators";

export interface LoginState { error?: string }

/**
 * Only the single ADMIN_EMAIL can ever sign in. Attempts are rate-limited per IP and per
 * e-mail, errors are deliberately generic, and the cookie is HttpOnly + Secure (in production) + SameSite.
 */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = clientIp(await headers());
  const byIp = await rateLimit(`login:ip:${ip}`, 5, 15 * 60);
  if (!byIp.ok) return { error: `Too many attempts. Try again in ${Math.ceil(byIp.retryAfter / 60)} minute(s).` };

  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Enter a valid email and password." };
  const byEmail = await rateLimit(`login:email:${parsed.data.email.toLowerCase()}`, 10, 60 * 60);
  if (!byEmail.ok) return { error: "Too many attempts for this account. Try again later." };

  if (!process.env.ADMIN_EMAIL || !(process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_HASH) || (process.env.AUTH_SECRET ?? "").length < 16) {
    return { error: "Server is not configured: set ADMIN_EMAIL, ADMIN_PASSWORD and AUTH_SECRET." };
  }
  if (!checkCredentials(parsed.data.email, parsed.data.password)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return { error: "Invalid email or password." };
  }

  (await cookies()).set(SESSION_COOKIE, createSessionToken(parsed.data.email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect("/admin");
}
