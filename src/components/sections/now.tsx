import { EmptyState, Reveal, SectionHeading } from "@/components/ui/motion";
import type { Dict } from "@/lib/i18n";
import type { SiteData } from "@/lib/data";

export function Now({ data, t }: { data: SiteData; t: Dict }) {
  return (
    <section id="now" className="section">
      <div className="container-x">
        <SectionHeading eyebrow={t.nav.now} title={t.now} sub={t.nowSub} />
        {data.now.length === 0 ? (
          <EmptyState>{t.noNow}</EmptyState>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {data.now.map((n, i) => (
              <Reveal key={n.id} delay={i * 0.07}>
                <div className="glass h-full rounded-3xl p-6">
                  <span className="chip chip-active mb-4 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden /> {n.label}
                  </span>
                  <p className="text-base leading-relaxed">{n.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
