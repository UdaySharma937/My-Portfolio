import { CountUp } from "@/components/sections/count-up";
import { Reveal, SectionHeading } from "@/components/ui/motion";
import { SmartImage } from "@/components/ui/smart-image";
import type { Dict } from "@/lib/i18n";
import type { SiteData } from "@/lib/data";

export function About({ data, t }: { data: SiteData; t: Dict }) {
  const { about, projects, certificates, hero } = data;
  const stats = [
    { label: t.years, value: about.yearsExperience, suffix: "+" },
    { label: t.projectsStat, value: projects.length, suffix: "" },
    { label: t.certsStat, value: certificates.length, suffix: "" },
  ];
  return (
    <section id="about" className="section">
      <div className="container-x">
        <SectionHeading eyebrow={t.nav.about} title={about.heading} />
        <div className="grid items-start gap-10 lg:grid-cols-[360px_1fr]">
          <Reveal>
            <div className="glass relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] p-2">
              <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-primary/20">
                {about.photoUrl && <SmartImage src={about.photoUrl} alt={`Portrait of ${hero.name}`} sizes="(min-width: 1024px) 360px, 90vw" />}
              </div>
            </div>
          </Reveal>
          <div>
            <Reveal delay={0.05}>
              <div className="space-y-4 text-lg leading-relaxed text-muted">
                {about.story.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </Reveal>
            {about.specialties.length > 0 && (
              <Reveal delay={0.1} className="mt-8">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-accent">{t.specialties}</h3>
                <ul className="flex flex-wrap gap-2">
                  {about.specialties.map((s) => <li key={s} className="chip text-sm">{s}</li>)}
                </ul>
              </Reveal>
            )}
            <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={0.1 + i * 0.07}>
                  <div className="glass rounded-3xl p-4 text-center sm:p-6">
                    <div className="text-gradient font-display text-3xl font-extrabold sm:text-5xl"><CountUp value={s.value} suffix={s.suffix} /></div>
                    <div className="mt-1 text-xs text-muted sm:text-sm">{s.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
