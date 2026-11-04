import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostCard } from "@/components/sections/blog";
import { EmptyState, Reveal } from "@/components/ui/motion";
import { getPublishedPosts, getSiteData } from "@/lib/data";
import { getDict } from "@/lib/locale";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Notes & writing", alternates: { canonical: "/blog" } };

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { locale, t } = await getDict();
  const data = await getSiteData(locale);
  if (!data.sections.find((s) => s.key === "blog")?.isVisible) notFound();
  const { tag } = await searchParams;
  const all = await getPublishedPosts(locale);
  const tags = [...new Set(all.flatMap((p) => p.tags))];
  const posts = tag ? all.filter((p) => p.tags.includes(tag)) : all;
  return (
    <div className="px-5 py-10 md:px-10 md:py-16">
      <div className="container-x">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-accent"><ArrowLeft className="h-4 w-4" />{t.goHome}</Link>
        <p className="eyebrow mb-3">{t.nav.blog}</p>
        <h1 className="text-4xl font-extrabold sm:text-6xl"><span className="text-gradient">{t.blog}</span></h1>
        <p className="mt-4 max-w-xl text-lg text-muted">{t.blogSub}</p>
        {tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            <Link href="/blog" className={`chip px-4 py-2 ${!tag ? "chip-active" : ""}`}>{t.all}</Link>
            {tags.map((x) => <Link key={x} href={`/blog?tag=${encodeURIComponent(x)}`} className={`chip px-4 py-2 ${tag === x ? "chip-active" : ""}`}>#{x}</Link>)}
          </div>
        )}
        <div className="mt-10">
          {posts.length === 0 ? <EmptyState>{t.noPosts}</EmptyState> : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => <Reveal key={p.id} delay={(i % 3) * 0.06}><PostCard post={p} t={t} locale={locale} /></Reveal>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
