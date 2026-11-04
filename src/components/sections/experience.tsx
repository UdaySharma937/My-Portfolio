import { GraduationCap, Briefcase } from "lucide-react";
import { EmptyState, Reveal, SectionHeading } from "@/components/ui/motion";
import { formatDate } from "@/lib/utils";
import type { Dict, Locale } from "@/lib/i18n";
import type { SiteData } from "@/lib/data";

interface Entry { id: number; title: string; org: string; meta: string; period: string; text: string }

function Timeline({ title, icon, entries }: { title: string; icon: React.ReactNode; entries: Entry[] }) {
  return (
    <div>
      <h3 className="mb-6 flex items-center gap-3 text-2xl font-bold"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white">{icon}</span>{title}</h3>
      <ol className="relative space-y-6 border-l-2 border-line pl-6">
        {entries.map((e, i) => (
          <li key={e.id} className="relative">
            <span className="absolute -left-[33px] top-2 h-4 w-4 rounded-full border-4 border-bg bg-secondary" aria-hidden />
            <Reveal delay={i * 0.06}>
              <div className="glass rounded-3xl p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-accent">{e.period}</p>
                <h4 className="mt-1 text-lg font-bold">{e.title}</h4>
                <p className="text-sm font-medium text-muted">{e.org}{e.meta ? ` · ${e.meta}` : ""}</p>
                {e.text && <p className="mt-3 text-sm leading-relaxed text-muted">{e.text}</p>}
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Experience({ data, t, locale }: { data: SiteData; t: Dict; locale: Locale }) {
  const period = (s: string | null, e: string | null) => `${formatDate(s, locale)} — ${e ? formatDate(e, locale) : t.present}`;
  const exp: Entry[] = data.experience.map((x) => ({ id: x.id, title: x.role, org: x.company, meta: x.location, period: period(x.startDate, x.endDate), text: x.description }));
  const edu: Entry[] = data.education.map((x) => ({ id: x.id, title: x.degree, org: x.institution, meta: "", period: period(x.startDate, x.endDate), text: x.description }));
  return (
    <section id="experience" className="section">
      <div className="container-x">
        <SectionHeading eyebrow={t.nav.experience} title={t.journey} />
        {exp.length + edu.length === 0 ? (
          <EmptyState>{t.noTimeline}</EmptyState>
        ) : (
          <div className="grid gap-12 lg:grid-cols-2">
            {exp.length > 0 && <Timeline title={t.experience} icon={<Briefcase className="h-5 w-5" />} entries={exp} />}
            {edu.length > 0 && <Timeline title={t.education} icon={<GraduationCap className="h-5 w-5" />} entries={edu} />}
          </div>
        )}
      </div>
    </section>
  );
}
