"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import { useI18n } from "@/components/providers";
import { cn } from "@/lib/utils";

export function setLocale(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
}

/** EN / हि switch – stores the language in a cookie and re-renders server content. */
export function LangSwitch({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const pick = (l: Locale) => {
    if (l === locale) return;
    setLocale(l);
    router.refresh();
  };
  return (
    <div role="group" aria-label={t.language} className={cn("glass inline-flex rounded-full p-1 text-xs font-bold", className)}>
      {(["en", "hi"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => pick(l)}
          aria-pressed={locale === l}
          lang={l}
          className={cn("rounded-full px-3 py-1.5 transition", locale === l ? "chip-active" : "text-muted hover:text-fg")}
        >
          {l === "en" ? "EN" : "हिं"}
        </button>
      ))}
    </div>
  );
}
