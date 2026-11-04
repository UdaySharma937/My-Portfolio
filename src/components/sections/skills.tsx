import { EmptyState, Reveal, SectionHeading } from "@/components/ui/motion";
import { SkillIcon } from "@/components/ui/icons";
import type { Dict } from "@/lib/i18n";
import type { SiteData } from "@/lib/data";

export function Skills({ data, t }: { data: SiteData; t: Dict }) {
  return (
    <section id="skills" className="section">
      <div className="container-x">
        <SectionHeading eyebrow={t.nav.skills} title={t.skills} sub={t.skillsSub} />
        {data.skillGroups.length === 0 ? (
          <EmptyState>{t.noSkills}</EmptyState>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {data.skillGroups.map((g, i) => (
              <Reveal key={g.id} delay={i * 0.06}>
                <div className="glass h-full rounded-3xl p-6 transition duration-300 hover:-translate-y-1">
                  <h3 className="mb-4 text-xl font-bold">{g.name}</h3>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {g.items.map((k) => (
                      <li key={k.id} className="flex items-center gap-2.5 rounded-2xl border border-line bg-bg/30 px-3 py-2.5 text-sm font-medium transition hover:border-accent">
                        <SkillIcon name={k.icon} className="h-[18px] w-[18px] shrink-0 text-accent" />
                        <span className="truncate">{k.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
