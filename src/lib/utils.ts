/** Tiny class-name joiner (keeps the bundle free of clsx/tailwind-merge). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Estimated reading time in minutes (200 wpm, minimum 1). */
export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(value: string | Date | null | undefined, locale: "en" | "hi" = "en", withDay = false): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value.length <= 10 ? `${value}T00:00:00` : value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale === "hi" ? "hi-IN" : "en-US", {
    year: "numeric",
    month: "short",
    ...(withDay ? { day: "numeric" } : {}),
  });
}

/** Absolute site URL without trailing slash. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

/** Only http(s), mailto and same-site paths are allowed in user-provided links. */
export function safeHref(url: string): string {
  if (!url) return "#";
  if (url.startsWith("/") || /^(https?:|mailto:|tel:)/i.test(url)) return url;
  return "#";
}
