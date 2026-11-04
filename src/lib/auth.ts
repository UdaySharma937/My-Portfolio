import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/** Returns the current admin (or null). Always verifies the signed cookie server-side. */
export async function getAdmin(): Promise<{ email: string } | null> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

/** For pages/layouts: redirects to the login screen when not authenticated. */
export async function requireAdminPage(): Promise<{ email: string }> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** For server actions: throws when not authenticated. Call this FIRST in every action. */
export async function requireAdmin(): Promise<{ email: string }> {
  const admin = await getAdmin();
  if (!admin) throw new Error("Unauthorized");
  return admin;
}
