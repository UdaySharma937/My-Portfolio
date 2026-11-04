import {
  boolean,
  customType,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/** Shared audit columns. `updated_at` is refreshed on every ORM update. */
const stamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

const list = (name: string) => jsonb(name).$type<string[]>().notNull().default([]);

/* ------------------------------------------------------------------ */
/* Singleton tables (one row each, edited from the admin panel)        */
/* ------------------------------------------------------------------ */

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("Portfolio"),
  metaTitle: text("meta_title").notNull().default(""),
  metaDescription: text("meta_description").notNull().default(""),
  ogImage: text("og_image").notNull().default(""),
  favicon: text("favicon").notNull().default(""),
  email: text("email").notNull().default(""),
  location: text("location").notNull().default(""),
  locationHi: text("location_hi").notNull().default(""),
  resumeUrl: text("resume_url").notNull().default(""),
  githubUsername: text("github_username").notNull().default(""),
  ...stamps(),
});

export const hero = pgTable("hero", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  nameHi: text("name_hi").notNull().default(""),
  greeting: text("greeting").notNull().default("Hi, I'm"),
  greetingHi: text("greeting_hi").notNull().default(""),
  roles: list("roles"),
  rolesHi: list("roles_hi"),
  pitch: text("pitch").notNull().default(""),
  pitchHi: text("pitch_hi").notNull().default(""),
  ...stamps(),
});

export const about = pgTable("about", {
  id: serial("id").primaryKey(),
  heading: text("heading").notNull().default("About me"),
  headingHi: text("heading_hi").notNull().default(""),
  story: text("story").notNull().default(""),
  storyHi: text("story_hi").notNull().default(""),
  photoUrl: text("photo_url").notNull().default(""),
  specialties: list("specialties"),
  specialtiesHi: list("specialties_hi"),
  yearsExperience: integer("years_experience").notNull().default(0),
  ...stamps(),
});

export const themeSettings = pgTable("theme_settings", {
  id: serial("id").primaryKey(),
  primary: text("primary_color").notNull().default("#b3261e"),
  secondary: text("secondary_color").notNull().default("#e4572e"),
  g1: text("g1").notNull().default("#1a0505"),
  g2: text("g2").notNull().default("#5c0f0a"),
  g3: text("g3").notNull().default("#b3261e"),
  g4: text("g4").notNull().default("#e4572e"),
  g5: text("g5").notNull().default("#f4a259"),
  blur: integer("blur").notNull().default(18),
  animations: boolean("animations").notNull().default(true),
  grain: boolean("grain").notNull().default(true),
  defaultMode: text("default_mode").notNull().default("system"),
  ...stamps(),
});

/* ------------------------------------------------------------------ */
/* Content collections                                                 */
/* ------------------------------------------------------------------ */

export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  platform: text("platform").notNull().default("website"),
  url: text("url").notNull(),
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...stamps(),
});

export const skillCategories = pgTable("skill_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameHi: text("name_hi").notNull().default(""),
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...stamps(),
});

export const skills = pgTable(
  "skills",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id").references(() => skillCategories.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    icon: text("icon").notNull().default("code"),
    isPublished: boolean("is_published").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...stamps(),
  },
  (t) => [index("skills_category_idx").on(t.categoryId)],
);

export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    titleHi: text("title_hi").notNull().default(""),
    summary: text("summary").notNull().default(""),
    summaryHi: text("summary_hi").notNull().default(""),
    category: text("category").notNull().default("Web"),
    techStack: list("tech_stack"),
    coverImage: text("cover_image").notNull().default(""),
    /** Ordered list of gallery image URLs (drag-and-drop reorder in admin). */
    gallery: list("gallery"),
    problem: text("problem").notNull().default(""),
    problemHi: text("problem_hi").notNull().default(""),
    solution: text("solution").notNull().default(""),
    solutionHi: text("solution_hi").notNull().default(""),
    result: text("result").notNull().default(""),
    resultHi: text("result_hi").notNull().default(""),
    liveUrl: text("live_url").notNull().default(""),
    githubUrl: text("github_url").notNull().default(""),
    isFeatured: boolean("is_featured").notNull().default(false),
    isPublished: boolean("is_published").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...stamps(),
  },
  (t) => [uniqueIndex("projects_slug_uq").on(t.slug), index("projects_order_idx").on(t.sortOrder)],
);

export const certificates = pgTable(
  "certificates",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    titleHi: text("title_hi").notNull().default(""),
    issuer: text("issuer").notNull().default(""),
    category: text("category").notNull().default("General"),
    issueDate: date("issue_date"),
    expiryDate: date("expiry_date"),
    credentialId: text("credential_id").notNull().default(""),
    credentialUrl: text("credential_url").notNull().default(""),
    fileUrl: text("file_url").notNull().default(""),
    isFeatured: boolean("is_featured").notNull().default(false),
    isPublished: boolean("is_published").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...stamps(),
  },
  (t) => [index("certificates_order_idx").on(t.sortOrder)],
);

export const experience = pgTable("experience", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(),
  roleHi: text("role_hi").notNull().default(""),
  company: text("company").notNull().default(""),
  location: text("location").notNull().default(""),
  startDate: date("start_date"),
  endDate: date("end_date"),
  description: text("description").notNull().default(""),
  descriptionHi: text("description_hi").notNull().default(""),
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...stamps(),
});

export const education = pgTable("education", {
  id: serial("id").primaryKey(),
  degree: text("degree").notNull(),
  degreeHi: text("degree_hi").notNull().default(""),
  institution: text("institution").notNull().default(""),
  startDate: date("start_date"),
  endDate: date("end_date"),
  description: text("description").notNull().default(""),
  descriptionHi: text("description_hi").notNull().default(""),
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...stamps(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleHi: text("title_hi").notNull().default(""),
  description: text("description").notNull().default(""),
  descriptionHi: text("description_hi").notNull().default(""),
  icon: text("icon").notNull().default("code"),
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...stamps(),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull().default(""),
  roleHi: text("role_hi").notNull().default(""),
  photoUrl: text("photo_url").notNull().default(""),
  text: text("text").notNull(),
  textHi: text("text_hi").notNull().default(""),
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...stamps(),
});

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    titleHi: text("title_hi").notNull().default(""),
    excerpt: text("excerpt").notNull().default(""),
    excerptHi: text("excerpt_hi").notNull().default(""),
    content: text("content").notNull().default(""),
    contentHi: text("content_hi").notNull().default(""),
    coverImage: text("cover_image").notNull().default(""),
    tags: list("tags"),
    seoDescription: text("seo_description").notNull().default(""),
    /** Posts with a future date stay hidden until then (scheduled publishing). */
    publishedAt: timestamp("published_at", { withTimezone: true }),
    isPublished: boolean("is_published").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...stamps(),
  },
  (t) => [uniqueIndex("blog_slug_uq").on(t.slug), index("blog_published_idx").on(t.publishedAt)],
);

export const nowItems = pgTable("now_items", {
  id: serial("id").primaryKey(),
  label: text("label").notNull().default("Building"),
  labelHi: text("label_hi").notNull().default(""),
  text: text("text").notNull(),
  textHi: text("text_hi").notNull().default(""),
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...stamps(),
});

export const sectionVisibility = pgTable(
  "section_visibility",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    label: text("label").notNull(),
    isVisible: boolean("is_visible").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...stamps(),
  },
  (t) => [uniqueIndex("section_key_uq").on(t.key)],
);

/* ------------------------------------------------------------------ */
/* Operational tables                                                  */
/* ------------------------------------------------------------------ */

export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull().default(""),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_created_idx").on(t.createdAt)],
);

export const pageViews = pgTable(
  "page_views",
  {
    id: serial("id").primaryKey(),
    path: text("path").notNull(),
    referrer: text("referrer").notNull().default(""),
    /** Daily-rotating salted hash – no cookies, no raw IPs stored. */
    visitor: text("visitor").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("page_views_created_idx").on(t.createdAt), index("page_views_path_idx").on(t.path)],
);

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  bucket: text("bucket").notNull(),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

/**
 * Uploaded files live in Postgres, so the app works on any host (including Vercel's
 * read-only serverless filesystem). Served through /api/files with immutable caching.
 */
export const storedFiles = pgTable(
  "stored_files",
  {
    id: serial("id").primaryKey(),
    bucket: text("bucket").notNull(),
    filename: text("filename").notNull(),
    mime: text("mime").notNull(),
    data: bytea("data").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("stored_files_name_uq").on(t.bucket, t.filename)],
);
