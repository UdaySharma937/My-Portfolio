"use client";

import { createContext, useContext, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { dictionaries, type Dict, type Locale } from "@/lib/i18n";

interface I18nValue { locale: Locale; t: Dict }
const I18nContext = createContext<I18nValue>({ locale: "en", t: dictionaries.en });

/** Gives client components access to the active language + UI strings. */
export function useI18n(): I18nValue {
  return useContext(I18nContext);
}

export function Providers({ locale, animations, children }: { locale: Locale; animations: boolean; children: ReactNode }) {
  return (
    <I18nContext.Provider value={{ locale, t: dictionaries[locale] }}>
      {/* "user" honours prefers-reduced-motion; "always" is used when the admin disables animations */}
      <MotionConfig reducedMotion={animations ? "user" : "always"}>{children}</MotionConfig>
    </I18nContext.Provider>
  );
}
