import { GitFork, Star } from "lucide-react";
import { EmptyState, Reveal, SectionHeading } from "@/components/ui/motion";
import { SocialIcon } from "@/components/ui/icons";
import { getGithubData, type GithubDay } from "@/lib/github";
import type { Dict } from "@/lib/i18n";

function Graph({ days }: { days: GithubDay[] }) {
  const pad = new Date(`${days[0].date}T00:00:00Z`).getUTCDay(); // align first column to Sunday
  const cells: (GithubDay | null)[] = [...Array(pad).fill(null), ...days];
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid w-max grid-flow-col gap-[3px]" style={{ gridTemplateRows: "repeat(7, 11px)" }} role="img" aria-label="Contribution graph">
        {cells.map((d, i) => (
          <span key={i} title={d ? `${d.count} on ${d.date}` : undefined} className="h-[11px] w-[11px] rounded-[3px]"
            style={{ background: !d ? "transparent" : d.level === 0 ? "color-mix(in srgb, var(--muted) 18%, transparent)" : `color-mix(in srgb, var(--secondary) ${20 + d.level * 20}%, var(--primary) ${d.level * 8}%)` }} />
        ))}
      </div>
    </div>
  );
}

/** Server component – data is cached for an hour (ISR-style) and degrades gracefully if GitHub is unreachable. */
export async function GithubStats({ username, t }: { username: string; t: Dict }) {
  const data = username ? await getGithubData(username) : null;
  return (
    <section id="github" className="section">
      <div className="container-x">
        <SectionHeading eyebrow={t.nav.github} title={t.github} sub={t.githubSub} />
        {!data ? (
          <EmptyState>{t.githubDown}</EmptyState>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3 sm:gap-5">
              {[{ l: t.repos, v: data.publicRepos }, { l: t.stars, v: data.stars }, { l: t.followers, v: data.followers }].map((s, i) => (
                <Reveal key={s.l} delay={i * 0.06}>
                  <div className="glass rounded-3xl p-4 text-center sm:p-6">
                    <div className="text-gradient font-display text-3xl font-extrabold sm:text-5xl">{s.v}</div>
                    <div className="mt-1 text-xs text-muted sm:text-sm">{s.l}</div>
                  </div>
                </Reveal>
              ))}
            </div>
            {data.days && (
              <Reveal>
                <div className="glass rounded-3xl p-5 sm:p-6">
                  <p className="mb-4 text-sm font-semibold">{data.totalContributions != null ? `${data.totalContributions} ` : ""}{t.contributions}</p>
                  <Graph days={data.days} />
                </div>
              </Reveal>
            )}
            {data.repos.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-bold">{t.pinned}</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {data.repos.map((r, i) => (
                    <Reveal key={r.name} delay={i * 0.05}>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="glass flex h-full flex-col rounded-3xl p-5 transition hover:-translate-y-1 hover:border-accent">
                        <span className="flex items-center gap-2 font-bold text-accent"><SocialIcon platform="github" className="h-4 w-4" />{r.name}</span>
                        <span className="mt-2 flex-1 text-sm text-muted">{r.description || "—"}</span>
                        <span className="mt-4 flex items-center gap-4 text-xs text-muted">
                          {r.language && <span>● {r.language}</span>}
                          <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5" aria-hidden />{r.stars}</span>
                          <span className="inline-flex items-center gap-1"><GitFork className="h-3.5 w-3.5" aria-hidden />{r.forks}</span>
                        </span>
                      </a>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
