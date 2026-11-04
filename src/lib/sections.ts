/** Public homepage sections in their default order. Managed from Admin → Sections. */
export const DEFAULT_SECTIONS = [
  { key: "hero", label: "Hero" },
  { key: "about", label: "About" },
  { key: "skills", label: "Skills" },
  { key: "projects", label: "Projects" },
  { key: "certifications", label: "Certifications" },
  { key: "experience", label: "Experience & Education" },
  { key: "services", label: "Services" },
  { key: "testimonials", label: "Testimonials" },
  { key: "blog", label: "Blog / Notes" },
  { key: "github", label: "GitHub stats" },
  { key: "now", label: "Now" },
  { key: "contact", label: "Contact" },
] as const;

export type SectionKey = (typeof DEFAULT_SECTIONS)[number]["key"];
