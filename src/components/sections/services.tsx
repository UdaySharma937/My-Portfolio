import { EmptyState, Reveal, SectionHeading } from "@/components/ui/motion";
import { SkillIcon } from "@/components/ui/icons";
import type { Dict } from "@/lib/i18n";
import type { SiteData } from "@/lib/data";

export function Services({ data, t }: { data: SiteData; t: Dict }) {
  return (
    <section id="services" className="section">
      <div className="container-x">
        <SectionHeading eyebrow={t.nav.services} title={t.services} sub={t.servicesSub} />
        {data.services.length === 0 ? (
          <EmptyState>{t.empty}</EmptyState>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.services.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.07}>
                <div className="glass group h-full rounded-3xl p-6 transition duration-300 hover:-translate-y-1.5">
                  <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30 transition group-hover:rotate-6">
                    <SkillIcon name={s.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
