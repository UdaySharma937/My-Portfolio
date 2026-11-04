"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, FolderKanban, Hash, Languages, MoonStar, PenLine } from "lucide-react";
import { useI18n } from "@/components/providers";
import { toggleTheme } from "@/lib/theme-client";
import { setLocale } from "@/components/layout/lang-switch";

interface Item { id: string; group: string; label: string; icon: React.ReactNode; run: () => void }

/** Ctrl/⌘ + K quick navigation: sections, projects, posts and actions. */
export function CommandPalette({
  sections, projects, posts,
}: {
  sections: string[];
  projects: { slug: string; title: string }[];
  posts: { slug: string; title: string }[];
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => { setOpen(false); setQ(""); setIdx(0); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((v) => !v); }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-palette", onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("open-palette", onOpen); };
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 30); }, [open]);

  const items = useMemo<Item[]>(() => {
    const go = (fn: () => void) => () => { close(); fn(); };
    const nav = t.nav as Record<string, string>;
    return [
      ...sections.map((id) => ({
        id: `s-${id}`, group: t.sections, label: nav[id] ?? id, icon: <Hash className="h-4 w-4" />,
        run: go(() => (pathname === "/" ? document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }) : router.push(`/#${id}`))),
      })),
      ...projects.map((p) => ({ id: `p-${p.slug}`, group: t.nav.projects, label: p.title, icon: <FolderKanban className="h-4 w-4" />, run: go(() => router.push(`/projects/${p.slug}`)) })),
      ...posts.map((p) => ({ id: `b-${p.slug}`, group: t.nav.blog, label: p.title, icon: <PenLine className="h-4 w-4" />, run: go(() => router.push(`/blog/${p.slug}`)) })),
      { id: "a-theme", group: t.actions, label: t.toggleTheme, icon: <MoonStar className="h-4 w-4" />, run: go(() => toggleTheme()) },
      { id: "a-lang", group: t.actions, label: locale === "en" ? "हिन्दी में देखें" : "Switch to English", icon: <Languages className="h-4 w-4" />, run: go(() => { setLocale(locale === "en" ? "hi" : "en"); router.refresh(); }) },
    ];
  }, [sections, projects, posts, t, locale, pathname, router, close]);

  const filtered = items.filter((i) => i.label.toLowerCase().includes(q.trim().toLowerCase()));

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") filtered[idx]?.run();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.div
            role="dialog" aria-modal="true" aria-label={t.search} onKeyDown={onKeyDown} onClick={(e) => e.stopPropagation()}
            className="glass-solid w-full max-w-xl overflow-hidden rounded-3xl"
            initial={{ scale: 0.96, y: -12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: -12 }}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="h-5 w-5 text-muted" aria-hidden />
              <input ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setIdx(0); }} placeholder={t.palette} aria-label={t.search}
                className="h-14 w-full bg-transparent text-base text-fg outline-none placeholder:text-muted" />
              <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-[10px] text-muted sm:block">ESC</kbd>
            </div>
            <ul role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
              {filtered.length === 0 && <li className="px-4 py-8 text-center text-muted">{t.paletteEmpty}</li>}
              {filtered.map((it, i) => (
                <li key={it.id} role="option" aria-selected={i === idx}>
                  <button type="button" onMouseEnter={() => setIdx(i)} onClick={it.run}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${i === idx ? "bg-primary text-white" : "text-fg"}`}>
                    {it.icon}
                    <span className="flex-1 truncate">{it.label}</span>
                    <span className={`text-[11px] ${i === idx ? "text-white/80" : "text-muted"}`}>{it.group}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
