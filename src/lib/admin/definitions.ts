import { ICON_OPTIONS, PLATFORM_OPTIONS } from "@/lib/options";

/**
 * Declarative description of every admin-editable collection. The same definitions drive
 * the list UI, the form UI AND the server-side Zod validation, so they can never drift apart.
 * (Pure data – safe to import from client and server code.)
 */
export type FieldType =
  | "text" | "textarea" | "markdown" | "url" | "email" | "number" | "boolean" | "date" | "datetime"
  | "select" | "relation" | "tags" | "image" | "file" | "images" | "slug" | "color" | "range";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  options?: { value: string; label: string }[];
  relation?: string; // resource key whose rows supply the options
  bucket?: string; // upload bucket for image/file/images
  slugFrom?: string; // auto-generate slug from this field
  hi?: boolean; // Hindi translation field (grouped in the form)
  min?: number;
  max?: number;
  readOnly?: boolean;
}

export interface ResourceDef {
  key: string;
  title: string;
  singular: string;
  group: "Site" | "Content";
  description: string;
  titleField: string;
  columns: string[];
  fields: FieldDef[];
  singleton?: boolean;
  sortable?: boolean;
  publishField?: string; // boolean column used for the show/hide toggle
  featuredField?: string;
  noCreate?: boolean;
  noDelete?: boolean;
  preview?: "theme";
}

const t = (name: string, label: string, extra: Partial<FieldDef> = {}): FieldDef => ({ name, label, type: "text", ...extra });
const hi = (f: FieldDef): FieldDef => ({ ...f, label: `${f.label} (हिन्दी)`, hi: true, required: false });

export const RESOURCES: ResourceDef[] = [
  {
    key: "site", title: "Site & SEO", singular: "Site settings", group: "Site", singleton: true, titleField: "siteName", columns: [],
    description: "Site name, SEO meta tags, social preview image, favicon, résumé and contact details.",
    fields: [
      t("siteName", "Site / person name", { required: true }),
      t("metaTitle", "SEO title", { hint: "Shown in Google & browser tab. Keep under 60 characters." }),
      { name: "metaDescription", label: "SEO description", type: "textarea", hint: "Keep under 160 characters." },
      { name: "ogImage", label: "Social preview image (OG)", type: "image", bucket: "media", hint: "1200×630 recommended." },
      { name: "favicon", label: "Favicon", type: "image", bucket: "media", hint: "Square PNG, 64×64 or larger." },
      { name: "resumeUrl", label: "Résumé (PDF)", type: "file", bucket: "resume", hint: "Upload again to replace the current file." },
      { name: "email", label: "Public contact email", type: "email" },
      t("location", "Location"), hi(t("locationHi", "Location")),
      t("githubUsername", "GitHub username", { hint: "Powers the live GitHub stats section." }),
    ],
  },
  {
    key: "hero", title: "Hero", singular: "Hero", group: "Site", singleton: true, titleField: "name", columns: [],
    description: "The first thing visitors see: name, rotating roles and one-line pitch.",
    fields: [
      t("name", "Your name", { required: true }), t("greeting", "Greeting"),
      { name: "roles", label: "Animated roles", type: "tags", hint: "Press Enter after each role (typewriter order)." },
      { name: "pitch", label: "One-line pitch", type: "textarea" },
      hi(t("nameHi", "Your name")), hi(t("greetingHi", "Greeting")),
      hi({ name: "rolesHi", label: "Animated roles", type: "tags" }), hi({ name: "pitchHi", label: "One-line pitch", type: "textarea" }),
    ],
  },
  {
    key: "about", title: "About", singular: "About", group: "Site", singleton: true, titleField: "heading", columns: [],
    description: "Your story, photo, specialties and years of experience (project & certificate counts are automatic).",
    fields: [
      t("heading", "Heading"), { name: "story", label: "Story", type: "textarea", hint: "Blank line = new paragraph." },
      { name: "photoUrl", label: "Photo", type: "image", bucket: "avatars" },
      { name: "specialties", label: "Specialties", type: "tags" },
      { name: "yearsExperience", label: "Years of experience", type: "number", min: 0, max: 80 },
      hi(t("headingHi", "Heading")), hi({ name: "storyHi", label: "Story", type: "textarea" }), hi({ name: "specialtiesHi", label: "Specialties", type: "tags" }),
    ],
  },
  {
    key: "theme", title: "Theme", singular: "Theme", group: "Site", singleton: true, titleField: "primary", columns: [], preview: "theme",
    description: "Change the Mars palette, glass blur and animations. Changes preview live as you edit.",
    fields: [
      { name: "primary", label: "Primary colour", type: "color" }, { name: "secondary", label: "Secondary colour", type: "color" },
      { name: "g1", label: "Gradient stop 1 (darkest)", type: "color" }, { name: "g2", label: "Gradient stop 2", type: "color" },
      { name: "g3", label: "Gradient stop 3", type: "color" }, { name: "g4", label: "Gradient stop 4", type: "color" },
      { name: "g5", label: "Gradient stop 5 (lightest)", type: "color" },
      { name: "blur", label: "Glass blur intensity (px)", type: "range", min: 0, max: 40 },
      { name: "animations", label: "Enable animations", type: "boolean" }, { name: "grain", label: "Grain texture overlay", type: "boolean" },
      { name: "defaultMode", label: "Default mode for new visitors", type: "select", options: [{ value: "system", label: "Follow system" }, { value: "dark", label: "Dark" }, { value: "light", label: "Light" }] },
    ],
  },
  {
    key: "sections", title: "Sections", singular: "Section", group: "Site", sortable: true, noCreate: true, noDelete: true, titleField: "label",
    columns: ["label", "key"], publishField: "isVisible",
    description: "Drag to reorder homepage sections and use the switch to show or hide them.",
    fields: [t("label", "Label", { required: true }), t("key", "Key", { readOnly: true })],
  },
  {
    key: "social", title: "Social links", singular: "Link", group: "Site", sortable: true, titleField: "label", columns: ["label", "platform", "url"], publishField: "isPublished",
    description: "Links shown in the sidebar and contact section.",
    fields: [t("label", "Label", { required: true }), { name: "platform", label: "Platform", type: "select", options: PLATFORM_OPTIONS, required: true }, { name: "url", label: "URL", type: "url", required: true, hint: "Use mailto:you@example.com for email." }],
  },
  {
    key: "projects", title: "Projects", singular: "Project", group: "Content", sortable: true, titleField: "title", columns: ["coverImage", "title", "category", "techStack"],
    publishField: "isPublished", featuredField: "isFeatured",
    description: "Portfolio projects with full case-study pages. Featured projects are listed first.",
    fields: [
      t("title", "Title", { required: true }), { name: "slug", label: "URL slug", type: "slug", slugFrom: "title", required: true, hint: "Auto-generated; used in /projects/your-slug." },
      { name: "summary", label: "Short description", type: "textarea" }, t("category", "Category", { hint: "e.g. Web App, Mobile, Dashboard" }),
      { name: "techStack", label: "Tech stack", type: "tags" },
      { name: "coverImage", label: "Cover image", type: "image", bucket: "projects" },
      { name: "gallery", label: "Gallery (drag to reorder)", type: "images", bucket: "projects" },
      { name: "problem", label: "Problem", type: "textarea" }, { name: "solution", label: "Solution", type: "textarea" }, { name: "result", label: "Result", type: "textarea" },
      { name: "liveUrl", label: "Live demo URL", type: "url" }, { name: "githubUrl", label: "GitHub URL", type: "url" },
      { name: "isFeatured", label: "Featured", type: "boolean" }, { name: "isPublished", label: "Published", type: "boolean" },
      hi(t("titleHi", "Title")), hi({ name: "summaryHi", label: "Short description", type: "textarea" }),
      hi({ name: "problemHi", label: "Problem", type: "textarea" }), hi({ name: "solutionHi", label: "Solution", type: "textarea" }), hi({ name: "resultHi", label: "Result", type: "textarea" }),
    ],
  },
  {
    key: "certificates", title: "Certificates", singular: "Certificate", group: "Content", sortable: true, titleField: "title", columns: ["fileUrl", "title", "issuer", "issueDate"],
    publishField: "isPublished", featuredField: "isFeatured",
    description: "Certifications with image or PDF preview, credential ID and verification link.",
    fields: [
      t("title", "Title", { required: true }), t("issuer", "Issuer", { required: true }), t("category", "Category", { hint: "Used by the public filter." }),
      { name: "issueDate", label: "Issue date", type: "date" }, { name: "expiryDate", label: "Expiry date (optional)", type: "date" },
      t("credentialId", "Credential ID"), { name: "credentialUrl", label: "Credential URL", type: "url" },
      { name: "fileUrl", label: "Certificate image or PDF", type: "file", bucket: "certificates" },
      { name: "isFeatured", label: "Featured", type: "boolean" }, { name: "isPublished", label: "Published", type: "boolean" },
      hi(t("titleHi", "Title")),
    ],
  },
  {
    key: "skill-categories", title: "Skill categories", singular: "Category", group: "Content", sortable: true, titleField: "name", columns: ["name"], publishField: "isPublished",
    description: "Group your skills (Frontend, Backend, Database, Tools…).",
    fields: [t("name", "Name", { required: true }), { name: "isPublished", label: "Published", type: "boolean" }, hi(t("nameHi", "Name"))],
  },
  {
    key: "skills", title: "Skills", singular: "Skill", group: "Content", sortable: true, titleField: "name", columns: ["name", "categoryId", "icon"], publishField: "isPublished",
    description: "Individual skills, each with an icon and a category.",
    fields: [
      t("name", "Name", { required: true }), { name: "categoryId", label: "Category", type: "relation", relation: "skill-categories", required: true },
      { name: "icon", label: "Icon", type: "select", options: ICON_OPTIONS }, { name: "isPublished", label: "Published", type: "boolean" },
    ],
  },
  {
    key: "experience", title: "Experience", singular: "Position", group: "Content", sortable: true, titleField: "role", columns: ["role", "company", "startDate"], publishField: "isPublished",
    description: "Work history shown on the timeline (newest first by your ordering).",
    fields: [
      t("role", "Role", { required: true }), t("company", "Company"), t("location", "Location"),
      { name: "startDate", label: "Start date", type: "date" }, { name: "endDate", label: "End date", type: "date", hint: "Leave empty for 'Present'." },
      { name: "description", label: "Description", type: "textarea" }, { name: "isPublished", label: "Published", type: "boolean" },
      hi(t("roleHi", "Role")), hi({ name: "descriptionHi", label: "Description", type: "textarea" }),
    ],
  },
  {
    key: "education", title: "Education", singular: "Education", group: "Content", sortable: true, titleField: "degree", columns: ["degree", "institution", "startDate"], publishField: "isPublished",
    description: "Degrees and courses.",
    fields: [
      t("degree", "Degree / course", { required: true }), t("institution", "Institution"),
      { name: "startDate", label: "Start date", type: "date" }, { name: "endDate", label: "End date", type: "date" },
      { name: "description", label: "Description", type: "textarea" }, { name: "isPublished", label: "Published", type: "boolean" },
      hi(t("degreeHi", "Degree / course")), hi({ name: "descriptionHi", label: "Description", type: "textarea" }),
    ],
  },
  {
    key: "services", title: "Services", singular: "Service", group: "Content", sortable: true, titleField: "title", columns: ["title", "icon"], publishField: "isPublished",
    description: "What you offer. Hide the whole section from Admin → Sections.",
    fields: [
      t("title", "Title", { required: true }), { name: "description", label: "Description", type: "textarea" },
      { name: "icon", label: "Icon", type: "select", options: ICON_OPTIONS }, { name: "isPublished", label: "Published", type: "boolean" },
      hi(t("titleHi", "Title")), hi({ name: "descriptionHi", label: "Description", type: "textarea" }),
    ],
  },
  {
    key: "testimonials", title: "Testimonials", singular: "Testimonial", group: "Content", sortable: true, titleField: "name", columns: ["photoUrl", "name", "role"], publishField: "isPublished",
    description: "Kind words from clients and colleagues.",
    fields: [
      t("name", "Name", { required: true }), t("role", "Role / company"), { name: "photoUrl", label: "Photo", type: "image", bucket: "avatars" },
      { name: "text", label: "Testimonial", type: "textarea", required: true }, { name: "isPublished", label: "Published", type: "boolean" },
      hi(t("roleHi", "Role / company")), hi({ name: "textHi", label: "Testimonial", type: "textarea" }),
    ],
  },
  {
    key: "blog", title: "Blog", singular: "Post", group: "Content", titleField: "title", columns: ["coverImage", "title", "publishedAt", "tags"], publishField: "isPublished",
    description: "Markdown posts with live preview. Set a future date to schedule publishing.",
    fields: [
      t("title", "Title", { required: true }), { name: "slug", label: "URL slug", type: "slug", slugFrom: "title", required: true },
      { name: "excerpt", label: "Excerpt", type: "textarea" }, { name: "coverImage", label: "Cover image", type: "image", bucket: "blog" },
      { name: "tags", label: "Tags", type: "tags" }, { name: "content", label: "Content (Markdown)", type: "markdown" },
      { name: "seoDescription", label: "SEO description", type: "textarea" },
      { name: "publishedAt", label: "Publish date (schedule in the future)", type: "datetime" }, { name: "isPublished", label: "Published", type: "boolean" },
      hi(t("titleHi", "Title")), hi({ name: "excerptHi", label: "Excerpt", type: "textarea" }), hi({ name: "contentHi", label: "Content (Markdown)", type: "markdown" }),
    ],
  },
  {
    key: "now", title: "Now", singular: "Item", group: "Content", sortable: true, titleField: "text", columns: ["label", "text"], publishField: "isPublished",
    description: "What you're building, learning or reading right now.",
    fields: [
      t("label", "Label", { required: true, hint: "e.g. Building, Learning, Reading" }), { name: "text", label: "Text", type: "textarea", required: true },
      { name: "isPublished", label: "Published", type: "boolean" }, hi(t("labelHi", "Label")), hi({ name: "textHi", label: "Text", type: "textarea" }),
    ],
  },
];

export function getResource(key: string): ResourceDef | undefined {
  return RESOURCES.find((r) => r.key === key);
}
