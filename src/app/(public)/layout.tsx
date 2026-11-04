import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { Cursor } from "@/components/ui/cursor";
import { Tracker } from "@/components/layout/tracker";
import { Footer } from "@/components/layout/footer";
import { getSiteData } from "@/lib/data";
import { getLocale } from "@/lib/locale";

/** Public shell: sidebar navigation, custom cursor, command palette, footer. */
export default async function PublicLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const data = await getSiteData(locale);
  const visible = data.sections.filter((s) => s.isVisible).map((s) => s.key);
  const hasBlog = visible.includes("blog");

  return (
    <>
      <a href="#main" className="sr-only z-[200] rounded-lg bg-primary px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Sidebar sections={visible} social={data.social} siteName={data.settings.siteName} />
      <main id="main" className="min-h-dvh pb-24 pt-20 lg:pb-0 lg:pl-[6.5rem] lg:pt-0">
        {children}
        <Footer siteName={data.settings.siteName} />
      </main>
      <CommandPalette
        sections={visible}
        projects={data.projects.map((p) => ({ slug: p.slug, title: p.title }))}
        posts={hasBlog ? data.posts.map((p) => ({ slug: p.slug, title: p.title })) : []}
      />
      <Cursor />
      <Tracker />
    </>
  );
}
