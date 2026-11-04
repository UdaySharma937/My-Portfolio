"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import { SocialIcon } from "@/components/ui/icons";
import { EmptyState, Reveal, SectionHeading } from "@/components/ui/motion";
import { SmartImage } from "@/components/ui/smart-image";
import { useI18n } from "@/components/providers";
import { cn, safeHref } from "@/lib/utils";

export interface ProjectCard {
  id: number; slug: string; title: string; summary: string; category: string; techStack: string[];
  coverImage: string; liveUrl: string; githubUrl: string; isFeatured: boolean;
}

/** Filterable project grid (filter by category or by technology). */
export function Projects({ projects }: { projects: ProjectCard[] }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState("all");

  const filters = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => { set.add(p.category); p.techStack.forEach((x) => set.add(x)); });
    return [...set].filter(Boolean).slice(0, 14);
  }, [projects]);

  const shown = filter === "all" ? projects : projects.filter((p) => p.category === filter || p.techStack.includes(filter));

  return (
    <section id="projects" className="section">
      <div className="container-x">
        <SectionHeading eyebrow={t.nav.projects} title={t.projects} sub={t.projectsSub} />
        {projects.length === 0 ? (
          <EmptyState>{t.noProjects}</EmptyState>
        ) : (
          <>
            <Reveal>
              <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter projects">
                {["all", ...filters].map((f) => (
                  <button key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f}
                    className={cn("chip px-4 py-2 text-sm transition hover:text-fg", filter === f && "chip-active hover:text-white")}>
                    {f === "all" ? t.all : f}
                  </button>
                ))}
              </div>
            </Reveal>
            <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {shown.map((p) => (
                  <motion.article
                    key={p.id} layout initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.35 }}
                    className="glass group relative flex flex-col overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-primary/20">
                      {p.coverImage && <SmartImage src={p.coverImage} alt={`${p.title} screenshot`} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />}
                      {p.isFeatured && (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                          <Star className="h-3 w-3 fill-current text-secondary" aria-hidden /> Featured
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-accent">{p.category}</p>
                      <h3 className="mt-1 text-xl font-bold">
                        <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0 after:content-['']">{p.title}</Link>
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.summary}</p>
                      <ul className="mt-4 flex flex-wrap gap-1.5">{p.techStack.slice(0, 5).map((x) => <li key={x} className="chip">{x}</li>)}</ul>
                      <div className="relative z-10 mt-4 flex items-center gap-4 text-sm font-semibold">
                        {p.liveUrl && <a href={safeHref(p.liveUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">{t.live} <ArrowUpRight className="h-4 w-4" aria-hidden /></a>}
                        {p.githubUrl && <a href={safeHref(p.githubUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-fg"><SocialIcon platform="github" className="h-4 w-4" />{t.code}</a>}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
