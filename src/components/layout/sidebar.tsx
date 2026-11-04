"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award, Briefcase, ChevronsLeft, ChevronsRight, Clock, FolderKanban, Home, Mail, Menu, MessageSquareQuote,
  PenLine, Search, Sparkles, User, Wrench, X, type LucideIcon,
} from "lucide-react";
import { SocialIcon } from "@/components/ui/icons";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LangSwitch } from "@/components/layout/lang-switch";
import { useI18n } from "@/components/providers";
import { cn, safeHref } from "@/lib/utils";

const ICONS: Record<string, LucideIcon | "github"> = {
  hero: Home, about: User, skills: Sparkles, projects: FolderKanban, certifications: Award, experience: Briefcase,
  services: Wrench, testimonials: MessageSquareQuote, blog: PenLine, github: "github", now: Clock, contact: Mail,
};

function NavIcon({ id, className }: { id: string; className?: string }) {
  const I = ICONS[id] ?? Sparkles;
  return I === "github" ? <SocialIcon platform="github" className={className} /> : <I className={className} aria-hidden />;
}

interface Props {
  sections: string[];
  social: { id: number; label: string; platform: string; url: string }[];
  siteName: string;
}

export function Sidebar({ sections, social, siteName }: Props) {
  const { t } = useI18n();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [expanded, setExpanded] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [active, setActive] = useState("hero");

  // Scroll-spy: highlight the section that crosses the middle of the viewport.
  useEffect(() => {
    if (!isHome) return;
    const els = sections.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections, isHome, pathname]);

  // Drawer: lock scroll + close on Escape.
  useEffect(() => {
    if (!drawer) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [drawer]);

  const href = (id: string) => (isHome ? `#${id}` : `/#${id}`);
  const label = (id: string) => (t.nav as Record<string, string>)[id] ?? id;
  const openPalette = () => window.dispatchEvent(new Event("open-palette"));

  const links = (onNavigate?: () => void, showLabels = true): ReactNode =>
    sections.map((id) => {
      const on = isHome && active === id;
      return (
        <a
          key={id}
          href={href(id)}
          onClick={onNavigate}
          aria-label={label(id)}
          aria-current={on ? "location" : undefined}
          title={label(id)}
          className={cn("relative flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-colors", on ? "text-white" : "text-muted hover:text-fg")}
        >
          {on && (
            <motion.span
              layoutId={showLabels && onNavigate ? "pill-m" : "pill-d"}
              className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}
          <NavIcon id={id} className="h-5 w-5 shrink-0" />
          {showLabels && <span className="truncate">{label(id)}</span>}
        </a>
      );
    });

  const socials = (
    <div className="flex flex-wrap items-center gap-2">
      {social.map((s) => (
        <a key={s.id} href={safeHref(s.url)} target="_blank" rel="noopener noreferrer me" aria-label={s.label} title={s.label}
          className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:scale-110 hover:text-accent">
          <SocialIcon platform={s.platform} className="h-[18px] w-[18px]" />
        </a>
      ))}
    </div>
  );

  const brand = (
    <a href={isHome ? "#hero" : "/"} className="flex items-center gap-3 px-1" aria-label={siteName}>
      <span className="planet-static h-9 w-9 shrink-0" aria-hidden />
      <span className="font-display text-lg font-extrabold leading-none">{siteName.split(" ")[0]}</span>
    </a>
  );

  return (
    <>
      {/* ---------- desktop: collapsible glass rail ---------- */}
      <motion.aside
        aria-label="Primary"
        initial={false}
        animate={{ width: expanded ? 232 : 76 }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="glass fixed bottom-4 left-4 top-4 z-40 hidden flex-col overflow-hidden rounded-3xl p-3 lg:flex"
      >
        <div className="mb-4 flex h-12 items-center">{expanded ? brand : <span className="planet-static mx-auto h-9 w-9" aria-hidden />}</div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden" aria-label="Sections">{links(undefined, expanded)}</nav>
        <div className="mt-3 flex flex-col items-center gap-3 border-t border-line pt-3">
          {expanded ? <LangSwitch /> : null}
          <div className={cn("flex w-full items-center gap-2", expanded ? "justify-between" : "flex-col")}>
            <button type="button" onClick={openPalette} aria-label={t.search} title="Ctrl/⌘ + K" className="glass grid h-10 w-10 place-items-center rounded-full text-accent transition hover:scale-105">
              <Search className="h-[18px] w-[18px]" />
            </button>
            <ThemeToggle />
          </div>
          {expanded ? socials : null}
          <button type="button" onClick={() => setExpanded((v) => !v)} aria-label={expanded ? t.collapse : t.expand} aria-expanded={expanded}
            className="grid h-9 w-full place-items-center rounded-xl text-muted transition hover:text-accent">
            {expanded ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
          </button>
        </div>
      </motion.aside>

      {/* ---------- mobile: top bar + slide-in drawer + bottom quick actions ---------- */}
      <header className="glass fixed inset-x-3 top-3 z-40 flex h-14 items-center justify-between rounded-2xl px-3 lg:hidden">
        <button type="button" onClick={() => setDrawer(true)} aria-label={t.menu} aria-expanded={drawer} className="grid h-10 w-10 place-items-center rounded-full">
          <Menu className="h-6 w-6" />
        </button>
        {brand}
        <ThemeToggle className="h-10 w-10" />
      </header>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div key="bd" className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
            <motion.aside
              key="dr"
              role="dialog"
              aria-modal="true"
              aria-label={t.menu}
              className="glass-solid fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-xs flex-col gap-4 overflow-y-auto rounded-r-3xl p-5 lg:hidden"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="flex items-center justify-between">
                {brand}
                <button type="button" onClick={() => setDrawer(false)} aria-label={t.close} className="grid h-10 w-10 place-items-center rounded-full"><X className="h-6 w-6" /></button>
              </div>
              <nav className="flex flex-col gap-1" aria-label="Sections">{links(() => setDrawer(false), true)}</nav>
              <div className="mt-auto flex flex-col gap-4 border-t border-line pt-4">
                <LangSwitch className="self-start" />
                {socials}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <nav aria-label="Quick actions" className="glass fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-2xl p-1.5 lg:hidden">
        {[
          { id: "hero", icon: Home, text: t.nav.hero },
          { id: "projects", icon: FolderKanban, text: t.nav.projects },
          { id: "contact", icon: Mail, text: t.hireMe },
        ].map((q) => (
          <a key={q.id} href={href(q.id)} className="flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold text-muted active:text-accent">
            <q.icon className="h-5 w-5" aria-hidden />
            <span className="max-w-full truncate px-1">{q.text}</span>
          </a>
        ))}
        <button type="button" onClick={openPalette} className="flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold text-muted active:text-accent">
          <Search className="h-5 w-5" aria-hidden />
          <span>{t.search}</span>
        </button>
      </nav>
    </>
  );
}
