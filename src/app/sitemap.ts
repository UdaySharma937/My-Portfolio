import type { MetadataRoute } from "next";
import { getSlugs } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  let projects: { slug: string; updatedAt: Date }[] = [];
  let posts: { slug: string; updatedAt: Date }[] = [];
  try {
    ({ projects, posts } = await getSlugs());
  } catch {
    /* DB unavailable – still serve the static entries */
  }
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.7 },
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, lastModified: p.updatedAt, priority: 0.8 })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
  ];
}
