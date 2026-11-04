import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getSingleton, themeCss } from "@/lib/data";
import { getLocale } from "@/lib/locale";
import { siteUrl } from "@/lib/utils";
import * as s from "@/db/schema";

const display = Syne({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--f-display", display: "swap" });
const body = DM_Sans({ subsets: ["latin"], variable: "--f-body", display: "swap" });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  let settings: typeof s.siteSettings.$inferSelect | null = null;
  try {
    settings = await getSingleton(s.siteSettings);
  } catch {
    settings = null;
  }
  const title = settings?.metaTitle || settings?.siteName || "Portfolio";
  const description = settings?.metaDescription || "A developer portfolio.";
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: `%s · ${settings?.siteName || "Portfolio"}` },
    description,
    applicationName: settings?.siteName || "Portfolio",
    alternates: { canonical: "/" },
    icons: settings?.favicon ? { icon: settings.favicon } : { icon: "/icon.svg" },
    openGraph: { type: "website", title, description, siteName: settings?.siteName, images: settings?.ogImage ? [settings.ogImage] : undefined },
    twitter: { card: "summary_large_image", title, description, images: settings?.ogImage ? [settings.ogImage] : undefined },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#1a0505" },
    { media: "(prefers-color-scheme: light)", color: "#fbf1e4" },
  ],
};

/** Runs before first paint → the saved/system theme is applied with zero flash. */
const themeScript = `(function(){try{var r=document.documentElement,m=localStorage.getItem('theme')||r.dataset.defaultMode||'system';var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);r.classList.toggle('dark',d);}catch(e){}})();`;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  let theme: typeof s.themeSettings.$inferSelect | null = null;
  try {
    theme = await getSingleton(s.themeSettings);
  } catch {
    theme = null;
  }
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-default-mode={theme?.defaultMode ?? "system"}
      className={`${display.variable} ${body.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {theme && <style id="theme-vars" dangerouslySetInnerHTML={{ __html: themeCss(theme) }} />}
      </head>
      <body className="min-h-dvh antialiased">
        <div className="scene" aria-hidden />
        <div className="blob blob-1" aria-hidden />
        <div className="blob blob-2" aria-hidden />
        <div className="blob blob-3" aria-hidden />
        <div className="grain" aria-hidden />
        <Providers locale={locale} animations={theme?.animations ?? true}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
