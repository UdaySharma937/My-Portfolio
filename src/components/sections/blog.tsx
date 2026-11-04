import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EmptyState, Reveal, SectionHeading } from "@/components/ui/motion";
import { formatDate, readingTime } from "@/lib/utils";
import type { Dict, Locale } from "@/lib/i18n";

export interface PostLite { id: number; slug: string; title: string; excerpt: string; content: string; tags: string[]; publishedAt: Date | null }

export function PostCard({ post, t, locale }: { post: PostLite; t: Dict; locale: Locale }) {
  return (
    <article className="glass group relative flex h-full flex-col rounded-3xl p-6 transition duration-300 hover:-translate-y-1.5">
      <p className="text-xs text-muted">
        {formatDate(post.publishedAt, locale, true)} · {readingTime(post.content)} {t.min}
      </p>
      <h3 className="mt-2 text-xl font-bold leading-snug">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-['']">{post.title}</Link>
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{post.excerpt}</p>
      <ul className="mt-4 flex flex-wrap gap-1.5">{post.tags.map((x) => <li key={x} className="chip">#{x}</li>)}</ul>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">{t.readMore} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden /></span>
    </article>
  );
}

export function Blog({ posts, t, locale }: { posts: PostLite[]; t: Dict; locale: Locale }) {
  return (
    <section id="blog" className="section">
      <div className="container-x">
        <SectionHeading eyebrow={t.nav.blog} title={t.blog} sub={t.blogSub} />
        {posts.length === 0 ? (
          <EmptyState>{t.noPosts}</EmptyState>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, 3).map((p, i) => <Reveal key={p.id} delay={i * 0.07}><PostCard post={p} t={t} locale={locale} /></Reveal>)}
            </div>
            <div className="mt-8 text-center"><Link href="/blog" className="btn btn-ghost">{t.allPosts} <ArrowRight className="h-4 w-4" /></Link></div>
          </>
        )}
      </div>
    </section>
  );
}
