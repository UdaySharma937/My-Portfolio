import "server-only";
import type { PgTable } from "drizzle-orm/pg-core";
import * as s from "@/db/schema";

/** Maps admin resource keys to Drizzle tables (server only). */
export const TABLES: Record<string, PgTable> = {
  site: s.siteSettings,
  hero: s.hero,
  about: s.about,
  theme: s.themeSettings,
  sections: s.sectionVisibility,
  social: s.socialLinks,
  projects: s.projects,
  certificates: s.certificates,
  "skill-categories": s.skillCategories,
  skills: s.skills,
  experience: s.experience,
  education: s.education,
  services: s.services,
  testimonials: s.testimonials,
  blog: s.blogPosts,
  now: s.nowItems,
};

/** Tables included in JSON backups, in dependency order (parents first). */
export const BACKUP_TABLES: Record<string, PgTable> = {
  site_settings: s.siteSettings,
  hero: s.hero,
  about: s.about,
  theme_settings: s.themeSettings,
  section_visibility: s.sectionVisibility,
  social_links: s.socialLinks,
  skill_categories: s.skillCategories,
  skills: s.skills,
  projects: s.projects,
  certificates: s.certificates,
  experience: s.experience,
  education: s.education,
  services: s.services,
  testimonials: s.testimonials,
  blog_posts: s.blogPosts,
  now_items: s.nowItems,
};
