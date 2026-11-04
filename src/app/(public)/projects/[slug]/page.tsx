import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { SocialIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/motion";
import { SmartImage } from "@/components/ui/smart-image";
import { getProjectBySlug } from "@/lib/data";
import { getDict } from "@/lib/locale";
import { safeHref } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { locale } = await getDict();
  const res = await getProjectBySlug(slug, locale);
  if (!res) return { title: "Project not found" };
  const { project } = res;
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.title, description: project.summary, images: project.coverImage ? [project.coverImage] : undefined },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const { locale, t } = await getDict();
  const res = await getProjectBySlug(slug, locale);
  if (!res) notFound();
  const { project: p, prev, next } = res;
  const story = [
    { n: "01", title: t.problem, text: p.problem },
    { n: "02", title: t.solution, text: p.solution },
    { n: "03", title: t.result, text: p.result },
  ].filter((s) => s.text);

  return (
    <article className="px-5 py-10 md:px-10 md:py-16">
      <div className="container-x max-w-5xl">
        <Link href="/#projects" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-accent"><ArrowLeft className="h-4 w-4" />{t.back}</Link>
        <header>
          <p className="eyebrow mb-3">{p.category} · {t.caseStudy}</p>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl"><span className="text-gradient">{p.title}</span></h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">{p.summary}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {p.liveUrl && <a href={safeHref(p.liveUrl)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">{t.live} <ArrowUpRight className="h-4 w-4" /></a>}
            {p.githubUrl && <a href={safeHref(p.githubUrl)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost"><SocialIcon platform="github" className="h-4 w-4" />{t.code}</a>}
          </div>
        </header>

        {p.coverImage && (
          <Reveal className="mt-10">
            <div className="glass relative aspect-[16/9] overflow-hidden rounded-[2rem] p-2">
              <div className="relative h-full w-full overflow-hidden rounded-[1.5rem]"><SmartImage src={p.coverImage} alt={`${p.title} cover`} sizes="(min-width: 1024px) 64rem, 100vw" priority /></div>
            </div>
          </Reveal>
        )}

        {p.techStack.length > 0 && (
          <div className="mt-8"><h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-accent">{t.techStack}</h2>
            <ul className="flex flex-wrap gap-2">{p.techStack.map((x) => <li key={x} className="chip text-sm">{x}</li>)}</ul></div>
        )}

        <div className="mt-14 space-y-5">
          {story.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.05}>
              <section className="glass grid gap-4 rounded-3xl p-6 sm:grid-cols-[6rem_1fr] sm:p-8">
                <span className="text-gradient font-display text-5xl font-extrabold">{s.n}</span>
                <div><h2 className="text-2xl font-bold">{s.title}</h2><p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-muted">{s.text}</p></div>
              </section>
            </Reveal>
          ))}
        </div>

        {p.gallery.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 text-2xl font-bold">{t.gallery}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {p.gallery.map((src, i) => (
                <Reveal key={src + i} delay={(i % 2) * 0.06}>
                  <div className="glass relative aspect-[16/10] overflow-hidden rounded-3xl"><SmartImage src={src} alt={`${p.title} screenshot ${i + 1}`} sizes="(min-width: 640px) 50vw, 100vw" /></div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {(prev || next) && (
          <nav aria-label="Project navigation" className="mt-16 grid gap-4 sm:grid-cols-2">
            {prev ? (
              <Link href={`/projects/${prev.slug}`} className="glass group rounded-3xl p-6 transition hover:-translate-y-1">
                <span className="flex items-center gap-2 text-sm text-muted"><ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />{t.prev}</span>
                <span className="mt-1 block text-xl font-bold">{prev.title}</span>
              </Link>
            ) : <span />}
            {next && (
              <Link href={`/projects/${next.slug}`} className="glass group rounded-3xl p-6 text-right transition hover:-translate-y-1">
                <span className="flex items-center justify-end gap-2 text-sm text-muted">{t.next}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                <span className="mt-1 block text-xl font-bold">{next.title}</span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </article>
  );
}
