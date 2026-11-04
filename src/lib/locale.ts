import "server-only";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, dictionaries, type Locale } from "@/lib/i18n";

export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return v === "hi" ? "hi" : "en";
}

export async function getDict() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
