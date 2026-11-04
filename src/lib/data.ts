import "server-only";
import { cache } from "react";
import { and, asc, desc, eq, isNull, lte, or } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
import * as s from "@/db/schema";
import { seedIfEmpty } from "@/db/seed";
import { localize, type Locale } from "@/lib/i18n";

/** Fetches (or lazily creates) the single row of a singleton table. */
export async function getSingleton<T extends PgTable>(table: T): Promise<T["$inferSelect"]> {
  await seedIfEmpty();
  const t = table as unknown as PgTable;
  const rows = await db.select().from(t).limit(1);
  if (rows[0]) return rows[0] as T["$inferSelect"];
  const created = await db.insert(t).values({} as never).returning();
  return created[0] as T["$inferSelect"];
}

const postVisible = and(
  eq(s.blogPosts.isPublished, true),
  or(isNull(s.blogPosts.publishedAt), lte(s.blogPosts.publishedAt, new Date())),
);

const loc = <T extends object>(rows: T[], locale: Locale) => rows.map((r) => localize(r, locale));

/** Everything the public homepage needs, localized and filtered to published rows. */
async function loadSiteData(locale: Locale) {
  await seedIfEmpty();
  const [settings, hero, about, theme] = await Promise.all([
    getSingleton(s.siteSettings),
    getSingleton(s.hero),
    getSingleton(s.about),
    getSingleton(s.themeSettings),
  ]);
  const [sections, social, categories, skills, projects, certificates, experience, education, services, testimonials, posts, now] =
    await Promise.all([
      db.select().from(s.sectionVisibility).orderBy(asc(s.sectionVisibility.sortOrder)),
      db.select().from(s.socialLinks).where(eq(s.socialLinks.isPublished, true)).orderBy(asc(s.socialLinks.sortOrder)),
      db.select().from(s.skillCategories).where(eq(s.skillCategories.isPublished, true)).orderBy(asc(s.skillCategories.sortOrder)),
      db.select().from(s.skills).where(eq(s.skills.isPublished, true)).orderBy(asc(s.skills.sortOrder)),
      db.select().from(s.projects).where(eq(s.projects.isPublished, true)).orderBy(desc(s.projects.isFeatured), asc(s.projects.sortOrder), desc(s.projects.id)),
      db.select().from(s.certificates).where(eq(s.certificates.isPublished, true)).orderBy(desc(s.certificates.isFeatured), asc(s.certificates.sortOrder)),
      db.select().from(s.experience).where(eq(s.experience.isPublished, true)).orderBy(asc(s.experience.sortOrder)),
      db.select().from(s.education).where(eq(s.education.isPublished, true)).orderBy(asc(s.education.sortOrder)),
      db.select().from(s.services).where(eq(s.services.isPublished, true)).orderBy(asc(s.services.sortOrder)),
      db.select().from(s.testimonials).where(eq(s.testimonials.isPublished, true)).orderBy(asc(s.testimonials.sortOrder)),
      db.select().from(s.blogPosts).where(postVisible).orderBy(desc(s.blogPosts.publishedAt)).limit(6),
      db.select().from(s.nowItems).where(eq(s.nowItems.isPublished, true)).orderBy(asc(s.nowItems.sortOrder)),
    ]);

  return {
    settings: localize(settings, locale),
    hero: localize(hero, locale),
    about: localize(about, locale),
    theme,
    sections,
    social,
    skillGroups: loc(categories, locale)
      .map((c) => ({ ...c, items: skills.filter((k) => k.categoryId === c.id) }))
      .filter((c) => c.items.length > 0),
    projects: loc(projects, locale),
    certificates: loc(certificates, locale),
    experience: loc(experience, locale),
    education: loc(education, locale),
    services: loc(services, locale),
    testimonials: loc(testimonials, locale),
    posts: loc(posts, locale),
    now: loc(now, locale),
  };
}

/** Request-scoped cache: layout + page share one DB round-trip. */
export const getSiteData = cache(loadSiteData);
export type SiteData = Awaited<ReturnType<typeof loadSiteData>>;

export async function getProjectBySlug(slug: string, locale: Locale) {
  const [row] = await db.select().from(s.projects).where(and(eq(s.projects.slug, slug), eq(s.projects.isPublished, true))).limit(1);
  if (!row) return null;
  const all = await db
    .select({ slug: s.projects.slug, title: s.projects.title, titleHi: s.projects.titleHi })
    .from(s.projects)
    .where(eq(s.projects.isPublished, true))
    .orderBy(desc(s.projects.isFeatured), asc(s.projects.sortOrder), desc(s.projects.id));
  const idx = all.findIndex((p) => p.slug === slug);
  const list = loc(all, locale);
  return {
    project: localize(row, locale),
    prev: idx > 0 ? list[idx - 1] : list.length > 1 ? list[list.length - 1] : null,
    next: idx < list.length - 1 ? list[idx + 1] : list.length > 1 ? list[0] : null,
  };
}

export async function getPublishedPosts(locale: Locale) {
  const rows = await db.select().from(s.blogPosts).where(postVisible).orderBy(desc(s.blogPosts.publishedAt));
  return loc(rows, locale);
}

export async function getPostBySlug(slug: string, locale: Locale) {
  const [row] = await db.select().from(s.blogPosts).where(and(eq(s.blogPosts.slug, slug), postVisible)).limit(1);
  return row ? localize(row, locale) : null;
}

/** Lightweight list for sitemap + command palette. */
export async function getSlugs() {
  const [projects, posts] = await Promise.all([
    db.select({ slug: s.projects.slug, title: s.projects.title, updatedAt: s.projects.updatedAt }).from(s.projects).where(eq(s.projects.isPublished, true)),
    db.select({ slug: s.blogPosts.slug, title: s.blogPosts.title, updatedAt: s.blogPosts.updatedAt }).from(s.blogPosts).where(postVisible),
  ]);
  return { projects, posts };
}

/** Builds the CSS-variable override block from admin theme settings. */
export function themeCss(t: typeof s.themeSettings.$inferSelect): string {
  const hex = /^#[0-9a-fA-F]{6}$/;
  const c = (v: string, f: string) => (hex.test(v) ? v : f);
  return `:root{--primary:${c(t.primary, "#b3261e")};--secondary:${c(t.secondary, "#e4572e")};--g1:${c(t.g1, "#1a0505")};--g2:${c(t.g2, "#5c0f0a")};--g3:${c(t.g3, "#b3261e")};--g4:${c(t.g4, "#e4572e")};--g5:${c(t.g5, "#f4a259")};--blur:${Math.min(40, Math.max(0, t.blur))}px;--grain:${t.grain ? 0.07 : 0};--anim:${t.animations ? "running" : "paused"}}`;
}
