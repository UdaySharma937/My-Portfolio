"use client";

import { toggleTheme } from "@/lib/theme-client";
import { useI18n } from "@/components/providers";
import { cn } from "@/lib/utils";

/**
 * Sun ↔ moon morph. Pure CSS driven by the `dark` class on <html>, so there is
 * no hydration flicker: the correct icon is painted from the very first frame.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      aria-label={t.toggleTheme}
      title={t.toggleTheme}
      className={cn("glass grid h-10 w-10 shrink-0 place-items-center rounded-full text-accent transition hover:scale-105 active:scale-95", className)}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <mask id="moon-mask">
          <rect x="0" y="0" width="24" height="24" fill="#fff" />
          <circle cx="30" cy="2" r="8" fill="#000" className="transition-transform duration-500 ease-out dark:-translate-x-[11px] dark:translate-y-[3px]" />
        </mask>
        <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" mask="url(#moon-mask)" className="origin-center transition-transform duration-500 dark:scale-[1.35]" />
        <g className="origin-center transition-all duration-500 dark:rotate-90 dark:scale-0 dark:opacity-0">
          <path d="M12 1.5v2.5M12 20v2.5M1.5 12H4M20 12h2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
        </g>
      </svg>
    </button>
  );
}
