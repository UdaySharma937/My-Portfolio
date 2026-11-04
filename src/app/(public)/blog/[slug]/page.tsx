import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import { SmartImage } from "@/components/ui/smart-image";
import { getPostBySlug } from "@/lib/data";
import { getDict } from "@/lib/locale";
import { formatDate, readingTime, siteUrl } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { locale } = await getDict();
  const post = await getPostBySlug(slug, locale);
  if (!post) return { title: "Note not found" };
  const description = post.seoDescription || post.excerpt;
  return {
    title: post.title,
    description,
    keywords: post.tags,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description, publishedTime: post.publishedAt?.toISOString(), tags: post.tags, images: post.coverImage ? [post.coverImage] : undefined },
    twitter: { card: "summary_large_image", title: post.title, description },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const { locale, t } = await getDict();
  const post = await getPostBySlug(slug, locale);
  if (!post) notFound();
  const jsonLd = {
    "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.seoDescription || post.excerpt,
    datePublished: post.publishedAt?.toISOString(), dateModified: post.updatedAt.toISOString(), keywords: post.tags.join(", "),
    image: post.coverImage ? `${siteUrl()}${post.coverImage}` : undefined, mainEntityOfPage: `${siteUrl()}/blog/${post.slug}`,
  };
  return (
    <article className="px-5 py-10 md:px-10 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-x max-w-3xl">
        <Link href="/blog" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-accent"><ArrowLeft className="h-4 w-4" />{t.allPosts}</Link>
        <header>
          <p className="text-sm text-muted">{formatDate(post.publishedAt, locale, true)} · {readingTime(post.content)} {t.min}</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl"><span className="text-gradient">{post.title}</span></h1>
          <ul className="mt-5 flex flex-wrap gap-2">{post.tags.map((x) => <li key={x}><Link href={`/blog?tag=${encodeURIComponent(x)}`} className="chip">#{x}</Link></li>)}</ul>
        </header>
        {post.coverImage && (
          <div className="glass relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl"><SmartImage src={post.coverImage} alt="" sizes="(min-width: 768px) 48rem, 100vw" priority /></div>
        )}
        <div className="glass mt-10 rounded-3xl p-6 sm:p-10"><Markdown>{post.content}</Markdown></div>
      </div>
    </article>
  );
}
